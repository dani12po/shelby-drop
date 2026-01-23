"use client";

import { motion, AnimatePresence } from "framer-motion";

/* ===============================
   TYPES
================================ */
export type WalletModalState =
  | "LOADING"
  | "FOUND"
  | "EMPTY";

interface WalletSearchModalProps {
  wallet: string;
  state: WalletModalState;
  onClose: () => void;
  onEnterExplorer?: () => void;
}

/* ===============================
   COMPONENT
================================ */
export default function WalletSearchModal({
  wallet,
  state,
  onClose,
  onEnterExplorer,
}: WalletSearchModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        key="wallet-search-pill"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="
          fixed z-50
          bottom-6 left-6
        "
      >
        {/* PILL CONTAINER (MATCH WalletPill) */}
        <div
          className="
            min-w-[320px]
            max-w-[420px]
            rounded-2xl
            bg-black/60 backdrop-blur
            hover:bg-black/70
            transition
            shadow-lg
            text-white
          "
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              <span className="truncate max-w-[260px]">
                {wallet}
              </span>
            </div>

            {/* CLOSE */}
            <button
              onClick={onClose}
              className="
                h-6 w-6
                rounded-full
                bg-white/10
                hover:bg-white/20
                flex items-center justify-center
                text-[11px]
                transition
              "
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* BODY */}
          <div className="px-4 pb-4">
            {/* LOADING */}
            {state === "LOADING" && (
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-white/10" />
                <div className="h-6 rounded bg-white/10" />
                <div className="h-6 rounded bg-white/10" />
              </div>
            )}

            {/* FOUND */}
            {state === "FOUND" && (
              <>
                <div className="mb-2 text-xs text-white/50">
                  file list
                </div>

                <div className="space-y-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="
                        flex items-center justify-between
                        rounded-lg
                        bg-white/5
                        px-3 py-2
                        text-sm
                      "
                    >
                      <span className="truncate">
                        name
                      </span>
                      <span className="text-xs text-white/50">
                        open
                      </span>
                    </div>
                  ))}
                </div>

                {onEnterExplorer && (
                  <button
                    onClick={onEnterExplorer}
                    className="
                      mt-3 w-full
                      rounded-full
                      bg-white/10
                      hover:bg-white/20
                      py-2
                      text-sm
                      transition
                    "
                  >
                    Open explorer
                  </button>
                )}
              </>
            )}

            {/* EMPTY */}
            {state === "EMPTY" && (
              <div className="text-sm text-white/50">
                file does not exist in shelby
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
