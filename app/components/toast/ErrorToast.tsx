"use client";

import { motion, AnimatePresence } from "framer-motion";

type Props = {
  open: boolean;
  message: string;
  onClose: () => void;
};

export default function ErrorToast({
  open,
  message,
  onClose,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25 }}
          className="
            fixed bottom-6 right-6 z-[9999]
            rounded-xl
            bg-red-500/90
            text-white
            px-4 py-3
            shadow-lg
            max-w-sm
          "
        >
          <div className="flex justify-between gap-4">
            <span className="text-sm">
              {message}
            </span>
            <button
              onClick={onClose}
              className="text-xs opacity-80 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
