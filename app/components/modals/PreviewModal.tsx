"use client";

import { useEffect, useState } from "react";
import { FileItemData } from "@/lib/data";
import { previewRegistry } from "@/lib/preview/PreviewRegistry";
import { RenderResult } from "@/lib/preview/renderers/types";

/* ===============================
   PROPS
================================ */

type Props = {
  file: FileItemData;
  wallet: string;
  onClose: () => void;

  /** Optional filesystem navigation */
  onNavigate?: (path: string[]) => void;
};

/* ===============================
   HELPERS
================================ */

function buildBlobUrl(wallet: string, path: string[]) {
  return `https://api.shelbynet.shelby.xyz/shelby/v1/blobs/${wallet}/${path.join(
    "/"
  )}`;
}

function getExt(name: string): string {
  return "." + (name.split(".").pop()?.toLowerCase() ?? "");
}

/* ===============================
   COMPONENT
================================ */

export default function PreviewModal({
  file,
  wallet,
  onClose,
}: Props) {
  const filePath = [...file.path, file.name];
  const fileUrl = buildBlobUrl(wallet, filePath);
  const ext = getExt(file.name);

  /* ===============================
     STATE
  ================================ */

  const [content, setContent] = useState<string | null>(null);
  const [result, setResult] = useState<RenderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<
    "preview" | "raw" | "tree"
  >("preview");

  /* ===============================
     FETCH FILE
  ================================ */

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await fetch(fileUrl);
        const text = await res.text();
        if (!active) return;

        setContent(text);

        const rendered = await previewRegistry.render(text, {
          path: filePath.join("/"),
          ext,
          meta: {
            wallet,
          },
        });

        setResult(rendered);
      } catch (e) {
        if (active) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load file"
          );
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [fileUrl, ext, wallet]);

  /* ===============================
     PREVIEW BODY
  ================================ */

  function renderPreviewBody() {
    if (error) {
      return (
        <p className="text-sm text-red-400">
          {error}
        </p>
      );
    }

    if (!content || !result) {
      return (
        <p className="text-sm text-gray-400">
          Loading preview…
        </p>
      );
    }

    /* ===== HTML (Markdown) ===== */
    if (result.type === "html") {
      return (
        <div className="space-y-2">
          <div className="flex justify-end gap-2 text-xs">
            {["preview", "raw"].map((m) => (
              <button
                key={m}
                onClick={() =>
                  setViewMode(m as any)
                }
                className={`px-2 py-1 rounded ${
                  viewMode === m
                    ? "bg-blue-600"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>

          {viewMode === "preview" ? (
            <div
              className="max-h-[65vh] bg-black/40 p-4 rounded overflow-auto prose prose-invert"
              dangerouslySetInnerHTML={{
                __html: result.content,
              }}
            />
          ) : (
            <pre className="max-h-[65vh] bg-black/40 p-3 rounded text-xs overflow-auto">
              {content}
            </pre>
          )}
        </div>
      );
    }

    /* ===== REACT (JSON Tree, etc) ===== */
    if (result.type === "react") {
      return (
        <div className="space-y-2">
          {result.meta?.raw && (
            <div className="flex justify-end gap-2 text-xs">
              {["tree", "raw"].map((m) => (
                <button
                  key={m}
                  onClick={() =>
                    setViewMode(m as any)
                  }
                  className={`px-2 py-1 rounded ${
                    viewMode === m
                      ? "bg-blue-600"
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
            <pre className="max-h-[65vh] bg-black/40 p-3 rounded text-xs overflow-auto">
              {result.meta.raw}
            </pre>
          ) : (
            result.content
          )}
        </div>
      );
    }

    /* ===== TEXT ===== */
    return (
      <pre className="max-h-[65vh] bg-black/40 p-3 rounded text-xs overflow-auto">
        {result.content}
      </pre>
    );
  }

  /* ===============================
     RENDER
  ================================ */

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-white/10 rounded-xl p-4 w-full max-w-4xl space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              {file.name}
            </h3>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* BREADCRUMB */}
          <div className="text-xs text-gray-400">
            {wallet}
            {file.path.map((p) => (
              <span key={p}> / {p}</span>
            ))}
          </div>
        </div>

        {/* META */}
        <div className="flex gap-4 text-xs text-gray-400">
          <span>Size: {file.size}</span>
          <span>Uploader: {file.uploader}</span>
        </div>

        {/* PREVIEW */}
        <div className="bg-black/40 rounded p-3">
          {renderPreviewBody()}
        </div>
      </div>
    </div>
  );
}
