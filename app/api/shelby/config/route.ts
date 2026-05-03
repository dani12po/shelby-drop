// app/api/shelby/config/route.ts
// Returns public Shelby config needed by browser-side upload.
// The RPC API key (AG-...) is what ShelbyRPCClient needs for putBlob.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Network param: "testnet" or "shelbynet"
  const { searchParams } = new URL(req.url);
  const network = searchParams.get("network") || 
                  process.env.NEXT_PUBLIC_SHELBY_NETWORK || 
                  "testnet";

  // KEY SELECTION — network-aware:
  // testnet  → aptoslabs_*** (Aptos Labs infra)
  // shelbynet → AG-*** (Shelby native infra)
  const apiKey = network === "testnet"
    ? (process.env.SHELBY_API_KEY || process.env.NEXT_PUBLIC_SHELBY_API_KEY)
    : (process.env.SHELBY_RPC_API_KEY || process.env.SHELBY_API_KEY);

  const host = req.headers.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  const fallbackOrigin = host ? `${protocol}://${host}` : "https://explorer.shelby.xyz";
  const origin = process.env.SHELBY_ORIGIN || fallbackOrigin;

  console.log(`[Shelby Config] network=${network}, key prefix=${apiKey?.substring(0, 12)}..., origin=${origin}`);

  if (!apiKey) {
    const missing = network === "testnet"
      ? "SHELBY_API_KEY (format: aptoslabs_***)"
      : "SHELBY_RPC_API_KEY (format: AG-***)";
    console.error(`[Shelby Config] No API key found! Missing: ${missing}`);
    return NextResponse.json(
      { error: `No Shelby API key configured for ${network}. Need ${missing}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ apiKey, origin, network });
}
