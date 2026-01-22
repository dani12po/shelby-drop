"use client";

type WalletPillProps = {
  connected: boolean;
  label: string;
  onOpenModal: () => void;
  onDisconnect: () => void;
};

export default function WalletPill({
  connected,
  label,
  onOpenModal,
  onDisconnect,
}: WalletPillProps) {
  return (
    <button
      onClick={connected ? onDisconnect : onOpenModal}
      className="
        flex items-center gap-2
        rounded-full px-4 py-2
        text-sm font-medium
        bg-black/60 backdrop-blur
        hover:bg-black/70
        transition
        shadow-lg
      "
    >
      <span
        className={`h-2 w-2 rounded-full ${
          connected ? "bg-green-400" : "bg-neutral-400"
        }`}
      />
      <span>{connected ? label : "Connect Wallet"}</span>
    </button>
  );
}
