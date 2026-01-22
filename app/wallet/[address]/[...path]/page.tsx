"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Explorer from "@/app/components/Explorer";
import PreviewModal from "@/app/components/PreviewModal";
import MetadataPanel from "@/app/components/MetadataPanel";

import { mapShelbyBlobsToFolder } from "@/app/lib/shelbyMapper";
import type {
  FolderItem,
  FileItemData,
} from "@/app/lib/data";

export default function WalletFolderPage() {
  const params = useParams();
  const router = useRouter();

  const address = params.address as string;
  const pathParam =
    (params.path as string[]) || [];

  const [root, setRoot] =
    useState<FolderItem | null>(null);
  const [currentRoot, setCurrentRoot] =
    useState<FolderItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [previewFile, setPreviewFile] =
    useState<FileItemData | null>(null);
  const [metaFile, setMetaFile] =
    useState<FileItemData | null>(null);

  /* ===============================
     RESOLVE FOLDER BY PATH
  ================================ */
  function resolveFolder(
    root: FolderItem,
    path: string[]
  ): FolderItem | null {
    let current = root;

    for (const segment of path) {
      const next = current.children.find(
        (c) =>
          c.type === "folder" &&
          c.name === segment
      ) as FolderItem | undefined;

      if (!next) return null;
      current = next;
    }

    return current;
  }

  /* ===============================
     LOAD BLOBS FROM API
  ================================ */
  async function loadFiles() {
    setLoading(true);
    setError("");

    try {
      if (!address?.startsWith("0x")) {
        throw new Error("Invalid wallet address");
      }

      const res = await fetch(
        `/api/shelby/blobs?wallet=${address}`
      );

      if (!res.ok) {
        throw new Error(
          "Unable to load files from Shelby Explorer"
        );
      }

      const blobs = await res.json();
      const tree = mapShelbyBlobsToFolder(
        address,
        blobs
      );

      setRoot(tree);

      const resolved = resolveFolder(
        tree,
        pathParam
      );

      if (!resolved) {
        setError("Folder not found");
        setCurrentRoot(null);
        return;
      }

      setCurrentRoot(resolved);

      /* ===== AUTO PREVIEW IF FILE ===== */
      const last =
        pathParam[pathParam.length - 1];
      if (last?.includes(".")) {
        const file =
          resolved.children.find(
            (c) =>
              c.type === "file" &&
              c.name === last
          ) as FileItemData | undefined;

        if (file) {
          setPreviewFile(file);
        }
      }
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, pathParam.join("/")]);

  /* ===============================
     NAVIGATION
  ================================ */
  function openFolder(folder: FolderItem) {
    const nextPath = [
      ...pathParam,
      folder.name,
    ];
    router.push(
      `/wallet/${address}/${nextPath.join(
        "/"
      )}`
    );
  }

  function goTo(index: number) {
    const nextPath = pathParam.slice(
      0,
      index
    );
    const url =
      nextPath.length === 0
        ? `/wallet/${address}`
        : `/wallet/${address}/${nextPath.join(
            "/"
          )}`;
    router.push(url);
  }

  /* ===============================
     RENDER
  ================================ */
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-6xl px-6">
        <div className="bg-gray-900 border border-white/10 rounded-xl p-6 shadow-xl space-y-6">
          {/* HEADER */}
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">
              Wallet Files
            </h1>
            <p className="text-sm text-gray-400 break-all">
              {address}
            </p>

            <a
              href={`https://explorer.shelby.xyz/shelbynet/account/${address}/blobs`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline"
            >
              View on Shelby Explorer ↗
            </a>
          </div>

          {/* STATUS */}
          {loading && (
            <p className="text-sm text-gray-400">
              Loading files…
            </p>
          )}

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          {/* EXPLORER */}
          {currentRoot && (
            <Explorer
              root={currentRoot}
              wallet={address}
              onOpenFolder={openFolder}
              onBreadcrumbClick={goTo}
              onPreview={setPreviewFile}
              onMeta={setMetaFile}
            />
          )}
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {previewFile && (
        <PreviewModal
          file={previewFile}
          wallet={address}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {/* METADATA PANEL */}
      {metaFile && (
        <MetadataPanel
          file={metaFile}
          wallet={address}
          onClose={() => setMetaFile(null)}
        />
      )}
    </main>
  );
}
