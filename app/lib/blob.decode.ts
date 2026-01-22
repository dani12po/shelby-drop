/* ===============================
   TYPES
================================ */

export type DecodedBlob = {
  /**
   * Encoding asal blob
   */
  encoding: "hex" | "base64" | "utf8" | "binary";

  /**
   * Ukuran byte hasil decode
   */
  size: number;

  /**
   * Jika bisa ditampilkan sebagai text
   */
  text?: string;

  /**
   * Data mentah byte
   */
  bytes?: Uint8Array;
};

/* ===============================
   DETECTION
================================ */

/**
 * Cek apakah string hex
 */
function isHex(data: string): boolean {
  return /^0x[a-fA-F0-9]+$/.test(data);
}

/**
 * Cek apakah base64
 */
function isBase64(data: string): boolean {
  // base64 biasanya panjang kelipatan 4
  return (
    /^[A-Za-z0-9+/=]+$/.test(data) &&
    data.length % 4 === 0
  );
}

/* ===============================
   DECODERS
================================ */

/**
 * Decode hex string → bytes
 */
function decodeHex(hex: string): Uint8Array {
  const clean = hex.startsWith("0x")
    ? hex.slice(2)
    : hex;

  const bytes = new Uint8Array(clean.length / 2);

  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(
      clean.substring(i, i + 2),
      16
    );
  }

  return bytes;
}

/**
 * Decode base64 → bytes
 */
function decodeBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

/**
 * Decode bytes → utf8 (jika valid)
 */
function tryDecodeUtf8(
  bytes: Uint8Array
): string | null {
  try {
    const text = new TextDecoder(
      "utf-8",
      { fatal: true }
    ).decode(bytes);

    // heuristic: pastikan printable
    if (
      /[\u0000-\u0008]/.test(text)
    ) {
      return null;
    }

    return text;
  } catch {
    return null;
  }
}

/* ===============================
   MAIN DECODER
================================ */

/**
 * Decode blob string → DecodedBlob
 */
export function decodeBlob(
  data: string
): DecodedBlob {
  /* ===== HEX ===== */
  if (isHex(data)) {
    const bytes = decodeHex(data);
    const text = tryDecodeUtf8(bytes);

    return {
      encoding: "hex",
      size: bytes.length,
      bytes,
      ...(text ? { text } : {}),
    };
  }

  /* ===== BASE64 ===== */
  if (isBase64(data)) {
    const bytes = decodeBase64(data);
    const text = tryDecodeUtf8(bytes);

    return {
      encoding: "base64",
      size: bytes.length,
      bytes,
      ...(text ? { text } : {}),
    };
  }

  /* ===== UTF-8 STRING ===== */
  return {
    encoding: "utf8",
    size: data.length,
    text: data,
  };
}
