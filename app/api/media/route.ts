// app/api/media/route.ts
// Proxies blob content from Shelby storage nodes to avoid CORS issues.
//
// Shelby blob URL format (from SDK):
//   {baseUrl}/v1/blobs/{wallet}/{blobName}
// where blobName = raw blob_name from indexer, e.g. "@wallet/filename.jpg"
//
// The `blobref` param carries "network|rawBlobName" (set by shelbyAdapter).
// Falls back to trying both networks if no hint is given.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// RPC base URLs from @shelby-protocol/sdk NetworkToShelbyRPCBaseUrl
const RPC_BASE: Record<string, string> = {
  testnet:   process.env.SHELBY_RPC_URL_TESTNET || "https://api.testnet.shelby.xyz/shelby",
  shelbynet: process.env.SHELBY_RPC_URL_SHELBYNET || "https://api.shelbynet.shelby.xyz/shelby",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet   = searchParams.get("wallet");
  const name     = searchParams.get("name");     // display name (stripped)
  const blobref  = searchParams.get("blobref");  // "network|rawBlobName" from adapter
  const download = searchParams.get("download") === "1";
  const networkHint = searchParams.get("network"); // legacy fallback

  if (!wallet || !name) {
    return NextResponse.json({ error: "Missing wallet or name" }, { status: 400 });
  }

  // Parse blobref: "testnet|@wallet/filename.jpg"
  let rawBlobName: string | null = null;
  let primaryNetwork: string = networkHint || "testnet";

  if (blobref && blobref.includes("|")) {
    const pipeIdx = blobref.indexOf("|");
    primaryNetwork = blobref.slice(0, pipeIdx);
    rawBlobName = blobref.slice(pipeIdx + 1);
  }

  // If no rawBlobName from blobref, reconstruct it from wallet + name
  // Format: @{wallet_without_0x}/{name}
  if (!rawBlobName) {
    const walletNoPrefix = wallet.replace(/^0x/, "");
    rawBlobName = `@${walletNoPrefix}/${name}`;
  }

  // Build ordered list of networks to try
  const networksToTry = [
    primaryNetwork,
    ...Object.keys(RPC_BASE).filter(n => n !== primaryNetwork),
  ];

  const rangeHeader = req.headers.get("range");
  const filename = name.split("/").pop() ?? name;

  for (const net of networksToTry) {
    const base = RPC_BASE[net];
    if (!base) continue;

    // URL: {base}/v1/blobs/{wallet}/{rawBlobName}
    // rawBlobName may contain slashes — encode each segment but keep slashes
    const encodedBlobName = rawBlobName
      .split("/")
      .map(seg => encodeURIComponent(seg))
      .join("/");

    const blobUrl = `${base}/v1/blobs/${encodeURIComponent(wallet)}/${encodedBlobName}`;

    try {
      const upstream = await fetch(blobUrl, {
        headers: rangeHeader ? { Range: rangeHeader } : {},
      });

      if (!upstream.ok && upstream.status !== 206) {
        console.warn(`[media:${net}] ${upstream.status} for ${blobUrl}`);
        continue;
      }

      const contentType =
        upstream.headers.get("content-type") ||
        inferContentType(name);

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
      continue;
    }
  }

  return NextResponse.json(
    { error: "File not found on any Shelby network", wallet, name, rawBlobName },
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
