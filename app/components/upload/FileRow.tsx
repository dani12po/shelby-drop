'use client';

import type {
  FileItem,
  FolderItem,
  FileItemData,
} from '@/lib/data';

import { getRetentionStatus } from '@/lib/retention';
import React from 'react';

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
  if (item.type === 'folder') {
    return (
      <div
        onClick={() => onOpenFolder(item)}
        className="
          group
          grid grid-cols-5
          px-4 py-2
          items-center
          cursor-pointer
          border-b border-white/5
          transition-colors
          hover:bg-white/5
        "
      >
        <div className="col-span-2 truncate font-medium">
          📁 {item.name}
        </div>

        <div className="text-gray-400 text-xs">
          Folder
        </div>

        <div className="text-gray-400 text-xs">
          —
        </div>

        <div className="text-right text-gray-500 opacity-40 group-hover:opacity-80">
          ›
        </div>
      </div>
    );
  }

  /* ==================================================
     FILE ROW (TYPE-SAFE NARROWING)
  =================================================== */

  const file = item as FileItemData;

  const retention = getRetentionStatus(file.expiresAt);
  const isExpired = retention.state === 'expired';

  /* ===============================
     PREVIEW
  ================================ */
  function handlePreview() {
    if (isExpired) return;
    onPreview(file);
  }

  /* ===============================
     META
  ================================ */
  function handleMeta(
    e: React.MouseEvent<HTMLButtonElement>
  ) {
    e.stopPropagation();
    onMeta(file);
  }

  /* ===============================
     DOWNLOAD (SIGNED URL)
  ================================ */
  async function handleDownload(
    e: React.MouseEvent<HTMLButtonElement>
  ) {
    e.stopPropagation();
    if (isExpired) return;

    try {
      const key = `${wallet}/${[
        ...file.path,
        file.name,
      ].join('/')}`;

      const res = await fetch(
        `/api/files/signed?wallet=${wallet}&key=${encodeURIComponent(
          key
        )}`
      );

      if (!res.ok) {
        throw new Error('Failed to get signed download URL');
      }

      const data = await res.json();
      // SSR-safe: only use window APIs on client
      if (typeof window !== "undefined") {
        window.open(data.url, '_blank');
      }
    } catch {
      alert('Download failed');
    }
  }

  /* ===============================
     SHARE
  ================================ */
  async function handleShare(
    e: React.MouseEvent<HTMLButtonElement>
  ) {
    e.stopPropagation();
    if (isExpired) return;

    const target = `/wallet/${wallet}/${file.path.join(
      '/'
    )}/${file.name}`;

    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target }),
      });

      if (!res.ok) {
        throw new Error('Failed to create share link');
      }

      const data = await res.json();
      // SSR-safe: only use navigator APIs on client
      if (typeof window !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(data.url);
        alert('Share link copied!');
      }
    } catch {
      alert('Unable to share file');
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
        border-b border-white/5
        transition-colors
        hover:bg-white/5
      "
    >
      {/* ===========================
          NAME / PREVIEW
      ============================ */}
      <button
        onClick={handlePreview}
        disabled={isExpired}
        className={`
          col-span-2
          text-left
          truncate
          font-medium
          ${
            isExpired
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:underline'
          }
        `}
        title={isExpired ? 'File expired' : 'Preview'}
      >
        📄 {file.name}
      </button>

      {/* ===========================
          TYPE + RETENTION
      ============================ */}
      <div className="flex items-center gap-2 text-gray-400 text-xs">
        <span>{file.fileType}</span>

        {retention.state === 'active' && (
          <span className="text-yellow-400">
            ⏳ {retention.label}
          </span>
        )}

        {retention.state === 'expired' && (
          <span className="text-red-500">
            EXPIRED
          </span>
        )}
      </div>

      {/* ===========================
          SIZE
      ============================ */}
      <div className="text-gray-400 text-xs">
        {file.size}
      </div>

      {/* ===========================
          ACTIONS
      ============================ */}
      <div
        className="
          flex justify-end gap-3
          opacity-0
          group-hover:opacity-100
          transition-opacity
        "
      >
        {/* DOWNLOAD */}
        <button
          onClick={handleDownload}
          disabled={isExpired}
          className={
            isExpired
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:text-blue-400'
          }
          title={isExpired ? 'File expired' : 'Download'}
        >
          ⬇
        </button>

        {/* SHARE */}
        <button
          onClick={handleShare}
          disabled={isExpired}
          className={
            isExpired
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:text-blue-400'
          }
          title={isExpired ? 'File expired' : 'Share'}
        >
          🔗
        </button>

        {/* METADATA */}
        <button
          onClick={handleMeta}
          className="hover:text-blue-400"
          title="Metadata"
        >
          ℹ️
        </button>
      </div>
    </div>
  );
}
