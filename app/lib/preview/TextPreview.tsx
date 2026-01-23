"use client";

import { RenderResult } from "./renderers/types";

/* ===============================
   PROPS
================================ */
type Props = {
  /** raw text content */
  content: string;

  /** rendered preview result */
  result: RenderResult;

  /** current view mode */
  viewMode: "preview" | "raw" | "tree";

  /** change view mode */
  onChangeViewMode?: (mode: "preview" | "raw" | "tree") => void;
};

/* ===============================
   COMPONENT
================================ */
export default function TextPreview({
  content,
  result,
  viewMode,
  onChangeViewMode,
}: Props) {
  /* ===== HTML / MARKDOWN ===== */
  if (result.type === "html") {
    return (
      <div className="space-y-3">
        {/* VIEW MODE SWITCH */}
        {onChangeViewMode && (
          <div className="flex justify-end gap-2 text-xs">
            {["preview", "raw"].map((m) => (
              <button
                key={m}
                onClick={() =>
                  onChangeViewMode(m as any)
                }
                className={`px-3 py-1.5 rounded-full transition ${
                  viewMode === m
                    ? "bg-white text-black"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {viewMode === "preview" ? (
          <div
            className="max-h-[65vh] bg-black/40 p-4 rounded-xl overflow-auto prose prose-invert"
            dangerouslySetInnerHTML={{
              __html: result.content,
            }}
          />
        ) : (
          <pre className="max-h-[65vh] bg-black/40 p-4 rounded-xl text-xs overflow-auto">
            {content}
          </pre>
        )}
      </div>
    );
  }

  /* ===== REACT (JSON TREE) ===== */
  if (result.type === "react") {
    return (
      <div className="space-y-3">
        {result.meta?.raw && onChangeViewMode && (
          <div className="flex justify-end gap-2 text-xs">
            {["tree", "raw"].map((m) => (
              <button
                key={m}
                onClick={() =>
                  onChangeViewMode(m as any)
                }
                className={`px-3 py-1.5 rounded-full transition ${
                  viewMode === m
                    ? "bg-white text-black"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {viewMode === "raw" &&
        result.meta?.raw ? (
          <pre className="max-h-[65vh] bg-black/40 p-4 rounded-xl text-xs overflow-auto">
            {result.meta.raw}
          </pre>
        ) : (
          result.content
        )}
      </div>
    );
  }

  /* ===== FALLBACK TEXT ===== */
  return (
    <pre className="max-h-[65vh] bg-black/40 p-4 rounded-xl text-xs overflow-auto">
      {content}
    </pre>
  );
}
