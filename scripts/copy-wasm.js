#!/usr/bin/env node
/**
 * Copies clay.wasm to all locations where the SDK might look for it.
 * Run as part of the build process on Vercel.
 */

const fs = require("fs");
const path = require("path");

const src = path.resolve(
  __dirname,
  "../node_modules/@shelby-protocol/clay-codes/dist/clay.wasm"
);

const destinations = [
  // Next.js server output directories
  path.resolve(__dirname, "../.next/server/clay.wasm"),
  path.resolve(__dirname, "../.next/server/chunks/clay.wasm"),
  path.resolve(__dirname, "../.next/server/app/api/upload/clay.wasm"),
  // Public fallback
  path.resolve(__dirname, "../public/clay.wasm"),
];

if (!fs.existsSync(src)) {
  console.warn("[copy-wasm] Source not found:", src);
  process.exit(0);
}

for (const dest of destinations) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log("[copy-wasm] Copied to:", dest);
}

console.log("[copy-wasm] Done.");
