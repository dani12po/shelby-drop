// app/components/explorer/context-menu/getContextMenuActions.ts

import type { ContextMenuContext } from "./context";
import type { ContextMenuAction } from "./action-types";
import { CONTEXT_MENU_STRATEGIES } from "./strategies/";

/* ======================================================
   CONTEXT MENU ACTION RESOLVER (FINAL)
====================================================== */

export function getContextMenuActions(
  ctx: ContextMenuContext
): ContextMenuAction[] {
  for (const strategy of CONTEXT_MENU_STRATEGIES) {
    if (strategy.match(ctx)) {
      return strategy.getActions(ctx);
    }
  }

  return [];
}
