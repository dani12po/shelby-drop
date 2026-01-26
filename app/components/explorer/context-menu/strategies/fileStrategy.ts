import type { ContextMenuStrategy } from "./types";
import type { ContextMenuContext } from "../context";
import { explorerContextMenuActions } from "../actions";

export const fileStrategy: ContextMenuStrategy = {
  match(ctx: ContextMenuContext) {
    return (
      ctx.isSingle &&
      ctx.items[0]?.type === "file"
    );
  },

  getActions(ctx: ContextMenuContext) {
    return explorerContextMenuActions.filter(
      (action) => action.isAllowed(ctx)
    );
  },
};
