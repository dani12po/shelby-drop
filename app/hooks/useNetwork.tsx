"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { ShelbyNetwork } from "@/config/shelby";

const STORAGE_KEY = "shelby_network";

interface NetworkContextType {
  network: ShelbyNetwork;
  setNetwork: (n: ShelbyNetwork) => void;
}

const NetworkContext = createContext<NetworkContextType>({
  network: "testnet",
  setNetwork: () => {},
});

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetworkState] = useState<ShelbyNetwork>("testnet");

  // Hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ShelbyNetwork | null;
    if (saved === "testnet" || saved === "shelbynet") {
      setNetworkState(saved);
    } else {
      const envDefault = (process.env.NEXT_PUBLIC_SHELBY_NETWORK as ShelbyNetwork) || "testnet";
      setNetworkState(envDefault === "shelbynet" ? "shelbynet" : "testnet");
    }
  }, []);

  const setNetwork = useCallback((n: ShelbyNetwork) => {
    setNetworkState(n);
    localStorage.setItem(STORAGE_KEY, n);
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
