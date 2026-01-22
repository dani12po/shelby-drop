"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useNotifications } from "@/components/notifications/useNotifications";
import { uploadToShelby } from "@/lib/uploadService";

type Props = {
  onDone: () => void;
};

export default function UploadForm({ onDone }: Props) {
  const { notify } = useNotifications();
  const { account } = useWallet(); // ⬅️ signMessage DIHAPUS

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [retentionDays, setRetentionDays] =
    useState<string>("");

  const handleUpload = async () => {
    /* ===============================
       GUARDS (LOGIC ONLY)
    ================================ */
    if (loading) return;

    if (!account) {
      notify("error", "Wallet not connected");
      return;
    }

    if (!file) {
      notify("error", "Please select a file");
      return;
    }

    if (!retentionDays) {
      notify("error", "Please set retention period");
      return;
    }

    setLoading(true);

    try {
      /* ===============================
         UPLOAD (NO SIGNATURE)
      ================================ */
      await uploadToShelby({
        file, // REAL File object
        wallet: account.address.toString(),
        path: [], // nanti bisa currentPath
      });

      notify("success", "Upload successful");
      onDone();
    } catch (err) {
      notify(
        "error",
        err instanceof Error
          ? err.message
          : "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center space-y-[12px] px-[10px]">
      {/* SELECT FILE BUTTON */}
      <button
        type="button"
        className="
          w-full rounded-full
          bg-white/10
          px-4 py-2
          text-[13px]
          hover:bg-white/20
        "
        onClick={() =>
          document
            .getElementById("shelby-upload-input")
            ?.click()
        }
      >
        Select File
      </button>

      {/* HIDDEN FILE INPUT */}
      <input
        id="shelby-upload-input"
        type="file"
        className="hidden"
        onChange={(e) =>
          setFile(e.target.files?.[0] ?? null)
        }
      />

      {/* FILE NAME */}
      <div className="text-[12px] text-white/60">
        {file ? file.name : "No file selected"}
      </div>

      {/* RETENTION */}
      <div className="w-full space-y-[6px]">
        <div className="text-[12px] text-white/60">
          Retention Period (days)
        </div>

        <input
          type="number"
          maxLength={5}
          value={retentionDays}
          onChange={(e) =>
            setRetentionDays(
              e.target.value.slice(0, 5)
            )
          }
          className="
            w-full rounded-full
            bg-white/10
            px-4 py-2
            text-[13px]
            text-center
          "
        />
      </div>

      {/* UPLOAD BUTTON */}
      <button
        onClick={handleUpload}
        disabled={loading}
        className="
          w-full rounded-full
          bg-white/20
          px-4 py-2
          text-[13px]
          hover:bg-white/30
          disabled:opacity-40
        "
      >
        {loading ? "Uploading…" : "Upload"}
      </button>
    </div>
  );
}
