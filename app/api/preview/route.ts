// app/api/preview/route.ts

import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===============================
   CONFIG
================================ */
const SHELBY_ENDPOINT =
  process.env.SHELBY_S3_ENDPOINT ??
  "https://api.shelbynet.shelby.xyz/shelby/v1/blobs";

const SIGNING_SECRET =
  process.env.SHELBY_SIGNING_SECRET ??
  "dev-secret-change-me";

/* ===============================
   SIGNED URL GENERATOR
================================ */
function generateSignedUrl(params: {
  wallet: string;
  objectPath: string;
  expiresInSeconds?: number;
}) {
  const expires =
    Math.floor(Date.now() / 1000) +
    (params.expiresInSeconds ?? 60);

  const payload = `${params.wallet}/${params.objectPath}:${expires}`;

  const signature = crypto
    .createHmac("sha256", SIGNING_SECRET)
    .update(payload)
    .digest("hex");

  return `${SHELBY_ENDPOINT}/${params.wallet}/${params.objectPath}?expires=${expires}&sig=${signature}`;
}

/* ===============================
   GET /api/preview
================================ */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const wallet = searchParams.get("wallet");
  const pathParam = searchParams.get("path");

  if (!wallet || !pathParam) {
    return NextResponse.json(
      { error: "Missing parameters" },
      { status: 400 }
    );
  }

  // Prevent path traversal
  const safePath = pathParam
    .split("/")
    .filter(Boolean)
    .join("/");

  const signedUrl = generateSignedUrl({
    wallet,
    objectPath: safePath,
    expiresInSeconds: 120, // 2 minutes
  });

  return NextResponse.json({
    url: signedUrl,
    expiresIn: 120,
  });
}
