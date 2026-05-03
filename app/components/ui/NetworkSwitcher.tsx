"use client";

import { useNetwork } from "@/hooks/useNetwork";
import { NETWORK_CONFIGS } from "@/config/shelby";
import { useState } from "react";

export default function NetworkSwitcher() {
  const { network } = useNetwork();
  const [showTooltip, setShowTooltip] = useState(false);

  const config = NETWORK_CONFIGS[network];

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "6px 12px",
          borderRadius: "8px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          whiteSpace: "nowrap",
          fontSize: "0.72rem",
          color: "var(--text-secondary)",
          zIndex: 100,
          backdropFilter: "blur(10px)",
          pointerEvents: "none",
        }}>
          Early Access testnet (recommended)
        </div>
      )}

      {/* Switcher pill (now just a display pill) */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "5px 12px",
        borderRadius: "9999px",
        border: "1px solid rgba(52,211,153,0.3)",
        background: "rgba(52,211,153,0.08)",
        transition: "all 0.2s",
      }}>
        {/* Status dot */}
        <span style={{
          width: "6px", height: "6px", borderRadius: "50%",
          background: "#34d399",
          flexShrink: 0,
          boxShadow: "0 0 6px rgba(52,211,153,0.6)",
        }} />

        {/* Label */}
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 600,
            color: "#34d399",
            padding: 0,
          }}
        >
          {config.label}
        </span>
      </div>
    </div>
  );
}
