"use client";

import { X } from "lucide-react";

import type {
  BulkDownloadState,
} from "./useBulkDownloadController";

import {
  getProgressPercent,
  hasRetryableFailed,
} from "./downloadStateUtils";

type Props = {
  state: BulkDownloadState;
  onCancel: () => void;
  onRetry: () => void;
};

export default function DownloadProgressPanel({
  state,
  onCancel,
  onRetry,
}: Props) {
  if (state.status === "idle") return null;

  const progress = getProgressPercent(state);
  const canRetry = hasRetryableFailed(state);

  return (
    <div
      className="fixed bottom-6 right-6 z-[100]
        w-[320px] rounded-xl
        bg-[#0b0f14] border border-white/10
        shadow-lg p-4 text-sm"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium">
          Download
        </span>

        {state.status === "running" && (
          <button
            onClick={onCancel}
            className="p-1 rounded hover:bg-white/10"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full h-2 rounded bg-white/10 overflow-hidden mb-3">
        <div
          className="h-full bg-white/80 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* STATUS */}
      <div className="text-xs text-white/70 mb-3">
        {state.completed + state.failed} / {state.total} files
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-2">
        {state.status === "completed" && canRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1 rounded
              bg-white/10 hover:bg-white/20"
          >
            Retry failed
          </button>
        )}

        {state.status === "completed" && (
          <span className="text-xs text-white/50">
            Completed
          </span>
        )}

        {state.status === "cancelled" && (
          <span className="text-xs text-white/50">
            Cancelled
          </span>
        )}
      </div>
    </div>
  );
}
