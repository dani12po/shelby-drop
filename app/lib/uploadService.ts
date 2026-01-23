// app/lib/uploadService.ts

/* ===============================
   Types
================================ */

export type UploadMetadata = {
  wallet: string;
  originalName: string;
  storedName: string;
  size: number;
  mime: string;
  hash: string;

  retentionDays: number;
  expiresAt: string;

  uploadedAt: string;
  path: string;
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

  return data.metadata as UploadMetadata;
}
