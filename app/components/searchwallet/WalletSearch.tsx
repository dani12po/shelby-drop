"use client";

import { useState, KeyboardEvent } from "react";

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

import { Search, Loader2, AlertCircle, Wallet } from "lucide-react";

/* ===============================
   UTIL
=============================== */

/**
 * Validasi alamat wallet Aptos
 */
function isValidAptosAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(addr);
}

/* ===============================
   TYPES
=============================== */

type WalletSummaryData = {
  address: string;
  txCount: number;
  lastActivity: string;
};

/* ===============================
   COMPONENT
=============================== */

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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      handleSearch();
    }
  };

  /* ===============================
     RENDER
  ================================ */

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div className="
          w-12 h-12 
          rounded-xl 
          bg-gradient-to-br from-purple-500/20 to-blue-500/20
          border border-purple-500/20
          flex items-center justify-center
        ">
          <Wallet className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">
            Search Aptos Wallet
          </h1>
          <p className="text-xs text-white/50">
            Find files stored by any Aptos wallet address
          </p>
        </div>
      </div>

      {/* Search input */}
      <div className="relative">
        <div className="
          flex gap-3
          p-[2px]
          rounded-xl
          bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20
          animate-gradient
        ">
          <div className="flex-1 flex items-center bg-[#0b0f14] rounded-l-[10px] px-4">
            <Search className="w-4 h-4 text-white/40 mr-3" />
            <input
              className="
                flex-1 
                bg-transparent 
                py-3 
                text-sm 
                text-white 
                placeholder:text-white/30
                outline-none
              "
              placeholder="0x..."
              value={address}
              onChange={(e) =>
                setAddress(e.target.value)
              }
              onKeyDown={handleKeyDown}
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="
              px-6 
              py-3 
              rounded-r-[10px]
              bg-gradient-to-r from-purple-600 to-blue-600
              hover:from-purple-500 hover:to-blue-500
              text-white text-sm font-medium
              transition-all
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>Search</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
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
