"use client";

import { useEffect } from "react";

type Props = {
  message: string;
  onClose: () => void;
};

export default function Toast({ message, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="
        fixed bottom-6 right-6 z-[100]
        w-[240px] h-[50px]
        bg-black/80 backdrop-blur
        border border-white/10
        rounded-md
        flex items-center px-4
        text-sm text-white
        shadow-lg
      "
    >
      <span className="flex-1 truncate">
        {message}
      </span>

      <button
        onClick={onClose}
        className="ml-3 text-white/60 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
