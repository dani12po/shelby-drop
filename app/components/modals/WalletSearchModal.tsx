"use client";

import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useExplorerModalController } from "@/components/explorer/core/useExplorerModalController";

export type WalletModalState = "LOADING" | "FOUND" | "EMPTY";

type WalletFileItem = {
  id: string;
  name: string;
  path: string[];
};

type Props = {
  wallet: string;
  state: WalletModalState;
  onClose: () => void;

  /* NEW */
  files?: WalletFileItem[];
  onViewFile?: (file: WalletFileItem) => void;
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
  files = [],
  onViewFile,
}: Props) {
  const [mounted, setMounted] = useState(false);

  const { openExplorer } = useExplorerModalController();

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
          {/* SAFE INNER PADDING */}
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
                  {files.map((file) => (
                    <div key={file.id} className="group relative">
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
                        <span className="truncate">
                          {file.name}
                        </span>

                        {onViewFile && (
                          <button
                            onClick={() => onViewFile(file)}
                            className="text-white/60 hover:text-white text-xs"
                          >
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FOOTER ACTIONS */}
            <div className="pt-6 pb-4 flex flex-col items-center gap-[10px]">
              <button
                onClick={() => {
                  openExplorer({ wallet });
                  onClose(); // Close WalletSearch when opening Explorer
                }}
                className="
                  w-[50%]
                  rounded-full
                  bg-white
                  hover:bg-white/90
                  transition
                  py-3
                  text-sm font-medium
                  text-black
                "
              >
                Open Explorer
              </button>

              <button
                onClick={onClose}
                className="
                  w-[50%]
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
