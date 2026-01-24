"use client";

import FileRow from "@/components/upload/FileRow";
import type {
  FileItem,
  FileItemData,
  FolderItem,
} from "@/lib/data";

/* ===============================
   EXPLORER ITEM UNION
================================ */
export type ExplorerItem =
  | (FolderItem & { type: "folder" })
  | (FileItemData & { type: "file" });

type Props = {
  item: ExplorerItem;
  wallet: string;
  selected: boolean;

  /* ===============================
     EVENTS (FORWARDED ONLY)
  ================================ */
  onClick: (
    e: React.MouseEvent,
    item: ExplorerItem
  ) => void;

  onContextMenu: (
    e: React.MouseEvent,
    item: ExplorerItem
  ) => void;

  onOpenFolder: (folder: FolderItem) => void;
  onPreview: (file: FileItemData) => void;
  onMeta: (file: FileItemData) => void;
};

export default function ExplorerFileRowAdapter({
  item,
  wallet,
  selected,
  onClick,
  onContextMenu,
  onOpenFolder,
  onPreview,
  onMeta,
}: Props) {
  /* ===============================
     FileRow EXPECTS FileItem
     (FolderItem ⊂ FileItem)
  ================================ */
  const adaptedItem = item as FileItem;

  return (
    <div
      onClick={(e) => onClick(e, item)}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e, item);
      }}
      className={`
        ${selected ? "bg-white/10" : ""}
        hover:bg-white/5
        transition-colors
      `}
    >
      <FileRow
        item={adaptedItem}
        wallet={wallet}
        onOpenFolder={onOpenFolder}
        onPreview={onPreview}
        onMeta={onMeta}
      />
    </div>
  );
}
