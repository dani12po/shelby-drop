#!/usr/bin/env node
/**
 * Copies clay.wasm to all locations where the SDK might look for it.
 * Run as part of postinstall so the file is available before Next.js build.
 */

const fs = require("fs");
const path = require("path");

const src = path.resolve(
  __dirname,
  "../node_modules/@shelby-protocol/clay-codes/dist/clay.wasm"
);

const destinations = [
  // Public folder — always accessible, served as static file
  path.resolve(__dirname, "../public/clay.wasm"),
  // Next.js server output directories (may not exist yet during postinstall)
  path.resolve(__dirname, "../.next/server/clay.wasm"),
  path.resolve(__dirname, "../.next/server/chunks/clay.wasm"),
  path.resolve(__dirname, "../.next/server/static/wasm/clay.wasm"),
  path.resolve(__dirname, "../.next/server/app/api/upload/clay.wasm"),
];

if (!fs.existsSync(src)) {
  console.warn("[copy-wasm] Source not found:", src);
  process.exit(0);
}

for (const dest of destinations) {
  const dir = path.dirname(dest);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log("[copy-wasm] Copied to:", dest);
  } catch (e) {
    // .next/ dirs may not exist during postinstall — that's fine
    if (dest.includes(".next")) {
      console.log("[copy-wasm] Skipped (dir not ready):", dest);
    } else {
      console.warn("[copy-wasm] Failed:", dest, e.message);
    }
  }
}

console.log("[copy-wasm] Done.");
