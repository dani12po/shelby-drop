// app/components/explorer/adapters/apiToExplorerItem.ts

import type { FileItemData, FolderItem } from "@/lib/data";
import type { ExplorerItem } from "@/types/explorer";

/**
 * API → DOMAIN
 * Satu-satunya tempat konversi data API
 */
export function adaptApiItemToExplorerItem(
  item: FileItemData | FolderItem
): ExplorerItem {
  if (item.type === "file") {
    return {
      kind: "file",
      id: item.id,
      name: item.name,
      path: item.path.join("/"), // 🔴 FIX string[] → string
      size: item.size ?? 0,
      mimeType: item.mimeType ?? "application/octet-stream",
    };
  }

  return {
    kind: "folder",
    id: item.id,
    name: item.name,
    path: item.path.join("/"),
    childrenCount: item.childrenCount,
  };
}
