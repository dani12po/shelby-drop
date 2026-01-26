import type {
  FolderItem,
  FileItemData,
} from "./data";

/* ===============================
   FILE GROUP DEFINITIONS
================================ */
const GROUPS: Record<string, string[]> = {
  images: ["png", "jpg", "jpeg", "gif", "webp", "svg"],
  videos: ["mp4", "webm", "mov", "avi", "mkv"],
  music: ["mp3", "wav", "ogg", "flac"],
  documents: [
    "pdf",
    "txt",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
  ],
};

function getGroup(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  for (const group in GROUPS) {
    if (GROUPS[group].includes(ext)) return group;
  }
  return "others";
}

function inferType(
  filename: string
): "PDF" | "IMG" | "OTHER" {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (GROUPS.images.includes(ext || "")) return "IMG";
  if (ext === "pdf") return "PDF";
  return "OTHER";
}

/* ===============================
   MAIN MAPPER
================================ */
export function mapShelbyBlobsToFolder(
  wallet: string,
  blobs: any[]
): FolderItem {
  const folders: Record<string, FolderItem> = {};

  function getFolder(name: string): FolderItem {
    if (!folders[name]) {
      folders[name] = {
        id: `${wallet}-${name}`,
        name,
        type: "folder",
        path: [name],
        children: [],
      };
    }
    return folders[name];
  }

  blobs.forEach((blob, index) => {
    const filename =
      blob.filename ||
      `file-${index}.${blob.content_type || "bin"}`;

    const group = getGroup(filename);
    const folder = getFolder(group);

    const file: FileItemData = {
      id: blob.blob_id || `${index}`,
      blobId: blob.blob_id,
      name: filename,
      type: "file",
      fileType: inferType(filename),
      size: blob.size,
      path: [group],
      uploader: wallet,
    };

    if (!folder.children) folder.children = [];
    folder.children.push(file);
  });

  return {
    id: wallet,
    name: "Blobs",
    type: "folder",
    path: [],
    children: Object.values(folders),
  };
}
