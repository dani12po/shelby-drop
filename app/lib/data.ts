/* ===============================
   CORE DATA TYPES
================================ */

/**
 * Folder item (node)
 * Digunakan untuk routing & explorer
 */
export type FolderItem = {
  /**
   * ID unik
   * - root folder: wallet address
   * - sub folder: bebas (nama folder / hash)
   */
  id: string;

  /**
   * Nama folder (ditampilkan & dipakai di URL)
   */
  name: string;

  /**
   * Diskriminator
   */
  type: "folder";

  /**
   * Isi folder
   */
  children: FileItem[];

  /**
   * Path folder dari root wallet
   * contoh:
   *  []                       → root
   *  ["docs"]                 → /wallet/0xABC/docs
   *  ["docs", "images"]       → /wallet/0xABC/docs/images
   */
  path: string[];
};

/**
 * File item (leaf)
 */
export type FileItemData = {
  /**
   * Internal ID (bebas)
   */
  id: string;

  /**
   * Blob ID dari Shelby
   */
  blobId: string;

  /**
   * Nama file + ekstensi
   */
  name: string;

  /**
   * Diskriminator
   */
  type: "file";

  /**
   * Jenis file (untuk icon & preview)
   */
  fileType: "PDF" | "IMG" | "OTHER";

  /**
   * Ukuran file (formatted)
   * contoh: "2.3 MB"
   */
  size: string;

  /**
   * Path folder tempat file berada
   * contoh:
   *  []                       → root
   *  ["docs"]                 → /docs
   *  ["docs", "images"]       → /docs/images
   */
  path: string[];

  /**
   * Wallet uploader
   */
  uploader: string;
};

/**
 * Union type untuk Explorer
 */
export type FileItem = FolderItem | FileItemData;





/* ===============================
   TYPE GUARDS
================================ */

/**
 * Cek apakah item adalah file
 */
export function isFile(
  item: FileItem
): item is FileItemData {
  return item.type === "file";
}

/**
 * Cek apakah item adalah folder
 */
export function isFolder(
  item: FileItem
): item is FolderItem {
  return item.type === "folder";
}





/* ===============================
   FACTORY HELPERS
   (Dipakai oleh upload & mapping blob)
================================ */

/**
 * Buat root folder untuk wallet
 */
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

/**
 * Buat folder baru
 */
export function createFolder(
  name: string,
  path: string[]
): FolderItem {
  return {
    id: `${path.join("/")}/${name}`,
    name,
    type: "folder",
    children: [],
    path,
  };
}

/**
 * Buat file item dari blob
 */
export function createFileItem(params: {
  id: string;
  blobId: string;
  name: string;
  fileType: FileItemData["fileType"];
  size: string;
  path: string[];
  uploader: string;
}): FileItemData {
  return {
    type: "file",
    ...params,
  };
}





/* ===============================
   TREE UTILITIES
================================ */

/**
 * Cari folder berdasarkan path
 */
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

/**
 * Tambahkan item ke folder tertentu
 */
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

/**
 * Flatten tree (berguna untuk search)
 */
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
   FILE TYPE HELPERS
================================ */

/**
 * Tentukan tipe file dari nama
 */
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
