
import type { ContextMenuStrategy } from "./types";
import { itemStrategy, bulkItemStrategy, emptyStrategy } from "./strategies";

export const CONTEXT_MENU_STRATEGIES: ContextMenuStrategy[] = [
  itemStrategy,
  bulkItemStrategy,
  emptyStrategy,
];
