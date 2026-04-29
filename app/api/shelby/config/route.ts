// app/api/shelby/config/route.ts
// Returns public Shelby config needed by browser-side upload.
// The RPC API key (AG-...) is what ShelbyRPCClient needs for putBlob.
// The Aptos API key (aptoslabs_...) is for the Aptos node only.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // SHELBY_RPC_API_KEY is the AG-... key for ShelbyRPCClient (putBlob)
  // Fall back to SHELBY_SIGNING_SECRET which historically held the AG- key
  // Fall back to SHELBY_API_KEY as last resort
  const apiKey =
    process.env.SHELBY_RPC_API_KEY ||
    process.env.SHELBY_SIGNING_SECRET ||
    process.env.SHELBY_API_KEY ||
    process.env.NEXT_PUBLIC_SHELBY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "No Shelby RPC API key configured on the server" },
      { status: 500 }
    );
  }

  return NextResponse.json({ apiKey });
}
