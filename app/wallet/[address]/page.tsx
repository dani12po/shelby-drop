"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

import UploadPanel from "@/app/components/UploadPanel";

type FileMeta = {
  filename: string;
  originalName: string;
  size: number;
  mime: string;
  hash: string;
  uploadedAt: string;
  path: string;
};

export default function WalletPage() {
  const params = useParams();
  const address = params.address as string;

  const { connected, account } = useWallet();
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const connectedAddress =
    account?.address?.toString?.() ?? "";

  useEffect(() => {
    async function loadFiles() {
      setLoading(true);
      const res = await fetch(
        `/api/shelby/list?wallet=${address}`
      );
      const data = await res.json();
      setFiles(data.files || []);
      setLoading(false);
    }

    if (address?.startsWith("0x")) {
      loadFiles();
    }
  }, [address]);

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <section className="card p-6 space-y-2">
        <h1 className="text-lg font-semibold">
          Wallet Files
        </h1>

        <p className="text-sm text-gray-400 break-all">
          {address}
        </p>

        <a
          href={`https://explorer.shelby.xyz/shelbynet/account/${address}/blobs`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:underline"
        >
          View on Shelby Explorer ↗
        </a>
      </section>

      {/* UPLOAD */}
      <section className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">
            ⬆️ Upload
          </h2>

          {!connected ? (
            <WalletSelector />
          ) : (
            <span className="text-xs text-green-400">
              Connected: {connectedAddress}
            </span>
          )}
        </div>

        {connected && connectedAddress === address && (
          <UploadPanel
            address={connectedAddress}
            onUploaded={() =>
              location.reload()
            }
          />
        )}
      </section>

      {/* FILE LIST */}
      <section className="card p-6 space-y-4">
        <h2 className="text-sm font-medium">
          📂 Files
        </h2>

        {loading && (
          <p className="text-sm text-gray-500">
            Loading files...
          </p>
        )}

        {!loading && files.length === 0 && (
          <p className="text-sm text-gray-500">
            No files uploaded yet.
          </p>
        )}

        <ul className="space-y-3">
          {files.map((file) => (
            <li
              key={file.hash}
              className="flex items-center justify-between border border-white/10 rounded-md px-4 py-2"
            >
              <div>
                <p className="text-sm">
                  {file.originalName}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(
                    file.uploadedAt
                  ).toLocaleString()}
                </p>
              </div>

              <a
                href={file.path}
                download
                className="text-sm text-blue-400 hover:underline"
              >
                Download
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
