"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useNotifications } from "@/components/notifications/useNotifications";
import {
  uploadToShelby,
  type UploadMetadata,
} from "@/lib/uploadService";

type Props = {
  /** Called after successful upload */
  onDone: (metadata: UploadMetadata) => void;

  /** Active folder path */
  path?: string[];
};

export default function UploadForm({
  onDone,
  path = [],
}: Props) {
  const { notify } = useNotifications();
  const { account } = useWallet();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [retentionDays, setRetentionDays] =
    useState<string>("");

  const handleUpload = async () => {
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
         1️⃣ Upload file (Shelby / local)
      ================================ */
      const metadata = await uploadToShelby({
        file,
        wallet: account.address.toString(),
        path,
        retentionDays: Number(retentionDays),
      });

      /* ===============================
         2️⃣ Update Explorer index.json
         (server-side)
      ================================ */
      await fetch("/api/upload/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet: account.address.toString(),
          blob_name: metadata.blob_name,
          size: metadata.size,
          contentType:
            metadata.mime ?? file.type,
          createdAt: metadata.uploadedAt,
        }),
      });

      notify("success", "Upload successful");

      /* ===============================
         3️⃣ Notify parent (UI refresh)
      ================================ */
      onDone(metadata);

      // Optional: reset form
      setFile(null);
      setRetentionDays("");
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

      <input
        id="shelby-upload-input"
        type="file"
        className="hidden"
        onChange={(e) =>
          setFile(e.target.files?.[0] ?? null)
        }
      />

      <div className="text-[12px] text-white/60">
        {file ? file.name : "No file selected"}
      </div>

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
