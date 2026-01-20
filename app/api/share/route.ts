import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

function genCode() {
  return Math.random()
    .toString(36)
    .substring(2, 8);
}

/* ===============================
   CREATE SHORT LINK
================================ */
export async function POST(req: Request) {
  try {
    const { target } = await req.json();

    if (!target) {
      return NextResponse.json(
        { error: "Missing target" },
        { status: 400 }
      );
    }

    const code = genCode();

    // store for 30 days (TTL optional)
    await kv.set(
      `share:${code}`,
      target,
      { ex: 60 * 60 * 24 * 30 }
    );

    return NextResponse.json({
      code,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/${code}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 }
    );
  }
}

/* ===============================
   RESOLVE SHORT LINK
================================ */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Missing code" },
      { status: 400 }
    );
  }

  const target = await kv.get<string>(
    `share:${code}`
  );

  if (!target) {
    return NextResponse.json(
      { error: "Link not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ target });
}
