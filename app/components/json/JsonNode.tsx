"use client";

import { useEffect, useState } from "react";
import { jsonContainsQuery } from "./json.search";

type ExpandMode = "expand" | "collapse" | null;

type Props = {
  name?: string;
  value: unknown;
  depth: number;
  query: string;
  path: string;
  expandMode: ExpandMode;
  expandSignal: number;
};

export default function JsonNode({
  name,
  value,
  depth,
  query,
  path,
  expandMode,
  expandSignal,
}: Props) {
  const isObject =
    typeof value === "object" &&
    value !== null;

  const isArray = Array.isArray(value);

  const hasMatch = jsonContainsQuery(
    value,
    query
  );

  const [open, setOpen] = useState(
    depth < 2
  );

  const [copiedPath, setCopiedPath] =
    useState(false);

  const [copiedValue, setCopiedValue] =
    useState(false);

  /* ===============================
     GLOBAL EXPAND / COLLAPSE
  ================================ */

  useEffect(() => {
    if (expandMode === "expand") {
      setOpen(true);
    }
    if (expandMode === "collapse") {
      setOpen(false);
    }
  }, [expandSignal, expandMode]);

  /* ===============================
     AUTO OPEN ON SEARCH
  ================================ */

  useEffect(() => {
    if (query && hasMatch) {
      setOpen(true);
    }
  }, [query, hasMatch]);

  /* ===============================
     FILTER NON MATCH
  ================================ */

  if (query && !hasMatch) {
    return null;
  }

  /* ===============================
     COPY HANDLERS
  ================================ */

  function copyPath() {
    navigator.clipboard.writeText(path);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 1200);
  }

  function copyValue(val: unknown) {
    const text =
      typeof val === "string"
        ? val
        : JSON.stringify(val, null, 2);

    navigator.clipboard.writeText(text);
    setCopiedValue(true);
    setTimeout(() => setCopiedValue(false), 1200);
  }

  /* ===============================
     PRIMITIVE
  ================================ */

  if (!isObject) {
    const text = JSON.stringify(value);

    return (
      <div className="pl-4 group flex gap-1 items-start">
        {/* KEY */}
        {name && (
          <span
            onClick={copyPath}
            title="Copy JSON path"
            className="text-blue-400 cursor-pointer hover:underline"
          >
            "{name}"
          </span>
        )}

        {name && <span>: </span>}

        {/* VALUE */}
        <span
          onClick={() => copyValue(value)}
          title="Copy value"
          className={
            "cursor-pointer " +
            (query &&
            text
              .toLowerCase()
              .includes(query.toLowerCase())
              ? "bg-yellow-400/20 text-emerald-300"
              : "text-emerald-400")
          }
        >
          {text}
        </span>

        {/* FEEDBACK */}
        {(copiedPath || copiedValue) && (
          <span className="ml-2 text-xs text-green-400">
            {copiedPath
              ? "path copied"
              : "value copied"}
          </span>
        )}
      </div>
    );
  }

  /* ===============================
     OBJECT / ARRAY
  ================================ */

  const entries = isArray
    ? value.map((v, i) => [i, v])
    : Object.entries(
        value as Record<string, unknown>
      );

  return (
    <div className="pl-4 group">
      <div className="cursor-pointer select-none flex items-center gap-1">
        {/* TOGGLE */}
        <span
          onClick={() => setOpen(!open)}
          className="text-gray-400"
        >
          {open ? "▼" : "▶"}
        </span>

        {/* KEY */}
        {name && (
          <span
            onClick={copyPath}
            title="Copy JSON path"
            className={
              "cursor-pointer hover:underline " +
              (query &&
              name
                .toLowerCase()
                .includes(query.toLowerCase())
                ? "bg-yellow-400/20 text-blue-300"
                : "text-blue-400")
            }
          >
            "{name}"
          </span>
        )}

        {name && <span>: </span>}

        {/* TYPE */}
        <span
          onClick={() => copyValue(value)}
          title="Copy value"
          className="text-purple-400 cursor-pointer"
        >
          {isArray ? "[" : "{"}
        </span>

        {!open && (
          <span className="text-gray-500 ml-1">
            {entries.length} items
          </span>
        )}

        <span className="text-purple-400">
          {isArray ? "]" : "}"}
        </span>

        {/* FEEDBACK */}
        {(copiedPath || copiedValue) && (
          <span className="ml-2 text-xs text-green-400">
            {copiedPath
              ? "path copied"
              : "value copied"}
          </span>
        )}
      </div>

      {/* CHILDREN */}
      {open && (
        <div className="pl-4 border-l border-white/10 mt-1 space-y-1">
          {entries.map(([k, v]) => {
            const nextPath = isArray
              ? `${path}[${k}]`
              : `${path}.${k}`;

            return (
              <JsonNode
                key={String(k)}
                name={String(k)}
                value={v}
                depth={depth + 1}
                query={query}
                path={nextPath}
                expandMode={expandMode}
                expandSignal={expandSignal}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
