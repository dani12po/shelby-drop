"use client";

import { useCallback, useRef, useState } from "react";
import { bulkDownload } from "./bulkDownload";
import type { FileItemData } from "@/lib/data";

/* ===============================
   TYPES
================================ */
export type BulkDownloadStatus =
  | "idle"
  | "running"
  | "cancelled"
  | "completed";

export interface BulkDownloadItemResult {
  file: FileItemData;
  success: boolean;
  error?: unknown;
  attempts: number;
  permanentFailure: boolean;
}

export interface BulkDownloadState {
  status: BulkDownloadStatus;
  total: number;
  completed: number;
  failed: number;
  results: Record<string, BulkDownloadItemResult>;
  abortController: AbortController | null;
}

/* ===============================
   CONSTANTS
================================ */
const MAX_RETRY = 2;

/* ===============================
   INITIAL STATE
================================ */
const initialState: BulkDownloadState = {
  status: "idle",
  total: 0,
  completed: 0,
  failed: 0,
  results: {},
  abortController: null,
};

/* ===============================
   HOOK
================================ */
export function useBulkDownloadController(wallet: string) {
  const [state, setState] =
    useState<BulkDownloadState>(initialState);

  const runningRef = useRef(false);

  /* ===============================
     START
  ================================ */
  const start = useCallback(
    async (files: FileItemData[]) => {
      if (runningRef.current || files.length === 0)
        return;

      runningRef.current = true;
      const controller = new AbortController();

      const initialResults: Record<
        string,
        BulkDownloadItemResult
      > = {};
      files.forEach((file) => {
        initialResults[file.id] = {
          file,
          success: false,
          attempts: 0,
          permanentFailure: false,
        };
      });

      setState({
        status: "running",
        total: files.length,
        completed: 0,
        failed: 0,
        results: initialResults,
        abortController: controller,
      });

      try {
        const { success, failed } =
          await bulkDownload(wallet, files, {
            signal: controller.signal,
          });

        setState((prev) => {
          const nextResults = { ...prev.results };

          success.forEach((file) => {
            nextResults[file.id] = {
              file,
              success: true,
              attempts: 1,
              permanentFailure: false,
            };
          });

          failed.forEach(({ file, error }) => {
            nextResults[file.id] = {
              file,
              success: false,
              error,
              attempts: 1,
              permanentFailure: false,
            };
          });

          return {
            status: controller.signal.aborted
              ? "cancelled"
              : "completed",
            total: prev.total,
            completed: success.length,
            failed: failed.length,
            results: nextResults,
            abortController: null,
          };
        });
      } finally {
        runningRef.current = false;
      }
    },
    [wallet]
  );

  /* ===============================
     CANCEL
  ================================ */
  const cancel = useCallback(() => {
    setState((prev) => {
      prev.abortController?.abort();
      return {
        ...prev,
        status: "cancelled",
        abortController: null,
      };
    });
    runningRef.current = false;
  }, []);

  /* ===============================
     RETRY FAILED
  ================================ */
  const retryFailed = useCallback(async () => {
    if (runningRef.current) return;

    const retryable = Object.values(state.results).filter(
      (r) => !r.success && !r.permanentFailure
    );

    if (retryable.length === 0) return;

    runningRef.current = true;
    const controller = new AbortController();

    setState((prev) => ({
      ...prev,
      status: "running",
      abortController: controller,
    }));

    try {
      const files = retryable.map((r) => r.file);

      const { success, failed } =
        await bulkDownload(wallet, files, {
          signal: controller.signal,
        });

      setState((prev) => {
        const nextResults = { ...prev.results };

        success.forEach((file) => {
          const prevItem = nextResults[file.id];
          nextResults[file.id] = {
            file,
            success: true,
            attempts: prevItem.attempts + 1,
            permanentFailure: false,
          };
        });

        failed.forEach(({ file, error }) => {
          const prevItem = nextResults[file.id];
          const attempts = prevItem.attempts + 1;

          nextResults[file.id] = {
            file,
            success: false,
            error,
            attempts,
            permanentFailure: attempts >= MAX_RETRY,
          };
        });

        const completed = Object.values(
          nextResults
        ).filter((r) => r.success).length;

        const failedCount = Object.values(
          nextResults
        ).filter((r) => !r.success).length;

        return {
          status: controller.signal.aborted
            ? "cancelled"
            : "completed",
          total: prev.total,
          completed,
          failed: failedCount,
          results: nextResults,
          abortController: null,
        };
      });
    } finally {
      runningRef.current = false;
    }
  }, [wallet, state.results]);

  return {
    state,
    start,
    cancel,
    retryFailed,
  };
}
