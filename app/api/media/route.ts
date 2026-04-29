// app/api/media/route.ts
// Redirects to Shelby gateway for media/download.
// Using redirect instead of proxy because gateway.shelby.xyz
// may not be resolvable from the server in some environments.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GATEWAY = process.env.NEXT_PUBLIC_S3_GATEWAY_ORIGIN ?? "https://gateway.shelby.xyz";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet   = searchParams.get("wallet");
  const name     = searchParams.get("name");
  const download = searchParams.get("download") === "1";

  if (!wallet || !name) {
    return NextResponse.json({ error: "Missing wallet or name" }, { status: 400 });
  }

  // Build gateway URL — encode each path segment
  const segments = name.split("/").map(encodeURIComponent);
  const gatewayUrl = `${GATEWAY}/${encodeURIComponent(wallet)}/${segments.join("/")}`;

  if (download) {
    // For download: redirect with response-content-disposition if gateway supports it,
    // otherwise just redirect — browser will use filename from URL
    const dlUrl = `${gatewayUrl}?response-content-disposition=${encodeURIComponent(`attachment; filename="${name.split("/").pop()}"`)}`;
    return NextResponse.redirect(dlUrl, { status: 302 });
  }

  // For preview/streaming: redirect directly to gateway
  return NextResponse.redirect(gatewayUrl, { status: 302 });
}
