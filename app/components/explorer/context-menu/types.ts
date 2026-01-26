
import type { ContextMenuContext } from "./context";
import type { ContextMenuAction } from "./action-types";

/* ======================================================
   CONTEXT MENU STRATEGY
====================================================== */

export interface ContextMenuStrategy {
  id: string;
  isMatch(ctx: ContextMenuContext): boolean;
  getActions(ctx: ContextMenuContext): ContextMenuAction[];
}

/* ======================================================
   PREVIEW TYPES (re-exported for legacy imports)
====================================================== */

export type RenderResult = any;
export type RenderContext = any;
export type PreviewRenderer = any;
