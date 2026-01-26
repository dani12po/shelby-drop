"use client";

import { useMemo } from "react";
import type { ExplorerItem } from "@/types/explorer";

/* ======================================================
   TYPES
====================================================== */

export type ExplorerSearchQuery = {
  text?: string;
  ext?: string;
  path?: string;
};

/* ======================================================
   PARSER
====================================================== */

function parseQuery(input: string): ExplorerSearchQuery {
  const tokens = input.trim().split(/\s+/);

  const query: ExplorerSearchQuery = {};

  for (const token of tokens) {
    if (token.startsWith("ext:")) {
      query.ext = token.slice(4).toLowerCase();
      continue;
    }

    if (token.startsWith("path:")) {
      query.path = token.slice(5).toLowerCase();
      continue;
    }

    query.text = query.text
      ? `${query.text} ${token}`
      : token;
  }

  return query;
}

/* ======================================================
   MATCHERS
====================================================== */

function matchItem(
  item: ExplorerItem,
  query: ExplorerSearchQuery
): boolean {
  const name = item.name.toLowerCase();
  const fullPath = item.path.toLowerCase();

  if (query.text) {
    if (
      !name.includes(query.text.toLowerCase()) &&
      !fullPath.includes(query.text.toLowerCase())
    ) {
      return false;
    }
  }

  if (query.ext && item.kind === "file") {
    if (!name.endsWith(`.${query.ext}`)) {
      return false;
    }
  }

  if (query.ext && item.kind === "folder") {
    return false;
  }

  if (query.path) {
    if (!fullPath.startsWith(query.path)) {
      return false;
    }
  }

  return true;
}

/* ======================================================
   HOOK
====================================================== */

export function useExplorerSearch(
  items: ExplorerItem[],
  searchInput: string
) {
  const parsed = useMemo(
    () => parseQuery(searchInput),
    [searchInput]
  );

  const filteredItems = useMemo(() => {
    if (!searchInput.trim()) {
      return items;
    }

    return items.filter((item) =>
      matchItem(item, parsed)
    );
  }, [items, parsed, searchInput]);

  return {
    filteredItems,
    parsedQuery: parsed,
  };
}
