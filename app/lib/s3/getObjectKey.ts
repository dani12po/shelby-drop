import type { ExplorerFileItem } from "@/types/explorer";
import type { FileItemData } from "@/lib/data";

/**
 * Build logical object key for S3 / gateway
 *
 * Example:
 * wallet: 0xabc
 * path: folder/file.pdf or ["folder", "file.pdf"]
 * → 0xabc/folder/file.pdf
 */
export function getObjectKey(
  wallet: string,
  file: ExplorerFileItem | FileItemData
): string {
  const path = Array.isArray(file.path)
    ? file.path.join("/")
    : file.path;
  return `${wallet}/${path}`;
}
