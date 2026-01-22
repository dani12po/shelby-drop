"use client";

import { useState } from "react";

type Props = {
  wallet: string;
  onClose: () => void;
  onUploaded: (url: string) => void;
};

export default function UploadModal({
  wallet,
  onClose,
  onUploaded,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [days, setDays] = useState(3);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return;

    setLoading(true);

    const form = new FormData();
    form.append("file", file);
    form.append("wallet", wallet);
    form.append("days", String(days));

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      onUploaded(data.metadata.path);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="w-[380px] rounded-2xl bg-[#0b0f14] p-6 space-y-5">

        <h2 className="text-center text-lg font-semibold">
          Shelby Drop Upload
        </h2>

        {/* FILE PICKER */}
        <label className="block text-sm">
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div className="cursor-pointer rounded-lg bg-white/10 py-3 text-center">
            {file ? file.name : "Choose file"}
          </div>
        </label>

        {/* DAYS */}
        <div className="flex items-center justify-between text-sm">
          <span>Locked days</span>
          <input
            type="number"
            min={1}
            max={99999}
            value={days}
            onChange={(e) => setDays(+e.target.value)}
            className="w-[90px] rounded-md bg-white/10 px-2 py-1 text-center"
          />
        </div>

        {/* ACTIONS */}
        <button
          disabled={loading}
          onClick={handleUpload}
          className="w-full rounded-lg bg-white text-black py-2 text-sm"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        <button
          onClick={onClose}
          className="w-full text-xs text-white/50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
