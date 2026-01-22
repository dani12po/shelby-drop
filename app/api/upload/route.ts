// app/api/upload/route.ts

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(
  process.cwd(),
  "public/uploads"
);

/* ===============================
   POST /api/upload
   NO SIGNATURE REQUIRED
================================ */
export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const file = form.get("file");
    const wallet = form.get("wallet");
    const uploadPath = (form.get("path") as string) ?? "";

    /* ===============================
       VALIDATION (UPDATED)
    ================================ */
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Invalid file" },
        { status: 400 }
      );
    }

    if (typeof wallet !== "string" || !wallet) {
      return NextResponse.json(
        { error: "Invalid wallet" },
        { status: 400 }
      );
    }

    /* ===============================
       PREPARE STORAGE PATH
       public/uploads/<wallet>/<path?>
    ================================ */
    const safePath = uploadPath
      .split("/")
      .filter(Boolean);

    const userDir = path.join(
      UPLOAD_DIR,
      wallet,
      ...safePath
    );

    await fs.mkdir(userDir, { recursive: true });

    /* ===============================
       READ FILE
    ================================ */
    const bytes = Buffer.from(
      await file.arrayBuffer()
    );

    /* ===============================
       HASH (PREVENT COLLISION)
    ================================ */
    const hash = crypto
      .createHash("sha256")
      .update(bytes)
      .digest("hex");

    const safeName = `${hash}_${file.name}`;
    const filePath = path.join(
      userDir,
      safeName
    );

    await fs.writeFile(filePath, bytes);

    /* ===============================
       METADATA
    ================================ */
    const metadata = {
      wallet,
      originalName: file.name,
      storedName: safeName,
      size: file.size,
      mime: file.type,
      hash,
      uploadedAt: new Date().toISOString(),
      path: `/uploads/${wallet}/${safePath.join(
        "/"
      )}/${safeName}`,
    };

    await fs.writeFile(
      `${filePath}.json`,
      JSON.stringify(metadata, null, 2)
    );

    return NextResponse.json({
      success: true,
      metadata,
    });
  } catch (err) {
    console.error("UPLOAD_ERROR", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
