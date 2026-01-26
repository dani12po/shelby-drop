"use client";

import {
  Folder,
  File as FileIcon,
  Eye,
  Share2,
  Info,
  Download,
} from "lucide-react";
import type { MouseEvent } from "react";

import type { ExplorerItem } from "@/types/explorer";

/* ===============================
   HELPERS (UI ONLY)
================================ */

function formatSize(bytes?: number) {
  if (!bytes || bytes === 0) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${
    sizes[i]
  }`;
}

/* ===============================
   PROPS
================================ */

type Props = {
  item: ExplorerItem;
  selected: boolean;

  onClick: (e: MouseEvent<HTMLDivElement>) => void;
  onContextMenu: (
    e: MouseEvent<HTMLDivElement>
  ) => void;

  onOpenFolder: (folder: ExplorerItem) => void;
  onMeta: (file: ExplorerItem) => void;
  onDownload?: (file: ExplorerItem) => void;
  onShare?: (file: ExplorerItem) => void;
};

/* ===============================
   COMPONENT
================================ */

export default function ExplorerRow({
  item,
  selected,
  onClick,
  onContextMenu,
  onOpenFolder,
  onMeta,
  onDownload,
  onShare,
}: Props) {
  const isFile = item.kind === "file";

  function handleDoubleClick(
    e: MouseEvent<HTMLDivElement>
  ) {
    e.stopPropagation();

    if (item.kind === "folder") {
      onOpenFolder(item);
    }
    // Removed onPreview call - preview will be handled by separate modal
  }

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDoubleClick={handleDoubleClick}
      className={`
        grid grid-cols-[20px_1fr_90px_80px]
        items-center gap-3
        px-[15px] py-2
        rounded-md
        select-none
        transition
        cursor-default
        ${
          selected
            ? "bg-purple-500/15 border border-purple-400/40"
            : "hover:bg-white/5"
        }
      `}
    >
      {/* ICON */}
      <div>
        {item.kind === "folder" ? (
          <Folder
            size={16}
            className="text-yellow-400"
          />
        ) : (
          <FileIcon
            size={16}
            className="text-blue-400"
          />
        )}
      </div>

      {/* NAME */}
      <div className="truncate text-sm">
        {item.name}
      </div>

      {/* SIZE */}
      <div className="text-right text-xs text-white/60">
        {isFile ? formatSize(item.size) : "—"}
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-2">
        {isFile && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMeta(item);
              }}
              className="p-1.5 rounded-md hover:bg-white/10"
              title="Metadata"
            >
              <Info size={14} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload?.(item);
              }}
              className="p-1.5 rounded-md hover:bg-white/10"
              title="Download"
            >
              <Download size={14} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare?.(item);
              }}
              className="p-1.5 rounded-md hover:bg-white/10"
              title="Share"
            >
              <Share2 size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
