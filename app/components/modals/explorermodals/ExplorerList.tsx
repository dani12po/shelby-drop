"use client";

import ExplorerFileRowAdapter, {
  ExplorerItem,
} from "./ExplorerFileRowAdapter";

import type {
  FileItemData,
  FolderItem,
} from "@/lib/data";

/* ===============================
   PROPS
================================ */
type Props = {
  wallet: string;
  items: ExplorerItem[];
  selectedIds: Set<string>;

  /* ===============================
     EVENTS (INDEX-AWARE)
  ================================ */
  onItemClick: (
    item: ExplorerItem,
    index: number,
    e: React.MouseEvent
  ) => void;

  onContextMenu: (
    item: ExplorerItem,
    e: React.MouseEvent
  ) => void;

  onOpenFolder: (folder: FolderItem) => void;
  onPreview: (file: FileItemData) => void;
  onMeta: (file: FileItemData) => void;
};

/* ===============================
   COMPONENT
================================ */
export default function ExplorerList({
  wallet,
  items,
  selectedIds,
  onItemClick,
  onContextMenu,
  onOpenFolder,
  onPreview,
  onMeta,
}: Props) {
  return (
    <div className="relative">
      {items.map((item, index) => {
        const isSelected = selectedIds.has(item.id);

        return (
          <ExplorerFileRowAdapter
            key={`${item.type}-${item.id}`}
            item={item}
            wallet={wallet}
            selected={isSelected}

            /* ===============================
               LEFT CLICK → SELECTION
            ================================ */
            onClick={(e) =>
              onItemClick(item, index, e)
            }

            /* ===============================
               RIGHT CLICK → CONTEXT MENU
            ================================ */
            onContextMenu={(e) =>
              onContextMenu(item, e)
            }

            /* ===============================
               FILE / FOLDER ACTIONS
            ================================ */
            onOpenFolder={onOpenFolder}
            onPreview={onPreview}
            onMeta={onMeta}
          />
        );
      })}
    </div>
  );
}
