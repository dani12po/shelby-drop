"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function WalletButton() {
  const { connected, connect, disconnect, account } = useWallet();

  if (!connected) {
    return (
      <button
        onClick={() => connect("Petra")}
        className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <button
      onClick={disconnect}
      className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20"
    >
      {account?.address.toString().slice(0, 6)}…
      {account?.address.toString().slice(-4)}
    </button>
  );
}
