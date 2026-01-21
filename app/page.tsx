"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";

export default function HomePage() {
  const router = useRouter();
  const [wallet, setWallet] = useState("");
  const [error, setError] = useState("");

  /* ===============================
     AUTO REDIRECT (?wallet=0x...)
  ================================ */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const w = params.get("wallet");

    if (w && w.startsWith("0x")) {
      router.replace(`/wallet/${w}`);
    }
  }, [router]);

  /* ===============================
     SEARCH HANDLER
  ================================ */
  function searchByWallet() {
    setError("");
    const addr = wallet.trim();

    if (!addr.startsWith("0x") || addr.length < 20) {
      setError("Invalid wallet address");
      return;
    }

    router.push(`/wallet/${addr}`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-xl px-6">
        <div className="bg-gray-900 border border-white/10 rounded-xl p-6 shadow-xl space-y-6">
          {/* HEADER */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">Shelby Drop</h1>
              <p className="text-sm text-gray-400">
                Public Web3 file explorer on Aptos
              </p>
            </div>

            <WalletSelector />
          </div>

          {/* SEARCH */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">
              🔍 Find files by wallet address
            </label>

            <div className="flex gap-2">
              <input
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") searchByWallet();
                }}
                placeholder="0xabc..."
                className="flex-1 bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500"
              />

              <button
                onClick={searchByWallet}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-sm"
              >
                Search
              </button>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
