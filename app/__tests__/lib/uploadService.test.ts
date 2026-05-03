/// <reference types="vitest/globals" />
// app/__tests__/lib/uploadService.test.ts

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { uploadToShelby } from "@/lib/uploadService";

const mockFile = new File(["hello"], "test.png", { type: "image/png" });
const wallet = "0x50093856644bfcf8e33e3979b52f1a71f79f24a6ed7da94aa92b5b4057e0d0bb";

const successResponse = {
  success: true,
  metadata: {
    wallet,
    originalName: "test.png",
    storedName: "1234-test.png",
    blob_name: "1234-test.png",
    size: 5,
    mime: "image/png",
    hash: "0xabc",
    retentionDays: 7,
    expiresAt: "2026-05-01T00:00:00.000Z",
    uploadedAt: "2026-04-28T00:00:00.000Z",
  },
};

beforeEach(() => {
  mockFetch.mockReset();
});

describe("uploadToShelby", () => {
  it("returns metadata on success", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => successResponse,
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) }); // /api/upload/complete

    const result = await uploadToShelby({ file: mockFile, wallet, retentionDays: 7 });

    expect(result.wallet).toBe(wallet);
    expect(result.blob_name).toBe("1234-test.png");
    expect(result.mime).toBe("image/png");
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => "Upload failed",
    });

    await expect(uploadToShelby({ file: mockFile, wallet, retentionDays: 7 }))
      .rejects.toThrow("Upload failed");
  });

  it("throws when metadata is missing", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }), // no metadata field
    });

    await expect(uploadToShelby({ file: mockFile, wallet, retentionDays: 7 }))
      .rejects.toThrow("metadata is missing");
  });

  it("calls /api/upload/complete after success", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => successResponse })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });

    await uploadToShelby({ file: mockFile, wallet, retentionDays: 7 });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    const secondCall = mockFetch.mock.calls[1];
    expect(secondCall[0]).toBe("/api/upload/complete");
  });

  it("does not throw if /api/upload/complete fails", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => successResponse })
      .mockRejectedValueOnce(new Error("network error")); // complete fails

    // Should not throw
    const result = await uploadToShelby({ file: mockFile, wallet, retentionDays: 7 });
    expect(result.blob_name).toBe("1234-test.png");
  });
});
