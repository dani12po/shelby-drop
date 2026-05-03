// app/api/explorer/route.ts

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===============================
   SHELBY NETWORK CONFIG
=============================== */
const APTOS_NODE_URL = 
  process.env.APTOS_NODE_URL ?? 
  "https://api.shelbynet.shelby.xyz/v1";

const APTOS_INDEXER_URL = 
  process.env.APTOS_INDEXER_URL ?? 
  "https://api.shelbynet.shelby.xyz/v1/graphql";

/* ===============================
   TYPES
=============================== */
type ExplorerFile = {
  id: string;
  type: "file";
  name: string;
  size: string;
  path: string[];

  blobId: string;
  fileType: "PDF" | "IMG" | "OTHER";
  uploader: string;

  expiresAt?: string;
  retentionDays?: number;
};

type ExplorerFolder = {
  id: string;
  type: "folder";
  name: string;
  path: string[];
  children: Array<ExplorerFolder | ExplorerFile>;
};

/* ===============================
   HELPERS
=============================== */
function inferFileType(
  name: string
): "PDF" | "IMG" | "OTHER" {
  const lower = name.toLowerCase();

  if (lower.endsWith(".pdf")) return "PDF";
  if (
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".webp")
  ) {
    return "IMG";
  }

  return "OTHER";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(
    1
  )} MB`;
}

/* ===============================
   FETCH FROM SHELBY NETWORK
 =============================== */
interface ShelbyBlob {
  blob_id: string;
  blob_name: string;
  size: number;
  creator_address: string;
  inserted_at: string;
  expiration_date?: string;
}

interface LedgerObject {
  blob_id?: string | number;
  object_type?: string;
  owner_address?: string;
  state_key?: string;
  inserted_at?: string;
}

interface AccountResource {
  type: string;
  data?: {
    blob_id?: string;
    name?: string;
    size?: number | string;
    inserted_at?: string;
  };
  guid?: {
    id?: string;
  };
}

/**
 * Fetch blobs from Shelby Network API
 * Uses Aptos Indexer GraphQL endpoint for efficient querying
 */
async function fetchBlobsFromShelbyNetwork(
  wallet: string
): Promise<ShelbyBlob[]> {
  const blobs: ShelbyBlob[] = [];
  
  try {
    // Try GraphQL endpoint first (more efficient for querying)
    const query = `
      query GetAccountBlobs($address: String!) {
        ledger_objects(
          where: {
            creator_address: { _eq: $address },
            _or: [
              { object_type: { _eq: "0x3::blob::Blob" } }
              { object_type: { _contains: "blob" } }
            ]
          },
          limit: 100
        ) {
          blob_id: guid_id
          object_type
          owner_address
          state_key
          inserted_at
        }
      }
    `;

    const response = await fetch(APTOS_INDEXER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { address: wallet },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const ledgerObjects = data?.data?.ledger_objects ?? [];
      
      return ledgerObjects.map((obj: LedgerObject) => ({
        blob_id: obj.blob_id?.toString() ?? "",
        blob_name: `blob_${obj.blob_id ?? "unknown"}`,
        size: 0, // Size not available in indexer
        creator_address: wallet,
        inserted_at: obj.inserted_at ?? new Date().toISOString(),
      }));
    }
  } catch (graphqlError) {
    console.log("GraphQL query failed, trying REST fallback:", graphqlError);
  }

  // Fallback: Use REST API to fetch account resources
  try {
    const accountResponse = await fetch(
      `${APTOS_NODE_URL}/accounts/${wallet}/resources`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (accountResponse.ok) {
      const resources = await accountResponse.json();
      
      // Find blob-related resources
      const blobResources = resources.filter(
        (r: AccountResource) =>
          r.type?.includes("Blob") ||
          r.type?.includes("blob")
      );

      for (const blob of blobResources) {
        const sizeVal = blob.data?.size;
        const size = typeof sizeVal === "string" ? parseInt(sizeVal, 10) || 0 : (sizeVal ?? 0);
        
        blobs.push({
          blob_id: blob.data?.blob_id ?? blob.guid?.id ?? "",
          blob_name: blob.data?.name ?? "unknown",
          size,
          creator_address: wallet,
          inserted_at: blob.data?.inserted_at ?? new Date().toISOString(),
        });
      }
    }
  } catch (restError) {
    console.error("REST API also failed:", restError);
  }

  return blobs;
}

/**
 * Convert Shelby blobs to Explorer format
 */
function blobsToExplorerItems(
  blobs: ShelbyBlob[],
  wallet: string
): Array<ExplorerFolder | ExplorerFile> {
  const items: Array<ExplorerFolder | ExplorerFile> = [];
  
  // Group blobs by their path (first part of name)
  const pathGroups = new Map<string, ShelbyBlob[]>();
  
  for (const blob of blobs) {
    const nameParts = blob.blob_name.split("/");
    const folderName = nameParts.length > 1 ? nameParts[0] : "root";
    
    if (!pathGroups.has(folderName)) {
      pathGroups.set(folderName, []);
    }
    pathGroups.get(folderName)!.push(blob);
  }

  // Create folder structure
  for (const [folderName, folderBlobs] of pathGroups) {
    if (folderName === "root") {
      // Files directly in root
      for (const blob of folderBlobs) {
        items.push({
          id: blob.blob_id,
          type: "file" as const,
          name: blob.blob_name,
          size: formatSize(blob.size),
          path: [],
          blobId: blob.blob_id,
          fileType: inferFileType(blob.blob_name),
          uploader: wallet,
          expiresAt: blob.expiration_date,
        });
      }
    } else {
      // Folder with files
      const children: Array<ExplorerFile> = folderBlobs.map((blob) => ({
        id: blob.blob_id,
        type: "file" as const,
        name: blob.blob_name.split("/").slice(1).join("/") || blob.blob_name,
        size: formatSize(blob.size),
        path: [folderName],
        blobId: blob.blob_id,
        fileType: inferFileType(blob.blob_name),
        uploader: wallet,
        expiresAt: blob.expiration_date,
      }));

      items.push({
        id: folderName,
        type: "folder" as const,
        name: folderName,
        path: [],
        children,
      });
    }
  }

  return items;
}

/* ===============================
   GET /api/explorer
=============================== */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json(
      { error: "Missing wallet" },
      { status: 400 }
    );
  }

  // Fetch blobs from Shelby Network instead of local filesystem
  const blobs = await fetchBlobsFromShelbyNetwork(wallet);
  
  // Convert to explorer structure
  const children = blobsToExplorerItems(blobs, wallet);

  const root: ExplorerFolder = {
    id: wallet,
    type: "folder",
    name: wallet,
    path: [],
    children,
  };

  return NextResponse.json(root);
}
