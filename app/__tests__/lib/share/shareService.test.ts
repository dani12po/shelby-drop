/// <reference types="vitest/globals" />
// app/__tests__/lib/share/shareService.test.ts

// Mock localStorage
const store: Record<string, string> = {};
vi.stubGlobal("localStorage", {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
});

import { createShare, getShareMapping, createShareUrl } from "@/lib/share/shareService";

const wallet = "0x50093856644bfcf8e33e3979b52f1a71f79f24a6ed7da94aa92b5b4057e0d0bb";

beforeEach(() => {
  localStorage.clear();
});

describe("shareService", () => {
  it("createShare returns an 8-char code", () => {
    const code = createShare(wallet, "file.png");
    expect(code).toHaveLength(8);
    expect(typeof code).toBe("string");
  });

  it("getShareMapping returns the mapping for a valid code", () => {
    const code = createShare(wallet, "file.png");
    const mapping = getShareMapping(code);
    expect(mapping).not.toBeNull();
    expect(mapping!.wallet).toBe(wallet);
    expect(mapping!.filename).toBe("file.png");
  });

  it("getShareMapping returns null for unknown code", () => {
    expect(getShareMapping("XXXXXXXX")).toBeNull();
  });

  it("getShareMapping returns null for expired share", () => {
    const code = createShare(wallet, "file.png");
    // Manually expire it
    const raw = localStorage.getItem("shelby-drop-shares");
    const shares = JSON.parse(raw!);
    shares[code].expiresAt = new Date(Date.now() - 1000).toISOString();
    localStorage.setItem("shelby-drop-shares", JSON.stringify(shares));

    expect(getShareMapping(code)).toBeNull();
  });

  it("createShareUrl includes the code", () => {
    const code = createShare(wallet, "file.png");
    const url = createShareUrl(code);
    expect(url).toContain(code);
  });

  it("two shares have different codes", () => {
    const code1 = createShare(wallet, "a.png");
    const code2 = createShare(wallet, "b.png");
    expect(code1).not.toBe(code2);
  });
});
