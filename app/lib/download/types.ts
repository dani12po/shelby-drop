import type { FileItemData } from "@/lib/data";

export type DownloadItemResult = {
  file: FileItemData;
  status: "pending" | "success" | "failed";
  error?: unknown;
};

export type BulkDownloadStatus =
  | "idle"
  | "running"
  | "completed"
  | "cancelled";

export type BulkDownloadState = {
  status: BulkDownloadStatus;
  total: number;
  completed: number;
  failed: number;

  items: Record<string, DownloadItemResult>;

  abortController: AbortController | null;
};
