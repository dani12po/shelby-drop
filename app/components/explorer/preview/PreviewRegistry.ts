// app/lib/preview/PreviewRegistry.ts

import {
  PreviewRenderer,
  RenderContext,
  RenderResult,
} from "../context-menu/types";

class PreviewRegistry {
  private renderers: PreviewRenderer[] = [];

  /**
   * Register renderer into registry
   */
  register(renderer: PreviewRenderer) {
    this.renderers.push(renderer);

    // Higher priority first
    this.renderers.sort(
      (a, b) =>
        (b.priority ?? 0) - (a.priority ?? 0)
    );
  }

  /**
   * Resolve renderer based on context
   */
  resolve(
    ctx: RenderContext
  ): PreviewRenderer | null {
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
   * Render from already-loaded text content
   */
  async render(
    content: string,
    ctx: RenderContext
  ): Promise<RenderResult> {
    const renderer = this.resolve(ctx);

    // Fallback: raw text
    if (!renderer) {
      return {
        type: "text",
        content,
      };
    }

    let workingContent = content;

    // Optional preprocess
    if (renderer.preprocess) {
      workingContent =
        await renderer.preprocess(
          workingContent,
          ctx
        );
    }

    // Main render
    let result = await renderer.render(
      workingContent,
      ctx
    );

    // Optional postprocess
    if (renderer.postprocess) {
      result = await renderer.postprocess(
        result,
        ctx
      );
    }

    return result;
  }

  /**
   * 🔑 High-level entry point
   * Render directly from file URL
   */
  async renderFromFile(
    src: string,
    ctx: RenderContext
  ): Promise<RenderResult> {
    const renderer = this.resolve(ctx);

    /**
     * No renderer:
     * → UI decides what to do (download / no preview)
     */
    if (!renderer) {
      return {
        type: "media",
        src,
      };
    }

    /**
     * Renderer does NOT require text content
     * (image / video / audio / pdf)
     */
    if (!renderer.requiresContent) {
      return {
        type: "media",
        src,
      };
    }

    /**
     * Text-based renderer
     * → fetch file content
     */
    const res = await fetch(src);

    if (!res.ok) {
      throw new Error(
        `Failed to load preview (${res.status})`
      );
    }

    const text = await res.text();
    return this.render(text, ctx);
  }
}

export const previewRegistry =
  new PreviewRegistry();
