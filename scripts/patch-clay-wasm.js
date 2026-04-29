#!/usr/bin/env node
/**
 * Patches @shelby-protocol/clay-codes/dist/index-node.js
 * to use an absolute path for clay.wasm instead of import.meta.url.
 *
 * This fixes the "Unable to locate clay.wasm" error on Vercel serverless.
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

let content = fs.readFileSync(indexNodePath, "utf-8");

// Check if already patched
if (content.includes("PATCHED_BY_SHELBY_DROP")) {
  console.log("[patch-clay-wasm] Already patched, skipping.");
  process.exit(0);
}

// Replace the loadWasm function with one that uses require.resolve
const originalLoadWasm = `async function loadWasm() {
  const here = dirname(fileURLToPath(import.meta.url));
  const paths = [
    resolve(here, "clay.wasm"),
    resolve(here, "../dist/clay.wasm")
  ];
  let bytes;
  for (const path of paths) {
    try {
      bytes = await readFile(path);
      break;
    } catch {
    }
  }
  if (!bytes) {
    throw new Error(\`Unable to locate clay.wasm. Tried: \${paths.join(", ")}\`);
  }`;

const patchedLoadWasm = `async function loadWasm() {
  // PATCHED_BY_SHELBY_DROP: use absolute paths that work on Vercel
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
  for (const path of paths) {
    try {
      bytes = await readFile(path);
      break;
    } catch {
    }
  }
  if (!bytes) {
    throw new Error(\`Unable to locate clay.wasm. Tried: \${paths.join(", ")}\`);
  }`;

if (content.includes("const here = dirname(fileURLToPath(import.meta.url))")) {
  content = content.replace(
    /async function loadWasm\(\) \{[\s\S]*?if \(!bytes\) \{[\s\S]*?throw new Error[\s\S]*?\}\s*\}/,
    patchedLoadWasm + "\n  }"
  );
  fs.writeFileSync(indexNodePath, content, "utf-8");
  console.log("[patch-clay-wasm] Successfully patched index-node.js");
} else {
  console.log("[patch-clay-wasm] Pattern not found, trying direct replacement...");
  
  // Fallback: just prepend the extra paths to the existing array
  const simpleReplace = `resolve(here, "clay.wasm"),
    resolve(here, "../dist/clay.wasm")`;
  const simpleWith = `resolve(here, "clay.wasm"),
    resolve(here, "../dist/clay.wasm"),
    resolve(process.cwd(), "node_modules/@shelby-protocol/clay-codes/dist/clay.wasm"),
    "/vercel/path0/node_modules/@shelby-protocol/clay-codes/dist/clay.wasm",
    resolve(process.cwd(), "public/clay.wasm")`;
  
  if (content.includes(simpleReplace)) {
    content = content.replace(simpleReplace, simpleWith);
    // Add PATCHED marker
    content = "// PATCHED_BY_SHELBY_DROP\n" + content;
    fs.writeFileSync(indexNodePath, content, "utf-8");
    console.log("[patch-clay-wasm] Patched with simple replacement.");
  } else {
    console.log("[patch-clay-wasm] Could not find pattern to patch.");
  }
}
