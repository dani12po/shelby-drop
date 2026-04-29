// app/api/files/signed/route.ts

import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===============================
   ENV (STRICT & CORRECT)
================================ */

// BUG #3 FIX: Use S3 Gateway endpoint, not the blob API endpoint
// Format: https://gateway.shelby.xyz/{wallet}/{objectKey}?expires=...&sig=...
const SHELBY_GATEWAY_ENDPOINT =
  process.env.NEXT_PUBLIC_S3_GATEWAY_ORIGIN ??
  "https://gateway.shelby.xyz";

// ⚠️ INTERNAL SIGNING SECRET (NOT API KEY)
const SIGNING_SECRET_RAW =
  process.env.SHELBY_SIGNING_SECRET;

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
  // Double-check: ensure secret is available before signing
  if (!SIGNING_SECRET_RAW) {
    throw new Error("SHELBY_SIGNING_SECRET is not configured");
  }

  const payload = `${params.wallet}/${params.objectKey}:${params.expires}`;

  const signature = crypto
    .createHmac("sha256", SIGNING_SECRET_RAW)
    .update(payload)
    .digest("hex");

  return `${SHELBY_GATEWAY_ENDPOINT}/${params.wallet}/${params.objectKey}?expires=${params.expires}&sig=${signature}`;
}

/* ===============================
   GET /api/files/signed
================================ */
export async function GET(req: Request) {
  /* ===============================
     ENVIRONMENT CHECK
  ================================ */
  if (!SIGNING_SECRET_RAW) {
    return NextResponse.json(
      { error: "Server configuration error: SHELBY_SIGNING_SECRET is missing" },
      { status: 500 }
    );
  }

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
