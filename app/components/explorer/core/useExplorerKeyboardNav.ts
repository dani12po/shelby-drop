"use client";

import { useCallback, useEffect, useState } from "react";
import type { ExplorerItem } from "@/types/explorer";

/* ======================================================
   TYPES
====================================================== */

export type ExplorerKeyboardNavOptions = {
  /**
   * Current visible items (ordered)
   */
  items: ExplorerItem[];

  /**
   * Current selection (source of truth)
   */
  selectedIds: Set<string>;

  /**
   * Notify parent about selection change
   * ⚠️ MUST receive a NEW Set instance
   */
  onSelectionChange: (next: Set<string>) => void;

  /**
   * Open / activate item
   * - Folder → navigate
   * - File → preview
   */
  onOpenItem: (item: ExplorerItem) => void;

  /**
   * Optional initial focused index
   */
  initialFocusedIndex?: number | null;
};

export type ExplorerKeyboardNavResult = {
  focusedIndex: number | null;
  setFocusedIndex: (index: number | null) => void;
  onKeyDown: (e: KeyboardEvent) => void;
};

/* ======================================================
   HOOK
====================================================== */

export function useExplorerKeyboardNav(
  options: ExplorerKeyboardNavOptions
): ExplorerKeyboardNavResult {
  const {
    items,
    selectedIds,
    onSelectionChange,
    onOpenItem,
    initialFocusedIndex = null,
  } = options;

  /* ===============================
     FOCUS STATE
  ================================ */
  const [focusedIndex, setFocusedIndex] = useState<
    number | null
  >(initialFocusedIndex);

  /* ===============================
     KEEP FOCUS IN RANGE
  ================================ */
  useEffect(() => {
    if (items.length === 0) {
      setFocusedIndex(null);
      return;
    }

    if (
      focusedIndex === null ||
      focusedIndex >= items.length
    ) {
      setFocusedIndex(0);
    }
  }, [items, focusedIndex]);

  /* ===============================
     HELPERS
  ================================ */

  const clampIndex = useCallback(
    (index: number) => {
      if (index < 0) return 0;
      if (index >= items.length)
        return items.length - 1;
      return index;
    },
    [items.length]
  );

  const toggleSelection = useCallback(
    (id: string) => {
      const next = new Set(selectedIds);
      next.has(id) ? next.delete(id) : next.add(id);
      onSelectionChange(next);
    },
    [selectedIds, onSelectionChange]
  );

  const selectSingle = useCallback(
    (id: string) => {
      onSelectionChange(new Set([id]));
    },
    [onSelectionChange]
  );

  /* ===============================
     KEY HANDLER
  ================================ */

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (items.length === 0) return;

      switch (e.key) {
        /* -------- NAVIGATION -------- */
        case "ArrowDown": {
          e.preventDefault();
          setFocusedIndex((prev) =>
            clampIndex((prev ?? 0) + 1)
          );
          break;
        }

        case "ArrowUp": {
          e.preventDefault();
          setFocusedIndex((prev) =>
            clampIndex((prev ?? 0) - 1)
          );
          break;
        }

        case "Home": {
          e.preventDefault();
          setFocusedIndex(0);
          break;
        }

        case "End": {
          e.preventDefault();
          setFocusedIndex(items.length - 1);
          break;
        }

        /* -------- SELECTION -------- */
        case " ": {
          // Space
          if (focusedIndex === null) return;
          e.preventDefault();

          const item = items[focusedIndex];
          toggleSelection(item.id);
          break;
        }

        case "Enter": {
          if (focusedIndex === null) return;
          e.preventDefault();

          const item = items[focusedIndex];
          selectSingle(item.id);
          onOpenItem(item);
          break;
        }

        case "Escape": {
          e.preventDefault();
          onSelectionChange(new Set());
          break;
        }

        /* -------- SELECT ALL -------- */
        case "a": {
          if (!e.metaKey && !e.ctrlKey) return;
          e.preventDefault();

          onSelectionChange(
            new Set(items.map((i) => i.id))
          );
          break;
        }

        default:
          break;
      }
    },
    [
      items,
      focusedIndex,
      clampIndex,
      toggleSelection,
      selectSingle,
      onSelectionChange,
      onOpenItem,
    ]
  );

  /* ===============================
     RETURN
  ================================ */
  return {
    focusedIndex,
    setFocusedIndex,
    onKeyDown,
  };
}
