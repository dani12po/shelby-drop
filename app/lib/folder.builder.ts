import {
  FolderItem,
  FileItem,
  createRootFolder,
  addItemToFolder,
} from "@/lib/data";

/* ===============================
   BUILDER
================================ */

/**
 * Build folder tree dari list file
 */
export function buildFolderTree(
  wallet: string,
  files: FileItem[]
): FolderItem {
  const root = createRootFolder(wallet);

  for (const file of files) {
    addItemToFolder(root, file);
  }

  return root;
}
