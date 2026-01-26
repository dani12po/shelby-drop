import type { FileItemData } from "@/lib/data";

export type MetadataTabKey =
  | "info"
  | "access"
  | "history";

export type MetadataTabProps = {
  file: FileItemData;
  wallet: string;
};
