"use client";

import type { FileItemData } from "@/lib/data";

type SharePayload = {
  wallet: string;
  file: FileItemData;
  path?: string[];
};

export function useExplorerShare() {
  /* ===============================
     BUILD URLS
  ================================ */

  function buildFileUrl(
    wallet: string,
    fileId: string
  ) {
    // SSR-safe: only use window APIs on client
    if (typeof window === "undefined") {
      return "";
    }
    // direct file access
    return `${window.location.origin}/uploads/${wallet}/${fileId}`;
  }

  function buildExplorerLink(
    wallet: string,
    fileId: string,
    path?: string[]
  ) {
    // SSR-safe: only use window APIs on client
    if (typeof window === "undefined") {
      return "";
    }
    const params = new URLSearchParams();
    params.set("wallet", wallet);
    params.set("fileId", fileId);

    if (path && path.length) {
      params.set("path", path.join("/"));
    }

    return `${window.location.origin}/?${params.toString()}`;
  }

  /* ===============================
     CORE SHARE
  ================================ */

  async function shareFile({
    wallet,
    file,
    path,
  }: SharePayload) {
    const fileUrl = buildFileUrl(wallet, file.id);
    const explorerUrl = buildExplorerLink(
      wallet,
      file.id,
      path
    );

    const shareText = `File: ${file.name}`;

    // SSR-safe: only use navigator APIs on client
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: file.name,
          text: shareText,
          url: explorerUrl,
        });
        return { method: "native" as const };
      } catch {
        // user cancelled → fallback
      }
    }

    // Fallback: copy explorer link
    if (typeof window !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(explorerUrl);
    }
    return { method: "clipboard" as const };
  }

  return {
    shareFile,
    buildFileUrl,
    buildExplorerLink,
  };
}
