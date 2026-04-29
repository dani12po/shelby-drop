// app/api/shelby/list/route.ts

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getNetworkConfig } from "@/config/shelby";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===============================
   SHELBY NETWORK CONFIG
   Resolved per-request from ?network= query param
=============================== */
function getEndpoints(network?: string | null) {
  const cfg = getNetworkConfig(network);
  return {
    nodeUrl:    process.env.APTOS_NODE_URL    || cfg.aptosNodeUrl,
    indexerUrl: process.env.APTOS_INDEXER_URL || cfg.aptosIndexerUrl,
  };
}

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
   READ LOCAL UPLOAD INDEX
   (written by /api/upload/complete)
=============================== */
async function readLocalIndex(wallet: string): Promise<BlobItem[]> {
  try {
    const indexPath = path.join(
      process.cwd(),
      "public/uploads",
      wallet,
      "index.json"
    );
    const raw = await fs.readFile(indexPath, "utf-8");
    const entries: any[] = JSON.parse(raw);

    return entries.map((entry) => ({
      id: entry.blob_name ?? entry.id ?? Math.random().toString(36).slice(2),
      name: entry.blob_name ?? "unknown",
      blob_id: entry.blob_name ?? "",
      size: typeof entry.size === "number" ? entry.size : 0,
      created_at: entry.createdAt ?? new Date().toISOString(),
      creator: wallet,
      file_type: inferFileType(entry.blob_name ?? ""),
    }));
  } catch {
    // File doesn't exist yet — that's fine
    return [];
  }
}

/* ===============================
   MERGE & DEDUPLICATE
=============================== */
function mergeBlobs(local: BlobItem[], remote: BlobItem[]): BlobItem[] {
  const seen = new Set<string>();
  const result: BlobItem[] = [];

  for (const blob of [...local, ...remote]) {
    const key = blob.name || blob.blob_id || blob.id;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(blob);
    }
  }

  // Sort newest first
  return result.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
async function fetchBlobsFromShelbyNetwork(wallet: string, nodeUrl: string, indexerUrl: string): Promise<BlobItem[]> {
  const blobs: BlobItem[] = [];
  
  // Add timeout controller
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
  
  try {
    // BUG #9 FIX: Use Shelby-specific GraphQL schema (not standard Aptos ledger_objects)
    // Shelby indexer uses `blobs` table with `creator_address` field
    const query = `
      query GetAccountBlobs($address: String!) {
        blobs(
          where: {
            creator_address: { _eq: $address }
          },
          order_by: { inserted_at: desc },
          limit: 100
        ) {
          blob_id
          name
          size
          inserted_at
          creator_address
        }
      }
    `;

    const response = await fetch(indexerUrl, {
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
      
      // Handle both Shelby `blobs` schema and graceful empty response
      const blobRows = data?.data?.blobs ?? [];
      
      if (blobRows.length > 0) {
        return blobRows.map((obj: any) => ({
          id: obj.blob_id?.toString() ?? "",
          name: obj.name ?? `blob_${obj.blob_id ?? "unknown"}`,
          blob_id: obj.blob_id?.toString() ?? "",
          size: obj.size ?? 0,
          created_at: obj.inserted_at ?? new Date().toISOString(),
          creator: wallet,
          file_type: inferFileType(obj.name ?? ""),
        }));
      }
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
      `${nodeUrl}/accounts/${wallet}/resources`,
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
  const wallet  = searchParams.get("wallet");
  const network = searchParams.get("network");

  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet parameter" }, { status: 400 });
  }
  if (!wallet.startsWith("0x") || wallet.length < 66) {
    return NextResponse.json({ error: "Invalid wallet address format" }, { status: 400 });
  }

  const { nodeUrl, indexerUrl } = getEndpoints(network);

  try {
    const [localBlobs, remoteBlobs] = await Promise.all([
      readLocalIndex(wallet),
      fetchBlobsFromShelbyNetwork(wallet, nodeUrl, indexerUrl),
    ]);

    // Merge: local index takes priority (always up-to-date after upload)
    const blobs = mergeBlobs(localBlobs, remoteBlobs);
    
    // Convert to folder structure
    const folders = groupBlobsIntoFolders(blobs);

    return NextResponse.json({
      wallet,
      files: blobs,
      folders,
      total: blobs.length,
      sources: {
        local: localBlobs.length,
        remote: remoteBlobs.length,
      },
      message: blobs.length === 0 
        ? 'No files found or network unavailable' 
        : undefined,
    });
  } catch (error) {
    console.error("Error fetching blobs:", error);
    return NextResponse.json({
      wallet,
      files: [],
      folders: [],
      total: 0,
      message: 'Network unavailable - returning empty result',
    });
  }
}
