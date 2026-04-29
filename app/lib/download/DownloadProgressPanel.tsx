"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Download, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

import type { BulkDownloadState } from "./useBulkDownloadController";
import { getProgressPercent, hasRetryableFailed } from "./downloadStateUtils";

type Props = {
  state: BulkDownloadState;
  onCancel: () => void;
  onRetry: () => void;
};

export default function DownloadProgressPanel({ state, onCancel, onRetry }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (state.status === "idle") return null;
  if (!mounted) return null;

  const progress = getProgressPercent(state);
  const canRetry = hasRetryableFailed(state);
  const isDone = state.status === "completed";
  const isCancelled = state.status === "cancelled";

  const accent =
    isDone && !canRetry ? "#10b981" :
    isCancelled         ? "#ef4444" :
    "#a78bfa";

  const panel = (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px",
      /* z-index 200 — above ExplorerModal (60), notifications (70), and all overlays */
      zIndex: 200, width: "320px",
      borderRadius: "14px", padding: "2px",
      background: "linear-gradient(90deg,#7dd3fc,#a78bfa,#f472b6,#34d399,#fbbf24,#60a5fa,#a78bfa)",
      backgroundSize: "400% 100%",
      animation: "walletBorder 4s linear infinite",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    }}>
      {/* inner card */}
      <div style={{
        borderRadius: "12px",
        background: "var(--bg-modal)",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* progress bar at top */}
        <div style={{
          height: "3px",
          background: "rgba(255,255,255,0.06)",
        }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: accent,
            transition: "width 0.3s ease",
          }} />
        </div>

        {/* body */}
        <div style={{
          padding: "14px",
          display: "flex", alignItems: "flex-start", gap: "10px",
        }}>
          {/* left accent line */}
          <div style={{
            width: "3px", alignSelf: "stretch", minHeight: "20px",
            borderRadius: "2px", flexShrink: 0,
            background: accent,
          }} />

          {/* icon */}
          <div style={{ flexShrink: 0, marginTop: "1px" }}>
            {isDone && !canRetry
              ? <CheckCircle2 size={16} strokeWidth={2} color={accent} />
              : isCancelled
              ? <XCircle size={16} strokeWidth={2} color={accent} />
              : <Download size={16} strokeWidth={2} color={accent} />
            }
          </div>

          {/* content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "0.825rem", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>
              {isDone && !canRetry ? "Download complete" :
               isCancelled        ? "Download cancelled" :
               "Downloading…"}
            </p>
            <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
              {state.completed + state.failed} / {state.total} files
              {canRetry && state.failed > 0 && (
                <span style={{ color: "#f87171", marginLeft: "6px" }}>
                  ({state.failed} failed)
                </span>
              )}
            </p>

            {/* retry button */}
            {isDone && canRetry && (
              <button
                onClick={onRetry}
                style={{
                  marginTop: "8px",
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  padding: "5px 10px", borderRadius: "6px",
                  background: "rgba(139,92,246,0.15)",
                  border: "1px solid rgba(139,92,246,0.3)",
                  color: "#a78bfa", fontSize: "0.75rem",
                  fontWeight: 600, cursor: "pointer",
                }}
              >
                <RefreshCw size={11} strokeWidth={2.5} />
                Retry failed
              </button>
            )}
          </div>

          {/* close / cancel */}
          <button
            onClick={onCancel}
            style={{
              flexShrink: 0, background: "none", border: "none",
              color: "#475569", cursor: "pointer", padding: "2px",
              display: "flex", alignItems: "center",
            }}
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );

  // Portal to document.body so z-index is relative to root stacking context
  // This ensures the panel always appears above ExplorerModal and all other overlays
  return createPortal(panel, document.body);
}
