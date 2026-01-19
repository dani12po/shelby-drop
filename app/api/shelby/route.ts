import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.shelbynet.shelby.xyz/shelby/v1/blobs",
      { cache: "no-store" }
    );

    const text = await res.text();

    // DEBUG: pastikan selalu JSON
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json);
    } catch {
      return NextResponse.json({
        error: "Non-JSON response from Shelby API",
        raw: text.slice(0, 500), // potong biar aman
      });
    }
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch Shelby blobs" },
      { status: 500 }
    );
  }
}
