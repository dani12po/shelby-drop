/**
 * ExplorerItem
 * ------------
 * Domain-level entity
 * Source of truth untuk Explorer feature
 *
 * Aturan:
 * - Tidak bergantung ke React / UI
 * - Tidak tahu soal selection / preview / context menu
 * - Dipakai lintas layer (adapter, list, preview, menu, bulk action)
 */

import type { ExplorerAcl } from "./acl";

/* ======================================================
   DISCRIMINATED UNION (KUNCI UTAMA)
====================================================== */

export type ExplorerItem =
  | ExplorerFileItem
  | ExplorerFolderItem;

/* ======================================================
   BASE CONTRACT
====================================================== */

interface ExplorerItemBase {
  /**
   * Stable unique identifier
   * Digunakan untuk selection, key, bulk action
   */
  id: string;

  /**
   * Display name (tanpa path)
   */
  name: string;

  /**
   * Full logical path (flat string, bukan filesystem path)
   * Contoh:
   * - "root"
   * - "root/images"
   * - "root/images/logo.png"
   */
  path: string;

  /**
   * Parent logical path (untuk inheritance ACL)
   * null / undefined = root
   */
  parentPath?: string;

  /**
   * Optional Access Control List (ACL)
   * ----------------------------------
   * - Override permission berbasis role
   * - Tidak selalu ada (inherit / default)
   * - Digunakan oleh permission resolver
   */
  acl?: ExplorerAcl;
}

/* ======================================================
   FILE ITEM
====================================================== */

export interface ExplorerFileItem extends ExplorerItemBase {
  kind: "file";

  /**
   * File size in bytes
   */
  size: number;

  /**
   * MIME type (e.g. image/png, application/pdf)
   *
   * Catatan:
   * - WAJIB ada di domain Explorer
   * - Dipakai oleh preview + share + content-type resolver
   */
  mimeType: string;
}

/* ======================================================
   FOLDER ITEM
====================================================== */

export interface ExplorerFolderItem extends ExplorerItemBase {
  kind: "folder";

  /**
   * Optional hint untuk UI
   * - Tidak selalu tersedia dari backend
   * - Jangan dijadikan source of truth
   */
  childrenCount?: number;
}
