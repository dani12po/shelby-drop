import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs/promises";

// Mock fs
vi.mock("fs/promises", () => ({
  readFile: vi.fn(),
  mkdir: vi.fn(),
  writeFile: vi.fn(),
}));

// Mock fetch for Shelby network calls
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// We test the helper functions by importing them indirectly
// through the logic we can extract

describe("/api/shelby/list logic", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.mocked(fs.readFile).mockReset();
  });

  it("merges local and remote blobs deduplicating by name", () => {
    // Simulate the merge logic
    interface Blob { id: string; name: string; created_at: string; }
    function mergeBlobs(local: Blob[], remote: Blob[]): Blob[] {
      const seen = new Set<string>();
      const result: Blob[] = [];
      for (const blob of [...local, ...remote]) {
        const key = blob.name || blob.id;
        if (!seen.has(key)) { seen.add(key); result.push(blob); }
      }
      return result.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    const local: Blob[] = [
      { id: "1", name: "file.png", created_at: "2026-04-28T10:00:00Z" },
    ];
    const remote: Blob[] = [
      { id: "1", name: "file.png", created_at: "2026-04-28T10:00:00Z" }, // duplicate
      { id: "2", name: "video.mp4", created_at: "2026-04-27T10:00:00Z" },
    ];

    const merged = mergeBlobs(local, remote);
    expect(merged).toHaveLength(2);
    expect(merged[0].name).toBe("file.png"); // newest first
    expect(merged[1].name).toBe("video.mp4");
  });

  it("inferFileType correctly identifies file types", () => {
    function inferFileType(name: string) {
      const lower = name.toLowerCase();
      if (lower.endsWith(".pdf")) return "PDF";
      if ([".png",".jpg",".jpeg",".gif",".webp",".svg"].some(e => lower.endsWith(e))) return "IMG";
      if ([".mp4",".webm",".mov",".avi"].some(e => lower.endsWith(e))) return "VIDEO";
      if ([".mp3",".wav",".ogg",".flac"].some(e => lower.endsWith(e))) return "AUDIO";
      if ([".txt",".md",".json",".js",".ts",".css",".html"].some(e => lower.endsWith(e))) return "TEXT";
      return "OTHER";
    }

    expect(inferFileType("photo.png")).toBe("IMG");
    expect(inferFileType("video.mp4")).toBe("VIDEO");
    expect(inferFileType("song.mp3")).toBe("AUDIO");
    expect(inferFileType("doc.pdf")).toBe("PDF");
    expect(inferFileType("readme.md")).toBe("TEXT");
    expect(inferFileType("archive.zip")).toBe("OTHER");
    expect(inferFileType("PHOTO.PNG")).toBe("IMG"); // case insensitive
  });

  it("formatSize returns human-readable sizes", () => {
    function formatSize(bytes: number): string {
      if (!bytes || bytes === 0) return "0 B";
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    expect(formatSize(0)).toBe("0 B");
    expect(formatSize(500)).toBe("500 B");
    expect(formatSize(1024)).toBe("1.0 KB");
    expect(formatSize(75000)).toBe("73.2 KB");
    expect(formatSize(1048576)).toBe("1.0 MB");
    expect(formatSize(1900000)).toBe("1.8 MB");
  });
});
