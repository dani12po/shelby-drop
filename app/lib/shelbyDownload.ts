import type { FileItemData } from "@/lib/data";
import { getObjectUrl } from "./s3/getObjectUrl";

/**
 * Build Shelby download URL from FileItemData
 * @deprecated Use getObjectUrl with mode: "download" instead
 */
export function buildShelbyDownloadUrl(
  wallet: string,
  item: FileItemData
): string {
  return getObjectUrl(item, {
    wallet,
    mode: "download",
  });
}
