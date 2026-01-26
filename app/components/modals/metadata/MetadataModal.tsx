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
            className="fixed inset-0 z-60 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* GRADIENT BORDER */}
          <motion.div
            className="
              fixed z-70
              top-1/2 left-1/2
              -translate-x-1/2 -translate-y-1/2
              rounded-[26px]
              p-[2px]
            "
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              background: `
                linear-gradient(
                  90deg,
                  #7dd3fc,
                  #a78bfa,
                  #f472b6,
                  #34d399,
                  #fbbf24,
                  #60a5fa
                )
              `,
              backgroundSize: "400% 100%",
              animation: "walletBorder 32s linear infinite",
            }}
          >
            {/* SOLID MODAL */}
            <div
              className="
                w-[720px]
                h-[360px]
                max-w-[94vw]
                rounded-[24px]
                bg-[#0b0f14]
                shadow-[0_25px_90px_rgba(0,0,0,0.65)]
                overflow-hidden
                flex flex-col
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div
                className="
                  px-[15px] py-[15px]
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

                  {/* CLOSE (STYLE AS REQUESTED) */}
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
              <div className="px-[15px] pt-[15px]">
                <MetadataTabs
                  active={tab}
                  onChange={setTab}
                />
              </div>

              {/* CONTENT */}
              <div className="flex-1 overflow-auto px-[15px] py-[15px]">
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
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
