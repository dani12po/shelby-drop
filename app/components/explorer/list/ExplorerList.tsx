"use client";

import { useMemo, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

import ExplorerRow from "./ExplorerRow";
import type { ExplorerItem } from "@/types/explorer";

/* ===============================
   SORT TYPES
================================ */

type SortKey = "name" | "size";
type SortDir = "asc" | "desc";

/* ===============================
   PROPS
================================ */

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

  onOpenFolder: (folder: ExplorerItem) => void;
  onMeta: (file: ExplorerItem) => void;
  onDownload?: (file: ExplorerItem) => void;
  onShare?: (file: ExplorerItem) => void;

  /** optional – for auto-scroll */
  itemRefs?: React.MutableRefObject<
    Record<string, HTMLDivElement | null>
  >;
};

/* ===============================
   COMPONENT
================================ */

export default function ExplorerList({
  items,
  selectedIds,
  onItemClick,
  onContextMenu,
  onOpenFolder,
  onMeta,
  onDownload,
  onShare,
  itemRefs,
}: Props) {
  const [sortKey, setSortKey] =
    useState<SortKey>("name");
  const [sortDir, setSortDir] =
    useState<SortDir>("asc");

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) =>
        d === "asc" ? "desc" : "asc"
      );
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  /* ===============================
     SORTED ITEMS
  ================================ */
  const sortedItems = useMemo(() => {
    const folders = items.filter(
      (i) => i.kind === "folder"
    );
    const files = items.filter(
      (i) => i.kind === "file"
    );

    function compare(
      a: ExplorerItem,
      b: ExplorerItem
    ) {
      let v1: string | number = "";
      let v2: string | number = "";

      if (sortKey === "size") {
        v1 =
          a.kind === "file" ? a.size : 0;
        v2 =
          b.kind === "file" ? b.size : 0;
      } else {
        v1 = a.name.toLowerCase();
        v2 = b.name.toLowerCase();
      }

      if (v1 < v2) return sortDir === "asc" ? -1 : 1;
      if (v1 > v2) return sortDir === "asc" ? 1 : -1;
      return 0;
    }

    return [
      ...folders.sort(compare),
      ...files.sort(compare),
    ];
  }, [items, sortKey, sortDir]);

  /* ===============================
     HEADER CELL
  ================================ */
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
        <div
          className={`text-white/50 ${
            align === "right"
              ? "text-right"
              : ""
          }`}
        >
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
          ${
            align === "right"
              ? "justify-end"
              : ""
          }
          ${
            active
              ? "text-white"
              : "text-white/50 hover:text-white"
          }
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

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div
        className="
          grid grid-cols-[20px_1fr_90px_80px]
          px-[15px] py-2
          text-[11px] font-medium
          bg-[#0b0f14]
        "
      >
        <div />
        <Header label="Name" col="name" />
        <Header
          label="Size"
          col="size"
          align="right"
        />
        <Header
          label="Actions"
          align="right"
        />
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto">
        {sortedItems.map((item, index) => {
          const selected =
            selectedIds.has(item.id);

          return (
            <div
              key={`${item.kind}-${item.id}`}
              ref={(el) => {
                if (itemRefs) {
                  itemRefs.current[item.id] = el;
                }
              }}
              className={`
                relative
                transition
                ${
                  selected
                    ? "bg-white/10 ring-1 ring-white/20"
                    : "hover:bg-white/5"
                }
              `}
            >
              <ExplorerRow
                item={item}
                selected={selected}
                onClick={(e) =>
                  onItemClick(item, index, e)
                }
                onContextMenu={(e) =>
                  onContextMenu(item, e)
                }
                onOpenFolder={onOpenFolder}
                onMeta={onMeta}
                onDownload={onDownload}
                onShare={onShare}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
