/* ===============================
   JSON PREVIEW UTIL
================================ */

export type JsonPreviewResult =
  | {
      ok: true;
      formatted: string;
      value: unknown;
    }
  | {
      ok: false;
      error: string;
    };

/**
 * Parse & pretty-print JSON safely
 */
export function previewJson(
  text: string
): JsonPreviewResult {
  try {
    const value = JSON.parse(text);

    const formatted = JSON.stringify(
      value,
      null,
      2
    );

    return {
      ok: true,
      value,
      formatted,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Invalid JSON",
    };
  }
}
