import type { DecodedBlob } from "@/lib/blob.decode";

/* ===============================
   TYPES
================================ */

export type MimeResult = {
  mime: string;
  extension: string;
  category:
    | "image"
    | "video"
    | "audio"
    | "pdf"
    | "text"
    | "json"
    | "binary"
    | "unknown";
};

/* ===============================
   SIGNATURE HELPERS
================================ */

function startsWith(
  bytes: Uint8Array,
  sig: number[]
): boolean {
  return sig.every(
    (b, i) => bytes[i] === b
  );
}

/* ===============================
   MIME DETECTION
================================ */

export function detectMimeType(
  decoded: DecodedBlob
): MimeResult {
  const bytes = decoded.bytes;

  /* ===== NO BYTES ===== */
  if (!bytes || bytes.length < 4) {
    if (decoded.text) {
      return {
        mime: "text/plain",
        extension: "txt",
        category: "text",
      };
    }

    return {
      mime: "application/octet-stream",
      extension: "bin",
      category: "binary",
    };
  }

  /* ===== IMAGES ===== */

  // PNG
  if (
    startsWith(bytes, [
      0x89, 0x50, 0x4e, 0x47,
    ])
  ) {
    return {
      mime: "image/png",
      extension: "png",
      category: "image",
    };
  }

  // JPEG
  if (
    startsWith(bytes, [0xff, 0xd8, 0xff])
  ) {
    return {
      mime: "image/jpeg",
      extension: "jpg",
      category: "image",
    };
  }

  // GIF
  if (
    startsWith(bytes, [
      0x47, 0x49, 0x46, 0x38,
    ])
  ) {
    return {
      mime: "image/gif",
      extension: "gif",
      category: "image",
    };
  }

  // WEBP
  if (
    startsWith(bytes, [
      0x52, 0x49, 0x46, 0x46,
    ]) &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return {
      mime: "image/webp",
      extension: "webp",
      category: "image",
    };
  }

  /* ===== PDF ===== */
  if (
    startsWith(bytes, [
      0x25, 0x50, 0x44, 0x46,
    ])
  ) {
    return {
      mime: "application/pdf",
      extension: "pdf",
      category: "pdf",
    };
  }

  /* ===== VIDEO ===== */

  // MP4 / MOV
  if (
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  ) {
    return {
      mime: "video/mp4",
      extension: "mp4",
      category: "video",
    };
  }

  /* ===== AUDIO ===== */

  // MP3
  if (
    startsWith(bytes, [
      0x49, 0x44, 0x33,
    ]) ||
    (bytes[0] === 0xff &&
      (bytes[1] & 0xe0) === 0xe0)
  ) {
    return {
      mime: "audio/mpeg",
      extension: "mp3",
      category: "audio",
    };
  }

  /* ===== JSON ===== */
  if (
    decoded.text &&
    decoded.text.trim().startsWith("{")
  ) {
    return {
      mime: "application/json",
      extension: "json",
      category: "json",
    };
  }

  /* ===== TEXT ===== */
  if (decoded.text) {
    return {
      mime: "text/plain",
      extension: "txt",
      category: "text",
    };
  }

  /* ===== FALLBACK ===== */
  return {
    mime: "application/octet-stream",
    extension: "bin",
    category: "binary",
  };
}
