"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/* ===============================
   PROPS
================================ */

type Props = {
  onSearch: (wallet: string) => void;
};

/* ===============================
   GRADIENT (MATCH WALLET MODAL)
================================ */

const GRADIENT = `
  linear-gradient(
    90deg,
    #7dd3fc,
    #a78bfa,
    #f472b6,
    #34d399,
    #fbbf24,
    #60a5fa,
    #a78bfa
  )
`;

/* ===============================
   WALLET VALIDATION
================================ */

function isValidWallet(input: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(input.trim());
}

/* ===============================
   COMPONENT
================================ */

export default function SearchBox({ onSearch }: Props) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

  function submit() {
    const wallet = value.trim();

    if (!isValidWallet(wallet)) {
      setError("Invalid wallet address");
      return;
    }

    setError(null);
    onSearch(wallet);
  }

  return (
    <div className="flex flex-col items-center">
      {/* ============================
          GRADIENT BORDER
      ============================ */}
      <motion.div
        animate={{ scale: focused ? 1.04 : 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative rounded-full p-[2px]"
        style={{
          background: GRADIENT,
          backgroundSize: "400% 100%",
          animation:
            "walletBorder 28s linear infinite",
        }}
      >
        {/* ============================
            CAPSULE MASK + INNER GAP
            ⬇️ 4px SAFE SPACE FROM LINE
        ============================ */}
        <div
          className="
            rounded-full
            overflow-hidden
            bg-[#0b0f14]
            px-[4px]
          "
        >
          {/* ============================
              CONTENT ROW
          ============================ */}
          <div
            className="
              flex items-center
              w-[500px]
              h-[44px]
              px-6
              gap-4
            "
          >
            {/* INPUT */}
            <input
              value={value}
              onChange={(e) =>
                setValue(e.target.value)
              }
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="Search wallet address…"
              className="
                flex-1
                h-full
                bg-transparent
                appearance-none
                border-none
                outline-none
                ring-0
                focus:ring-0
                text-[14px]
                leading-none
                text-white
                placeholder-white/40
                caret-white
              "
            />

            {/* SEARCH BUTTON */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={submit}
              className="
                shrink-0
                px-4 py-1.5
                rounded-full
                text-[12px] font-medium
                bg-white text-black
              "
            >
              Search
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ============================
          ERROR MESSAGE
      ============================ */}
      {error && (
        <div className="mt-2 w-[500px] text-center">
          <p className="text-xs text-red-400">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
