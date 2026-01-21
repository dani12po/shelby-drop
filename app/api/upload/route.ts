import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const wallet = formData.get("wallet") as string | null;
    const message = formData.get("message") as string | null;
    const signatureRaw = formData.get("signature") as string | null;

    /* ===============================
       BASIC VALIDATION
    ================================ */
    if (!file || !wallet || !message || !signatureRaw) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!wallet.startsWith("0x")) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    /* ===============================
       PARSE SIGNATURE
    ================================ */
    let signature: any;
    try {
      signature = JSON.parse(signatureRaw);
    } catch {
      return NextResponse.json(
        { error: "Invalid signature format" },
        { status: 400 }
      );
    }

    /* ===============================
       FILE STORAGE
    ================================ */
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      wallet
    );

    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());

    const hash = crypto
      .createHash("sha256")
      .update(buffer)
      .digest("hex");

    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    /* ===============================
       METADATA (TEMP STORAGE)
    ================================ */
    const metadata = {
      wallet,
      filename,
      originalName: file.name,
      size: file.size,
      mime: file.type,
      hash,
      message,
      signature,
      uploadedAt: new Date().toISOString(),
      path: `/uploads/${wallet}/${filename}`,
    };

    const metaPath = path.join(
      uploadDir,
      `${filename}.json`
    );

    await writeFile(
      metaPath,
      JSON.stringify(metadata, null, 2)
    );

    /* ===============================
       RESPONSE
    ================================ */
    return NextResponse.json({
      success: true,
      file: metadata,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
