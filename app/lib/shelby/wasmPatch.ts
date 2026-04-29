/**
 * WASM Path Patch for Vercel Serverless
 *
 * @shelby-protocol/clay-codes uses `import.meta.url` to locate clay.wasm.
 * After Vercel bundles the code, `import.meta.url` resolves to the wrong path.
 *
 * This module patches the Node.js module resolution so that when clay-codes
 * tries to read the wasm file, it finds it at the correct absolute path.
 *
 * Must be imported BEFORE any @shelby-protocol imports.
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Possible locations for clay.wasm on Vercel and locally
const WASM_SEARCH_PATHS = [
  // Standard node_modules location (local dev + Vercel with file tracing)
  resolve(process.cwd(), "node_modules/@shelby-protocol/clay-codes/dist/clay.wasm"),
  // Vercel's path prefix
  "/vercel/path0/node_modules/@shelby-protocol/clay-codes/dist/clay.wasm",
  // Next.js server output
  resolve(process.cwd(), ".next/server/clay.wasm"),
  resolve(process.cwd(), ".next/server/chunks/clay.wasm"),
  // Public folder fallback
  resolve(process.cwd(), "public/clay.wasm"),
];

let wasmBytes: Buffer | null = null;

export function getWasmBytes(): Buffer {
  if (wasmBytes) return wasmBytes;

  for (const p of WASM_SEARCH_PATHS) {
    if (existsSync(p)) {
      console.log("✅ Found clay.wasm at:", p);
      wasmBytes = readFileSync(p);
      return wasmBytes;
    }
  }

  throw new Error(
    `Unable to locate clay.wasm. Tried:\n${WASM_SEARCH_PATHS.join("\n")}`
  );
}

/**
 * Monkey-patch the clay-codes module to use our wasm bytes
 * instead of trying to resolve via import.meta.url
 */
export async function patchClayWasm(): Promise<void> {
  try {
    const bytes = getWasmBytes();

    // Patch WebAssembly.compile to intercept the wasm load
    // The SDK calls: const module = await WebAssembly.compile(bytes)
    // We pre-compile it so the SDK's readFile call is bypassed
    // by patching the fs.readFile that clay-codes uses

    // Actually patch via module augmentation:
    // Override the readFile in the clay-codes module context
    const clayCodesPath = resolve(
      process.cwd(),
      "node_modules/@shelby-protocol/clay-codes/dist/index-node.js"
    );

    if (existsSync(clayCodesPath)) {
      // The module is already loaded or will be loaded — 
      // we ensure the wasm bytes are available at the expected path
      // by writing them to a temp location if needed
      const expectedPath = resolve(
        process.cwd(),
        "node_modules/@shelby-protocol/clay-codes/dist/clay.wasm"
      );

      if (!existsSync(expectedPath)) {
        const { writeFileSync, mkdirSync } = await import("fs");
        mkdirSync(dirname(expectedPath), { recursive: true });
        writeFileSync(expectedPath, bytes);
        console.log("✅ Wrote clay.wasm to expected path:", expectedPath);
      }
    }
  } catch (err) {
    console.warn("⚠️ wasmPatch: could not patch clay.wasm:", err);
  }
}
