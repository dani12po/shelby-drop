"use client";

import { useState } from "react";

/* ===============================
   PROPS
================================ */
type Props = {
  src: string;
  filename?: string;
};

/* ===============================
   CONSTANTS
================================ */
const ZOOM_STEP = 0.25;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

/* ===============================
   COMPONENT
================================ */
export default function ImagePreview({
  src,
  filename,
}: Props) {
  const [mode, setMode] = useState<
    "fit" | "natural" | "zoom"
  >("fit");

  const [zoom, setZoom] = useState(1);

  function zoomIn() {
    setZoom((z) =>
      Math.min(z + ZOOM_STEP, MAX_ZOOM)
    );
    setMode("zoom");
  }

  function zoomOut() {
    setZoom((z) =>
      Math.max(z - ZOOM_STEP, MIN_ZOOM)
    );
    setMode("zoom");
  }

  function resetZoom() {
    setZoom(1);
    setMode("fit");
  }

  /* ===============================
     IMAGE STYLE
  ================================ */
  const imageStyle: React.CSSProperties =
    mode === "fit"
      ? {
          maxWidth: "100%",
          maxHeight: "65vh",
          objectFit: "contain",
        }
      : mode === "natural"
      ? {
          maxWidth: "none",
          maxHeight: "none",
        }
      : {
          transform: `scale(${zoom})`,
          transformOrigin: "center",
        };

  return (
    <div className="space-y-3">
      {/* ===========================
          TOOLBAR
      ============================ */}
      <div className="flex justify-end gap-2 text-xs">
        <button
          onClick={() => setMode("fit")}
          className={`px-3 py-1.5 rounded-full transition ${
            mode === "fit"
              ? "bg-white text-black"
              : "bg-white/10 hover:bg-white/20"
          }`}
        >
          FIT
        </button>

        <button
          onClick={() => setMode("natural")}
          className={`px-3 py-1.5 rounded-full transition ${
            mode === "natural"
              ? "bg-white text-black"
              : "bg-white/10 hover:bg-white/20"
          }`}
        >
          1:1
        </button>

        <button
          onClick={zoomOut}
          className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20"
        >
          −
        </button>

        <button
          onClick={zoomIn}
          className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20"
        >
          +
        </button>

        <button
          onClick={resetZoom}
          className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20"
        >
          RESET
        </button>
      </div>

      {/* ===========================
          IMAGE CANVAS
      ============================ */}
      <div className="relative flex justify-center overflow-auto max-h-[70vh] bg-black/40 rounded-xl p-4">
        <img
          src={src}
          alt={filename ?? "image preview"}
          style={imageStyle}
          className="select-none"
          draggable={false}
        />
      </div>
    </div>
  );
}
