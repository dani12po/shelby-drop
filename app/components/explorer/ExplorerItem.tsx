"use client";

import type {
  FileItem,
  FolderItem,
  FileItemData,
} from "@/lib/data";

import FileRow from "@/components/upload/FileRow";
import { getRetentionStatus } from "@/lib/retention";

/* ===============================
   PROPS
================================ */

type Props = {
  item: FileItem;
  wallet: string;

  onOpenFolder: (folder: FolderItem) => void;
  onPreview: (file: FileItemData) => void;
  onMeta: (file: FileItemData) => void;
};

/* ===============================
   COMPONENT
================================ */

export default function ExplorerItem({
  item,
  wallet,
  onOpenFolder,
  onPreview,
  onMeta,
}: Props) {
  if (item.type === "file") {
    const retention = getRetentionStatus(
      item.expiresAt
    );

    // inject retention info via meta
    return (
      <FileRow
        item={{
          ...item,
          __retention: retention, // UI-only extension
        } as any}
        wallet={wallet}
        onOpenFolder={onOpenFolder}
        onPreview={onPreview}
        onMeta={onMeta}
      />
    );
  }

  return (
    <FileRow
      item={item}
      wallet={wallet}
      onOpenFolder={onOpenFolder}
      onPreview={onPreview}
      onMeta={onMeta}
    />
  );
}
