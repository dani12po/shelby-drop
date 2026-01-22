"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type Props = {
  wallet: string;
  onUploaded: (url: string) => void;
};

export default function UploadBox({
  wallet,
  onUploaded,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [days, setDays] = useState<number>(3);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);

      const form = new FormData();
      form.append("file", file);
      form.append("wallet", wallet);
      form.append("message", "Upload to Shelby Drop");
      form.append("signature", "stub"); // nanti diganti real sign
      form.append("publicKey", "stub");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error);
      }

      // 🔥 INI PENTING
      onUploaded(json.metadata.path);
    } catch (err) {
      console.error("UPLOAD FAILED", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* FILE PICKER */}
      <label className="block text-sm">
        <input
          type="file"
          hidden
          onChange={(e) =>
            setFile(e.target.files?.[0] ?? null)
          }
        />
        <span className="cursor-pointer underline">
          {file ? file.name : "Choose file"}
        </span>
      </label>

      {/* DAYS */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-white/60">
          Lock days:
        </span>
        <input
          type="number"
          min={3}
          max={99999}
          value={days}
          onChange={(e) =>
            setDays(Number(e.target.value))
          }
          className="w-[90px] px-2 py-1 rounded bg-white/10 text-sm outline-none"
        />
      </div>

      {/* UPLOAD */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        disabled={!file || loading}
        onClick={handleUpload}
        className="
          w-full py-2 rounded-full
          bg-white text-black text-sm
          disabled:opacity-40
        "
      >
        {loading ? "Uploading..." : "Upload"}
      </motion.button>
    </div>
  );
}
