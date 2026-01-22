// app/lib/preview/renderers/RawRenderer.ts

import { PreviewRenderer } from "./types";

export const RawRenderer: PreviewRenderer = {
  id: "raw",
  fileTypes: ["*"],
  priority: -100,

  canRender: () => true,

  render(content) {
    return {
      type: "text",
      content
    };
  }
};
