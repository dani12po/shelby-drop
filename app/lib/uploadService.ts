// app/lib/uploadService.ts

/* ===============================
   Types
================================ */

export type UploadMetadata = {
  /** Wallet owner */
  wallet: string;

  /** Original filename */
  originalName: string;

  /** Stored filename on disk */
  storedName: string;

  /** Logical blob path used by Explorer & Preview */
  blob_name: string;

  /** File size in bytes */
  size: number;

  /** MIME type */
  mime: string;

  /** Content hash */
  hash: string;

  /** Retention policy */
  retentionDays: number;
  expiresAt: string | null;

  /** Upload timestamp */
  uploadedAt: string;
};

export type ShelbyUploadArgs = {
  file: File;
  wallet: string;
  path?: string[];

  /** REQUIRED by backend */
  retentionDays: number;
};

/* ===============================
   Upload (Retention enforced)
================================ */

export async function uploadToShelby({
  file,
  wallet,
  path = [],
  retentionDays,
}: ShelbyUploadArgs): Promise<UploadMetadata> {
  /* ===============================
     FORM DATA
  ================================ */
  const formData = new FormData();
  formData.append("file", file);
  formData.append("wallet", wallet);
  formData.append("path", path.join("/"));
  formData.append(
    "retentionDays",
    String(retentionDays)
  );

  /* ===============================
     REQUEST
  ================================ */
  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  /* ===============================
     ERROR HANDLING
  ================================ */
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Upload failed");
  }

  /* ===============================
     RESPONSE VALIDATION
  ================================ */
  const data = await res.json();

  if (
    !data ||
    data.success !== true ||
    !data.metadata
  ) {
    throw new Error(
      "Upload succeeded but metadata is missing"
    );
  }

  /**
   * Normalize backend metadata
   * (single source of truth)
   */
  const metadata = data.metadata;

  return {
    wallet: metadata.wallet,
    originalName: metadata.originalName,
    storedName: metadata.storedName,
    blob_name: metadata.blob_name, // 🔑 IMPORTANT
    size: metadata.size,
    mime: metadata.mime,
    hash: metadata.hash,
    retentionDays: metadata.retentionDays,
    expiresAt: metadata.expiresAt ?? null,
    uploadedAt: metadata.uploadedAt,
  };
}
