"use client";

import {
  Folder,
  File as FileIcon,
  FileText,
  Image,
  Video,
  Music,
  Eye,
  Share2,
  Info,
  Download,
} from "lucide-react";
import type { MouseEvent } from "react";

import type { ExplorerItem } from "@/types/explorer";

function formatSize(bytes?: number) {
  if (!bytes || bytes === 0) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function FileTypeIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png","jpg","jpeg","gif","webp","svg"].includes(ext))
    return <Image size={16} className="text-purple-400" />;
  if (["mp4","webm","mov","avi","mkv"].includes(ext))
    return <Video size={16} className="text-pink-400" />;
  if (["mp3","wav","ogg","flac","aac"].includes(ext))
    return <Music size={16} className="text-green-400" />;
  if (["pdf","txt","md","json","js","ts","css","html"].includes(ext))
    return <FileText size={16} className="text-blue-400" />;
  return <FileIcon size={16} className="text-blue-400" />;
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
  onPreview?: (file: ExplorerItem) => void;
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
  onPreview,
}: Props) {
  const isFile = item.kind === "file";

  function handleDoubleClick(
    e: MouseEvent<HTMLDivElement>
  ) {
    e.stopPropagation();

    if (item.kind === "folder") {
      onOpenFolder(item);
    } else if (item.kind === "file") {
      onPreview?.(item);
    }
  }

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDoubleClick={handleDoubleClick}
      className={`
        grid grid-cols-[24px_1fr_50px_80px] sm:grid-cols-[32px_1fr_80px_120px]
        items-center gap-2 sm:gap-4
        px-4 py-3
        select-none
        transition-colors
        cursor-default
        ${
          selected
            ? "bg-transparent"
            : "bg-transparent"
        }
      `}
    >
      {/* ICON */}
      <div className="flex items-center justify-center">
        {item.kind === "folder" ? (
          <Folder size={18} className="text-amber-400 fill-amber-400/20" />
        ) : (
          <FileTypeIcon name={item.name} />
        )}
      </div>

      {/* NAME */}
      <div className="truncate text-sm font-medium text-slate-200 min-w-0">
        {item.name}
      </div>

      {/* SIZE */}
      <div className="text-right text-xs font-mono text-slate-500">
        {isFile ? formatSize(item.size) : "—"}
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-1">
        {isFile && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview?.(item);
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
              title="Preview"
            >
              <Eye size={14} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload?.(item);
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
              title="Download"
            >
              <Download size={14} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare?.(item);
              }}
              className="hidden sm:flex p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
              title="Share"
            >
              <Share2 size={14} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onMeta(item);
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
              title="Info"
            >
              <Info size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
