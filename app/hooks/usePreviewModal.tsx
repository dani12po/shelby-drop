"use client";

import { useState } from "react";
import type { FileItemData } from "@/lib/data";

type PreviewState = {
  file: FileItemData | null;
  wallet: string | null;
  open: boolean;
};

export function usePreviewModal() {
  const [state, setState] = useState<PreviewState>({
    file: null,
    wallet: null,
    open: false,
  });

  const openPreview = (file: FileItemData, wallet: string) => {
    setState({
      file,
      wallet,
      open: true,
    });
  };

  const closePreview = () => {
    setState({
      file: null,
      wallet: null,
      open: false,
    });
  };

  return {
    ...state,
    openPreview,
    closePreview,
  };
}
