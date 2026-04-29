// app/api/shelby/debug/route.ts
// Temporary debug endpoint — shows raw indexer response
// Remove after debugging

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SHELBY_INDEXER_URLS: Record<string, string> = {
  testnet:  "https://api.testnet.aptoslabs.com/nocode/v1/public/cmlfqs5wt00qrs601zt5s4kfj/v1/graphql",
  shelbynet: "https://api.shelbynet.aptoslabs.com/nocode/v1/public/cmforrguw0042s601fn71f9l2/v1/graphql",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet  = searchParams.get("wallet") || "0x50093856644bfcf8e33e3979b52f1a71f79f24a6ed7da94aa92b5b4057e0d0bb";
  const network = searchParams.get("network") || "testnet";

  const indexerUrl = SHELBY_INDEXER_URLS[network] ?? SHELBY_INDEXER_URLS.testnet;

  const query = `
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

  // Try 1: with is_deleted filter
  let res1: any = null;
  let err1: string | null = null;
  try {
    const r = await fetch(indexerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.SHELBY_API_KEY ? { "Authorization": `Bearer ${process.env.SHELBY_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        query,
        variables: {
          where: { owner: { _eq: wallet }, is_deleted: { _eq: false } },
          orderBy: [{ created_at: "desc" }],
          limit: 10,
        },
      }),
    });
    res1 = await r.json();
  } catch (e: any) { err1 = e.message; }

  // Try 2: without is_deleted filter
  let res2: any = null;
  let err2: string | null = null;
  try {
    const r = await fetch(indexerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.SHELBY_API_KEY ? { "Authorization": `Bearer ${process.env.SHELBY_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        query,
        variables: {
          where: { owner: { _eq: wallet } },
          orderBy: [{ created_at: "desc" }],
          limit: 10,
        },
      }),
    });
    res2 = await r.json();
  } catch (e: any) { err2 = e.message; }

  // Try 3: no filter at all (first 5 blobs)
  let res3: any = null;
  let err3: string | null = null;
  try {
    const r = await fetch(indexerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.SHELBY_API_KEY ? { "Authorization": `Bearer ${process.env.SHELBY_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        query: `query { blobs(limit: 5, order_by: {created_at: desc}) { owner blob_name size created_at } }`,
        variables: {},
      }),
    });
    res3 = await r.json();
  } catch (e: any) { err3 = e.message; }

  return NextResponse.json({
    wallet,
    network,
    indexerUrl,
    envShelbyNetwork: process.env.SHELBY_NETWORK,
    hasApiKey: !!process.env.SHELBY_API_KEY,
    apiKeyPrefix: process.env.SHELBY_API_KEY?.slice(0, 12) + "...",
    withIsDeletedFilter: { result: res1, error: err1 },
    withoutIsDeletedFilter: { result: res2, error: err2 },
    noFilter: { result: res3, error: err3 },
  });
}
