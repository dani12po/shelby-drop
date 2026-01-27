"use client";

import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useExplorerModalController } from "@/components/explorer/core/useExplorerModalController";
import { useWalletSearch } from "@/hooks/useWalletSearch";
import { FileText } from "lucide-react";
import type { ExplorerFile } from "@/lib/shelby/explorerService";

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

type Props = {
  wallet: string;
  onClose: () => void;
  onViewFile?: (file: any) => void;
};

export default function WalletSearchModal({
  wallet,
  onClose,
  onViewFile,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const { openExplorer } = useExplorerModalController();
  const { state, result, error, searchWallet, isLoading, hasResults, isEmpty, hasError } = useWalletSearch();

  useEffect(() => {
    setMounted(true);
    // Auto-search when wallet changes
    if (wallet && mounted) {
      searchWallet(wallet);
    }
  }, [wallet, mounted]);

  if (!mounted) return null;

  const handleOpenExplorer = () => {
    openExplorer({ wallet });
    onClose();
  };

  const getFileIcon = (type?: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'document': return '📄';
      case 'code': return '💻';
      default: return '📁';
    }
  };

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
            h-[500px]
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
            <div className="flex-1 px-6 overflow-auto">
              <div className="mb-4 text-xs uppercase tracking-wide text-white/50">
                Files
              </div>

              {isLoading && (
                <div className="space-y-3 animate-pulse">
                  <div className="h-10 rounded-full bg-white/10" />
                  <div className="h-10 rounded-full bg-white/10" />
                  <div className="h-10 rounded-full bg-white/10" />
                </div>
              )}

              {isEmpty && (
                <div className="pt-16 text-center text-sm text-white/60">
                  <FileText className="mx-auto mb-4 w-12 h-12 text-white/20" />
                  No files found for this wallet
                </div>
              )}

              {hasError && (
                <div className="pt-16 text-center text-sm text-red-400">
                  <div className="mb-2">Failed to load files</div>
                  <div className="text-xs text-white/40">{error}</div>
                </div>
              )}

              {hasResults && (
                <div className="space-y-3">
                  {result!.files.map((file: ExplorerFile, index: number) => (
                    <div key={index} className="group relative">
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
                      >
                        <div className="w-full h-full rounded-full bg-[#0b0f14]" />
                      </div>

                      {/* FILE ITEM */}
                      <div
                        className="
                          relative z-10
                          flex items-center justify-between
                          rounded-full
                          px-6 py-3
                          bg-white/5
                          hover:bg-white/10
                          transition-colors
                          cursor-pointer
                          group
                        "
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {getFileIcon(file.type)}
                          </span>
                          <div>
                            <div className="text-sm font-medium">
                              {file.name}
                            </div>
                            {file.size && (
                              <div className="text-xs text-white/50">
                                {file.size}
                              </div>
                            )}
                          </div>
                        </div>

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
                onClick={handleOpenExplorer}
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
