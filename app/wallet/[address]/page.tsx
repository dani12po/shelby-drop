"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getWallets, Wallet } from "@aptos-labs/wallet-standard";

import UploadPanel from "@/app/components/UploadPanel";

/* ===== WALLET FEATURE TYPES ===== */
type ConnectFeature = {
  connect: () => Promise<void>;
};

type AccountFeature = {
  account: () => { address: string };
};

export default function WalletPage() {
  const params = useParams();
  const router = useRouter();
  const address = params.address as string;

  /* ===== CONNECTED WALLET ===== */
  const [walletObj, setWalletObj] = useState<Wallet | null>(null);
  const [connectedAddress, setConnectedAddress] =
    useState<string | null>(null);

  /* ===============================
     VALIDATE ADDRESS
  ================================ */
  useEffect(() => {
    if (!address || !address.startsWith("0x")) {
      router.replace("/");
    }
  }, [address, router]);

  /* ===============================
     CONNECT WALLET (UPLOAD ENABLE)
  ================================ */
  async function connectWallet() {
    const wallets = getWallets().get();

    if (!wallets.length) {
      alert("No Aptos wallet found");
      return;
    }

    const w = wallets[0];
    const connect =
      w.features["aptos:connect"] as ConnectFeature | undefined;
    const account =
      w.features["aptos:account"] as AccountFeature | undefined;

    if (!connect || !account) {
      alert("Wallet not supported");
      return;
    }

    await connect.connect();
    const acc = account.account();

    setWalletObj(w);
    setConnectedAddress(acc.address);
  }

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className="space-y-10">
      {/* ===============================
          HEADER / WALLET INFO
      ================================ */}
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

      {/* ===============================
          UPLOAD PANEL
      ================================ */}
      <section className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium flex items-center gap-2">
            ⬆️ Upload Files
          </h2>

          {!connectedAddress ? (
            <button
              onClick={connectWallet}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-sm"
            >
              Connect Wallet
            </button>
          ) : (
            <span className="text-xs text-green-400">
              Connected: {connectedAddress}
            </span>
          )}
        </div>

        {/* UPLOAD RULE */}
        {!connectedAddress && (
          <p className="text-xs text-gray-500">
            Connect your wallet to upload files.  
            You can still browse and download files without connecting.
          </p>
        )}

        {/* UPLOAD PANEL */}
        {walletObj && connectedAddress && (
          <UploadPanel
            wallet={walletObj}
            address={connectedAddress}
            onUploaded={() => {
              // After upload, go to explorer root
              router.push(`/wallet/${connectedAddress}`);
            }}
          />
        )}
      </section>

      {/* ===============================
          QUICK ACTION
      ================================ */}
      <section className="flex justify-end">
        <button
          onClick={() => router.push(`/wallet/${address}`)}
          className="text-sm text-blue-400 hover:underline"
        >
          → Go to File Explorer
        </button>
      </section>
    </div>
  );
}
