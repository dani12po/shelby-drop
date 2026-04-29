import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock process.env before importing
vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://shelby-drop.vercel.app");

import { buildShareUrl } from "@/lib/share/buildShareUrl";

describe("buildShareUrl", () => {
  const wallet = "0x50093856644bfcf8e33e3979b52f1a71f79f24a6ed7da94aa92b5b4057e0d0bb";

  it("builds correct URL for simple filename", () => {
    const url = buildShareUrl(wallet, "file.png");
    expect(url).toBe(
      `https://shelby-drop.vercel.app/share/${encodeURIComponent(wallet)}/file.png`
    );
  });

  it("encodes spaces in filename", () => {
    const url = buildShareUrl(wallet, "my file.mp4");
    expect(url).toContain("my%20file.mp4");
  });

  it("encodes filename with special chars", () => {
    const url = buildShareUrl(wallet, "1777402585251-Cuplikan layar 2026-04-11 064125.png");
    expect(url).toContain("1777402585251-Cuplikan%20layar%202026-04-11%20064125.png");
  });

  it("handles nested path", () => {
    const url = buildShareUrl(wallet, "images/cover.png");
    expect(url).toContain("images/cover.png");
  });

  it("always starts with base URL", () => {
    const url = buildShareUrl(wallet, "test.txt");
    expect(url.startsWith("https://shelby-drop.vercel.app/share/")).toBe(true);
  });
});
