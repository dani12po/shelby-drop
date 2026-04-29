// app/components/explorer/context-menu/actions.ts

import {
  Download,
  Eye,
  Share2,
  Info,
} from "lucide-react";

import type { ContextMenuAction } from "./action-types";
import {
  requirePermission,
  singleSelection,
  allFiles,
} from "./permission-guards";

/* ======================================================
   ITEM CONTEXT MENU ACTIONS
   onSelect delegates to callbacks in ContextMenuContext
====================================================== */

export const explorerContextMenuActions: ContextMenuAction[] = [
  {
    id: "preview",
    label: "Preview",
    icon: Eye,
    isAllowed: (ctx) =>
      requirePermission("preview")(ctx) &&
      singleSelection(ctx) &&
      allFiles(ctx),
    onSelect: (ctx) => {
      const file = ctx.items[0];
      if (file && ctx.onPreview) ctx.onPreview(file);
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
      const file = ctx.items[0];
      if (file && ctx.onDownload) ctx.onDownload(file);
    },
  },

  {
    id: "share",
    label: "Share",
    icon: Share2,
    isAllowed: (ctx) =>
      requirePermission("share")(ctx) &&
      singleSelection(ctx) &&
      allFiles(ctx),
    onSelect: (ctx) => {
      const file = ctx.items[0];
      if (file && ctx.onShare) ctx.onShare(file);
    },
  },

  {
    id: "info",
    label: "Info / Metadata",
    icon: Info,
    isAllowed: (ctx) =>
      requirePermission("read")(ctx) &&
      singleSelection(ctx),
    onSelect: (ctx) => {
      const item = ctx.items[0];
      if (item && ctx.onMeta) ctx.onMeta(item);
    },
  },
];
