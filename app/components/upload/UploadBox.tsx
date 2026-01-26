"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type Props = {
  wallet: string;
  onUploaded: (blobPath: string) => void;
};

export default function UploadBox({
  wallet,
  onUploaded,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [days, setDays] = useState<number>(3);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file || loading) return;

    try {
      setLoading(true);

      /* ===============================
         1️⃣ Upload file to server
      ================================ */
      const form = new FormData();
      form.append("file", file);
      form.append("wallet", wallet);
      form.append("retentionDays", String(days));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error ?? "Upload failed");
      }

      const metadata = json.metadata;

      /* ===============================
         2️⃣ Update Explorer index.json
      ================================ */
      await fetch("/api/upload/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet,
          blob_name: metadata.blob_name,
          size: metadata.size,
          contentType: metadata.mime ?? file.type,
          createdAt: metadata.uploadedAt,
        }),
      });

      /* ===============================
         3️⃣ Notify parent component
      ================================ */
      onUploaded(metadata.blob_name);

      /* ===============================
         4️⃣ Auto-refresh Explorer
         (NO reload, NO polling)
      ================================ */
      // SSR-safe: only use window APIs on client
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("explorer:refresh")
        );
      }

      // Optional: reset input
      setFile(null);
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

      {/* RETENTION DAYS */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-white/60">
          Lock days:
        </span>
        <input
          type="number"
          min={1}
          max={99999}
          value={days}
          onChange={(e) =>
            setDays(Number(e.target.value))
          }
          className="
            w-[90px]
            px-2 py-1
            rounded
            bg-white/10
            text-sm
            outline-none
          "
        />
      </div>

      {/* UPLOAD BUTTON */}
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
