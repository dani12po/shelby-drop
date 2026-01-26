import {
  Download,
  Trash,
  FolderOpen,
} from "lucide-react";

import type { ContextMenuAction } from "./action-types";
import {
  requirePermission,
  allFiles,
  allFolders,
} from "./permission-guards";

/* ======================================================
   BULK ACTIONS
====================================================== */

export const bulkActions: ContextMenuAction[] =
  [
    {
      id: "bulk-download",
      label: "Download",
      icon: Download,
      isAllowed: (ctx) =>
        requirePermission("download")(ctx) &&
        allFiles(ctx),
      onSelect: (ctx) => {
        console.log("Bulk download", ctx.items);
      },
    },

    {
      id: "bulk-open-folder",
      label: "Open folders",
      icon: FolderOpen,
      isAllowed: (ctx) =>
        requirePermission("read")(ctx) &&
        allFolders(ctx),
      onSelect: (ctx) => {
        console.log("Bulk open folders", ctx.items);
      },
    },

    {
      id: "bulk-delete",
      label: "Delete",
      icon: Trash,
      danger: true,
      isAllowed: (ctx) =>
        requirePermission("delete")(ctx),
      onSelect: (ctx) => {
        console.log("Bulk delete", ctx.items);
      },
    },
  ];
