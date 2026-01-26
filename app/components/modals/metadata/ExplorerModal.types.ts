import type { FileItemData, FolderItem } from "@/lib/data";

/**
 * Explorer item union
 * (JANGAN import dari adapter)
 */
export type ExplorerItem =
  | (FileItemData & { type: "file" })
  | (FolderItem & { type: "folder" });

export type ContextTarget =
  | { type: "file"; data: FileItemData }
  | { type: "folder"; data: FolderItem };
