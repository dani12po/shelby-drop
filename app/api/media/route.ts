// app/api/media/route.ts
// Proxies blob content from Shelby storage nodes to avoid CORS issues.
// Tries both testnet and shelbynet if the first fails.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Blob base URLs from @shelby-protocol/sdk NetworkToShelbyRPCBaseUrl
const BLOB_BASE_URLS: Record<string, string> = {
  testnet:   "https://api.testnet.shelby.xyz/shelby/v1/blobs",
  shelbynet: "https://api.shelbynet.shelby.xyz/shelby/v1/blobs",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet   = searchParams.get("wallet");
  const name     = searchParams.get("name");
  const download = searchParams.get("download") === "1";
  const network  = searchParams.get("network"); // optional hint

  if (!wallet || !name) {
    return NextResponse.json({ error: "Missing wallet or name" }, { status: 400 });
  }

  // Encode each path segment individually
  const segments = name.split("/").map(encodeURIComponent);
  const filePath = `${encodeURIComponent(wallet)}/${segments.join("/")}`;

  // Build ordered list of networks to try
  // If a network hint is given, try it first; always fall back to the other
  const networksToTry = network && BLOB_BASE_URLS[network]
    ? [network, ...Object.keys(BLOB_BASE_URLS).filter(n => n !== network)]
    : ["testnet", "shelbynet"];

  const rangeHeader = req.headers.get("range");

  for (const net of networksToTry) {
    const blobUrl = `${BLOB_BASE_URLS[net]}/${filePath}`;

    try {
      const upstream = await fetch(blobUrl, {
        headers: rangeHeader ? { Range: rangeHeader } : {},
      });

      if (!upstream.ok && upstream.status !== 206) {
        // Not found on this network — try next
        continue;
      }

      const contentType =
        upstream.headers.get("content-type") ||
        inferContentType(name);

      const filename = name.split("/").pop() ?? name;

      const headers: Record<string, string> = {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
        "X-Shelby-Network": net,
      };

      if (download) {
        headers["Content-Disposition"] = `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`;
      } else {
        headers["Content-Disposition"] = `inline; filename*=UTF-8''${encodeURIComponent(filename)}`;
      }

      const contentLength = upstream.headers.get("content-length");
      if (contentLength) headers["Content-Length"] = contentLength;

      const contentRange = upstream.headers.get("content-range");
      if (contentRange) headers["Content-Range"] = contentRange;

      return new Response(upstream.body, { status: upstream.status, headers });
    } catch {
      // Network error — try next
      continue;
    }
  }

  // All networks failed
  return NextResponse.json(
    { error: "File not found on any Shelby network" },
    { status: 404 }
  );
}

function inferContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp", svg: "image/svg+xml", bmp: "image/bmp",
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
    avi: "video/x-msvideo", mkv: "video/x-matroska",
    mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg",
    flac: "audio/flac", aac: "audio/aac", m4a: "audio/mp4",
    pdf: "application/pdf",
    txt: "text/plain", md: "text/markdown",
    json: "application/json", js: "text/javascript",
    ts: "text/plain", tsx: "text/plain", jsx: "text/plain",
    css: "text/css", html: "text/html", xml: "text/xml",
    csv: "text/csv", yaml: "text/yaml", yml: "text/yaml",
    zip: "application/zip", tar: "application/x-tar",
    gz: "application/gzip", rar: "application/x-rar-compressed",
  };
  return map[ext] || "application/octet-stream";
}
