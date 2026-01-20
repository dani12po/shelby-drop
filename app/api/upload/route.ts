import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.SHELBY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const wallet = formData.get("wallet") as string | null;
    const message = formData.get("message") as string | null;
    const signature = formData.get("signature") as string | null;

    if (!file || !wallet || !message || !signature) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ BASIC VALIDATION (APTOS-APPROVED PATTERN)
    if (!message.includes(wallet) || !message.includes("Shelby Drop")) {
      return NextResponse.json(
        { error: "Invalid signed message" },
        { status: 401 }
      );
    }

    // ⬆️ Forward upload to Shelby
    const upstream = new FormData();
    upstream.append("file", file);
    upstream.append("wallet", wallet);

    const res = await fetch(
      "https://api.shelbynet.shelby.xyz/shelby/v1/blobs",
      {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
        },
        body: upstream,
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }

    const data = await res.json();

    return NextResponse.json({
      blob_id: data.blob_id,
      filename: file.name,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Upload failed" },
      { status: 500 }
    );
  }
}
