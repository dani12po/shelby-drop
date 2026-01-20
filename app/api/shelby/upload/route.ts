import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.SHELBY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key missing" },
      { status: 500 }
    );
  }

  const form = await req.formData();

  const file = form.get("file") as File | null;
  const wallet = form.get("wallet");
  const message = form.get("message");
  const signature = form.get("signature");

  if (!file || !wallet || !signature) {
    return NextResponse.json(
      { error: "Invalid upload data" },
      { status: 400 }
    );
  }

  // ⚠️ ENDPOINT INI CONTOH
  // GANTI sesuai API Shelby upload final
  const res = await fetch(
    "https://api.shelbynet.shelby.xyz/shelby/v1/upload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: "Shelby upload failed", detail: text },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
