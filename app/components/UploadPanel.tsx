"use client";

import { useState } from "react";
import { Wallet } from "@aptos-labs/wallet-standard";

type Props = {
  wallet: Wallet | null;
  address: string | null;
  onUploaded: () => void;
};

export default function UploadPanel({
  wallet,
  address,
  onUploaded,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  async function upload() {
    if (!wallet || !address || !file) {
      alert("Wallet & file required");
      return;
    }

    const sign =
      wallet.features["aptos:signMessage"] as any;

    if (!sign) {
      alert("Wallet does not support signMessage");
      return;
    }

    try {
      setStatus("Signing message...");

      const message = `Shelby upload\nWallet:${address}\nFile:${file.name}`;
      const signed = await sign.signMessage({ message });

      setStatus("Uploading file...");

      const fd = new FormData();
      fd.append("file", file);
      fd.append("wallet", address);
      fd.append("message", message);
      fd.append("signature", signed.signature);

      const res = await fetch("/api/shelby/upload", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("Upload failed");

      setStatus("Upload success");
      setFile(null);
      onUploaded();
    } catch (e: any) {
      alert(e.message || "Upload error");
      setStatus("");
    }
  }

  return (
    <div className="border border-white/10 rounded-lg p-4 space-y-3 bg-black/30">
      <h3 className="text-sm font-medium">⬆️ Upload File</h3>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={upload}
        disabled={!file}
        className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-40"
      >
        Upload
      </button>

      {status && (
        <p className="text-xs text-gray-400">{status}</p>
      )}
    </div>
  );
}
