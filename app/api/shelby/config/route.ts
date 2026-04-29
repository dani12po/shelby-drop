// app/api/shelby/config/route.ts
// Returns public Shelby config needed by browser-side upload.
// The API key is safe to expose to authenticated users (it's not a private key).

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.SHELBY_API_KEY || process.env.NEXT_PUBLIC_SHELBY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "SHELBY_API_KEY is not configured on the server" },
      { status: 500 }
    );
  }

  return NextResponse.json({ apiKey });
}
