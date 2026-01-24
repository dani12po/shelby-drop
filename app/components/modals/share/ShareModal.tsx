"use client";

import { motion, AnimatePresence } from "framer-motion";

type Props = {
  url: string;
  onClose: () => void;
};

export default function ShareModal({ url, onClose }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* BACKDROP */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* MODAL */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="
            relative z-10
            w-[360px]
            rounded-xl
            bg-[#0b0f14]
            border border-white/10
            p-6
            shadow-[0_20px_80px_rgba(0,0,0,0.6)]
          "
        >
          <h3 className="mb-3 text-base font-semibold text-white text-center">
            Share this file
          </h3>

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
              mb-4
              select-all
            "
          />

          <button
            onClick={() => navigator.clipboard.writeText(url)}
            className="
              w-full
              py-2
              rounded-md
              text-sm font-medium
              bg-white/10 hover:bg-white/20
              transition
            "
          >
            Copy link
          </button>

          <button
            onClick={onClose}
            className="
              mt-3
              w-full
              text-xs
              text-white/50 hover:text-white
              transition
            "
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
