import type {
  BulkDownloadState,
  BulkDownloadItemResult,
} from "./useBulkDownloadController";

/* ===============================
   PROGRESS
================================ */
export function getProgressPercent(
  state: BulkDownloadState
): number {
  if (state.total === 0) return 0;

  return Math.round(
    ((state.completed + state.failed) / state.total) * 100
  );
}

/* ===============================
   STATUS HELPERS
================================ */
export function isDownloadDone(
  state: BulkDownloadState
): boolean {
  return (
    state.status === "completed" ||
    state.status === "failed" ||
    state.status === "cancelled"
  );
}

export function hasRetryableFailed(
  state: BulkDownloadState
): boolean {
  return Object.values(state.results).some(
    (r: BulkDownloadItemResult) =>
      !r.success && !r.permanentFailure
  );
}

export function hasPermanentFailure(
  state: BulkDownloadState
): boolean {
  return Object.values(state.results).some(
    (r: BulkDownloadItemResult) => r.permanentFailure
  );
}
