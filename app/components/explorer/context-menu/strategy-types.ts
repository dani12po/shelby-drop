import type { ContextMenuContext } from "./context";
import type { ContextMenuAction } from "./action-types";

/* ======================================================
   STRATEGY CONTRACT
====================================================== */

export interface ContextMenuStrategy {
  match(ctx: ContextMenuContext): boolean;
  getActions(ctx: ContextMenuContext): ContextMenuAction[];
}
