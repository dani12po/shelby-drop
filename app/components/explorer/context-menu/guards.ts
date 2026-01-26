import type { ExplorerItem } from "@/types/explorer";

export function allFiles(
  items: ExplorerItem[]
): items is Extract<ExplorerItem, { kind: "file" }>[] {
  return items.every((i) => i.kind === "file");
}

export function allFolders(
  items: ExplorerItem[]
): items is Extract<ExplorerItem, { kind: "folder" }>[] {
  return items.every((i) => i.kind === "folder");
}

export function mixedItems(
  items: ExplorerItem[]
): boolean {
  return (
    items.some((i) => i.kind === "file") &&
    items.some((i) => i.kind === "folder")
  );
}
