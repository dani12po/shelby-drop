// app/api/shelby/list/route.ts
// Lists blobs for a wallet using the Shelby indexer (GraphQL).
// Queries BOTH testnet and shelbynet and merges results.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Exact indexer URLs from @shelby-protocol/sdk dist/chunk-7OV5ZYW6.mjs
const SHELBY_INDEXER_URLS: Record<string, string> = {
  testnet:   "https://api.testnet.aptoslabs.com/nocode/v1/public/cmlfqs5wt00qrs601zt5s4kfj/v1/graphql",
  shelbynet: "https://api.shelbynet.aptoslabs.com/nocode/v1/public/cmforrguw0042s601fn71f9l2/v1/graphql",
};

// GraphQL query — exact schema from @shelby-protocol/sdk
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
  name: string;
  blob_id: string;
  size: number;
  created_at: string;
  expires_at?: string;
  creator: string;
  network: string;
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
      headers: { "Content-Type": "application/json" },
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

    const rows: any[] = json?.data?.blobs ?? [];
    console.log(`[shelby/list:${network}] got ${rows.length} blobs`);

    return rows
      .filter((b: any) => !b.is_deleted)
      .map((b: any, i: number) => ({
        id:         `${network}-${b.blob_name}-${i}`,
        name:       b.blob_name ?? `blob_${i}`,
        blob_id:    b.blob_name ?? "",
        size:       typeof b.size === "number" ? b.size : 0,
        created_at: b.created_at ?? new Date().toISOString(),
        expires_at: b.expires_at ?? undefined,
        creator:    b.owner ?? wallet,
        network,
      }));
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name !== "AbortError") {
      console.warn(`[shelby/list:${network}] error:`, err.message);
    }
    return [];
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet         = searchParams.get("wallet");
  const requestedNet   = searchParams.get("network");

  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet parameter" }, { status: 400 });
  }
  if (!wallet.startsWith("0x") || wallet.length < 10) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  let blobs: BlobItem[] = [];

  if (requestedNet && SHELBY_INDEXER_URLS[requestedNet]) {
    // Specific network requested — query only that one
    blobs = await fetchFromIndexer(wallet, requestedNet, SHELBY_INDEXER_URLS[requestedNet]);
  } else {
    // No specific network — query BOTH and merge (handles network mismatch)
    const [testnetBlobs, shelbynetBlobs] = await Promise.all([
      fetchFromIndexer(wallet, "testnet",   SHELBY_INDEXER_URLS.testnet),
      fetchFromIndexer(wallet, "shelbynet", SHELBY_INDEXER_URLS.shelbynet),
    ]);

    // Deduplicate by blob_name
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
