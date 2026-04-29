"use client";

import { ReactNode } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { NetworkProvider } from "@/hooks/useNetwork";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <NetworkProvider>
      <AptosWalletAdapterProvider
        autoConnect={false}
        dappConfig={{ network: Network.TESTNET }}
        onError={(error) => console.error("Wallet adapter error:", error)}
      >
        {children}
      </AptosWalletAdapterProvider>
    </NetworkProvider>
  );
}
