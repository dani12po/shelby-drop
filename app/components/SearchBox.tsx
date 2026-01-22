"use client";

import { motion } from "framer-motion";
import { spring } from "@/lib/motion";
import { useState } from "react";

export default function SearchBox({
  value,
  onChange,
  onOpen,
}: {
  value: string;
  onChange: (v: string) => void;
  onOpen: () => void;
}) {
  const [active, setActive] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setActive(true)}
      onHoverEnd={() => !value && setActive(false)}
      animate={{
        width: active ? 420 : 140,
      }}
      transition={spring}
      className="
        flex items-center gap-2
        bg-white/10 backdrop-blur
        rounded-full px-4 py-2
        overflow-hidden
      "
    >
      <input
        value={value}
        onFocus={() => setActive(true)}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search wallet address…"
        className="
          bg-transparent outline-none
          text-sm text-white placeholder-white/50
          w-full
        "
      />

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onOpen}
        className="
          px-3 py-1 rounded-full
          bg-white text-black text-xs
        "
      >
        Open
      </motion.button>
    </motion.div>
  );
}
