"use client";

import { FileItemData } from "@/lib/data";

type Props = {
  file: FileItemData;
  wallet: string;
  onClose: () => void;
};

export default function PreviewModal({
  file,
  wallet,
  onClose,
}: Props) {
  // 🔗 DOWNLOAD / PREVIEW URL (OFFICIAL)
  const fileUrl = `https://api.shelbynet.shelby.xyz/shelby/v1/blobs/${wallet}/${file.path.join(
    "/"
  )}/${file.name}`;

  function renderPreview() {
    const ext = file.name.split(".").pop()?.toLowerCase();

    /* ===== IMAGE ===== */
    if (
      ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(
        ext || ""
      )
    ) {
      return (
        <img
          src={fileUrl}
          alt={file.name}
          className="max-h-[70vh] max-w-full mx-auto rounded"
        />
      );
    }

    /* ===== PDF ===== */
    if (ext === "pdf") {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-[70vh] rounded"
        />
      );
    }

    /* ===== VIDEO ===== */
    if (
      ["mp4", "webm", "mov", "mkv"].includes(ext || "")
    ) {
      return (
        <video
          src={fileUrl}
          controls
          className="w-full max-h-[70vh] rounded"
        />
      );
    }

    /* ===== AUDIO ===== */
    if (
      ["mp3", "wav", "ogg", "flac"].includes(ext || "")
    ) {
      return (
        <audio
          src={fileUrl}
          controls
          className="w-full"
        />
      );
    }

    /* ===== FALLBACK ===== */
    return (
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-400">
          Preview not available for this file type.
        </p>
        <a
          href={fileUrl}
          download
          className="inline-block px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-sm"
        >
          Download File
        </a>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-white/10 rounded-xl p-4 w-full max-w-3xl space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">
              {file.name}
            </h3>
            <p className="text-xs text-gray-400">
              {file.size}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* PREVIEW */}
        <div className="bg-black/40 rounded p-3">
          {renderPreview()}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2">
          <a
            href={fileUrl}
            download
            className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm"
          >
            ⬇ Download
          </a>

          <button
            onClick={() => {
              navigator.clipboard.writeText(fileUrl);
              alert("File link copied");
            }}
            className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm"
          >
            🔗 Share
          </button>
        </div>
      </div>
    </div>
  );
}
