import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { Dirent } from "fs";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

/* ===============================
   TYPES (MATCH lib/data.ts)
================================ */
type FileItemData = {
  id: string;
  type: "file";
  name: string;
  size: number;
  path: string[];
  blobId: string;
  fileType: "PDF" | "IMG" | "OTHER";
  uploader: string;
  uploadedAt: string; // ✅ REAL DATE
};

type FolderItem = {
  id: string;
  type: "folder";
  name: string;
  path: string[];
};

/* ===============================
   HELPERS
================================ */
function inferFileType(
  name: string
): "PDF" | "IMG" | "OTHER" {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "PDF";
  if (
    ["png", "jpg", "jpeg", "gif", "webp"].includes(ext ?? "")
  ) {
    return "IMG";
  }
  return "OTHER";
}

/* ===============================
   GET /api/explorer
================================ */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");
  const rawPath = searchParams.get("path") || "/";

  if (!wallet) {
    return NextResponse.json(
      { error: "Missing wallet" },
      { status: 400 }
    );
  }

  const safePath =
    rawPath === "/"
      ? []
      : rawPath.split("/").filter(Boolean);

  const baseDir = path.join(
    UPLOAD_DIR,
    wallet,
    ...safePath
  );

  try {
    const entries: Dirent[] = await fs.readdir(baseDir, {
      withFileTypes: true,
    });

    const folders: FolderItem[] = [];
    const files: FileItemData[] = [];

    for (const entry of entries) {
      const name = entry.name.toString();

      /* ---------- FOLDER ---------- */
      if (entry.isDirectory()) {
        folders.push({
          id: [...safePath, name].join("/"),
          type: "folder",
          name,
          path: [...safePath, name],
        });
        continue;
      }

      /* ---------- FILE ---------- */
      if (entry.isFile() && !name.endsWith(".json")) {
        const fullPath = path.join(baseDir, name);
        const stat = await fs.stat(fullPath);

        const [blobId, ...rest] = name.split("_");
        const originalName =
          rest.join("_") || name;

        files.push({
          id: blobId,
          type: "file",
          name: originalName,
          size: stat.size,
          path: safePath,
          blobId,
          fileType: inferFileType(originalName),
          uploader: wallet,
          uploadedAt: stat.mtime.toISOString(), // ✅ REAL DATE
        });
      }
    }

    return NextResponse.json({
      folders,
      files,
    });
  } catch {
    // Folder belum ada / kosong
    return NextResponse.json({
      folders: [],
      files: [],
    });
  }
}
