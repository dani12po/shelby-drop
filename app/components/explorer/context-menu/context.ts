
import type { ExplorerPermissionMap } from "./permissions";

export type ContextMenuItem = any;

export type ContextMenuContext = {
  items: ContextMenuItem[];
  permissions: ExplorerPermissionMap;
  target?: ContextMenuItem;
  isSingle: boolean;
  isMulti: boolean;
  /** Optional action callbacks — wired up by ExplorerModal */
  onPreview?: (item: ContextMenuItem) => void;
  onDownload?: (item: ContextMenuItem) => void;
  onShare?: (item: ContextMenuItem) => void;
  onMeta?: (item: ContextMenuItem) => void;
  onBulkDownload?: (items: ContextMenuItem[]) => void;
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
