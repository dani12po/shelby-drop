// app/components/explorer/context-menu/actions.ts

import {
  Download,
  Trash,
  Info,
  FolderOpen,
} from "lucide-react";

import type { ContextMenuAction } from "./action-types";
import {
  requirePermission,
  singleSelection,
  allFiles,
  allFolders,
} from "./permission-guards";

/* ======================================================
   ITEM CONTEXT MENU ACTIONS
   - PURE TS
   - PERMISSION + SELECTION SAFE
   - API-LEVEL ITEMS (FileItemData | FolderItem)
====================================================== */

export const explorerContextMenuActions: ContextMenuAction[] =
  [
    {
      id: "preview",
      label: "Preview",
      icon: Download,
      isAllowed: (ctx) =>
        requirePermission("preview")(ctx) &&
        singleSelection(ctx) &&
        allFiles(ctx),
      onSelect: (ctx) => {
        const file = ctx.items[0];
        if (file.type !== "file") return;
        console.log("Preview", file);
      },
    },

    {
      id: "download",
      label: "Download",
      icon: Download,
      isAllowed: (ctx) =>
        requirePermission("download")(ctx) &&
        allFiles(ctx),
      onSelect: (ctx) => {
        console.log(
          "Download",
          ctx.items.filter(
            (i) => i.type === "file"
          )
        );
      },
    },

    {
      id: "open-folder",
      label: "Open",
      icon: FolderOpen,
      isAllowed: (ctx) =>
        singleSelection(ctx) &&
        allFolders(ctx),
      onSelect: (ctx) => {
        const folder = ctx.items[0];
        if (folder.type !== "folder") return;
        console.log("Open folder", folder);
      },
    },

    {
      id: "info",
      label: "Info",
      icon: Info,
      isAllowed: (ctx) =>
        requirePermission("share")(ctx) &&
        singleSelection(ctx),
      onSelect: (ctx) => {
        console.log("Info", ctx.items[0]);
      },
    },

    {
      id: "delete",
      label: "Delete",
      icon: Trash,
      danger: true,
      isAllowed: (ctx) =>
        requirePermission("delete")(ctx),
      onSelect: (ctx) => {
        console.log("Delete", ctx.items);
      },
    },
  ];
