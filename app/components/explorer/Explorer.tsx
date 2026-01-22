"use client";

import type {
  FolderItem,
  FileItem,
  FileItemData,
} from "@/lib/data";

import FileRow from "@/components/upload/FileRow";

/* ===============================
   PROPS
================================ */

type Props = {
  /**
   * Folder yang sedang ditampilkan
   */
  root: FolderItem;

  /**
   * Wallet address (root owner)
   */
  wallet: string;

  /**
   * Handler buka folder
   */
  onOpenFolder: (folder: FolderItem) => void;

  /**
   * Klik breadcrumb berdasarkan index path
   */
  onBreadcrumbClick: (index: number) => void;

  /**
   * Preview file
   */
  onPreview: (file: FileItemData) => void;

  /**
   * Metadata file
   */
  onMeta: (file: FileItemData) => void;
};

/* ===============================
   COMPONENT
================================ */

export default function Explorer({
  root,
  wallet,
  onOpenFolder,
  onBreadcrumbClick,
  onPreview,
  onMeta,
}: Props) {
  return (
    <div className="bg-black/30 border border-white/10 rounded-lg overflow-hidden">
      {/* ============================
          BREADCRUMB
      ============================ */}
      <div className="flex items-center gap-2 px-4 py-2 text-sm bg-black/40 border-b border-white/10">
        <button
          onClick={() => onBreadcrumbClick(0)}
          className="hover:underline"
        >
          {root.name}
        </button>

        {root.path.map(
          (seg: string, i: number) => (
            <span key={i} className="flex gap-2">
              <span>/</span>
              <button
                onClick={() =>
                  onBreadcrumbClick(i + 1)
                }
                className="hover:underline"
              >
                {seg}
              </button>
            </span>
          )
        )}
      </div>

      {/* ============================
          HEADER
      ============================ */}
      <div className="grid grid-cols-5 px-4 py-2 text-xs text-gray-400 border-b border-white/10">
        <div className="col-span-2">Name</div>
        <div>Type</div>
        <div>Size</div>
        <div className="text-right">
          Actions
        </div>
      </div>

      {/* ============================
          EMPTY STATE
      ============================ */}
      {root.children.length === 0 && (
        <div className="px-4 py-4 text-sm text-gray-500">
          Empty folder
        </div>
      )}

      {/* ============================
          CONTENT
      ============================ */}
      {root.children.map(
        (item: FileItem) => (
          <FileRow
            key={item.id}
            item={item}
            wallet={wallet}
            onOpenFolder={onOpenFolder}
            onPreview={onPreview}
            onMeta={onMeta}
          />
        )
      )}
    </div>
  );
}
