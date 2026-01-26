// app/api/upload/route.ts

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { runRetentionCleanup } from "@/lib/retention/cleanup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(
  process.cwd(),
  "public/uploads"
);

/* ===============================
   POST /api/upload
   Retention-enforced (server-side)
================================ */
export async function POST(req: Request) {
  try {
    /* ===============================
       🔁 LAZY RETENTION CLEANUP
       (serverless-safe)
    ================================ */
    await runRetentionCleanup();

    const form = await req.formData();

    const file = form.get("file");
    const wallet = form.get("wallet");
    const uploadPath = (form.get("path") as string) ?? "";

    /* ===============================
       RETENTION (SAFE)
       0 = unlimited
    ================================ */
    const retentionRaw = form.get("retentionDays");
    const retentionDays =
      typeof retentionRaw === "string"
        ? Number(retentionRaw)
        : 0;

    if (
      !Number.isFinite(retentionDays) ||
      retentionDays < 0
    ) {
      return NextResponse.json(
        { error: "Invalid retention period" },
        { status: 400 }
      );
    }

    const expiresAt =
      retentionDays > 0
        ? new Date(
            Date.now() +
              retentionDays *
                24 *
                60 *
                60 *
                1000
          ).toISOString()
        : null;

    /* ===============================
       VALIDATION
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
       METADATA (PER FILE)
    ================================ */
    const blobPath = [
      ...safePath,
      safeName,
    ].join("/");

    const metadata = {
      wallet,
      originalName: file.name,
      storedName: safeName,
      size: file.size,
      mime: file.type,
      hash,

      retentionDays,
      expiresAt,

      uploadedAt: new Date().toISOString(),

      // logical path (Explorer + Preview)
      blob_name: blobPath,
    };

    await fs.writeFile(
      `${filePath}.json`,
      JSON.stringify(metadata, null, 2)
    );

    /* ===============================
       🧠 UPDATE index.json (EXPLORER)
       public/uploads/<wallet>/index.json
    ================================ */
    const walletDir = path.join(
      UPLOAD_DIR,
      wallet
    );

    const indexPath = path.join(
      walletDir,
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

    // Avoid duplicates (by blob_name)
    const exists = index.some(
      (item) =>
        item.blob_name === metadata.blob_name
    );

    if (!exists) {
      index.push({
        blob_name: metadata.blob_name,
        size: metadata.size,
        contentType: metadata.mime,
        createdAt: metadata.uploadedAt,
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
