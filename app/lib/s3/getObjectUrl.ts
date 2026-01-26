import type { ExplorerFileItem } from "@/types/explorer";
import type { FileItemData } from "@/lib/data";
import type {
  ObjectAccessMode,
  ObjectUrlOptions,
} from "./types";
import { getObjectKey } from "./getObjectKey";
import { signObjectUrl } from "./signObjectUrl";

/**
 * Resolve final object URL
 * UI & Explorer TIDAK BOLEH bypass ini
 */
export function getObjectUrl(
  file: ExplorerFileItem | FileItemData,
  options: ObjectUrlOptions
): string {
  const { wallet, mode } = options;
  const objectKey = getObjectKey(wallet, file);
  
  const gatewayOrigin = process.env.NEXT_PUBLIC_S3_GATEWAY_ORIGIN || "https://gateway.shelby.xyz";
  const baseUrl = `${gatewayOrigin}/${objectKey}`;

  switch (mode) {
    case "public":
      return baseUrl;

    case "preview":
      return `${baseUrl}?inline=1`;

    case "download":
      return `${baseUrl}?attachment=1`;

    case "signed":
      return signObjectUrl(objectKey, {
        expiresIn: options.expiresIn,
      });

    default:
      // Exhaustive guard
      const _exhaustive: never = mode;
      return _exhaustive;
  }
}
