// app/components/explorer/context-menu/permissions.ts

/* ======================================================
   EXPLORER PERMISSIONS (DOMAIN-LEVEL)
   SOURCE OF TRUTH
====================================================== */

/**
 * Semua permission yang dikenal oleh Explorer
 *
 * ATURAN KERAS:
 * - String literal INI yang dipakai di seluruh sistem
 * - TANPA prefix "can"
 * - Dipakai oleh:
 *   - role-permission-map
 *   - ACL (allow / deny)
 *   - permission-guards
 *   - context-menu actions
 *   - permission resolver
 */
export type ExplorerPermission =
  | "read"
  | "preview"
  | "download"
  | "share"
  | "delete";

/* ======================================================
   PERMISSION MAP
====================================================== */

/**
 * Permission map lengkap
 *
 * true  = allowed
 * false = denied
 *
 * Digunakan sebagai:
 * - ROLE → ExplorerPermissionMap (full map)
 * - ACL  → Partial<ExplorerPermissionMap>
 * - Effective permission result
 */
export type ExplorerPermissionMap = Record<
  ExplorerPermission,
  boolean
>;

/* ======================================================
   DEFAULT / EMPTY MAP
====================================================== */

/**
 * Default kosong (deny all)
 * Berguna untuk:
 * - init
 * - fallback
 * - safety guard
 */
export const EMPTY_PERMISSION_MAP: ExplorerPermissionMap =
  {
    read: false,
    preview: false,
    download: false,
    share: false,
    delete: false,
  };

/* ======================================================
   TYPE GUARDS / HELPERS (OPTIONAL, TAPI AMAN)
====================================================== */

/**
 * Runtime-safe check
 */
export function isExplorerPermission(
  value: unknown
): value is ExplorerPermission {
  return (
    value === "read" ||
    value === "preview" ||
    value === "download" ||
    value === "share" ||
    value === "delete"
  );
}
