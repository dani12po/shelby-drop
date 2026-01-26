
import type { ContextMenuStrategy } from "./types";
import { explorerContextMenuActions } from "./actions";
import { bulkActions } from "./bulk-actions";

export const itemStrategy: ContextMenuStrategy = {
  id: "item",
  isMatch: (ctx: any) => ctx.items?.length === 1,
  getActions: (ctx: any) =>
    explorerContextMenuActions.filter(a => a.isAllowed(ctx)),
};

export const bulkItemStrategy: ContextMenuStrategy = {
  id: "bulk",
  isMatch: (ctx: any) => ctx.items?.length > 1,
  getActions: (ctx: any) =>
    bulkActions.filter(a => a.isAllowed(ctx)),
};

export const emptyStrategy: ContextMenuStrategy = {
  id: "empty",
  isMatch: () => true,
  getActions: () => [],
};
