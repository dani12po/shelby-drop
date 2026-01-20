import type { FileItemData } from "./data";

const BASE =
  "https://api.shelbynet.shelby.xyz/shelby/v1/blobs";

export function buildShelbyDownloadUrl(
  wallet: string,
  file: FileItemData
) {
  const folder =
    file.path.length > 0 ? `${file.path.join("/")}/` : "";

  return `${BASE}/${wallet}/${folder}${file.name}`;
}
