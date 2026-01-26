"use client";

import { useState } from "react";
import BaseModal from "@/components/ui/BaseModal";

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
    <BaseModal
      open={true}
      onClose={onClose}
      title="Shelby Drop Upload"
      subtitle={wallet}
      size="sm"
    >
      {/* CONTENT */}
      <div className="space-y-5">
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
      </div>

      {/* FOOTER ACTIONS */}
      <div className="pt-6 flex flex-col items-center gap-[10px] -m-6">
        <button
          disabled={loading}
          onClick={handleUpload}
          className="
            w-full
            rounded-full
            bg-white
            hover:bg-white/90
            transition
            py-3
            text-sm font-medium
            text-black
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        <button
          onClick={onClose}
          className="
            w-full
            rounded-full
            text-xs
            text-white/50
            py-2
            hover:text-white/70
            transition
          "
        >
          Cancel
        </button>
      </div>
    </BaseModal>
  );
}
