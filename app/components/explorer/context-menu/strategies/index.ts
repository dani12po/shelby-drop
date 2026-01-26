import type { ContextMenuStrategy } from "./types";

import { bulkStrategy } from "./bulkStrategy";
import { fileStrategy } from "./fileStrategy";
import { folderStrategy } from "./folderStrategy";

/**
 * Priority order:
 * 1. bulk
 * 2. single file
 * 3. single folder
 */
export const CONTEXT_MENU_STRATEGIES: ContextMenuStrategy[] =
  [
    bulkStrategy,
    fileStrategy,
    folderStrategy,
  ];
