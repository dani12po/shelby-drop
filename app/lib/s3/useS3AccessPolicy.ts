"use client";

/* ======================================================
   TYPES
====================================================== */

export type S3AccessMode =
  | "public"
  | "private"
  | "signed";

export type S3AccessPolicy = {
  mode: S3AccessMode;
  reason?: string;
};

export type S3AccessContext = {
  bucket: string;     // wallet
  key: string;        // object key
  contentType?: string;
  size?: number;
};

/* ======================================================
   DEFAULT RULES
====================================================== */

/**
 * Default access policy rules
 * NOTE:
 * - This is frontend-only heuristic
 * - Backend enforcement comes later
 */
function evaluateDefaultPolicy(
  ctx: S3AccessContext
): S3AccessPolicy {
  // Example heuristics (can evolve)
  if (
    ctx.key.endsWith(".json") ||
    ctx.key.endsWith(".txt") ||
    ctx.key.endsWith(".png") ||
    ctx.key.endsWith(".jpg") ||
    ctx.key.endsWith(".jpeg") ||
    ctx.key.endsWith(".svg")
  ) {
    return {
      mode: "public",
    };
  }

  return {
    mode: "signed",
    reason: "Object requires signed URL",
  };
}

/* ======================================================
   HOOK
====================================================== */

export function useS3AccessPolicy() {
  function getAccessPolicy(
    ctx: S3AccessContext
  ): S3AccessPolicy {
    return evaluateDefaultPolicy(ctx);
  }

  function isPublic(
    ctx: S3AccessContext
  ): boolean {
    return getAccessPolicy(ctx).mode === "public";
  }

  function requiresSignedUrl(
    ctx: S3AccessContext
  ): boolean {
    return getAccessPolicy(ctx).mode === "signed";
  }

  return {
    getAccessPolicy,
    isPublic,
    requiresSignedUrl,
  };
}
