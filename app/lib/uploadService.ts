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
  // Generate blobName from filename + timestamp
  const blobName = `${Date.now()}-${file.name}`;
  
  const formData = new FormData();
  formData.append("file", file);
  formData.append("wallet", wallet);
  formData.append("path", path.join("/"));
  formData.append("blobName", blobName);  // ← Required field
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

  const result: UploadMetadata = {
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

  /* ===============================
     RECORD IN LOCAL INDEX
     (so /api/shelby/list can find it
      immediately, before Shelby indexer
      catches up)
  ================================ */
  try {
    await fetch("/api/upload/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet: result.wallet,
        blob_name: result.blob_name,
        size: result.size,
        contentType: result.mime,
        createdAt: result.uploadedAt,
      }),
    });
  } catch {
    // Non-critical — search will still work via Shelby indexer eventually
  }

  return result;
}
