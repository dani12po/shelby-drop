// app/api/files/signed/route.ts

import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===============================
   ENV (STRICT & CORRECT)
================================ */

// Public Shelby blob endpoint (READ)
const SHELBY_BLOB_ENDPOINT =
  process.env.SHELBY_S3_ENDPOINT ??
  "https://api.shelbynet.shelby.xyz/shelby/v1/blobs";

// ⚠️ INTERNAL SIGNING SECRET (NOT API KEY)
const SIGNING_SECRET_RAW =
  process.env.SHELBY_SIGNING_SECRET;

if (!SIGNING_SECRET_RAW) {
  throw new Error(
    "SHELBY_SIGNING_SECRET is missing"
  );
}
const SIGNING_SECRET: string = SIGNING_SECRET_RAW;

/* ===============================
   CONFIG
================================ */
const SIGNED_URL_TTL_SECONDS = 120; // 2 minutes

/* ===============================
   SIGN HELPER
   (HMAC-SHA256)
================================ */
function signUrl(params: {
  wallet: string;
  objectKey: string;
  expires: number;
}) {
  const payload = `${params.wallet}/${params.objectKey}:${params.expires}`;

  const signature = crypto
    .createHmac("sha256", SIGNING_SECRET)
    .update(payload)
    .digest("hex");

  return `${SHELBY_BLOB_ENDPOINT}/${params.wallet}/${params.objectKey}?expires=${params.expires}&sig=${signature}`;
}

/* ===============================
   GET /api/files/signed
================================ */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const wallet = searchParams.get("wallet");
  const key = searchParams.get("key");

  /* ===============================
     VALIDATION
  ================================ */
  if (!wallet || !key) {
    return NextResponse.json(
      { error: "Missing wallet or key" },
      { status: 400 }
    );
  }

  /* ===============================
     ACCESS CONTROL
     Wallet namespace only
  ================================ */
  if (!key.startsWith(`${wallet}/`)) {
    return NextResponse.json(
      { error: "Access denied" },
      { status: 403 }
    );
  }

  /* ===============================
     PATH SANITIZATION
  ================================ */
  const safeKey = key
    .split("/")
    .filter(Boolean)
    .join("/");

  /* ===============================
     SIGNED URL
  ================================ */
  const expires =
    Math.floor(Date.now() / 1000) +
    SIGNED_URL_TTL_SECONDS;

  const signedUrl = signUrl({
    wallet,
    objectKey: safeKey,
    expires,
  });

  /* ===============================
     RESPONSE (FRONTEND SAFE)
  ================================ */
  return NextResponse.json({
    url: signedUrl,
    expiresAt: expires,
  });
}
