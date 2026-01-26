"use client";

import type { S3ObjectRef } from "./useS3ObjectUrl";
import { useS3ObjectUrl } from "./useS3ObjectUrl";

/* ======================================================
   TYPES
====================================================== */

export type S3BulkCopyResult = {
  count: number;
  content: string;
};

/* ======================================================
   HOOK
====================================================== */

export function useS3BulkOperations() {
  const {
    buildObjectUrl,
    buildS3Uri,
  } = useS3ObjectUrl();

  /* ===============================
     BULK OBJECT URL
  ================================ */
  async function copyObjectUrls(
    refs: S3ObjectRef[]
  ): Promise<S3BulkCopyResult> {
    if (!refs.length) {
      return { count: 0, content: "" };
    }

    const content = refs
      .map((ref) => buildObjectUrl(ref))
      .join("\n");

    // SSR-safe: only use navigator APIs on client
    if (typeof window !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(content);
    }

    return {
      count: refs.length,
      content,
    };
  }

  /* ===============================
     BULK S3 URI
  ================================ */
  async function copyS3Uris(
    refs: S3ObjectRef[]
  ): Promise<S3BulkCopyResult> {
    if (!refs.length) {
      return { count: 0, content: "" };
    }

    const content = refs
      .map((ref) => buildS3Uri(ref))
      .join("\n");

    // SSR-safe: only use navigator APIs on client
    if (typeof window !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(content);
    }

    return {
      count: refs.length,
      content,
    };
  }

  /* ===============================
     FUTURE EXTENSIONS
     - bulk signed URL
     - bulk download
  ================================ */

  return {
    copyObjectUrls,
    copyS3Uris,
  };
}
