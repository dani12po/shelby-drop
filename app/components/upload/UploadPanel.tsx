"use client";

import { motion, AnimatePresence } from "framer-motion";
import UploadForm from "./UploadForm";

type UploadPanelProps = {
  open: boolean;
  onClose: () => void;
  onUploaded?: (metadata: any) => void; // ⬅️ ADD (OPTIONAL, NON-BREAKING)
};

export default function UploadPanel({
  open,
  onClose,
  onUploaded,
}: UploadPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP — STRONG BLUR */}
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

          {/* GRADIENT CAPSULE BORDER */}
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
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              background: `
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
              `,
              backgroundSize: "400% 100%",
              animation: "walletBorder 36s linear infinite",
            }}
          >
            {/* SOLID CAPSULE */}
            <div
              className="
                relative
                w-[600px]
                rounded-[28px]
                bg-[#0b0f14]
                shadow-[0_20px_80px_rgba(0,0,0,0.65)]
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* CLOSE BUTTON — TOP RIGHT INSIDE BOX */}
              <button
                onClick={onClose}
                className="
                  absolute
                  top-[14px]
                  right-[16px]
                  h-8 w-8
                  rounded-full
                  bg-white/10
                  flex items-center justify-center
                  text-white/70
                  hover:bg-white/20
                  hover:text-white
                  transition
                "
              >
                ✕
              </button>

              {/* INNER CONTENT */}
              <div className="px-[24px] py-[22px]">
                {/* TITLE */}
                <h2 className="text-[17px] font-semibold text-white text-center mb-[16px]">
                  Shelby Drop Upload
                </h2>

                {/* FORM */}
                <UploadForm
                  onDone={(metadata?: any) => {
                    if (metadata && onUploaded) {
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
