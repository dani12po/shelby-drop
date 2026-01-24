import { NextResponse } from "next/server";
import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";
import { Network } from "@aptos-labs/ts-sdk";

export const runtime = "nodejs";

type FolderItem = {
  id: string;
  name: string;
  path: string;
  type: "folder";
};

type FileItemData = {
  id: string;
  name: string;
  path: string;
  size: number;
  lastModified: string | null;
  contentType: string;
  type: "file";
};

const client = new ShelbyNodeClient({
  network: Network.SHELBYNET,
  apiKey: process.env.SHELBY_API_KEY!, // keep this, but header still needed
});

export async function GET(request: Request) {
  const origin =
    request.headers.get("origin") ??
    request.headers.get("referer") ??
    "http://localhost:3000";

  const apiKey = process.env.SHELBY_API_KEY!;
  const originalFetch = global.fetch;

  // 🔑 Inject REQUIRED headers for Shelby GraphQL
  global.fetch = async (input: any, init?: any) => {
    return originalFetch(input, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        Origin: origin,
        Authorization: `Bearer ${apiKey}`,
      },
    });
  };

  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet || !wallet.startsWith("0x")) {
      return NextResponse.json(
        { folders: [], files: [], error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const listResult = await client.coordination.getAccountBlobs({
      account: wallet,
    });

    const folders: FolderItem[] = [];

    const files: FileItemData[] = (listResult ?? []).map((blob: any) => ({
      id: blob.blob_name,
      name: blob.blob_name,
      path: blob.blob_name,
      size: blob.size ?? 0,
      lastModified: blob.created_at
        ? new Date(blob.created_at).toISOString()
        : null,
      contentType: "application/octet-stream",
      type: "file",
    }));

    return NextResponse.json({ folders, files });
  } catch (error) {
    console.error("[SHELBY_LIST_ERROR]", error);
    return NextResponse.json(
      { folders: [], files: [], error: "Failed to list Shelby blobs" },
      { status: 500 }
    );
  } finally {
    // 🔁 Restore global fetch
    global.fetch = originalFetch;
  }
}
