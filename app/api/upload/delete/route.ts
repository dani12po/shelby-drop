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
 * POST /api/upload/delete
 *
 * Body:
 * {
 *   wallet: string,
 *   blob_name: string
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { wallet, blob_name } = body;

    /* ===============================
       VALIDATION
    ================================ */
    if (
      typeof wallet !== "string" ||
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
       RESOLVE FILE PATH
       public/uploads/<wallet>/<blob_name>
    ================================ */
    const filePath = path.join(
      UPLOAD_DIR,
      wallet,
      blob_name
    );

    const metadataPath = `${filePath}.json`;

    /* ===============================
       DELETE FILE + METADATA
    ================================ */
    await fs.rm(filePath, {
      force: true,
    });

    await fs.rm(metadataPath, {
      force: true,
    });

    /* ===============================
       UPDATE index.json
    ================================ */
    const indexPath = path.join(
      UPLOAD_DIR,
      wallet,
      "index.json"
    );

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

    const nextIndex = index.filter(
      (item) => item.blob_name !== blob_name
    );

    await fs.writeFile(
      indexPath,
      JSON.stringify(nextIndex, null, 2),
      "utf-8"
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "[DELETE_UPLOAD_ERROR]",
      error
    );

    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
