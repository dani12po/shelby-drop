import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

/* ===============================
   ON-CHAIN PLACEHOLDER
   (STEP 7.5 akan diganti TX Aptos)
================================ */
async function submitOnChainRecord(
  wallet: string,
  fileName: string,
  hash: string
) {
  console.log("ONCHAIN_RECORD", {
    wallet,
    fileName,
    hash,
    timestamp: Date.now(),
  });
}

/* ===============================
   POST /api/shelby/upload
================================ */
export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const file = form.get("file") as File | null;
    const wallet = form.get("wallet") as string | null;
    const message = form.get("message") as string | null;
    const signature = form.get("signature") as string | null;

    if (!file || !wallet || !message || !signature) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    /* ===============================
       PREPARE STORAGE
    ================================ */
    const userDir = path.join(UPLOAD_DIR, wallet);
    await fs.mkdir(userDir, { recursive: true });

    const bytes = Buffer.from(await file.arrayBuffer());

    /* ===============================
       FILE HASH (SHA-256)
    ================================ */
    const hash = crypto
      .createHash("sha256")
      .update(bytes)
      .digest("hex");

    const filePath = path.join(userDir, file.name);
    await fs.writeFile(filePath, bytes);

    /* ===============================
       METADATA
    ================================ */
    const metadata = {
      wallet,
      originalName: file.name,
      size: file.size,
      mime: file.type,
      hash,
      uploadedAt: new Date().toISOString(),
      path: `/uploads/${wallet}/${file.name}`,
    };

    await fs.writeFile(
      `${filePath}.json`,
      JSON.stringify(metadata, null, 2)
    );

    /* ===============================
       ON-CHAIN (LOGIC STUB)
    ================================ */
    await submitOnChainRecord(wallet, file.name, hash);

    return NextResponse.json({
      success: true,
      metadata,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
