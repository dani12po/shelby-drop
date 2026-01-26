"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

type Props = {
  wallet: string;
  blobName: string;
  contentType?: string;
};

export default function PreviewRenderer({
  wallet,
  blobName,
  contentType,
}: Props) {
  const src = `/uploads/${wallet}/${blobName}`;
  const lower = blobName.toLowerCase();

  /* ===============================
     IMAGE
  ================================ */
  if (contentType?.startsWith("image/")) {
    return (
      <img
        src={src}
        alt={blobName}
        className="max-w-full max-h-full rounded"
      />
    );
  }

  /* ===============================
     VIDEO
  ================================ */
  if (contentType?.startsWith("video/")) {
    return (
      <video
        src={src}
        controls
        className="max-w-full max-h-full rounded"
      />
    );
  }

  /* ===============================
     AUDIO
  ================================ */
  if (
    contentType?.startsWith("audio/") ||
    /\.(mp3|wav|ogg|aac)$/i.test(lower)
  ) {
    return (
      <audio
        src={src}
        controls
        className="w-full"
      />
    );
  }

  /* ===============================
     PDF
  ================================ */
  if (
    contentType === "application/pdf" ||
    lower.endsWith(".pdf")
  ) {
    return (
      <iframe
        src={src}
        className="w-full h-full rounded"
      />
    );
  }

  /* ===============================
     MARKDOWN
  ================================ */
  if (
    contentType === "text/markdown" ||
    lower.endsWith(".md")
  ) {
    return <MarkdownPreview src={src} />;
  }

  /* ===============================
     FALLBACK
  ================================ */
  return (
    <div className="text-sm text-white/60 space-y-2">
      <p>No preview available.</p>
      <a
        href={src}
        download
        className="underline"
      >
        Download file
      </a>
    </div>
  );
}

/* ===============================
   MARKDOWN PREVIEW
================================ */
function MarkdownPreview({
  src,
}: {
  src: string;
}) {
  const [content, setContent] =
    React.useState<string>("");

  React.useEffect(() => {
    fetch(src)
      .then((res) => res.text())
      .then(setContent)
      .catch(() =>
        setContent("Failed to load markdown")
      );
  }, [src]);

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown>
        {content}
      </ReactMarkdown>
    </div>
  );
}
