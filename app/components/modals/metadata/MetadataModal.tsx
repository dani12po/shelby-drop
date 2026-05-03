"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import type { FileItemData } from "@/lib/data";
import MetadataTabs from "./MetadataTabs";
import type { MetadataTabKey } from "./metadata.types";

import MetadataInfoTab from "./tabs/MetadataInfoTab";
import MetadataAccessTab from "./tabs/MetadataAccessTab";
import MetadataHistoryTab from "./tabs/MetadataHistoryTab";

type Props = {
  file: FileItemData;
  wallet: string;
  onClose: () => void;
};

export default function MetadataModal({
  file,
  wallet,
  onClose,
}: Props) {
  /* ===============================
     MOUNT GUARD
  ================================ */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* ===============================
     TAB STATE
  ================================ */
  const [tab, setTab] =
    useState<MetadataTabKey>("info");

  /* ===============================
     ESC TO CLOSE
  ================================ */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () =>
      window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {file && (
        <>
          {/* BACKDROP – ABOVE EXPLORER */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* GRADIENT BORDER */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="relative p-[2px] rounded-[26px] bg-gradient-to-r from-sky-300 via-violet-400 to-blue-400 bg-[length:400%_100%] animate-[walletBorder_4s_linear_infinite] pointer-events-auto"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {/* SOLID MODAL */}
              <div
                className="
                  w-[720px]
                  h-[min(85vh,480px)]
                  max-w-full
                  rounded-[24px]
                  bg-[var(--bg-modal)]
                  shadow-[0_25px_90px_rgba(0,0,0,0.65)]
                  overflow-hidden
                  flex flex-col
                "
                onClick={(e) => e.stopPropagation()}
              >
              {/* Top accent bar */}
              <div className="h-[3px] shrink-0 bg-gradient-to-r from-sky-300 via-violet-400 to-blue-400 bg-[length:400%_100%] animate-[walletBorder_4s_linear_infinite]" />

              {/* HEADER */}
              <div
                className="
                  px-4 py-4
                  border-b border-white/10
                "
              >
                <div className="flex items-start justify-between gap-3">
                  {/* LEFT SPACER (KEEP TITLE CENTERED) */}
                  <div className="w-6" />

                  {/* TITLE */}
                  <div className="flex-1 text-center space-y-1 min-w-0">
                    <h2 className="text-lg font-semibold text-white">
                      Shelby Drop Metadata
                    </h2>
                    <div className="text-xs text-white/40 truncate">
                      {wallet}
                    </div>
                  </div>

                  {/* CLOSE */}
                  <button
                    onClick={onClose}
                    className="
                      p-1.5 rounded-md
                      text-white/50
                      hover:text-white
                      hover:bg-white/10
                      transition
                    "
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* TABS */}
              <div className="px-4 pt-4">
                <MetadataTabs
                  active={tab}
                  onChange={setTab}
                />
              </div>

              {/* CONTENT */}
              <div className="flex-1 overflow-auto px-4 py-4">
                {tab === "info" && (
                  <MetadataInfoTab
                    file={file}
                    wallet={wallet}
                  />
                )}

                {tab === "access" && (
                  <MetadataAccessTab
                    file={file}
                    wallet={wallet}
                  />
                )}

                {tab === "history" && (
                  <MetadataHistoryTab
                    file={file}
                    wallet={wallet}
                  />
                )}
              </div>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
