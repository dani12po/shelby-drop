import type { ContextMenuStrategy } from "./types";
import type { ContextMenuContext } from "../context";
import { bulkActions } from "../bulk-actions";

export const bulkStrategy: ContextMenuStrategy = {
  match(ctx: ContextMenuContext) {
    return ctx.isMulti;
  },

  getActions(ctx: ContextMenuContext) {
    return bulkActions.filter(
      (action) => action.isAllowed(ctx)
    );
  },
};
