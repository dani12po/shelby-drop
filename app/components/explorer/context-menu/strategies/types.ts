import type { ContextMenuContext } from "../context";
import type { ContextMenuAction } from "../action-types";

/**
 * Strategy menentukan:
 * - kapan aktif
 * - action apa yang dihasilkan
 */
export interface ContextMenuStrategy {
  /**
   * Apakah strategy cocok dengan context
   */
  match(ctx: ContextMenuContext): boolean;

  /**
   * Return list of actions
   */
  getActions(
    ctx: ContextMenuContext
  ): ContextMenuAction[];
}
