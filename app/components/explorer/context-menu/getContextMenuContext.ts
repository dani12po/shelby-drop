
import type { ExplorerItem } from "@/types/explorer";
import type { ContextMenuContext } from "./context";
import type { ExplorerPermissionMap } from "./permissions";

export function getContextMenuContext(params: {
  items: ExplorerItem[];
  permissions: ExplorerPermissionMap;
  onPreview?: (item: any) => void;
  onDownload?: (item: any) => void;
  onShare?: (item: any) => void;
  onMeta?: (item: any) => void;
  onBulkDownload?: (items: any[]) => void;
}): ContextMenuContext {
  const items = params.items as any[];
  return {
    items,
    permissions: params.permissions,
    isSingle: items.length === 1,
    isMulti: items.length > 1,
    onPreview: params.onPreview,
    onDownload: params.onDownload,
    onShare: params.onShare,
    onMeta: params.onMeta,
    onBulkDownload: params.onBulkDownload,
  };
}
