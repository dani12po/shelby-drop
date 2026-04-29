import type { ExplorerFileItem } from "@/types/explorer";
import type { FileItemData } from "@/lib/data";

/**
 * Build logical object key for S3 / gateway
 *
 * Example:
 * wallet: 0xabc
 * file.path: [] or ["folder"], file.name: "file.pdf"
 * → 0xabc/file.pdf  or  0xabc/folder/file.pdf
 */
export function getObjectKey(
  wallet: string,
  file: ExplorerFileItem | FileItemData
): string {
  // Build path segments
  const pathSegments = Array.isArray(file.path)
    ? file.path.filter(Boolean)
    : file.path
      ? file.path.split("/").filter(Boolean)
      : [];

  // Include filename — encode each segment to handle spaces
  const name = (file as FileItemData).name ?? (file as ExplorerFileItem).name ?? "";
  const allSegments = [...pathSegments, name].filter(Boolean);

  const encodedPath = allSegments.map(encodeURIComponent).join("/");
  return `${encodeURIComponent(wallet)}/${encodedPath}`;
}
