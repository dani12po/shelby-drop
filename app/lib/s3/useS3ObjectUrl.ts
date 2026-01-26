"use client";

/* ======================================================
   TYPES
====================================================== */

export type S3ObjectRef = {
  bucket: string;        // wallet
  key: string;           // path/to/file.ext
};

export type S3GatewayConfig = {
  gatewayOrigin: string; // https://gateway.shelby.xyz
};

/* ======================================================
   DEFAULT CONFIG
====================================================== */

const DEFAULT_GATEWAY_ORIGIN =
  process.env.NEXT_PUBLIC_S3_GATEWAY_ORIGIN ??
  "https://gateway.shelby.xyz";

/* ======================================================
   CORE UTILS
====================================================== */

export function useS3ObjectUrl(
  config?: Partial<S3GatewayConfig>
) {
  const gatewayOrigin =
    config?.gatewayOrigin ?? DEFAULT_GATEWAY_ORIGIN;

  /* ===============================
     BUILD OBJECT KEY
     (S3-compatible)
  ================================ */
  function buildObjectKey(
    path: string[] | undefined,
    filename: string
  ): string {
    if (!path || path.length === 0) {
      return filename;
    }
    return `${path.join("/")}/${filename}`;
  }

  /* ===============================
     BUILD HTTP OBJECT URL
  ================================ */
  function buildObjectUrl(ref: S3ObjectRef): string {
    return `${gatewayOrigin}/${ref.bucket}/${ref.key}`;
  }

  /* ===============================
     BUILD S3 URI
     (s3://bucket/key)
  ================================ */
  function buildS3Uri(ref: S3ObjectRef): string {
    return `s3://${ref.bucket}/${ref.key}`;
  }

  /* ===============================
     BUILD EXPLORER DEEP LINK
     (for UI navigation)
  ================================ */
  function buildExplorerLink(
    ref: S3ObjectRef,
    path?: string[]
  ): string {
    // SSR-safe: only use window APIs on client
    if (typeof window === "undefined") {
      return "";
    }
    const params = new URLSearchParams();
    params.set("wallet", ref.bucket);
    params.set("fileKey", ref.key);

    if (path && path.length) {
      params.set("path", path.join("/"));
    }

    return `${window.location.origin}/?${params.toString()}`;
  }

  /* ===============================
     CLIPBOARD HELPERS
  ================================ */
  async function copyObjectUrl(ref: S3ObjectRef) {
    const url = buildObjectUrl(ref);
    // SSR-safe: only use navigator APIs on client
    if (typeof window !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
    return url;
  }

  async function copyS3Uri(ref: S3ObjectRef) {
    const uri = buildS3Uri(ref);
    // SSR-safe: only use navigator APIs on client
    if (typeof window !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(uri);
    }
    return uri;
  }

  /* ===============================
     FUTURE EXTENSION POINTS
     - signed URL
     - curl snippet
     - SDK snippet
  ================================ */

  return {
    /* builders */
    buildObjectKey,
    buildObjectUrl,
    buildS3Uri,
    buildExplorerLink,

    /* clipboard */
    copyObjectUrl,
    copyS3Uri,

    /* meta */
    gatewayOrigin,
  };
}
