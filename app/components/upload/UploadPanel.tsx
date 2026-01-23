"use client";

import { motion, AnimatePresence } from "framer-motion";
import UploadForm from "./UploadForm";
import type { UploadMetadata } from "@/lib/uploadService";

type UploadPanelProps = {
  open: boolean;
  onClose: () => void;

  /** Called after successful upload */
  onUploaded?: (metadata: UploadMetadata) => void;

  /** Active folder path */
  path: string[];
};

export default function UploadPanel({
  open,
  onClose,
  onUploaded,
  path,
}: UploadPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="
              fixed inset-0 z-40
              bg-black/40
              backdrop-blur-lg
            "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* MODAL */}
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
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div
              className="
                relative
                w-[600px]
                rounded-[28px]
                bg-[#0b0f14]
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* CLOSE BUTTON */}
              <button
                onClick={onClose}
                className="
                  absolute top-[14px] right-[16px]
                  h-8 w-8 rounded-full
                  bg-white/10
                  text-white/70
                  hover:bg-white/20
                  transition
                "
              >
                ✕
              </button>

              {/* CONTENT */}
              <div className="px-[24px] py-[22px]">
                <h2 className="text-[17px] font-semibold text-center mb-[16px]">
                  Shelby Drop Upload
                </h2>

                <UploadForm
                  path={path}
                  onDone={(metadata) => {
                    if (onUploaded) {
                      onUploaded(metadata);
                    }
                    onClose();
                  }}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
