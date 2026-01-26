import type {
  ExplorerPermission,
  ExplorerPermissionMap,
} from "./permissions";
import type { ExplorerAcl } from "@/types/acl";
import { ROLE_PERMISSION_MAP } from "./role-permission-map";
import { resolveInheritedAcl } from "./resolveInheritedAcl";

/* ======================================================
   EFFECTIVE PERMISSION RESOLVER
====================================================== */

export function resolveEffectivePermission(
  role: keyof typeof ROLE_PERMISSION_MAP,
  acl?: ExplorerAcl,
  parentAcl?: ExplorerAcl
): ExplorerPermissionMap {
  const base: ExplorerPermissionMap = {
    ...ROLE_PERMISSION_MAP[role],
  };

  const effectiveAcl = resolveInheritedAcl(
    parentAcl,
    acl
  );

  if (!effectiveAcl) {
    return base;
  }

  for (const entry of effectiveAcl) {
    if (entry.role !== role) continue;

    if (entry.allow) {
      for (const key of Object.keys(
        entry.allow
      ) as ExplorerPermission[]) {
        if (entry.allow[key] === true) {
          base[key] = true;
        }
      }
    }

    if (entry.deny) {
      for (const key of Object.keys(
        entry.deny
      ) as ExplorerPermission[]) {
        if (entry.deny[key] === true) {
          base[key] = false;
        }
      }
    }
  }

  return base;
}
