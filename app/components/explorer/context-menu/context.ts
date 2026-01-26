
import type { ExplorerPermissionMap } from "./permissions";

export type ContextMenuItem = any;

export type ContextMenuContext = {
  items: ContextMenuItem[];
  permissions: ExplorerPermissionMap;
  target?: ContextMenuItem;
  isSingle: boolean;
  isMulti: boolean;
};

export function createContext(
  items: ContextMenuItem[],
  permissions: ExplorerPermissionMap,
  target?: ContextMenuItem
): ContextMenuContext {
  return {
    items,
    permissions,
    target,
    isSingle: items.length === 1,
    isMulti: items.length > 1,
  };
}
