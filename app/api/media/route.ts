// app/api/media/route.ts
// Proxies content from Shelby gateway to avoid CORS issues.
// The browser talks to our domain; we fetch from gateway server-side.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GATEWAY = process.env.NEXT_PUBLIC_S3_GATEWAY_ORIGIN ?? "https://gateway.shelby.xyz";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet   = searchParams.get("wallet");
  const name     = searchParams.get("name");
  const download = searchParams.get("download") === "1";

  if (!wallet || !name) {
    return NextResponse.json({ error: "Missing wallet or name" }, { status: 400 });
  }

  // Build gateway URL — encode each path segment
  const segments = name.split("/").map(encodeURIComponent);
  const gatewayUrl = `${GATEWAY}/${encodeURIComponent(wallet)}/${segments.join("/")}`;

  try {
    // Proxy the request server-side — avoids CORS issues in the browser
    const upstream = await fetch(gatewayUrl, {
      headers: {
        // Forward range requests for video/audio seeking
        ...(req.headers.get("range")
          ? { Range: req.headers.get("range")! }
          : {}),
      },
    });

    if (!upstream.ok && upstream.status !== 206) {
      return NextResponse.json(
        { error: `Gateway returned ${upstream.status}` },
        { status: upstream.status }
      );
    }

    // Determine content type from upstream or infer from filename
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
      headers["Content-Disposition"] = `attachment; filename="${encodeURIComponent(filename)}"`;
    } else {
      headers["Content-Disposition"] = `inline; filename="${encodeURIComponent(filename)}"`;
    }

    // Forward content-length if available (needed for video seeking)
    const contentLength = upstream.headers.get("content-length");
    if (contentLength) headers["Content-Length"] = contentLength;

    // Forward content-range for partial content (video seeking)
    const contentRange = upstream.headers.get("content-range");
    if (contentRange) headers["Content-Range"] = contentRange;

    const status = upstream.status; // 200 or 206 (partial)

    return new Response(upstream.body, { status, headers });
  } catch (err) {
    console.error("[media proxy] fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch from gateway" },
      { status: 502 }
    );
  }
}

function inferContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    // Images
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
    bmp: "image/bmp", ico: "image/x-icon",
    // Video
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
    avi: "video/x-msvideo", mkv: "video/x-matroska",
    // Audio
    mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg",
    flac: "audio/flac", aac: "audio/aac", m4a: "audio/mp4",
    // Documents
    pdf: "application/pdf",
    // Text / Code
    txt: "text/plain", md: "text/markdown",
    json: "application/json", js: "text/javascript",
    ts: "text/plain", tsx: "text/plain", jsx: "text/plain",
    css: "text/css", html: "text/html", xml: "text/xml",
    csv: "text/csv", yaml: "text/yaml", yml: "text/yaml",
    // Archives
    zip: "application/zip", tar: "application/x-tar",
    gz: "application/gzip", rar: "application/x-rar-compressed",
  };
  return map[ext] || "application/octet-stream";
}
