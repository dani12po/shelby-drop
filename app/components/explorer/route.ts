import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { Dirent } from "fs";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(
  process.cwd(),
  "public/uploads"
);

/* ===============================
   TYPES (MATCH lib/data.ts)
================================ */
type FileItem = {
  id: string;
  type: "file";
  name: string;
  size: number;
  path: string[];

  blobId: string;
  fileType: "PDF" | "IMG" | "OTHER";
  uploader: string;
};

type FolderItem = {
  id: string;
  type: "folder";
  name: string;
  path: string[];
  children: Array<FolderItem | FileItem>;
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

if (!wallet) {
  return NextResponse.json(
    { error: "Missing wallet" },
    { status: 400 }
  );
}

const walletSafe: string = wallet; // 🔑 FIX
const userDir = path.join(UPLOAD_DIR, walletSafe);

  async function walk(
    dir: string,
    relPath: string[] = []
  ): Promise<Array<FolderItem | FileItem>> {
    const entries: Dirent[] = await fs.readdir(dir, {
      withFileTypes: true,
    });

    const items: Array<FolderItem | FileItem> = [];

    for (const entry of entries) {
      const name = entry.name.toString(); // 🔑 FORCE STRING

      if (entry.isDirectory()) {
        const children = await walk(
          path.join(dir, name),
          [...relPath, name]
        );

        items.push({
          id: name,
          type: "folder",
          name,
          path: [...relPath, name],
          children,
        });
      } else if (
        entry.isFile() &&
        !name.endsWith(".json")
      ) {
        const fullPath = path.join(dir, name);
        const stat = await fs.stat(fullPath);

        const [blobId, ...rest] = name.split("_");
        const originalName =
          rest.join("_") || name;

        items.push({
          id: blobId,
          type: "file",
          name: originalName,
          size: stat.size,
          path: relPath,

          blobId,
          fileType: inferFileType(originalName),
          uploader: walletSafe,
        });
      }
    }

    return items;
  }

  try {
    const children = await walk(userDir);

    const root: FolderItem = {
      id: "root",
      type: "folder",
      name: "root",
      path: [],
      children,
    };

    return NextResponse.json(root);
  } catch {
    // wallet belum punya upload
    return NextResponse.json({
      id: "root",
      type: "folder",
      name: "root",
      path: [],
      children: [],
    });
  }
}
