// app/lib/preview/renderers/JsonRenderer.tsx

import React from "react";
import { PreviewRenderer } from "./types";
import JsonTree from "@/components/json/JsonTree";

export const JsonRenderer: PreviewRenderer = {
  id: "json",
  fileTypes: [".json"],
  priority: 50,

  canRender: () => true,

  render(content) {
    let parsed: unknown;

    try {
      parsed = JSON.parse(content);
    } catch {
      return {
        type: "text",
        content: "Invalid JSON"
      };
    }

    return {
      type: "react",
      content: (
        <div className="max-h-[65vh] bg-black/40 p-3 rounded overflow-auto">
          <JsonTree value={parsed} />
        </div>
      ),
      meta: {
        raw: JSON.stringify(parsed, null, 2)
      }
    };
  }
};
