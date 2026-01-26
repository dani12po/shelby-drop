import type { ExplorerAcl } from "@/types/acl";
import type { ExplorerPermission } from "./permissions";

/* ======================================================
   ACL INHERITANCE RESOLVER
   Parent ACL → Child ACL
====================================================== */

/**
 * Merge parent ACL into child ACL.
 *
 * Rules:
 * - Child entries override parent entries (per role)
 * - deny > allow
 * - Pure merge, no permission evaluation here
 */
export function resolveInheritedAcl(
  parentAcl?: ExplorerAcl,
  childAcl?: ExplorerAcl
): ExplorerAcl | undefined {
  if (!parentAcl && !childAcl) {
    return undefined;
  }

  if (!parentAcl) {
    return childAcl ? [...childAcl] : undefined;
  }

  if (!childAcl) {
    return [...parentAcl];
  }

  const result: ExplorerAcl = [];

  const roles = new Set([
    ...parentAcl.map((e) => e.role),
    ...childAcl.map((e) => e.role),
  ]);

  for (const role of roles) {
    const parent = parentAcl.find(
      (e) => e.role === role
    );
    const child = childAcl.find(
      (e) => e.role === role
    );

    const allow: Partial<
      Record<ExplorerPermission, boolean>
    > = {};

    const deny: Partial<
      Record<ExplorerPermission, boolean>
    > = {};

    // 1️⃣ inherit from parent
    if (parent?.allow) {
      Object.assign(allow, parent.allow);
    }
    if (parent?.deny) {
      Object.assign(deny, parent.deny);
    }

    // 2️⃣ override by child
    if (child?.allow) {
      Object.assign(allow, child.allow);
    }
    if (child?.deny) {
      Object.assign(deny, child.deny);
    }

    // 3️⃣ deny always wins
    for (const key of Object.keys(
      deny
    ) as ExplorerPermission[]) {
      if (deny[key] === true) {
        allow[key] = false;
      }
    }

    if (
      Object.keys(allow).length === 0 &&
      Object.keys(deny).length === 0
    ) {
      continue;
    }

    result.push({
      role,
      allow:
        Object.keys(allow).length > 0
          ? allow
          : undefined,
      deny:
        Object.keys(deny).length > 0
          ? deny
          : undefined,
    });
  }

  return result.length > 0 ? result : undefined;
}
