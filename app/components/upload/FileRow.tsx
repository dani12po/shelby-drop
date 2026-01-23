"use client";

import type {
  FileItem,
  FolderItem,
  FileItemData,
} from "@/lib/data";

import { getRetentionStatus } from "@/lib/retention";

/* ===============================
   PROPS
================================ */

type Props = {
  item: FileItem;
  wallet: string;
  onOpenFolder: (folder: FolderItem) => void;
  onPreview: (file: FileItemData) => void;
  onMeta: (file: FileItemData) => void;
};

/* ===============================
   COMPONENT
================================ */

export default function FileRow({
  item,
  wallet,
  onOpenFolder,
  onPreview,
  onMeta,
}: Props) {
  /* ===============================
     FOLDER ROW
  ================================ */
  if (item.type === "folder") {
    return (
      <div
        onClick={() => onOpenFolder(item)}
        className="
          grid grid-cols-5
          px-4 py-2
          cursor-pointer
          hover:bg-white/5
          transition
          border-b border-white/5
        "
      >
        <div className="col-span-2 truncate">
          📁 {item.name}
        </div>

        <div className="text-gray-400 text-xs">
          Folder
        </div>

        <div className="text-gray-400 text-xs">
          —
        </div>

        <div className="text-right text-gray-500">
          ›
        </div>
      </div>
    );
  }

  /* ===============================
     FILE ROW
  ================================ */

  const retention = getRetentionStatus(
    item.expiresAt
  );

  const isExpired =
    retention.state === "expired";

  /* ===============================
     DOWNLOAD (SIGNED URL)
  ================================ */
  async function handleDownload(
    e: React.MouseEvent
  ) {
    e.stopPropagation();
    if (isExpired) return;

    try {
      const key = `${wallet}/${[
        ...item.path,
        item.name,
      ].join("/")}`;

      const res = await fetch(
        `/api/files/signed?wallet=${wallet}&key=${encodeURIComponent(
          key
        )}`
      );

      if (!res.ok) {
        throw new Error(
          "Failed to get signed download URL"
        );
      }

      const data = await res.json();
      window.open(data.url, "_blank");
    } catch {
      alert("Download failed");
    }
  }

  /* ===============================
     SHARE
  ================================ */
  async function shareFile(
    e: React.MouseEvent
  ) {
    e.stopPropagation();
    if (isExpired) return;

    const target = `/wallet/${wallet}/${item.path.join(
      "/"
    )}/${item.name}`;

    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ target }),
      });

      if (!res.ok) {
        throw new Error(
          "Failed to create share link"
        );
      }

      const data = await res.json();
      await navigator.clipboard.writeText(
        data.url
      );
      alert("Share link copied!");
    } catch {
      alert("Unable to share file");
    }
  }

  /* ===============================
     RENDER
  ================================ */

  return (
    <div
      className="
        group
        grid grid-cols-5
        px-4 py-2
        items-center
        hover:bg-white/5
        transition
        border-b border-white/5
      "
    >
      {/* ===========================
          NAME / PREVIEW
      ============================ */}
      <button
        onClick={() =>
          !isExpired && onPreview(item)
        }
        disabled={isExpired}
        className={`
          col-span-2
          text-left
          truncate
          ${
            isExpired
              ? "opacity-40 cursor-not-allowed"
              : "hover:underline"
          }
        `}
        title={
          isExpired
            ? "File expired"
            : "Preview"
        }
      >
        📄 {item.name}
      </button>

      {/* ===========================
          TYPE + RETENTION
      ============================ */}
      <div className="text-gray-400 text-xs flex items-center gap-2">
        {item.fileType}

        {retention.state === "active" && (
          <span className="text-yellow-400">
            ⏳ {retention.label}
          </span>
        )}

        {retention.state === "expired" && (
          <span className="text-red-500">
            EXPIRED
          </span>
        )}
      </div>

      {/* ===========================
          SIZE
      ============================ */}
      <div className="text-gray-400 text-xs">
        {item.size}
      </div>

      {/* ===========================
          ACTIONS
      ============================ */}
      <div className="
        flex justify-end gap-3
        opacity-0 group-hover:opacity-100
        transition
      ">
        {/* DOWNLOAD */}
        <button
          onClick={handleDownload}
          disabled={isExpired}
          className={`
            ${
              isExpired
                ? "opacity-40 cursor-not-allowed"
                : "hover:text-blue-400"
            }
          `}
          title={
            isExpired
              ? "File expired"
              : "Download"
          }
        >
          ⬇
        </button>

        {/* SHARE */}
        <button
          onClick={shareFile}
          disabled={isExpired}
          className={`
            ${
              isExpired
                ? "opacity-40 cursor-not-allowed"
                : "hover:text-blue-400"
            }
          `}
          title={
            isExpired
              ? "File expired"
              : "Share"
          }
        >
          🔗
        </button>

        {/* METADATA */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMeta(item);
          }}
          className="hover:text-blue-400"
          title="Metadata"
        >
          ℹ️
        </button>
      </div>
    </div>
  );
}
