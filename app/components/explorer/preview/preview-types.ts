import type { ReactNode } from "react";
import type { ExplorerFileItem } from "@/types/explorer";

export type RenderContext = {
  file: ExplorerFileItem;
};

export type RenderResult =
  | {
      type: "react";
      node: ReactNode;
      meta?: Record<string, any>;
    }
  | {
      type: "text";
      content: string;
    };

export type PreviewRenderer = {
  id: string;
  supports(file: ExplorerFileItem): boolean;
  render(
    content: string,
    ctx: RenderContext
  ): RenderResult;
};
