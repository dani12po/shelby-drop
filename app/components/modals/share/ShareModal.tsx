"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type Props = {
  url: string;
  onClose: () => void;
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

export default function ShareModal({ url, onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR-safe: don't render anything on server
  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      <>
        {/* BACKDROP */}
        <motion.div
          className="fixed inset-0 z-40 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
          exit={{ opacity: 0, scale: 0.97 }}
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
              w-[360px]
              rounded-[26px]
              bg-[#0b0f14]
              text-white
              shadow-[0_30px_120px_rgba(0,0,0,0.7)]
              flex flex-col
              overflow-hidden
            "
          >
            {/* SAFE INNER PADDING */}
            <div className="flex flex-col p-[15px]">
              {/* HEADER */}
              <div className="flex items-center justify-between pb-6">
                <div className="text-center flex-1">
                  <h2 className="text-lg font-semibold">
                    Share this file
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/40 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              {/* CONTENT */}
              <div className="flex-1 space-y-4">
                <input
                  value={url}
                  readOnly
                  className="
                    w-full
                    bg-black/30
                    border border-white/10
                    rounded-md
                    px-3 py-2
                    text-sm text-white
                    outline-none
                    select-all
                  "
                />

                <button
                  onClick={() => navigator.clipboard.writeText(url)}
                  className="
                    w-full
                    rounded-full
                    bg-white
                    hover:bg-white/90
                    transition
                    py-3
                    text-sm font-medium
                    text-black
                  "
                >
                  Copy link
                </button>
              </div>

              {/* FOOTER */}
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="
                    w-full
                    rounded-full
                    text-xs
                    text-white/50
                    py-2
                    hover:text-white/70
                    transition
                  "
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>,
    document.body
  );
}
