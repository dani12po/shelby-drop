// lib/download/bulkDownload.ts

import type { FileItemData } from "@/lib/data";
import { buildShelbyDownloadUrl } from "@/lib/shelbyDownload";

/* ===============================
   TYPES
================================ */
export type BulkDownloadResult = {
  success: FileItemData[];
  failed: {
    file: FileItemData;
    error: unknown;
  }[];
};

/* ===============================
   BULK DOWNLOAD
================================ */
export async function bulkDownload(
  wallet: string,
  files: FileItemData[],
  options?: {
    delayMs?: number;
    signal?: AbortSignal;
  }
): Promise<BulkDownloadResult> {
  const delayMs = options?.delayMs ?? 250;

  const result: BulkDownloadResult = {
    success: [],
    failed: [],
  };

  for (const file of files) {
    /* ===============================
       ABORT CHECK
    ================================ */
    if (options?.signal?.aborted) {
      break;
    }

    try {
      // Use proxy route — cross-origin <a download> is blocked by browsers
      // /api/media?download=1 adds Content-Disposition: attachment header
      const filePath = [
        ...(Array.isArray(file.path) ? file.path : [file.path]),
        file.name,
      ].filter(Boolean).join("/");

      const proxyUrl = `/api/media?wallet=${encodeURIComponent(wallet)}&name=${encodeURIComponent(filePath)}&download=1`;

      // SSR-safe: only use document APIs on client
      if (typeof window !== "undefined" && document) {
        const a = document.createElement("a");
        a.href = proxyUrl;
        a.download = file.name;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      result.success.push(file);
    } catch (err) {
      console.error(
        "[bulkDownload] failed:",
        file.name,
        err
      );

      result.failed.push({
        file,
        error: err,
      });
    }

    /* ===============================
       SMALL DELAY (ANTI-BLOCK)
    ================================ */
    if (delayMs > 0) {
      await new Promise((r) =>
        setTimeout(r, delayMs)
      );
    }
  }

  return result;
}
