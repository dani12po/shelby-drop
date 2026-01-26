// lib/download/bulkDownload.ts

import type { FileItemData } from "@/lib/data";
import { buildShelbyDownloadUrl } from "@/lib/shelbyDownload";

type BulkDownloadOptions = {
  concurrency?: number;
  signal?: AbortSignal;
  onProgress?: (current: number, total: number) => void;
  onFileError?: (file: FileItemData, error: unknown) => void;
};

export async function bulkDownload(
  wallet: string,
  files: FileItemData[],
  options: BulkDownloadOptions = {}
): Promise<void> {
  const {
    concurrency = 3,
    signal,
    onProgress,
    onFileError,
  } = options;

  let completed = 0;
  const total = files.length;
  const queue = [...files];

  async function downloadOne(file: FileItemData) {
    if (signal?.aborted) return;

    try {
      const url = buildShelbyDownloadUrl(wallet, file);

      // SSR-safe: only use document APIs on client
      if (typeof window !== "undefined" && document) {
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.rel = "noopener noreferrer";
        a.target = "_blank";

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // delay kecil → browser safe
        await new Promise((r) => setTimeout(r, 200));
      }
    } catch (err) {
      if (!signal?.aborted) {
        console.error(
          "[bulkDownload] failed:",
          file.name,
          err
        );
        onFileError?.(file, err);
      }
    } finally {
      completed++;
      onProgress?.(completed, total);
    }
  }

  async function worker() {
    while (queue.length > 0) {
      if (signal?.aborted) return;

      const file = queue.shift();
      if (!file) return;

      await downloadOne(file);
    }
  }

  // spawn workers
  const workers = Array.from(
    { length: Math.min(concurrency, total) },
    () => worker()
  );

  await Promise.all(workers);
}
