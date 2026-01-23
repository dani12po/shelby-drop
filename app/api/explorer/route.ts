// app/api/explorer/route.ts

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===============================
   CONFIG
================================ */
const UPLOAD_DIR = path.join(
  process.cwd(),
  "public/uploads"
);

/* ===============================
   TYPES (LOCAL, BACKEND-ONLY)
================================ */
type ExplorerFile = {
  id: string;
  type: "file";
  name: string;
  size: string;
  path: string[];

  blobId: string;
  fileType: "PDF" | "IMG" | "OTHER";
  uploader: string;

  expiresAt?: string;
  retentionDays?: number;
};

type ExplorerFolder = {
  id: string;
  type: "folder";
  name: string;
  path: string[];
  children: Array<ExplorerFolder | ExplorerFile>;
};

/* ===============================
   HELPERS
================================ */
function inferFileType(
  name: string
): "PDF" | "IMG" | "OTHER" {
  const lower = name.toLowerCase();

  if (lower.endsWith(".pdf")) return "PDF";
  if (
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".webp")
  ) {
    return "IMG";
  }

  return "OTHER";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(
    1
  )} MB`;
}

/* ===============================
   WALK DIRECTORY
================================ */
async function walkDirectory(
  absDir: string,
  wallet: string,
  relPath: string[] = []
): Promise<Array<ExplorerFolder | ExplorerFile>> {
  let entries: string[];

  try {
    entries = await fs.readdir(absDir);
  } catch {
    return [];
  }

  const items: Array<
    ExplorerFolder | ExplorerFile
  > = [];

  for (const entryName of entries) {
    const absPath = path.join(absDir, entryName);
    const stat = await fs.stat(absPath);

    /* ===== FOLDER ===== */
    if (stat.isDirectory()) {
      const children = await walkDirectory(
        absPath,
        wallet,
        [...relPath, entryName]
      );

      items.push({
        id: entryName,
        type: "folder",
        name: entryName,
        path: [...relPath, entryName],
        children,
      });

      continue;
    }

    /* ===== SKIP METADATA FILE ===== */
    if (entryName.endsWith(".json")) continue;

    /* ===== FILE ===== */
    const metaPath = `${absPath}.json`;

    let meta: any = null;
    try {
      const raw = await fs.readFile(
        metaPath,
        "utf-8"
      );
      meta = JSON.parse(raw);
    } catch {
      // metadata optional (legacy files)
    }

    const [blobId, ...rest] =
      entryName.split("_");
    const originalName =
      meta?.originalName ??
      rest.join("_") ??
      entryName;

    /* ===== RETENTION FILTER ===== */
    if (
      meta?.expiresAt &&
      new Date(meta.expiresAt).getTime() <
        Date.now()
    ) {
      continue; // expired → hidden
    }

    items.push({
      id: blobId,
      type: "file",
      name: originalName,
      size: formatSize(stat.size),
      path: relPath,

      blobId,
      fileType: inferFileType(originalName),
      uploader: wallet,

      expiresAt: meta?.expiresAt,
      retentionDays: meta?.retentionDays,
    });
  }

  return items;
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

  const userDir = path.join(
    UPLOAD_DIR,
    wallet
  );

  const children = await walkDirectory(
    userDir,
    wallet
  );

  const root: ExplorerFolder = {
    id: wallet,
    type: "folder",
    name: wallet,
    path: [],
    children,
  };

  return NextResponse.json(root);
}
