// app/api/shelby/list/route.ts
// Lists blobs for a wallet using the Shelby indexer (GraphQL).
// Queries BOTH testnet and shelbynet and merges results.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Exact indexer URLs from @shelby-protocol/sdk dist/chunk-7OV5ZYW6.mjs
const SHELBY_INDEXER_URLS: Record<string, string> = {
  testnet:   process.env.SHELBY_INDEXER_URL_TESTNET || "https://api.testnet.aptoslabs.com/nocode/v1/public/cmlfqs5wt00qrs601zt5s4kfj/v1/graphql",
  shelbynet: process.env.SHELBY_INDEXER_URL_SHELBYNET || "https://api.shelbynet.aptoslabs.com/nocode/v1/public/cmforrguw0042s601fn71f9l2/v1/graphql",
};

// GraphQL query — no is_deleted filter (field is "0"/"1" string, not boolean)
// We filter client-side instead
const GET_BLOBS_QUERY = `
  query getBlobs($where: blobs_bool_exp, $orderBy: [blobs_order_by!], $limit: Int) {
    blobs(where: $where, order_by: $orderBy, limit: $limit) {
      owner
      blob_name
      created_at
      expires_at
      size
      is_deleted
      is_written
    }
  }
`;

interface BlobItem {
  id: string;
  name: string;       // display name (stripped of @wallet/ prefix)
  blob_name: string;  // raw blob_name from indexer (used for media URL)
  blob_id: string;
  size: number;
  created_at: string;
  expires_at?: string;
  creator: string;
  network: string;
}

interface IndexerBlob {
  owner: string;
  blob_name: string;
  created_at: string;
  expires_at: string | null;
  size: string | number;
  is_deleted: string | number | boolean;
  is_written: string | number | boolean;
}

/**
 * blob_name from indexer has format: @{wallet}/{filename}
 * Strip the @{wallet}/ prefix to get the actual filename for display + download.
 */
function stripBlobNamePrefix(blobName: string, wallet: string): string {
  // Format: @50093856...bb/1777457761802-file.jpg
  const prefix1 = `@${wallet}/`;
  const prefix2 = `@${wallet.replace(/^0x/, "")}/`;
  if (blobName.startsWith(prefix1)) return blobName.slice(prefix1.length);
  if (blobName.startsWith(prefix2)) return blobName.slice(prefix2.length);
  // Fallback: strip any @.../  prefix
  const atSlash = blobName.indexOf("/");
  if (blobName.startsWith("@") && atSlash !== -1) return blobName.slice(atSlash + 1);
  return blobName;
}

async function fetchFromIndexer(
  wallet: string,
  network: string,
  indexerUrl: string
): Promise<BlobItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(indexerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.SHELBY_API_KEY
          ? { "Authorization": `Bearer ${process.env.SHELBY_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        query: GET_BLOBS_QUERY,
        variables: {
          where: { owner: { _eq: wallet } },
          orderBy: [{ created_at: "desc" }],
          limit: 200,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[shelby/list:${network}] indexer ${res.status}`);
      return [];
    }

    const json = await res.json();

    if (json.errors) {
      console.warn(`[shelby/list:${network}] GraphQL errors:`, JSON.stringify(json.errors));
      return [];
    }

    const rows: IndexerBlob[] = json?.data?.blobs ?? [];
    console.log(`[shelby/list:${network}] got ${rows.length} blobs`);

    return rows
      // Filter deleted: is_deleted is "0" (not deleted) or "1" (deleted)
      .filter((b: IndexerBlob) => b.is_deleted === "0" || b.is_deleted === 0 || b.is_deleted === false)
      // Only show fully written blobs
      .filter((b: IndexerBlob) => b.is_written === "1" || b.is_written === 1 || b.is_written === true)
      .map((b: IndexerBlob, i: number) => {
        const rawBlobName: string = b.blob_name ?? `blob_${i}`;
        const displayName = stripBlobNamePrefix(rawBlobName, wallet);
        return {
          id:         `${network}-${rawBlobName}-${i}`,
          name:       displayName,
          blob_name:  rawBlobName,
          blob_id:    rawBlobName,
          size:       typeof b.size === "string" ? parseInt(b.size, 10) || 0
                    : typeof b.size === "number" ? b.size : 0,
          created_at: b.created_at ?? new Date().toISOString(),
          expires_at: b.expires_at ?? undefined,
          creator:    b.owner ?? wallet,
          network,
        };
      });
  } catch (err: unknown) {
    clearTimeout(timeout);
    const isAbort = err instanceof Error && err.name === "AbortError";
    if (!isAbort) {
      console.warn(`[shelby/list:${network}] error:`, err instanceof Error ? err.message : String(err));
    }
    return [];
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet       = searchParams.get("wallet");
  const requestedNet = searchParams.get("network");

  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet parameter" }, { status: 400 });
  }
  if (!wallet.startsWith("0x") || wallet.length < 10) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  let blobs: BlobItem[] = [];

  if (requestedNet && SHELBY_INDEXER_URLS[requestedNet]) {
    blobs = await fetchFromIndexer(wallet, requestedNet, SHELBY_INDEXER_URLS[requestedNet]);
  } else {
    // Query BOTH networks in parallel — handles files on either network
    const [testnetBlobs, shelbynetBlobs] = await Promise.all([
      fetchFromIndexer(wallet, "testnet",   SHELBY_INDEXER_URLS.testnet),
      fetchFromIndexer(wallet, "shelbynet", SHELBY_INDEXER_URLS.shelbynet),
    ]);

    // Deduplicate by display name
    const seen = new Set<string>();
    for (const b of [...testnetBlobs, ...shelbynetBlobs]) {
      if (!seen.has(b.name)) {
        seen.add(b.name);
        blobs.push(b);
      }
    }
  }

  // Sort newest first
  blobs.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return NextResponse.json({
    wallet,
    files: blobs,
    total: blobs.length,
    network: requestedNet ?? "all",
  });
}
