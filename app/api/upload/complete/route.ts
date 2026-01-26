import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(
  process.cwd(),
  "public/uploads"
);

/**
 * POST /api/upload/complete
 *
 * Purpose:
 * - Called AFTER a file upload succeeds
 * - Updates Explorer index.json for the connected wallet
 *
 * This endpoint DOES NOT upload files.
 * It only records metadata for Explorer viewer.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      wallet,
      blob_name,
      size,
      contentType,
      createdAt,
    } = body;

    /* ===============================
       VALIDATION
    ================================ */
    if (
      typeof wallet !== "string" ||
      !wallet ||
      !wallet.startsWith("0x")
    ) {
      return NextResponse.json(
        { error: "Invalid wallet" },
        { status: 400 }
      );
    }

    if (
      typeof blob_name !== "string" ||
      !blob_name
    ) {
      return NextResponse.json(
        { error: "Invalid blob_name" },
        { status: 400 }
      );
    }

    /* ===============================
       PREPARE PATH
       public/uploads/<wallet>/index.json
    ================================ */
    const walletDir = path.join(
      UPLOAD_DIR,
      wallet
    );

    await fs.mkdir(walletDir, {
      recursive: true,
    });

    const indexPath = path.join(
      walletDir,
      "index.json"
    );

    /* ===============================
       READ EXISTING INDEX
    ================================ */
    let index: any[] = [];

    try {
      const existing = await fs.readFile(
        indexPath,
        "utf-8"
      );
      index = JSON.parse(existing);
    } catch {
      index = [];
    }

    /* ===============================
       DEDUPLICATION
       (by blob_name)
    ================================ */
    const exists = index.some(
      (item) => item.blob_name === blob_name
    );

    if (!exists) {
      index.push({
        blob_name,
        size: typeof size === "number" ? size : null,
        contentType:
          typeof contentType === "string"
            ? contentType
            : "application/octet-stream",
        createdAt:
          typeof createdAt === "string"
            ? createdAt
            : new Date().toISOString(),
      });

      await fs.writeFile(
        indexPath,
        JSON.stringify(index, null, 2),
        "utf-8"
      );
    }

    /* ===============================
       RESPONSE
    ================================ */
    return NextResponse.json({
      success: true,
      added: !exists,
    });
  } catch (error) {
    console.error(
      "[UPLOAD_COMPLETE_ERROR]",
      error
    );

    return NextResponse.json(
      { error: "Failed to update index" },
      { status: 500 }
    );
  }
}
