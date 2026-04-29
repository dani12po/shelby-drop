import { Download } from "lucide-react";

import type { ContextMenuAction } from "./action-types";
import { requirePermission, allFiles } from "./permission-guards";

/* ======================================================
   BULK ACTIONS
   onSelect delegates to callbacks in ContextMenuContext
====================================================== */

export const bulkActions: ContextMenuAction[] = [
  {
    id: "bulk-download",
    label: "Download all",
    icon: Download,
    isAllowed: (ctx) =>
      requirePermission("download")(ctx) && allFiles(ctx),
    onSelect: (ctx) => {
      if (ctx.onBulkDownload) ctx.onBulkDownload(ctx.items);
    },
  },
];
