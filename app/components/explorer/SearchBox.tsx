"use client";

import { useState } from "react";
import { useNotifications } from "@/components/notifications/useNotifications";
import { Search, X, ClipboardPaste } from "lucide-react";

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
  const [isFocused, setIsFocused] = useState(false);

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

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setValue(text);
    } catch {}
  }

  function handleClear() {
    setValue('');
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder="Search wallet address or paste 0x..."
        style={{
          width: '100%',
          height: '60px',
          borderRadius: '30px',
          paddingLeft: '28px',
          paddingRight: value ? '200px' : '160px',
          fontSize: '1rem',
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${isFocused ? 'rgba(139,92,246,0.6)' : 'rgba(139,92,246,0.3)'}`,
          color: '#f1f5f9',
          outline: 'none',
          fontFamily: 'inherit',
          transition: 'border-color 0.2s'
        }}
      />
      
      {/* Paste button */}
      <button
        type="button"
        onClick={handlePaste}
        title="Paste dari clipboard"
        style={{
          position: 'absolute',
          right: value ? '170px' : '130px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: '#475569',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          transition: 'color 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
        onMouseLeave={e => e.currentTarget.style.color = '#475569'}
      >
        <ClipboardPaste size={16} strokeWidth={1.8} />
      </button>

      {/* Clear button - only appears if there's text */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          title="Hapus"
          style={{
            position: 'absolute',
            right: '130px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: '#475569',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
          onMouseLeave={e => e.currentTarget.style.color = '#475569'}
        >
          <X size={16} strokeWidth={2} />
        </button>
      )}

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
