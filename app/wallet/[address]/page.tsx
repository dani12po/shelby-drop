"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

import UploadPanel from "@/app/components/UploadPanel";

export default function WalletPage() {
  const params = useParams();
  const router = useRouter();
  const address = params.address as string;

  const { connected, account } = useWallet();

  useEffect(() => {
    if (!address || !address.startsWith("0x")) {
      router.replace("/");
    }
  }, [address, router]);

  const connectedAddress =
    account?.address?.toString?.() ?? "";

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <section className="card p-6 space-y-2">
        <h1 className="text-lg font-semibold">
          Wallet Upload
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
          <h2 className="text-sm font-medium flex items-center gap-2">
            ⬆️ Upload Files
          </h2>

          {!connected ? (
            <WalletSelector />
          ) : (
            <span className="text-xs text-green-400">
              Connected: {connectedAddress}
            </span>
          )}
        </div>

        {!connected && (
          <p className="text-xs text-gray-500">
            Connect your wallet to upload files.
            Browsing is public.
          </p>
        )}

        {connected && connectedAddress && (
          <UploadPanel
            address={connectedAddress}
            onUploaded={() =>
              router.push(`/wallet/${connectedAddress}`)
            }
          />
        )}
      </section>
    </div>
  );
}
