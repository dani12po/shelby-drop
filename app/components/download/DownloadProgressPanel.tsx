"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Ban } from "lucide-react";
import type { BulkDownloadState } from "@/lib/download/types";

type Props = {
  state: BulkDownloadState;
  onCancel: () => void;
  onRetry: () => void;
  onClose: () => void;
};

export default function DownloadProgressPanel({
  state,
  onCancel,
  onRetry,
  onClose,
}: Props) {
  const percent =
    state.total === 0
      ? 0
      : Math.round(
          ((state.completed + state.failed) /
            state.total) *
            100
        );

  return (
    <AnimatePresence>
      {state.status !== "idle" && (
        <motion.div
          className="fixed bottom-6 right-6 z-[80]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div
            className="
              w-[340px]
              rounded-2xl
              bg-[#0b0f14]/95
              backdrop-blur-xl
              border border-white/10
              shadow-[0_20px_60px_rgba(0,0,0,0.6)]
              p-4
            "
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm font-medium">
                Downloading files
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-full"
              >
                <X size={14} />
              </button>
            </div>

            {/* PROGRESS */}
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-purple-400"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="text-xs text-white/60 mb-3">
              {state.completed} completed ·{" "}
              {state.failed} failed ·{" "}
              {state.total} total
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">
              {state.status === "running" && (
                <button
                  onClick={onCancel}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs"
                >
                  <Ban size={12} />
                  Cancel
                </button>
              )}

              {state.failed > 0 &&
                state.status !== "running" && (
                  <button
                    onClick={onRetry}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-xs"
                  >
                    <RotateCcw size={12} />
                    Retry failed
                  </button>
                )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
