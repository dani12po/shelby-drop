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
  uploadedAt: string;
  path: string;
};

export type ShelbyUploadArgs = {
  file: File;
  wallet: string;
  path?: string[];
};

/* ===============================
   Upload (NO signMessage)
================================ */

export async function uploadToShelby({
  file,
  wallet,
  path = [],
}: ShelbyUploadArgs): Promise<UploadMetadata> {
  /* ===============================
     FORM DATA
     (server enforces namespace)
  ================================ */
  const formData = new FormData();
  formData.append("file", file);
  formData.append("wallet", wallet);
  formData.append("path", path.join("/"));

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
     RETURN METADATA
     (for Explorer auto-refresh)
  ================================ */
  const data = await res.json();

  if (!data || !data.metadata) {
    throw new Error("Upload succeeded but no metadata returned");
  }

  return data.metadata as UploadMetadata;
}
