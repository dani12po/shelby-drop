"use client";

import { useState } from "react";
import { useNotifications } from "@/components/notifications/useNotifications";

type Props = {
  onSearch: (wallet: string) => void;
};

/* ===============================
   WALLET VALIDATION (MULTI-CHAIN)
 ================================ */

function isValidWallet(input: string) {
  const v = input.trim();

  if (!v.startsWith("0x")) return false;
  if (!/^[0-9a-fA-Fx]+$/.test(v)) return false;

  // ETH (42), Aptos (66), future-safe
  return v.length >= 42;
}

/* ===============================
   COMPONENT
 ================================ */

export default function SearchBox({ onSearch }: Props) {
  const [value, setValue] = useState("");

  // 🔔 notification system
  const { notify } = useNotifications();

  function submit() {
    const wallet = value.trim();

    if (!isValidWallet(wallet)) {
      notify("error", "Invalid wallet address.");
      return;
    }

    onSearch(wallet);
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder="Search wallet address or paste 0x..."
        style={{
          width: '100%',
          height: '60px',
          borderRadius: '30px',
          paddingLeft: '28px',
          paddingRight: '160px',
          fontSize: '1rem',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(139,92,246,0.3)',
          color: '#f1f5f9',
          outline: 'none',
          fontFamily: 'inherit'
        }}
      />
      <button
        onClick={submit}
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          height: '44px',
          padding: '0 28px',
          borderRadius: '22px',
          fontSize: '0.9rem',
          fontWeight: 600,
          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
          color: 'white',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Search
      </button>
    </div>
  );
}
