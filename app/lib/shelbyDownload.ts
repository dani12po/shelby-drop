import type { FileItem } from "@/lib/data";

/**
 * Build Shelby download URL from FileItem
 */
export function buildShelbyDownloadUrl(
  wallet: string,
  item: FileItem
): string {
  const fullPath = [...item.path, item.name].join("/");

  return `https://api.shelbynet.shelby.xyz/shelby/v1/blobs/${wallet}/${fullPath}`;
}
