"use client";

import {
  Folder,
  File as FileIcon,
  Download,
  Share2,
} from "lucide-react";

import type { FileItemData, FolderItem } from "@/lib/data";
import type { ExplorerItem } from "./ExplorerFileRowAdapter";

/* ===============================
   HELPERS
================================ */
function formatSize(bytes?: number) {
  if (!bytes || bytes === 0) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDate(value?: string | number) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

/* ===============================
   PROPS
================================ */
type Props = {
  item: ExplorerItem;
  selected: boolean;

  onOpenFolder: (folder: FolderItem) => void;
  onPreview: (file: FileItemData) => void;
  onMeta: (file: FileItemData) => void;
};

/* ===============================
   COMPONENT
================================ */
export default function ExplorerRow({
  item,
  selected,
  onOpenFolder,
  onPreview,
  onMeta,
}: Props) {
  const isFile = item.type === "file";

  return (
    <div
      className={`
        grid grid-cols-[20px_1fr_90px_120px_80px]
        items-center gap-3
        px-[15px] py-2
        rounded-md
        select-none
        transition
        ${selected
          ? "bg-purple-500/15 border border-purple-400/40"
          : "hover:bg-white/5"}
      `}
      onDoubleClick={() => {
        if (item.type === "folder") onOpenFolder(item);
        else onPreview(item);
      }}
    >
      {/* ICON */}
      <div>
        {item.type === "folder" ? (
          <Folder size={16} className="text-yellow-400" />
        ) : (
          <FileIcon size={16} className="text-blue-400" />
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

      {/* DATE */}
      <div className="text-right text-xs text-white/40">
        {isFile && "uploadedAt" in item
          ? formatDate(item.uploadedAt)
          : "—"}
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-2">
        {isFile && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview(item);
              }}
              className="p-1.5 rounded-md hover:bg-white/10"
              title="Download"
            >
              <Download size={14} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onMeta(item);
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
