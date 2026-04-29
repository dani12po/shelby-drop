// app/api/shelby/list/route.ts
// Lists blobs for a wallet by querying the Shelby storage API directly.
// This works on Vercel (no filesystem dependency).

import { NextResponse } from "next/server";
import { getNetworkConfig } from "@/config/shelby";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ── types ── */
interface BlobItem {
  id: string;
  name: string;
  blob_id: string;
  size: number;
  created_at: string;
  creator: string;
}

/* ── helpers ── */
function inferFileType(name: string): "PDF" | "IMG" | "VIDEO" | "AUDIO" | "TEXT" | "OTHER" {
  const lower = name.toLowerCase();
  if (lower.match(/\.(pdf)$/)) return "PDF";
  if (lower.match(/\.(png|jpg|jpeg|gif|webp|svg|bmp|ico)$/)) return "IMG";
  if (lower.match(/\.(mp4|webm|mov|avi|mkv)$/)) return "VIDEO";
  if (lower.match(/\.(mp3|wav|ogg|flac|aac|m4a)$/)) return "AUDIO";
  if (lower.match(/\.(txt|md|json|js|ts|tsx|jsx|css|html|xml|csv|yaml|yml)$/)) return "TEXT";
  return "OTHER";
}

/* ── fetch blobs from Shelby REST API ── */
async function fetchBlobsFromShelby(
  wallet: string,
  blobBaseUrl: string
): Promise<BlobItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    // Shelby blob list endpoint: GET /shelby/v1/blobs/{account}
    const url = `${blobBaseUrl}/${encodeURIComponent(wallet)}`;
    console.log("[shelby/list] fetching:", url);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "Accept": "application/json" },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[shelby/list] API returned ${res.status}`);
      return [];
    }

    const data = await res.json();

    // Handle array response or {blobs: [...]} shape
    const blobs: any[] = Array.isArray(data)
      ? data
      : (data.blobs ?? data.data ?? data.items ?? []);

    return blobs.map((b: any, i: number) => ({
      id:         b.blob_id ?? b.id ?? `blob-${i}`,
      name:       b.name ?? b.blob_name ?? `blob_${i}`,
      blob_id:    b.blob_id ?? b.id ?? "",
      size:       typeof b.size === "number" ? b.size : 0,
      created_at: b.created_at ?? b.inserted_at ?? b.createdAt ?? new Date().toISOString(),
      creator:    wallet,
    }));
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      console.warn("[shelby/list] request timed out");
    } else {
      console.warn("[shelby/list] fetch error:", err.message);
    }
    return [];
  }
}

/* ── GET /api/shelby/list ── */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet  = searchParams.get("wallet");
  const network = searchParams.get("network");

  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet parameter" }, { status: 400 });
  }
  if (!wallet.startsWith("0x") || wallet.length < 10) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  const cfg = getNetworkConfig(network);

  const blobs = await fetchBlobsFromShelby(wallet, cfg.blobBaseUrl);

  // Sort newest first
  blobs.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return NextResponse.json({
    wallet,
    files: blobs,
    total: blobs.length,
    network: cfg.aptosNetwork,
  });
}
