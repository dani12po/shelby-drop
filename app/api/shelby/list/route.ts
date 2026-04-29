// app/api/shelby/list/route.ts
// Lists blobs for a wallet using the Shelby indexer (GraphQL).
// Indexer URLs sourced directly from @shelby-protocol/sdk source.

import { NextResponse } from "next/server";
import { getNetworkConfig } from "@/config/shelby";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Exact indexer URLs from @shelby-protocol/sdk dist/chunk-7OV5ZYW6.mjs
const SHELBY_INDEXER_URLS: Record<string, string> = {
  testnet:  "https://api.testnet.aptoslabs.com/nocode/v1/public/cmlfqs5wt00qrs601zt5s4kfj/v1/graphql",
  shelbynet: "https://api.shelbynet.aptoslabs.com/nocode/v1/public/cmforrguw0042s601fn71f9l2/v1/graphql",
};

// GraphQL query — exact schema from @shelby-protocol/sdk
// Fields: owner, blob_name, created_at, expires_at, size, is_deleted, is_written
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
}

async function fetchBlobsFromIndexer(
  wallet: string,
  network: string
): Promise<BlobItem[]> {
  const indexerUrl = SHELBY_INDEXER_URLS[network] ?? SHELBY_INDEXER_URLS.testnet;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(indexerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: GET_BLOBS_QUERY,
        variables: {
          where: {
            owner: { _eq: wallet },
            is_deleted: { _eq: false },
          },
          orderBy: [{ created_at: "desc" }],
          limit: 200,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[shelby/list] indexer returned ${res.status}`);
      return [];
    }

    const json = await res.json();

    if (json.errors) {
      console.warn("[shelby/list] GraphQL errors:", JSON.stringify(json.errors));
      return [];
    }

    const rows: any[] = json?.data?.blobs ?? [];

    return rows.map((b: any, i: number) => ({
      id:         `${b.owner}-${b.blob_name}-${i}`,
      name:       b.blob_name ?? `blob_${i}`,
      blob_id:    b.blob_name ?? "",
      size:       typeof b.size === "number" ? b.size : 0,
      created_at: b.created_at ?? new Date().toISOString(),
      expires_at: b.expires_at ?? undefined,
      creator:    b.owner ?? wallet,
    }));
  } catch (err: any) {
    clearTimeout(timeout);
    console.warn("[shelby/list] indexer error:", err.message);
    return [];
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet  = searchParams.get("wallet");
  const network = searchParams.get("network") || process.env.SHELBY_NETWORK || "testnet";

  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet parameter" }, { status: 400 });
  }
  if (!wallet.startsWith("0x") || wallet.length < 10) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  const blobs = await fetchBlobsFromIndexer(wallet, network);

  return NextResponse.json({
    wallet,
    files: blobs,
    total: blobs.length,
    network,
  });
}
