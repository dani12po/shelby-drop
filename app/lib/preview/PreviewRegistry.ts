// app/lib/preview/PreviewRegistry.ts

import {
  PreviewRenderer,
  RenderContext,
  RenderResult
} from "./renderers/types";

class PreviewRegistry {
  private renderers: PreviewRenderer[] = [];

  /**
   * Register renderer into registry
   */
  register(renderer: PreviewRenderer) {
    this.renderers.push(renderer);

    // sort by priority (higher first)
    this.renderers.sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
    );
  }

  /**
   * Resolve renderer based on render context
   */
  resolve(ctx: RenderContext): PreviewRenderer | null {
    return (
      this.renderers.find((renderer) => {
        const matchExt =
          renderer.fileTypes.includes(ctx.ext) ||
          renderer.fileTypes.includes("*");

        if (!matchExt) return false;

        return renderer.canRender(ctx);
      }) ?? null
    );
  }

  /**
   * Full render pipeline
   * preprocess -> render -> postprocess
   */
  async render(
    content: string,
    ctx: RenderContext
  ): Promise<RenderResult> {
    const renderer = this.resolve(ctx);

    // fallback: raw text
    if (!renderer) {
      return {
        type: "text",
        content
      };
    }

    let workingContent = content;

    // preprocess hook
    if (renderer.preprocess) {
      workingContent = await renderer.preprocess(
        workingContent,
        ctx
      );
    }

    // main render
    let result = await renderer.render(
      workingContent,
      ctx
    );

    // postprocess hook
    if (renderer.postprocess) {
      result = await renderer.postprocess(
        result,
        ctx
      );
    }

    return result;
  }
}

export const previewRegistry = new PreviewRegistry();
