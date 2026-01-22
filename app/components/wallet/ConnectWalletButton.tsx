"use client";

export default function ConnectWalletButton() {
  return (
    <button
      className="
        px-4 py-2 rounded-lg
        bg-black text-white
        border border-black
        hover:bg-gray-900
        transition
        text-sm font-medium
      "
      onClick={() => {
        alert("Wallet connect coming next 🔌");
      }}
    >
      Connect Wallet
    </button>
  );
}
