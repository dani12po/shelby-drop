// lib/download/retryBulkDownload.ts

import type { FileItemData } from "@/lib/data";
import {
  bulkDownload,
  type BulkDownloadResult,
} from "./bulkDownload";

/* ===============================
   TYPES
================================ */

export type RetryBulkDownloadOptions = {
  /** Maximum retry per file */
  maxRetries?: number;

  /** Delay between retries (ms) */
  retryDelayMs?: number;

  /** Abort support */
  signal?: AbortSignal;
};

export type RetryBulkDownloadResult = {
  success: FileItemData[];
  failed: {
    file: FileItemData;
    error: unknown;
    attempts: number;
  }[];
};

/* ===============================
   RETRY BULK DOWNLOAD
================================ */

export async function retryBulkDownload(
  wallet: string,
  files: FileItemData[],
  options?: RetryBulkDownloadOptions
): Promise<RetryBulkDownloadResult> {
  const maxRetries = options?.maxRetries ?? 2;
  const retryDelayMs = options?.retryDelayMs ?? 500;

  const success: FileItemData[] = [];
  const failedMap = new Map<
    string,
    {
      file: FileItemData;
      error: unknown;
      attempts: number;
    }
  >();

  /* ===============================
     INIT STATE
  ================================ */
  for (const file of files) {
    failedMap.set(file.id, {
      file,
      error: null,
      attempts: 0,
    });
  }

  /* ===============================
     RETRY LOOP
  ================================ */
  for (let round = 0; round <= maxRetries; round++) {
    if (options?.signal?.aborted) {
      break;
    }

    const pendingFiles = Array.from(failedMap.values())
      .filter((f) => f.attempts === round)
      .map((f) => f.file);

    if (pendingFiles.length === 0) {
      break;
    }

    const result: BulkDownloadResult =
      await bulkDownload(wallet, pendingFiles, {
        delayMs: 250,
        signal: options?.signal,
      });

    /* ===============================
       SUCCESS
    ================================ */
    for (const file of result.success) {
      success.push(file);
      failedMap.delete(file.id);
    }

    /* ===============================
       FAILED
    ================================ */
    for (const failed of result.failed) {
      const entry = failedMap.get(failed.file.id);
      if (!entry) continue;

      entry.attempts += 1;
      entry.error = failed.error;
    }

    /* ===============================
       DELAY BETWEEN RETRIES
    ================================ */
    if (round < maxRetries && retryDelayMs > 0) {
      await new Promise((r) =>
        setTimeout(r, retryDelayMs)
      );
    }
  }

  /* ===============================
     FINAL RESULT
  ================================ */
  return {
    success,
    failed: Array.from(failedMap.values()),
  };
}
