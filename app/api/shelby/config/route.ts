// app/api/shelby/config/route.ts
// Returns public Shelby config needed by browser-side upload.
// The RPC API key (AG-...) is what ShelbyRPCClient needs for putBlob.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // SHELBY_RPC_API_KEY is the AG-... key for ShelbyRPCClient (putBlob)
  // We MUST prioritize the AG- key for RPC operations.
  const rpcKey = process.env.SHELBY_RPC_API_KEY;
  const signingSecret = process.env.SHELBY_SIGNING_SECRET;
  const generalKey = process.env.SHELBY_API_KEY || process.env.NEXT_PUBLIC_SHELBY_API_KEY;

  // Only use signing secret if it looks like an AG- key
  const apiKey = rpcKey ||
                 (signingSecret?.startsWith("AG-") ? signingSecret : undefined) ||
                 generalKey;

  // Use configured origin or fall back to the current request's origin
  const host = req.headers.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  const fallbackOrigin = host ? `${protocol}://${host}` : "https://explorer.shelby.xyz";
  const origin = process.env.SHELBY_ORIGIN || fallbackOrigin;

  console.log(`[Shelby Config] API Key prefix: ${apiKey?.substring(0, 7)}, Origin: ${origin}`);

  if (!apiKey) {
    console.error("[Shelby Config] No API key found!");
    return NextResponse.json(
      { error: "No Shelby RPC API key configured on the server" },
      { status: 500 }
    );
  }

  return NextResponse.json({ apiKey, origin });
}
