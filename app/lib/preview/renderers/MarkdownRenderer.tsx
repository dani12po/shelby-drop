// app/lib/preview/renderers/MarkdownRenderer.tsx

import React from "react";
import { PreviewRenderer } from "./types";
import { parseMarkdown } from "@/lib/markdown.render";

/**
 * Resolve relative markdown links at text level
 */
function resolveRelativeLinks(
  markdown: string,
  ctx: {
    path: string;
    wallet?: string;
  }
): string {
  return markdown.replace(
    /\]\((\.{1,2}\/[^)]+)\)/g,
    (_, rawPath) => {
      const parts = rawPath.split("/");
      const base = ctx.path.split("/").slice(0, -1);

      for (const p of parts) {
        if (p === "." || p === "") continue;
        if (p === "..") base.pop();
        else base.push(p);
      }

      const resolved = base.join("/");

      return `](https://api.shelbynet.shelby.xyz/shelby/v1/blobs/${ctx.wallet}/${resolved})`;
    }
  );
}

export const MarkdownRenderer: PreviewRenderer = {
  id: "markdown",
  fileTypes: [".md", ".markdown"],
  priority: 100,

  canRender: () => true,

  preprocess(content, ctx) {
    return resolveRelativeLinks(content, {
      path: ctx.path,
      wallet: ctx.meta?.wallet,
    });
  },

  render(content) {
    const parsed = parseMarkdown(content);

    return {
      type: "react",
      content: (
        <div className="space-y-3">
          {/* Actual rendering is delegated to PreviewModal */}
        </div>
      ),
      meta: {
        blocks: parsed.blocks,
        toc: parsed.toc,
        raw: content,
      },
    };
  },
};
