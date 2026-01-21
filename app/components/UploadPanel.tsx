"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

interface UploadPanelProps {
  address: string;
  onUploaded: () => void;
}

export default function UploadPanel({
  address,
  onUploaded,
}: UploadPanelProps) {
  const { signMessage } = useWallet();

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  async function upload() {
    if (!file) {
      alert("Please select a file");
      return;
    }

    if (!signMessage) {
      alert("Wallet does not support message signing");
      return;
    }

    try {
      setStatus("Signing message...");

      const message = `Shelby upload
Wallet: ${address}
File: ${file.name}`;

      const signed = await signMessage({
        message,
        nonce: Date.now().toString(),
      });

      setStatus("Uploading file...");

      const fd = new FormData();
      fd.append("file", file);
      fd.append("wallet", address);
      fd.append("message", message);

      // 🔥 FIX UTAMA: signature HARUS string
      fd.append(
        "signature",
        JSON.stringify(signed)
      );

      const res = await fetch("/api/shelby/upload", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      setStatus("Upload success");
      setFile(null);
      onUploaded();
    } catch (err: any) {
      alert(err?.message || "Upload error");
      setStatus("");
    }
  }

  return (
    <div className="border border-white/10 rounded-lg p-4 space-y-3 bg-black/30">
      <h3 className="text-sm font-medium">⬆️ Upload File</h3>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="text-sm"
      />

      <button
        onClick={upload}
        disabled={!file}
        className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-sm"
      >
        Upload
      </button>

      {status && (
        <p className="text-xs text-gray-400">{status}</p>
      )}
    </div>
  );
}
