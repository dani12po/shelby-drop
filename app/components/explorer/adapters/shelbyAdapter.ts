/**
 * Shelby Explorer Data Adapter
 *
 * Loads wallet files from /api/shelby/list (our own API route)
 * which merges the local upload index + Shelby Network indexer.
 */

import type { ExplorerItem, ExplorerFileItem } from "@/types/explorer";
import type { FileItemData, FolderItem } from "@/lib/data";

/* ── MIME helper ── */
function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", svg: "image/svg+xml", webp: "image/webp",
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", avi: "video/x-msvideo",
    mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", flac: "audio/flac",
    pdf: "application/pdf", doc: "application/msword",
    txt: "text/plain", md: "text/markdown",
    js: "text/javascript", ts: "text/typescript",
    jsx: "text/jsx", tsx: "text/tsx",
    json: "application/json", css: "text/css", html: "text/html",
    zip: "application/zip", tar: "application/x-tar",
    gz: "application/gzip", rar: "application/x-rar-compressed",
  };
  return map[ext] || "application/octet-stream";
}

/* ── size parser ── */
function parseSize(sizeStr?: string | number): number {
  if (typeof sizeStr === "number") return sizeStr;
  if (!sizeStr) return 0;
  const units: Record<string, number> = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 };
  const m = String(sizeStr).match(/^([\d.]+)\s*(B|KB|MB|GB)$/i);
  if (!m) return parseFloat(String(sizeStr)) || 0;
  return Math.floor(parseFloat(m[1]) * (units[m[2].toUpperCase()] ?? 1));
}

/**
 * Loads wallet files via /api/shelby/list
 * (merges local upload index + Shelby Network indexer)
 */
export async function loadWalletFilesFromShelby(wallet: string, network?: string): Promise<{
  items: ExplorerItem[];
  rawItems: (FileItemData | FolderItem)[];
}> {
  try {
    const networkParam = network ? `&network=${encodeURIComponent(network)}` : "";
    const res = await fetch(`/api/shelby/list?wallet=${encodeURIComponent(wallet)}${networkParam}`);
    if (!res.ok) throw new Error(`/api/shelby/list returned ${res.status}`);

    const data = await res.json();
    const blobs: any[] = data.files ?? [];

    const rawItems: FileItemData[] = blobs.map((blob, i) => ({
      id: blob.id || blob.blob_id || `file-${i}`,
      type: "file" as const,
      name: blob.name || "unknown",
      path: [],                          // all files are at root level
      size: parseSize(blob.size),
      mimeType: getMimeType(blob.name || ""),
      uploader: wallet,
      uploadedAt: blob.created_at || new Date().toISOString(),
      expiresAt: blob.expires_at,
    }));

    const items: ExplorerItem[] = rawItems.map((f) => ({
      id: f.id,
      kind: "file" as const,
      name: f.name,
      path: f.name,                      // flat path = filename
      size: f.size,
      mimeType: f.mimeType ?? "application/octet-stream",
    } satisfies ExplorerFileItem));

    return { items, rawItems };
  } catch (err) {
    console.warn("[shelbyAdapter] Failed to load files:", err);
    return { items: [], rawItems: [] };
  }
}

/**
 * Kept for backward compatibility — not used by useExplorerData anymore
 */
export function adaptShelbyFilesToExplorerItems(
  wallet: string,
  shelbyFiles: Array<{ name: string; size?: string; type?: string }>
): ExplorerItem[] {
  return shelbyFiles.map((file, i) => ({
    id: `shelby-${i}`,
    kind: "file" as const,
    name: file.name,
    path: file.name,
    size: parseSize(file.size),
    mimeType: getMimeType(file.name),
  } satisfies ExplorerFileItem));
}
