"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { ShelbyNetwork } from "@/config/shelby";

interface NetworkContextType {
  network: ShelbyNetwork;
  setNetwork: (n: ShelbyNetwork) => void;
}

const NetworkContext = createContext<NetworkContextType>({
  network: "testnet",
  setNetwork: () => {},
});

export function NetworkProvider({ children }: { children: ReactNode }) {
  // Force testnet as per user request to remove network selection
  const [network] = useState<ShelbyNetwork>("testnet");

  const setNetwork = useCallback((_n: ShelbyNetwork) => {
    // No-op: network selection is disabled
  }, []);

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
