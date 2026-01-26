
import type { ContextMenuContext } from "./context";
import { CONTEXT_MENU_STRATEGIES as STRATEGIES } from "./strategies/";

export function getContextMenuActions(ctx: ContextMenuContext) {
  for (const s of STRATEGIES) {
    if (s.match(ctx)) {
      return s.getActions(ctx).filter(a => a.isAllowed(ctx));
    }
  }
  return [];
}
