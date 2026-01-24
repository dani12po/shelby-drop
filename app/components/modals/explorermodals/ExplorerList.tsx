"use client";

import { useMemo, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

import ExplorerFileRowAdapter, {
  ExplorerItem,
} from "./ExplorerFileRowAdapter";

import type { FileItemData, FolderItem } from "@/lib/data";

type SortKey = "name" | "size" | "date";
type SortDir = "asc" | "desc";

type Props = {
  items: ExplorerItem[];
  selectedIds: Set<string>;

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

export default function ExplorerList({
  items,
  selectedIds,
  onItemClick,
  onContextMenu,
  onOpenFolder,
  onPreview,
  onMeta,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortedItems = useMemo(() => {
    const folders = items.filter((i) => i.type === "folder");
    const files = items.filter((i) => i.type === "file");

    function compare(a: ExplorerItem, b: ExplorerItem) {
      let v1: number | string = 0;
      let v2: number | string = 0;

      switch (sortKey) {
        case "size":
          v1 = a.type === "file" ? a.size : 0;
          v2 = b.type === "file" ? b.size : 0;
          break;
        case "date":
          v1 =
            a.type === "file" && a.uploadedAt
              ? new Date(a.uploadedAt).getTime()
              : 0;
          v2 =
            b.type === "file" && b.uploadedAt
              ? new Date(b.uploadedAt).getTime()
              : 0;
          break;
        default:
          v1 = a.name.toLowerCase();
          v2 = b.name.toLowerCase();
      }

      if (v1 < v2) return sortDir === "asc" ? -1 : 1;
      if (v1 > v2) return sortDir === "asc" ? 1 : -1;
      return 0;
    }

    return [...folders.sort(compare), ...files.sort(compare)];
  }, [items, sortKey, sortDir]);

  function Header({
    label,
    col,
    align = "left",
  }: {
    label: string;
    col?: SortKey;
    align?: "left" | "right";
  }) {
    if (!col) {
      return (
        <div className={`text-white/50 ${align === "right" ? "text-right" : ""}`}>
          {label}
        </div>
      );
    }

    const active = sortKey === col;

    return (
      <button
        onClick={() => toggleSort(col)}
        className={`
          flex items-center gap-1
          ${align === "right" ? "justify-end" : ""}
          ${active ? "text-white" : "text-white/50 hover:text-white"}
        `}
      >
        {label}
        {active &&
          (sortDir === "asc" ? (
            <ArrowUp size={12} />
          ) : (
            <ArrowDown size={12} />
          ))}
      </button>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* HEADER (FIXED) */}
      <div
        className="
          grid grid-cols-[20px_1fr_90px_120px_80px]
          px-[15px] py-2
          text-[11px] font-medium
          bg-[#0b0f14]
          border-b border-white/10
        "
      >
        <div />
        <Header label="Name" col="name" />
        <Header label="Size" col="size" align="right" />
        <Header label="Date" col="date" align="right" />
        <Header label="Actions" align="right" />
      </div>

      {/* BODY (SCROLL ONLY HERE) */}
      <div className="flex-1 overflow-y-auto">
        {sortedItems.map((item, index) => (
          <div
            key={`${item.type}-${item.id}`}
            className="
              grid grid-cols-[20px_1fr_90px_120px_80px]
              px-[15px]
            "
          >
            <ExplorerFileRowAdapter
              item={item}
              selected={selectedIds.has(item.id)}
              onClick={(e) => onItemClick(item, index, e)}
              onContextMenu={(e) => onContextMenu(item, e)}
              onOpenFolder={onOpenFolder}
              onPreview={onPreview}
              onMeta={onMeta}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
