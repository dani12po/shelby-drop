"use client";

import { ReactNode } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";

export default function Providers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AptosWalletAdapterProvider 
      autoConnect={false}
      dappConfig={{ network: Network.SHELBYNET }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
