#!/usr/bin/env node
/**
 * Patches @shelby-protocol/clay-codes/dist/index-node.js
 * to use absolute paths for clay.wasm that work on Vercel serverless.
 *
 * The original code uses import.meta.url which resolves incorrectly
 * after Vercel bundles the serverless function.
 */

const fs = require("fs");
const path = require("path");

const indexNodePath = path.resolve(
  __dirname,
  "../node_modules/@shelby-protocol/clay-codes/dist/index-node.js"
);

if (!fs.existsSync(indexNodePath)) {
  console.log("[patch-clay-wasm] index-node.js not found, skipping.");
  process.exit(0);
}

// The correct replacement for the entire loadWasm function
const PATCHED_LOAD_WASM = `// PATCHED_BY_SHELBY_DROP
import { readFile } from "fs/promises";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
async function loadWasm() {
  const here = dirname(fileURLToPath(import.meta.url));
  const cwd = process.cwd();
  const paths = [
    resolve(here, "clay.wasm"),
    resolve(here, "../dist/clay.wasm"),
    resolve(cwd, "node_modules/@shelby-protocol/clay-codes/dist/clay.wasm"),
    "/vercel/path0/node_modules/@shelby-protocol/clay-codes/dist/clay.wasm",
    resolve(cwd, ".next/server/clay.wasm"),
    resolve(cwd, "public/clay.wasm"),
  ];
  let bytes;
  for (const wasmPath of paths) {
    try {
      bytes = await readFile(wasmPath);
      break;
    } catch {
      // try next path
    }
  }
  if (!bytes) {
    throw new Error(\`Unable to locate clay.wasm. Tried: \${paths.join(", ")}\`);
  }
  const defaultImports = {
    env: {
      abort: () => { throw new Error("WASM abort called"); },
      js_msg: (i) => console.log(\`wasm msg: \${i}\`)
    }
  };
  const module = await WebAssembly.compile(bytes);
  return WebAssembly.instantiate(module, defaultImports);
}`;

// Read current content
let content = fs.readFileSync(indexNodePath, "utf-8");

// Check if already correctly patched (has correct defaultImports)
if (content.includes("PATCHED_BY_SHELBY_DROP") && content.includes("const defaultImports")) {
  console.log("[patch-clay-wasm] Already correctly patched, skipping.");
  process.exit(0);
}

// Remove any previous broken patch
content = content.replace(/\/\/ PATCHED_BY_SHELBY_DROP[\s\S]*?(?=async function createEncoder)/, "");

// Remove the original imports that we'll include in the patch
content = content.replace(/\/\/ src\/index-node\.ts\nimport \{ readFile \} from "fs\/promises";\nimport \{ dirname, resolve \} from "path";\nimport \{ fileURLToPath \} from "url";\n/, "");

// Remove the original loadWasm function (find it by its signature)
// Match from "async function loadWasm" to the closing "}" of the function
const loadWasmRegex = /async function loadWasm\(\) \{[\s\S]*?\nreturn WebAssembly\.instantiate\(module, defaultImports\);\n\}/;
if (loadWasmRegex.test(content)) {
  content = content.replace(loadWasmRegex, PATCHED_LOAD_WASM);
  fs.writeFileSync(indexNodePath, content, "utf-8");
  console.log("[patch-clay-wasm] Successfully patched index-node.js");
} else {
  // Fallback: rewrite the entire file with correct content
  console.log("[patch-clay-wasm] Using full rewrite fallback...");
  
  const fullContent = `import "./chunk-E7TRDNBU.js";
import {
  FULL_WASM_MASK,
  MAX_WASM_MASK_BITS,
  convertToErasedMask,
  makeDecoderAPI
} from "./chunk-RXWC2ROY.js";
import {
  makeEncoderAPI
} from "./chunk-BWTMZB33.js";
import "./chunk-ST33RHQN.js";
import {
  flattenSystematic
} from "./chunk-22OVODFS.js";
import {
  CLAY_PARAMS_BYTES,
  DEFAULT_ALIGNMENT,
  DEFAULT_ALIGN_MASK,
  DEFAULT_PAGE_SIZE
} from "./chunk-N26WXNR7.js";
import {
  DuplicateChunkIndexError,
  InvalidChunkIndexError
} from "./chunk-XAN62WH2.js";

${PATCHED_LOAD_WASM}

async function createEncoder(opts) {
  const instance = await loadWasm();
  return makeEncoderAPI(instance, opts);
}
async function createDecoder(opts) {
  const instance = await loadWasm();
  return makeDecoderAPI(instance, opts);
}
export {
  CLAY_PARAMS_BYTES,
  DEFAULT_ALIGNMENT,
  DEFAULT_ALIGN_MASK,
  DEFAULT_PAGE_SIZE,
  DuplicateChunkIndexError,
  FULL_WASM_MASK,
  InvalidChunkIndexError,
  MAX_WASM_MASK_BITS,
  convertToErasedMask,
  createDecoder,
  createEncoder,
  flattenSystematic,
  makeDecoderAPI,
  makeEncoderAPI
};
`;
  fs.writeFileSync(indexNodePath, fullContent, "utf-8");
  console.log("[patch-clay-wasm] Full rewrite complete.");
}
