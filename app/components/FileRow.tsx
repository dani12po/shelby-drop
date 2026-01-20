"use client";

import type {
  FileItem,
  FolderItem,
  FileItemData,
} from "@/lib/data";
import { buildShelbyDownloadUrl } from "@/lib/shelbyDownload";

type Props = {
  item: FileItem;
  wallet: string;
  onOpenFolder: (folder: FolderItem) => void;
  onPreview: (file: FileItemData) => void;
  onMeta: (file: FileItemData) => void;
};

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
        className="grid grid-cols-5 px-4 py-2 hover:bg-white/5 cursor-pointer"
      >
        <div className="col-span-2">📁 {item.name}</div>
        <div className="text-gray-400">Folder</div>
        <div className="text-gray-400">—</div>
        <div className="text-right text-gray-500">›</div>
      </div>
    );
  }

  /* ===============================
     FILE ROW
  ================================ */
  const downloadUrl = buildShelbyDownloadUrl(
    wallet,
    item
  );

  async function shareFile() {
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
        throw new Error("Failed to create share link");
      }

      const data = await res.json();
      await navigator.clipboard.writeText(data.url);
      alert("Share link copied!");
    } catch {
      alert("Unable to share file");
    }
  }

  return (
    <div className="grid grid-cols-5 px-4 py-2 hover:bg-white/5 items-center">
      {/* NAME / PREVIEW */}
      <button
        onClick={() => onPreview(item)}
        className="col-span-2 text-left hover:underline"
        title="Preview"
      >
        📄 {item.name}
      </button>

      {/* TYPE */}
      <div className="text-gray-400">
        {item.fileType}
      </div>

      {/* SIZE */}
      <div className="text-gray-400">
        {item.size}
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3">
        {/* DOWNLOAD */}
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-400"
          title="Download"
        >
          ⬇
        </a>

        {/* SHARE */}
        <button
          onClick={shareFile}
          className="hover:text-blue-400"
          title="Share"
        >
          🔗
        </button>

        {/* METADATA */}
        <button
          onClick={() => onMeta(item)}
          className="hover:text-blue-400"
          title="Metadata"
        >
          ℹ️
        </button>
      </div>
    </div>
  );
}
