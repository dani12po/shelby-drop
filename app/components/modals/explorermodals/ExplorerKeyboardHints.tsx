"use client";

type Props = {
  visible: boolean;
};

export default function ExplorerKeyboardHints({
  visible,
}: Props) {
  if (!visible) return null;

  return (
    <div
      className="
        pointer-events-none
        fixed bottom-6 right-6
        z-[60]
        hidden md:block
      "
    >
      <div
        className="
          rounded-xl
          bg-black/60 backdrop-blur
          border border-white/10
          px-4 py-3
          text-[11px]
          text-white/70
          space-y-1
          shadow-lg
        "
      >
        <Hint k="Esc" label="Close / Clear" />
        <Hint k="⌘ A" label="Select all" />
        <Hint k="Enter" label="Open / Preview" />
        <Hint k="⌫" label="Up folder" />
      </div>
    </div>
  );
}

function Hint({
  k,
  label,
}: {
  k: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="
          inline-flex items-center justify-center
          min-w-[28px]
          px-1.5 py-0.5
          rounded-md
          bg-white/10
          border border-white/15
          text-white/80
          font-mono
        "
      >
        {k}
      </span>
      <span>{label}</span>
    </div>
  );
}
