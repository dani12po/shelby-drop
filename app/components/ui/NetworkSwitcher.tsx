"use client";

import { useNetwork } from "@/hooks/useNetwork";
import { NETWORK_CONFIGS, type ShelbyNetwork } from "@/config/shelby";
import { useState } from "react";

export default function NetworkSwitcher() {
  const { network, setNetwork } = useNetwork();
  const [showTooltip, setShowTooltip] = useState(false);

  const isTestnet = network === "testnet";

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
          {isTestnet
            ? "Early Access testnet (recommended)"
            : "⚠️ Shelbynet is the older devnet"}
        </div>
      )}

      {/* Switcher pill */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "5px 10px",
        borderRadius: "9999px",
        border: `1px solid ${isTestnet ? "rgba(52,211,153,0.3)" : "rgba(251,191,36,0.3)"}`,
        background: isTestnet ? "rgba(52,211,153,0.08)" : "rgba(251,191,36,0.08)",
        cursor: "pointer",
        transition: "all 0.2s",
      }}>
        {/* Status dot */}
        <span style={{
          width: "6px", height: "6px", borderRadius: "50%",
          background: isTestnet ? "#34d399" : "#fbbf24",
          flexShrink: 0,
          boxShadow: isTestnet
            ? "0 0 6px rgba(52,211,153,0.6)"
            : "0 0 6px rgba(251,191,36,0.6)",
        }} />

        {/* Select */}
        <select
          value={network}
          onChange={(e) => setNetwork(e.target.value as ShelbyNetwork)}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "0.72rem",
            fontWeight: 600,
            color: isTestnet ? "#34d399" : "#fbbf24",
            cursor: "pointer",
            padding: 0,
            appearance: "none",
            WebkitAppearance: "none",
          }}
        >
          {Object.entries(NETWORK_CONFIGS).map(([key, cfg]) => (
            <option
              key={key}
              value={key}
              style={{ background: "var(--bg-dropdown)", color: "var(--text-primary)" }}
            >
              {cfg.label}
            </option>
          ))}
        </select>

        {/* Chevron */}
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ flexShrink: 0, opacity: 0.6 }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
