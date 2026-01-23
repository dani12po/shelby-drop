"use client";

import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export type WalletModalState = "LOADING" | "FOUND" | "EMPTY";

type Props = {
  wallet: string;
  state: WalletModalState;
  onClose: () => void;
  onEnterExplorer?: () => void;
};

const GRADIENT = `
  linear-gradient(
    90deg,
    #7dd3fc,
    #a78bfa,
    #f472b6,
    #34d399,
    #fbbf24,
    #60a5fa,
    #a78bfa
  )
`;

export default function WalletSearchModal({
  wallet,
  state,
  onClose,
  onEnterExplorer,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* BACKDROP */}
      <motion.div
        className="fixed inset-0 z-40 bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />

      {/* GRADIENT BORDER */}
      <motion.div
        className="
          fixed z-50
          top-1/2 left-1/2
          -translate-x-1/2 -translate-y-1/2
          rounded-[28px]
          p-[2px]
        "
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          background: GRADIENT,
          backgroundSize: "400% 100%",
          animation: "walletBorder 36s linear infinite",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL BODY */}
        <div
          className="
            w-[750px]
            h-[380px]
            rounded-[26px]
            bg-[#0b0f14]
            text-white
            shadow-[0_30px_120px_rgba(0,0,0,0.7)]
            flex flex-col
            overflow-hidden
          "
        >
          {/* SAFE INNER PADDING (15px from border) */}
          <div className="flex flex-col h-full p-[15px]">
            {/* HEADER */}
            <div className="text-center pt-2 pb-6">
              <h2 className="text-lg font-semibold">
                Shelby Drop — Wallet Files
              </h2>
              <div className="mt-2 text-sm text-white/60 truncate">
                {wallet}
              </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 px-6">
              <div className="mb-4 text-xs uppercase tracking-wide text-white/50">
                Files
              </div>

              {state === "LOADING" && (
                <div className="space-y-3 animate-pulse">
                  <div className="h-10 rounded-full bg-white/10" />
                  <div className="h-10 rounded-full bg-white/10" />
                  <div className="h-10 rounded-full bg-white/10" />
                </div>
              )}

              {state === "EMPTY" && (
                <div className="pt-16 text-center text-sm text-white/60">
                  No files found for this wallet
                </div>
              )}

              {state === "FOUND" && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="group relative">
                      {/* HOVER GRADIENT */}
                      <div
                        className="
                          absolute inset-0
                          rounded-full
                          p-[1.5px]
                          opacity-0
                          group-hover:opacity-100
                          transition-opacity
                        "
                        style={{
                          background: GRADIENT,
                          backgroundSize: "400% 100%",
                          animation: "walletBorder 28s linear infinite",
                        }}
                      />

                      <div
                        className="
                          relative z-10
                          flex items-center justify-between
                          rounded-full
                          px-6 py-3
                          bg-white/5
                          text-sm
                        "
                      >
                        <span className="truncate">filename.ext</span>
                        <span className="text-white/60">view</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FOOTER ACTIONS */}
            <div className="pt-6 pb-4 flex flex-col items-center gap-[10px]">
              {state === "FOUND" && onEnterExplorer && (
                <button
                  onClick={onEnterExplorer}
                  className="
                    w-[50%]           /* ⬅️ dipendekkan 1/5 */
                    rounded-full
                    bg-white/10
                    hover:bg-white/20
                    transition
                    py-3
                    text-sm font-medium
                  "
                >
                  Open Explorer
                </button>
              )}

              <button
                onClick={onClose}
                className="
                  w-[50%]           /* ⬅️ konsisten */
                  rounded-full
                  text-xs
                  text-white/50
                  py-2
                  hover:text-white/70
                  transition
                "
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>,
    document.body
  );
}
