/// <reference types="vitest/globals" />
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { loadWalletFilesFromShelby } from "@/components/explorer/adapters/shelbyAdapter";

const wallet = "0x50093856644bfcf8e33e3979b52f1a71f79f24a6ed7da94aa92b5b4057e0d0bb";

beforeEach(() => mockFetch.mockReset());

describe("loadWalletFilesFromShelby", () => {
  it("returns items from /api/shelby/list", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        wallet,
        files: [
          { id: "1", name: "photo.png", size: 75000, created_at: "2026-04-28T00:00:00Z" },
          { id: "2", name: "video.mp4", size: 1900000, created_at: "2026-04-27T00:00:00Z" },
        ],
        total: 2,
      }),
    });

    const result = await loadWalletFilesFromShelby(wallet);

    expect(result.items).toHaveLength(2);
    expect(result.rawItems).toHaveLength(2);
    expect(result.items[0].name).toBe("photo.png");
    expect(result.items[1].name).toBe("video.mp4");
  });

  it("assigns correct mimeType for images", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        files: [{ id: "1", name: "photo.png", size: 1000 }],
        total: 1,
      }),
    });

    const result = await loadWalletFilesFromShelby(wallet);
    const raw = result.rawItems[0] as { mimeType?: string };
    expect(raw.mimeType).toBe("image/png");
  });

  it("assigns correct mimeType for video", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        files: [{ id: "1", name: "video.mp4", size: 1000 }],
        total: 1,
      }),
    });

    const result = await loadWalletFilesFromShelby(wallet);
    const raw = result.rawItems[0] as { mimeType?: string };
    expect(raw.mimeType).toBe("video/mp4");
  });

  it("returns empty arrays on fetch error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network error"));

    const result = await loadWalletFilesFromShelby(wallet);
    expect(result.items).toHaveLength(0);
    expect(result.rawItems).toHaveLength(0);
  });

  it("returns empty arrays on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const result = await loadWalletFilesFromShelby(wallet);
    expect(result.items).toHaveLength(0);
  });

  it("sets path to empty array for all files", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        files: [{ id: "1", name: "file.txt", size: 100 }],
        total: 1,
      }),
    });

    const result = await loadWalletFilesFromShelby(wallet);
    const raw = result.rawItems[0] as { path?: string[] };
    expect(raw.path).toEqual([]);
  });
});
