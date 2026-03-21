// app/api/shelby/list/route.ts

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
interface BlobItem {
  id: string;
  name: string;
  blob_id: string;
  size: number;
  created_at: string;
  creator: string;
  file_type: "PDF" | "IMG" | "VIDEO" | "AUDIO" | "TEXT" | "OTHER";
}

interface FolderItem {
  id: string;
  name: string;
  type: "folder";
  path: string[];
  children: (BlobItem | FolderItem)[];
}

/* ===============================
   HELPERS
=============================== */
function inferFileType(name: string): "PDF" | "IMG" | "VIDEO" | "AUDIO" | "TEXT" | "OTHER" {
  const lower = name.toLowerCase();
  
  if (lower.endsWith(".pdf")) return "PDF";
  if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || 
      lower.endsWith(".gif") || lower.endsWith(".webp") || lower.endsWith(".svg")) return "IMG";
  if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov") || 
      lower.endsWith(".avi")) return "VIDEO";
  if (lower.endsWith(".mp3") || lower.endsWith(".wav") || lower.endsWith(".ogg") || 
      lower.endsWith(".flac")) return "AUDIO";
  if (lower.endsWith(".txt") || lower.endsWith(".md") || lower.endsWith(".json") || 
      lower.endsWith(".js") || lower.endsWith(".ts") || lower.endsWith(".css") || 
      lower.endsWith(".html") || lower.endsWith(".xml")) return "TEXT";
  
  return "OTHER";
}

function formatSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ===============================
   FETCH FROM SHELBY NETWORK
=============================== */
async function fetchBlobsFromShelbyNetwork(wallet: string): Promise<BlobItem[]> {
  const blobs: BlobItem[] = [];
  
  // Add timeout controller
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
  
  try {
    // Try GraphQL endpoint first (more efficient for querying)
    const query = `
      query GetAccountBlobs($address: String!) {
        ledger_objects(
          where: {
            creator_address: { _eq: $address }
          },
          order_by: { inserted_at: desc },
          limit: 100
        ) {
          guid_id
          object_type
          owner_address
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
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const ledgerObjects = data?.data?.ledger_objects ?? [];
      
      return ledgerObjects.map((obj: any) => ({
        id: obj.guid_id?.toString() ?? "",
        name: `blob_${obj.guid_id ?? "unknown"}`,
        blob_id: obj.guid_id?.toString() ?? "",
        size: 0,
        created_at: obj.inserted_at ?? new Date().toISOString(),
        creator: wallet,
        file_type: inferFileType(`blob_${obj.guid_id ?? "unknown"}`),
      }));
    }
  } catch (graphqlError: any) {
    clearTimeout(timeout);
    if (graphqlError.name === 'AbortError') {
      console.log("GraphQL query timed out after 10s");
    } else {
      console.log("GraphQL query failed, trying REST fallback:", graphqlError);
    }
  }

  // Fallback: Use REST API to fetch account resources
  try {
    const accountResponse = await fetch(
      `${APTOS_NODE_URL}/accounts/${wallet}/resources`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (accountResponse.ok) {
      const resources = await accountResponse.json();
      
      // Find blob-related resources
      const blobResources = resources.filter(
        (r: any) => r.type?.includes("Blob") || r.type?.includes("blob")
      );

      for (const blob of blobResources) {
        blobs.push({
          id: blob.data?.blob_id?.toString() ?? blob.guid?.id?.toString() ?? "",
          name: blob.data?.name ?? "unknown",
          blob_id: blob.data?.blob_id?.toString() ?? "",
          size: blob.data?.size ?? 0,
          created_at: blob.data?.inserted_at ?? new Date().toISOString(),
          creator: wallet,
          file_type: inferFileType(blob.data?.name ?? "unknown"),
        });
      }
    }
  } catch (restError: any) {
    clearTimeout(timeout);
    if (restError.name === 'AbortError') {
      console.log("REST API timed out after 10s");
    } else {
      console.error("REST API also failed:", restError);
    }
  }

  // Return empty array instead of throwing - this is not an error
  // It just means Shelby Network doesn't have data for this wallet
  console.log("Shelby Network not reachable or no data, returning empty array");
  return [];
}

/* ===============================
   GROUP BLOBS INTO FOLDERS
=============================== */
function groupBlobsIntoFolders(blobs: BlobItem[]): (BlobItem | FolderItem)[] {
  const rootItems: (BlobItem | FolderItem)[] = [];
  const folderMap = new Map<string, BlobItem[]>();
  
  for (const blob of blobs) {
    const parts = blob.name.split("/");
    if (parts.length > 1) {
      // Has folder path
      const folderName = parts[0];
      if (!folderMap.has(folderName)) {
        folderMap.set(folderName, []);
      }
      folderMap.get(folderName)!.push({
        ...blob,
        name: parts.slice(1).join("/"),
      });
    } else {
      // Root file
      rootItems.push(blob);
    }
  }
  
  // Add folders
  for (const [folderName, folderBlobs] of folderMap) {
    rootItems.push({
      id: folderName,
      name: folderName,
      type: "folder" as const,
      path: [folderName],
      children: folderBlobs,
    });
  }
  
  return rootItems;
}

/* ===============================
   GET /api/shelby/list
=============================== */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json(
      { error: "Missing wallet parameter" },
      { status: 400 }
    );
  }

  // Validate wallet address format
  if (!wallet.startsWith("0x") || wallet.length < 66) {
    return NextResponse.json(
      { error: "Invalid wallet address format" },
      { status: 400 }
    );
  }

  try {
    // Fetch blobs from Shelby Network
    const blobs = await fetchBlobsFromShelbyNetwork(wallet);
    
    // Convert to folder structure
    const folders = groupBlobsIntoFolders(blobs);

    return NextResponse.json({
      wallet,
      files: blobs,
      folders,
      total: blobs.length,
      message: blobs.length === 0 
        ? 'No files found or network unavailable' 
        : undefined,
    });
  } catch (error) {
    console.error("Error fetching blobs:", error);
    // Return empty result instead of error - network might be unavailable
    return NextResponse.json({
      wallet,
      files: [],
      folders: [],
      total: 0,
      message: 'Network unavailable - returning empty result',
    });
  }
}
