/* ======================================================
   CORE DATA TYPES
   ----------------
   API / Backend / Infra domain
   ❗ BUKAN domain UI
====================================================== */

/**
 * Folder item (virtual node)
 * Digunakan oleh API & data layer
 */
export type FolderItem = {
  id: string;
  name: string;
  type: "folder";

  /**
   * Path dari root wallet
   * Contoh:
   * ["folderA", "folderB"]
   */
  path: string[];

  /**
   * Children (tree mode)
   * ⚠️ Explorer modal TIDAK selalu pakai ini
   */
  children?: FileItem[];

  /**
   * Number of children (optional hint)
   */
  childrenCount?: number;
};

/**
 * File item (leaf node)
 */
export type FileItemData = {
  id: string;
  name: string;
  type: "file";

  /**
   * Path file relatif ke root wallet
   * Contoh:
   * ["folder", "file.pdf"]
   */
  path: string[];

  /**
   * Ukuran file (bytes)
   */
  size: number;

  /**
   * MIME type
   * Optional di backend, WAJIB di ExplorerItem
   */
  mimeType?: string;

  /**
   * Optional metadata
   */
  blobId?: string;
  uploader?: string;

  /**
   * File category hint
   */
  fileType?: "PDF" | "IMG" | "OTHER";

  /**
   * Retention info
   */
  retentionDays?: number;
  expiresAt?: string;

  /**
   * Upload / modified time (ISO string)
   */
  uploadedAt?: string;
};

/**
 * Union type (API domain)
 */
export type FileItem = FolderItem | FileItemData;

/* ======================================================
   TYPE GUARDS
====================================================== */

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

/* ======================================================
   FACTORY HELPERS
   (Data creation only, no UI logic)
====================================================== */

/**
 * Create root folder node
 */
export function createRootFolder(
  walletAddress: string
): FolderItem {
  return {
    id: walletAddress,
    name: walletAddress,
    type: "folder",
    path: [],
    children: [],
  };
}

/**
 * Create folder node
 */
export function createFolder(
  name: string,
  path: string[]
): FolderItem {
  return {
    id: [...path, name].join("/"),
    name,
    type: "folder",
    path: [...path, name],
    children: [],
  };
}

/**
 * Create file node
 */
export function createFileItem(params: {
  id: string;
  name: string;
  path: string[];
  size: number;
  mimeType?: string;
  uploadedAt?: string;
  blobId?: string;
  uploader?: string;
  retentionDays?: number;
  expiresAt?: string;
}): FileItemData {
  return {
    type: "file",
    ...params,
  };
}

/* ======================================================
   PATH & URL HELPERS (INFRA)
====================================================== */

/**
 * Build public URL for preview / download
 * ⚠️ Bukan permission-aware
 * (Signed URL system akan dibangun terpisah)
 */
export function getFilePublicUrl(
  file: FileItemData
): string {
  return `/uploads/${file.path.join("/")}`;
}

/* ======================================================
   TREE UTILITIES (OPTIONAL)
   Digunakan hanya jika mode tree aktif
====================================================== */

export function findFolderByPath(
  root: FolderItem,
  path: string[]
): FolderItem | null {
  if (path.length === 0) return root;

  let current: FolderItem = root;

  for (const segment of path) {
    const next = current.children?.find(
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

  target.children ??= [];
  target.children.push(item);
  return root;
}

/* ======================================================
   FILE HELPERS (NON-UI)
====================================================== */

/**
 * Get numeric timestamp for sorting
 */
export function getFileDate(
  item: FileItem
): number {
  if (isFile(item) && item.uploadedAt) {
    return new Date(item.uploadedAt).getTime();
  }
  return 0;
}
