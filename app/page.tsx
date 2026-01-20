"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
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
    <main className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-xl px-6">
        <div className="bg-gray-900 border border-white/10 rounded-xl p-6 shadow-xl space-y-6">
          {/* HEADER */}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Shelby Drop</h1>
            <p className="text-sm text-gray-400">
              Public Web3 file explorer on Aptos
            </p>
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
                  if (e.key === "Enter") {
                    searchByWallet();
                  }
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

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
          </div>

          {/* INFO */}
          <div className="text-xs text-gray-500 border-t border-white/10 pt-4 space-y-1">
            <p>• Browse & download files without wallet</p>
            <p>• Upload requires wallet connection</p>
            <p>
              • Or view directly on{" "}
              <a
                href="https://explorer.shelby.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Shelby Explorer
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
