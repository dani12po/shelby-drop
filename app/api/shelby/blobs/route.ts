import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");

  if (!wallet || !wallet.startsWith("0x")) {
    return NextResponse.json(
      { error: "Invalid wallet address" },
      { status: 400 }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000); // ⏱️ 8s timeout

  try {
    const url = `https://api.shelbynet.shelby.xyz/shelby/v1/blobs/${wallet}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        {
          error: "Shelby API error",
          status: res.status,
          detail: text,
        },
        { status: 502 }
      );
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    clearTimeout(timeout);

    if (err.name === "AbortError") {
      return NextResponse.json(
        { error: "Shelby API timeout" },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        error: "Shelby API proxy failed",
        message: err?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
