/* ===============================
   CORE DATA TYPES
================================ */

/**
 * Folder item (node)
 * Digunakan untuk routing & explorer
 */
export type FolderItem = {
  id: string;
  name: string;
  type: "folder";

  /**
   * Isi folder (tree mode)
   * ⚠️ Explorer modal tidak selalu pakai ini
   */
  children: FileItem[];

  /**
   * Path folder dari root wallet
   */
  path: string[];
};

/**
 * File item (leaf)
 */
export type FileItemData = {
  id: string;
  blobId: string;
  name: string;
  type: "file";

  fileType: "PDF" | "IMG" | "OTHER";

  /**
   * Ukuran file (RAW bytes)
   */
  size: number;

  /**
   * Path folder tempat file berada
   */
  path: string[];

  /**
   * Wallet uploader
   */
  uploader: string;

  /**
   * Retention policy (hari)
   */
  retentionDays?: number;

  /**
   * Expiry timestamp (ISO)
   */
  expiresAt?: string;

  /**
   * Upload / modified time (ISO)
   * ⬅️ DARI filesystem (stat.mtime)
   */
  uploadedAt?: string;
};

/**
 * Union type untuk Explorer
 */
export type FileItem = FolderItem | FileItemData;

/* ===============================
   TYPE GUARDS
================================ */

export function isFile(
  item: FileItem
): item is FileItemData {
  return item.type === "file";
}

export function isFolder(
  item: FileItem
): item is FolderItem {
  return item.type === "folder";
}

/* ===============================
   FACTORY HELPERS
================================ */

export function createRootFolder(
  walletAddress: string
): FolderItem {
  return {
    id: walletAddress,
    name: walletAddress,
    type: "folder",
    children: [],
    path: [],
  };
}

export function createFolder(
  name: string,
  path: string[]
): FolderItem {
  return {
    id: [...path, name].join("/"),
    name,
    type: "folder",
    children: [],
    path,
  };
}

export function createFileItem(params: {
  id: string;
  blobId: string;
  name: string;
  fileType: FileItemData["fileType"];
  size: number;
  path: string[];
  uploader: string;
  uploadedAt?: string;
  retentionDays?: number;
  expiresAt?: string;
}): FileItemData {
  return {
    type: "file",
    ...params,
  };
}

/* ===============================
   TREE UTILITIES
================================ */

export function findFolderByPath(
  root: FolderItem,
  path: string[]
): FolderItem | null {
  if (path.length === 0) return root;

  let current: FolderItem = root;

  for (const segment of path) {
    const next = current.children.find(
      (item): item is FolderItem =>
        isFolder(item) && item.name === segment
    );

    if (!next) return null;
    current = next;
  }

  return current;
}

export function addItemToFolder(
  root: FolderItem,
  item: FileItem
): FolderItem {
  const target = findFolderByPath(root, item.path);

  if (!target) {
    throw new Error(
      `Folder path not found: ${item.path.join("/")}`
    );
  }

  target.children.push(item);
  return root;
}

export function flattenTree(
  root: FolderItem
): FileItem[] {
  const result: FileItem[] = [];

  function walk(folder: FolderItem) {
    for (const child of folder.children) {
      result.push(child);
      if (isFolder(child)) {
        walk(child);
      }
    }
  }

  walk(root);
  return result;
}

/* ===============================
   FILE HELPERS
================================ */

export function inferFileType(
  fileName: string
): FileItemData["fileType"] {
  const lower = fileName.toLowerCase();

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

/**
 * Human-readable size helper (UI only)
 */
export function formatFileSize(
  bytes: number
): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(
      1
    )} MB`;

  return `${(bytes / 1024 / 1024 / 1024).toFixed(
    1
  )} GB`;
}

/**
 * Safe date getter (sorting / UI)
 */
export function getFileDate(
  item: FileItem
): number {
  if (isFile(item) && item.uploadedAt) {
    return new Date(item.uploadedAt).getTime();
  }
  return 0;
}
