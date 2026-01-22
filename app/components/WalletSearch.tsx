"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function WalletSearch() {
  const [value, setValue] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="search-wrapper">
      <input
        ref={inputRef}
        type="search"
        placeholder="Search wallet address..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.startsWith("0x")) {
            router.push(`/wallet/${value}`);
          }
        }}
        className="search-input"
      />

      <button
        onClick={() => {
          if (value.startsWith("0x")) {
            router.push(`/wallet/${value}`);
          }
        }}
        className="search-btn"
      >
        Open
      </button>
    </div>
  );
}
