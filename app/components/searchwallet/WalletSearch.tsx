"use client";

import { useState } from "react";

import WalletSummary from "@/components/searchwallet/WalletSummary";
import BlobTable from "@/components/searchwallet/BlobTable";

import {
  fetchAccount,
  fetchTransactions,
} from "@/lib/shelbyExplorer.fetch";

import {
  extractBlobs,
  BlobItem,
} from "@/lib/blob.extract";

/* ===============================
   UTIL
================================ */

/**
 * Validasi alamat wallet Aptos
 */
function isValidAptosAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(addr);
}

/* ===============================
   TYPES
================================ */

type WalletSummaryData = {
  address: string;
  txCount: number;
  lastActivity: string;
};

/* ===============================
   COMPONENT
================================ */

export default function WalletSearch() {
  const [address, setAddress] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [wallet, setWallet] =
    useState<WalletSummaryData | null>(null);

  const [blobs, setBlobs] =
    useState<BlobItem[]>([]);

  /* ===============================
     HANDLERS
  ================================ */

  async function handleSearch(): Promise<void> {
    setError(null);
    setWallet(null);
    setBlobs([]);

    if (!isValidAptosAddress(address)) {
      setError("Invalid Aptos wallet address");
      return;
    }

    setLoading(true);

    try {
      const account = await fetchAccount(address);
      const transactions = await fetchTransactions(address);

      setWallet({
        address: account.address,
        txCount: transactions.length,
        lastActivity:
          transactions[0]?.timestamp ?? "-",
      });

      const extractedBlobs =
        extractBlobs(transactions);

      setBlobs(extractedBlobs);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch wallet";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  /* ===============================
     RENDER
  ================================ */

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Search Aptos Wallet
      </h1>

      {/* Search input */}
      <div className="flex gap-2">
        <input
          className="flex-1 border px-3 py-2 rounded"
          placeholder="0x..."
          value={address}
          onChange={(e) =>
            setAddress(e.target.value)
          }
        />

        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-600 mt-2">
          {error}
        </p>
      )}

      {/* Result */}
      {wallet && (
        <>
          <WalletSummary wallet={wallet} />
          <BlobTable blobs={blobs} />
        </>
      )}
    </div>
  );
}
