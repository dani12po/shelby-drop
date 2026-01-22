"use client";

import type { FileItemData } from "@/app/lib/data";
import { buildShelbyDownloadUrl } from "@/app/lib/shelbyDownload";

type Props = {
  file: FileItemData;
  wallet: string;
  onClose: () => void;
};

export default function MetadataPanel({
  file,
  wallet,
  onClose,
}: Props) {
  const downloadUrl = buildShelbyDownloadUrl(wallet, file);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-end">
      <div className="w-full max-w-md h-full bg-gray-900 border-l border-white/10 p-5 space-y-5">
        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-medium">File Metadata</h2>
            <p className="text-xs text-gray-400 break-all">
              {file.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* META */}
        <div className="space-y-3 text-sm">
          <Meta label="Uploader" value={file.uploader} />
          <Meta label="Blob ID" value={file.blobId} />
          <Meta label="Type" value={file.fileType} />
          <Meta label="Size" value={file.size} />
        </div>

        {/* ACTIONS */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2 rounded-md bg-blue-600 hover:bg-blue-700"
          >
            Download
          </a>

          <button
            onClick={() =>
              navigator.clipboard.writeText(downloadUrl)
            }
            className="w-full py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-sm"
          >
            Copy download link
          </button>
        </div>
      </div>
    </div>
  );
}

function Meta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="break-all">{value}</p>
    </div>
  );
}
