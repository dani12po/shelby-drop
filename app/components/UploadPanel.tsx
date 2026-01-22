"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

type Props = {
  onUploaded: (blobId: string) => void;
};

export default function UploadPanel({ onUploaded }: Props) {
  const { account, signMessage } = useWallet();

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  async function upload() {
    if (!file || !account || !signMessage) {
      alert("Wallet & file required");
      return;
    }

    try {
      setStatus("Signing message…");

      const message = `Shelby upload\nFile:${file.name}`;
      const nonce = crypto.randomUUID();

      const signed = await signMessage({
        message,
        nonce,
      });

      /**
       * ✅ FIX UTAMA DI SINI
       * Signature adalah opaque type → cast via unknown
       */
      const sigBytes =
        signed.signature as unknown as Uint8Array;

      const signatureBase64 =
        Buffer.from(sigBytes).toString("base64");

      setStatus("Uploading to Shelby…");

      const form = new FormData();
      form.append("file", file);
      form.append(
        "address",
        account.address.toString()
      );
      form.append("message", message);
      form.append("nonce", nonce);
      form.append("signature", signatureBase64);

      const res = await fetch(
        "https://api.shelby.xyz/v1/blobs",
        {
          method: "POST",
          body: form,
        }
      );

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const json = await res.json();
      onUploaded(json.blob_id);

      setFile(null);
      setStatus("Upload success");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Upload error");
      setStatus("");
    }
  }

  return (
    <div className="border border-white/10 rounded-lg p-4 space-y-3">
      <input
        type="file"
        onChange={(e) =>
          setFile(e.target.files?.[0] || null)
        }
      />

      <button
        onClick={upload}
        disabled={!file}
        className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-40"
      >
        Upload
      </button>

      {status && (
        <p className="text-xs text-gray-400">
          {status}
        </p>
      )}
    </div>
  );
}
