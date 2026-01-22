"use client";

import { useState } from "react";
import JsonNode from "./JsonNode";

type ExpandMode = "expand" | "collapse" | null;

type Props = {
  value: unknown;
};

export default function JsonTree({
  value,
}: Props) {
  const [query, setQuery] =
    useState("");

  const [expandMode, setExpandMode] =
    useState<ExpandMode>(null);

  const [expandSignal, setExpandSignal] =
    useState(0);

  function triggerExpand(mode: ExpandMode) {
    setExpandMode(mode);
    setExpandSignal((n) => n + 1);
  }

  return (
    <div className="text-xs font-mono leading-relaxed space-y-2">
      {/* TOOLBAR */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search key or value…"
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          className="flex-1 px-2 py-1 rounded bg-black/40 border border-white/10 text-xs outline-none focus:border-blue-500"
        />

        <button
          onClick={() =>
            triggerExpand("expand")
          }
          className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs"
        >
          Expand all
        </button>

        <button
          onClick={() =>
            triggerExpand("collapse")
          }
          className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs"
        >
          Collapse all
        </button>
      </div>

      {/* TREE */}
      <JsonNode
        value={value}
        depth={0}
        query={query}
        path="root"
        expandMode={expandMode}
        expandSignal={expandSignal}
      />
    </div>
  );
}
