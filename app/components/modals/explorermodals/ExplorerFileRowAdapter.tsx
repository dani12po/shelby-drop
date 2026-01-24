"use client";

import ExplorerRow from "./ExplorerRow";
import type { FileItemData, FolderItem } from "@/lib/data";

/* ===============================
   EXPLORER ITEM UNION
================================ */
export type ExplorerItem =
  | (FolderItem & { type: "folder" })
  | (FileItemData & { type: "file" });

/* ===============================
   PROPS
================================ */
type Props = {
  item: ExplorerItem;
  selected: boolean;

  onClick: (e: React.MouseEvent, item: ExplorerItem) => void;
  onContextMenu: (e: React.MouseEvent, item: ExplorerItem) => void;

  onOpenFolder: (folder: FolderItem) => void;
  onPreview: (file: FileItemData) => void;
  onMeta: (file: FileItemData) => void;
};

/* ===============================
   COMPONENT
================================ */
export default function ExplorerFileRowAdapter({
  item,
  selected,
  onClick,
  onContextMenu,
  onOpenFolder,
  onPreview,
  onMeta,
}: Props) {
  return (
    <div
      className={`
        group
        grid grid-cols-[20px_1fr_90px_120px_80px]
        items-center
        gap-3
        px-[15px] py-2
        transition
        select-none
        ${
          selected
            ? "bg-purple-500/15 border border-purple-400/40 rounded-md"
            : "hover:bg-white/5"
        }
      `}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e, item);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e, item);
      }}
    >
      <ExplorerRow
        item={item}
        selected={selected}
        onOpenFolder={onOpenFolder}
        onPreview={onPreview}
        onMeta={onMeta}
      />
    </div>
  );
}
