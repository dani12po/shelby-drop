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
    <div className="relative w-full max-w-[680px] mx-auto group">
      <div className="relative flex items-center">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Search wallet address..."
          className={`
            w-full h-[56px] md:h-[64px] rounded-full pl-6 md:pl-8
            pr-[100px] md:pr-[180px] text-sm md:text-base
            bg-[var(--bg-card)] border transition-all duration-300
            ${isFocused ? 'border-[var(--accent)] ring-4 ring-[var(--accent)]/10' : 'border-[var(--border-hover)]'}
            text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]
          `}
        />
        
        <div className="absolute right-2 flex items-center gap-1 md:gap-2">
          {/* Action Buttons Group */}
          <div className="hidden sm:flex items-center gap-1 mr-1">
            <button
              type="button"
              onClick={handlePaste}
              title="Paste"
              className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/5 transition-colors"
            >
              <ClipboardPaste size={18} />
            </button>

            {value && (
              <button
                type="button"
                onClick={handleClear}
                title="Clear"
                className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <button
            onClick={submit}
            className="
              h-[40px] md:h-[48px] px-5 md:px-8 rounded-full
              text-sm md:text-base font-semibold
              bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6]
              text-white shadow-lg shadow-purple-500/20
              hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]
              transition-all duration-200
            "
          >
            <span className="hidden xs:inline">Search</span>
            <Search className="xs:hidden" size={18} />
          </button>
        </div>
      </div>
      
      {/* Mobile Helper Buttons */}
      <div className="flex sm:hidden mt-3 justify-center gap-4">
        <button
          onClick={handlePaste}
          className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        >
          <ClipboardPaste size={14} /> Paste Address
        </button>
        {value && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
