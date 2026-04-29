// app/api/media/route.ts
// Proxies blob content from Shelby storage nodes to avoid CORS issues.
// Correct URL format: https://api.{network}.shelby.xyz/shelby/v1/blobs/{wallet}/{filename}

import { NextResponse } from "next/server";
import { getNetworkConfig } from "@/config/shelby";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet   = searchParams.get("wallet");
  const name     = searchParams.get("name");
  const download = searchParams.get("download") === "1";
  const network  = searchParams.get("network") || process.env.SHELBY_NETWORK || "testnet";

  if (!wallet || !name) {
    return NextResponse.json({ error: "Missing wallet or name" }, { status: 400 });
  }

  const cfg = getNetworkConfig(network);

  // Correct Shelby blob URL: {blobBaseUrl}/{wallet}/{filename}
  // Each segment encoded individually to handle spaces and special chars
  const segments = name.split("/").map(encodeURIComponent);
  const blobUrl = `${cfg.blobBaseUrl}/${encodeURIComponent(wallet)}/${segments.join("/")}`;

  try {
    const upstream = await fetch(blobUrl, {
      headers: {
        // Forward range requests for video/audio seeking
        ...(req.headers.get("range")
          ? { Range: req.headers.get("range")! }
          : {}),
      },
    });

    if (!upstream.ok && upstream.status !== 206) {
      console.error(`[media proxy] upstream ${upstream.status} for: ${blobUrl}`);
      return NextResponse.json(
        { error: `Storage returned ${upstream.status}` },
        { status: upstream.status }
      );
    }

    const contentType =
      upstream.headers.get("content-type") ||
      inferContentType(name);

    const filename = name.split("/").pop() ?? name;

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
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
  } catch (err) {
    console.error("[media proxy] fetch failed:", err, "URL:", blobUrl);
    return NextResponse.json(
      { error: "Failed to fetch from storage" },
      { status: 502 }
    );
  }
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
