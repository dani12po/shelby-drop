// app/lib/preview/renderers/index.ts

import { previewRegistry } from "../PreviewRegistry";

import { MarkdownRenderer } from "./MarkdownRenderer";
import { JsonRenderer } from "./JsonRenderer";
import { RawRenderer } from "./RawRenderer";

previewRegistry.register(MarkdownRenderer);
previewRegistry.register(JsonRenderer);
previewRegistry.register(RawRenderer);

export * from "./types";
