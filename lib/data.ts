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
 * Union type
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
