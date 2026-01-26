import type { ExplorerPermissionMap } from "./permissions";

/* ======================================================
   ROLE TYPES
====================================================== */

export type ExplorerRole =
  | "admin"
  | "editor"
  | "viewer";

/* ======================================================
   ROLE → PERMISSION MAP
   - Key HARUS sesuai ExplorerPermission
   - Boolean = allow / deny
====================================================== */

export const ROLE_PERMISSION_MAP: Record<
  ExplorerRole,
  ExplorerPermissionMap
> = {
  admin: {
    read: true,
    preview: true,
    download: true,
    share: true,
    delete: true,
  },

  editor: {
    read: true,
    preview: true,
    download: true,
    share: true,
    delete: false,
  },

  viewer: {
    read: true,
    preview: true,
    download: false,
    share: false,
    delete: false,
  },
};
