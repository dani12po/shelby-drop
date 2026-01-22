// app/lib/preview/renderers/types.ts

export type RenderResult =
  | {
      type: "html";
      content: string;
      toc?: any[];
      meta?: Record<string, any>;
    }
  | {
      type: "react";
      content: JSX.Element;
      meta?: Record<string, any>;
    }
  | {
      type: "text";
      content: string;
    };

export interface RenderContext {
  path: string;
  ext: string;
  fs?: any;
  meta?: Record<string, any>;
  options?: Record<string, any>;
}

export interface PreviewRenderer {
  id: string;
  fileTypes: string[];
  priority?: number;

  canRender(ctx: RenderContext): boolean;

  preprocess?(
    content: string,
    ctx: RenderContext
  ): string | Promise<string>;

  render(
    content: string,
    ctx: RenderContext
  ): RenderResult | Promise<RenderResult>;

  postprocess?(
    result: RenderResult,
    ctx: RenderContext
  ): RenderResult | Promise<RenderResult>;
}
