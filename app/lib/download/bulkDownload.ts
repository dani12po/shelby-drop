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
      const url = buildShelbyDownloadUrl(wallet, file);

      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.rel = "noopener noreferrer";
      a.target = "_blank";

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

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
