import type { BlobItem } from "@/lib/blob.extract";
import { decodeBlob } from "@/lib/blob.decode";
import {
  FileItemData,
} from "@/lib/data";
import { detectMimeType } from "@/lib/blob.mime";

/* ===============================
   SIZE FORMAT
================================ */

function formatSize(bytes: number): string {
  if (bytes < 1024)
    return `${bytes} B`;
  if (bytes < 1024 ** 2)
    return `${(bytes / 1024).toFixed(
      1
    )} KB`;
  if (bytes < 1024 ** 3)
    return `${(bytes / 1024 ** 2).toFixed(
      1
    )} MB`;
  return `${(bytes / 1024 ** 3).toFixed(
    1
  )} GB`;
}

/* ===============================
   MAPPER
================================ */

export function mapBlobToFileItem(
  blob: BlobItem,
  wallet: string
): FileItemData {
  const decoded = decodeBlob(blob.data);
  const mime = detectMimeType(decoded);

  const fileName = `blob-${blob.txHash.slice(
    0,
    8
  )}.${mime.extension}`;

  return {
    id: blob.txHash,
    blobId: blob.txHash,
    name: fileName,
    type: "file",
    fileType:
      mime.category === "image"
        ? "IMG"
        : mime.category === "pdf"
        ? "PDF"
        : "OTHER",
    size: Number(decoded.size),
    path: [],
    uploader: wallet,
  };
}
