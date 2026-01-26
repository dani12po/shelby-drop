
import type { ExplorerItem } from "@/types/explorer";
import type { ContextMenuContext } from "./context";
import type { ExplorerPermissionMap } from "./permissions";

export function getContextMenuContext(params: {
  items: ExplorerItem[];
  permissions: ExplorerPermissionMap;
}): ContextMenuContext {
  return {
    items: params.items as any,
    permissions: params.permissions,
  } as any;
}
