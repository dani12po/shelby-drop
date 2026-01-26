"use client";

import React from "react";
import type { RenderResult } from "@/components/explorer/context-menu/types";

type Props = {
  result: RenderResult;
};

export default function PreviewResultRenderer({
  result,
}: Props) {
  switch (result.type) {
    /* ===============================
       MEDIA (image / video / audio / pdf)
    ================================ */
    case "media": {
      const src = result.src.toLowerCase();

      // Image
      if (
        src.endsWith(".png") ||
        src.endsWith(".jpg") ||
        src.endsWith(".jpeg") ||
        src.endsWith(".gif") ||
        src.endsWith(".webp")
      ) {
        return (
          <img
            src={result.src}
            alt=""
            className="max-w-full max-h-full rounded"
          />
        );
      }

      // Video
      if (
        src.endsWith(".mp4") ||
        src.endsWith(".webm") ||
        src.endsWith(".mov")
      ) {
        return (
          <video
            src={result.src}
            controls
            className="max-w-full max-h-full rounded"
          />
        );
      }

      // Audio
      if (
        src.endsWith(".mp3") ||
        src.endsWith(".wav") ||
        src.endsWith(".ogg")
      ) {
        return (
          <audio
            src={result.src}
            controls
            className="w-full"
          />
        );
      }

      // PDF
      if (src.endsWith(".pdf")) {
        return (
          <iframe
            src={result.src}
            className="w-full h-[80vh] rounded"
          />
        );
      }

      // Fallback media
      return (
        <div className="space-y-2 text-sm text-white/70">
          <p>No preview available.</p>
          <a
            href={result.src}
            download
            className="underline"
          >
            Download file
          </a>
        </div>
      );
    }

    /* ===============================
       HTML
    ================================ */
    case "html":
      return (
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: result.content,
          }}
        />
      );

    /* ===============================
       TEXT
    ================================ */
    case "text":
      return (
        <pre className="whitespace-pre-wrap text-sm text-white/80">
          {result.content}
        </pre>
      );

    /* ===============================
       REACT NODE
    ================================ */
    case "react":
      return <>{result.node}</>;

    /* ===============================
       SAFETY NET
    ================================ */
    default:
      return (
        <div className="text-sm text-white/60">
          Unsupported preview type
        </div>
      );
  }
}
