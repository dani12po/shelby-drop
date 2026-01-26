import type { ExplorerRole } from "@/types/role";
import type { ExplorerPermissionMap } from "./permissions";
import { ROLE_PERMISSION_MAP } from "./role-permission-map";

/**
 * Resolve permission from role
 * ----------------------------
 * Bisa di-extend ke ACL / API capability
 */
export function resolveExplorerPermission(
  role: ExplorerRole
): ExplorerPermissionMap {
  return ROLE_PERMISSION_MAP[role];
}
