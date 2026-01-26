/**
 * apiToExplorerItem
 * -----------------
 * Adapter dari API / data domain → Explorer UI domain
 *
 * Aturan keras:
 * - SATU ARAH (API → UI)
 * - Explorer UI TIDAK BOLEH mengakses FileItemData langsung
 * - Semua ExplorerItem HARUS lewat adapter ini
 */

import type {
  FileItemData,
  FolderItem,
} from "@/lib/data";

import type {
  ExplorerItem,
  ExplorerFileItem,
  ExplorerFolderItem,
} from "@/types/explorer";

/* ======================================================
   MAIN ADAPTER
====================================================== */

export function apiToExplorerItem(
  item: FileItemData | FolderItem
): ExplorerItem {
  if (item.type === "file") {
    return mapFileItem(item);
  }

  return mapFolderItem(item);
}

/* ======================================================
   FILE MAPPER
====================================================== */

function mapFileItem(
  file: FileItemData
): ExplorerFileItem {
  return {
    kind: "file",

    id: file.id,
    name: file.name,

    /**
     * Logical path untuk Explorer
     * Disimpan sebagai flat string
     */
    path: file.path.join("/"),

    /**
     * Parent path (untuk ACL / inheritance)
     */
    parentPath:
      file.path.length > 1
        ? file.path.slice(0, -1).join("/")
        : undefined,

    size: file.size,

    /**
     * MIME type WAJIB di Explorer domain
     * Fallback aman untuk preview & share
     */
    mimeType:
      file.mimeType ?? "application/octet-stream",
  };
}

/* ======================================================
   FOLDER MAPPER
====================================================== */

function mapFolderItem(
  folder: FolderItem
): ExplorerFolderItem {
  return {
    kind: "folder",

    id: folder.id,
    name: folder.name,

    /**
     * Logical path untuk Explorer
     */
    path: folder.path.join("/"),

    /**
     * Parent path (untuk ACL / permission)
     */
    parentPath:
      folder.path.length > 0
        ? folder.path.slice(0, -1).join("/")
        : undefined,

    /**
     * Optional UI hint
     */
    childrenCount: folder.childrenCount,
  };
}
