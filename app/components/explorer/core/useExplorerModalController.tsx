"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

/* ======================================================
   TYPES
====================================================== */

export type ExplorerOpenPayload = {
  wallet: string;
  fileId?: string;
  path?: string[];
};

type ExplorerModalState = {
  open: boolean;
  wallet: string | null;
  initialFileId: string | null;
  initialPath: string[] | null;

  openExplorer: (payload: ExplorerOpenPayload) => void;
  closeExplorer: () => void;
};

/* ======================================================
   CONTEXT
====================================================== */

const ExplorerModalContext =
  createContext<ExplorerModalState | null>(null);

/* ======================================================
   PROVIDER
====================================================== */

export function ExplorerModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [wallet, setWallet] =
    useState<string | null>(null);
  const [initialFileId, setInitialFileId] =
    useState<string | null>(null);
  const [initialPath, setInitialPath] =
    useState<string[] | null>(null);

  function openExplorer({
    wallet,
    fileId,
    path,
  }: ExplorerOpenPayload) {
    setWallet(wallet);
    setInitialFileId(fileId ?? null);
    setInitialPath(path ?? null);
    setOpen(true);
  }

  function closeExplorer() {
    setOpen(false);
    setWallet(null);
    setInitialFileId(null);
    setInitialPath(null);
  }

  return (
    <ExplorerModalContext.Provider
      value={{
        open,
        wallet,
        initialFileId,
        initialPath,
        openExplorer,
        closeExplorer,
      }}
    >
      {children}
    </ExplorerModalContext.Provider>
  );
}

/* ======================================================
   HOOK
====================================================== */

export function useExplorerModalController(): ExplorerModalState {
  const ctx = useContext(ExplorerModalContext);

  if (!ctx) {
    throw new Error(
      "useExplorerModalController must be used inside <ExplorerModalProvider>"
    );
  }

  return ctx;
}
