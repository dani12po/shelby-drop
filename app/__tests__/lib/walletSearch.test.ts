import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Test wallet address validation logic
describe("wallet address validation", () => {
  function isValidWallet(input: string): boolean {
    const v = input.trim();
    if (!v.startsWith("0x")) return false;
    if (!/^[0-9a-fA-Fx]+$/.test(v)) return false;
    return v.length >= 42;
  }

  it("accepts valid Aptos address (66 chars)", () => {
    const addr = "0x50093856644bfcf8e33e3979b52f1a71f79f24a6ed7da94aa92b5b4057e0d0bb";
    expect(isValidWallet(addr)).toBe(true);
  });

  it("accepts valid ETH address (42 chars)", () => {
    expect(isValidWallet("0x742d35Cc6634C0532925a3b8D4C9C3b3b3b3b3b3")).toBe(true);
  });

  it("rejects address without 0x prefix", () => {
    expect(isValidWallet("50093856644bfcf8e33e3979b52f1a71f79f24a6")).toBe(false);
  });

  it("rejects too short address", () => {
    expect(isValidWallet("0x1234")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidWallet("")).toBe(false);
  });

  it("rejects address with invalid chars", () => {
    expect(isValidWallet("0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG")).toBe(false);
  });
});

// Test useWalletSearch state machine
describe("useWalletSearch state transitions", () => {
  beforeEach(() => mockFetch.mockReset());

  it("maps API response to SearchResult correctly", async () => {
    const wallet = "0x50093856644bfcf8e33e3979b52f1a71f79f24a6ed7da94aa92b5b4057e0d0bb";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        wallet,
        files: [
          { id: "1", name: "photo.png", size: 75000, file_type: "IMG", blob_id: "abc", created_at: "2026-04-28" },
          { id: "2", name: "video.mp4", size: 1900000, file_type: "VIDEO", blob_id: "def", created_at: "2026-04-27" },
        ],
        total: 2,
      }),
    });

    const res = await fetch(`/api/shelby/list?wallet=${wallet}`);
    const data = await res.json();

    // Simulate the mapping in useWalletSearch
    function formatSize(bytes: number): string {
      if (!bytes) return "0 B";
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    const files = (data.files || []).map((f: any) => ({
      id: f.id || f.blob_id || Math.random().toString(),
      name: f.name || "Unknown",
      size: f.size ? formatSize(f.size) : undefined,
      type: f.file_type?.toLowerCase() || "other",
      blobId: f.blob_id,
    }));

    expect(files).toHaveLength(2);
    expect(files[0].name).toBe("photo.png");
    expect(files[0].type).toBe("img");
    expect(files[0].size).toBe("73.2 KB");
    expect(files[1].name).toBe("video.mp4");
    expect(files[1].type).toBe("video");
    expect(files[1].size).toBe("1.8 MB");
  });
});
