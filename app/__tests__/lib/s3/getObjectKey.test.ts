/// <reference types="vitest/globals" />
// app/__tests__/lib/s3/getObjectKey.test.ts
import { getObjectKey } from "@/lib/s3/getObjectKey";
import type { FileItemData } from "@/lib/data";

const wallet = "0xabc123";

function makeFile(name: string, path: string[] = []): FileItemData {
  return {
    id: "test-id",
    type: "file",
    name,
    path,
    size: 100,
    mimeType: "image/png",
    uploader: wallet,
    uploadedAt: new Date().toISOString(),
  };
}

describe("getObjectKey", () => {
  it("builds key for root file (empty path)", () => {
    const key = getObjectKey(wallet, makeFile("photo.png", []));
    expect(key).toBe(`${encodeURIComponent(wallet)}/photo.png`);
  });

  it("builds key for file in subfolder", () => {
    const key = getObjectKey(wallet, makeFile("cover.png", ["images"]));
    expect(key).toBe(`${encodeURIComponent(wallet)}/images/cover.png`);
  });

  it("encodes spaces in filename", () => {
    const key = getObjectKey(wallet, makeFile("my file.mp4", []));
    expect(key).toContain("my%20file.mp4");
  });

  it("encodes complex blob name", () => {
    const name = "1777402585251-Cuplikan layar 2026-04-11 064125.png";
    const key = getObjectKey(wallet, makeFile(name, []));
    expect(key).toContain(encodeURIComponent(name));
  });

  it("does not double-encode wallet", () => {
    const key = getObjectKey(wallet, makeFile("file.txt", []));
    expect(key.startsWith(encodeURIComponent(wallet))).toBe(true);
  });

  it("filters empty path segments", () => {
    const key = getObjectKey(wallet, makeFile("file.txt", ["", "folder", ""]));
    expect(key).toBe(`${encodeURIComponent(wallet)}/folder/file.txt`);
  });
});
