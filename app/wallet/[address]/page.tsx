"use client";

import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect } from "react";
import UploadPanel from "@/app/components/UploadPanel";

export default function WalletPage() {
  const { address } = useParams<{ address: string }>();
  const router = useRouter();
  const { account, connected } = useWallet();

  useEffect(() => {
    if (!address || !address.startsWith("0x")) {
      router.replace("/");
    }
  }, [address, router]);

  return (
    <main className="relative min-h-screen w-full">

      {/* ===============================
          WALLET PAGE CONTENT
      =============================== */}
      <div className="mx-auto max-w-3xl px-4 py-28 space-y-8">

        {/* WALLET HEADER */}
        <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
          <h1 className="text-lg font-semibold">
            Shelby Wallet Explorer
          </h1>

          <p className="mt-2 text-xs text-white/50 break-all">
            {address}
          </p>

          {connected && (
            <p className="mt-2 text-xs text-green-400">
              Connected as{" "}
              {account?.address.toString().slice(0, 6)}…
              {account?.address.toString().slice(-4)}
            </p>
          )}
        </section>

        {/* UPLOAD PANEL */}
        {connected && (
          <UploadPanel
            onUploaded={(blobId) => {
              window.open(
                `https://explorer.shelby.xyz/shelbynet/blob/${blobId}`,
                "_blank"
              );
            }}
          />
        )}

        {!connected && (
          <p className="text-xs text-white/40 text-center">
            Connect your wallet to upload files.
          </p>
        )}
      </div>
    </main>
  );
}
