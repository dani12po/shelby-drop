// app/lib/retention/cleanup.ts

import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(
  process.cwd(),
  "public/uploads"
);

type CleanupResult = {
  scanned: number;
  deleted: number;
};

export async function runRetentionCleanup(): Promise<CleanupResult> {
  let scanned = 0;
  let deleted = 0;

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      // Only metadata files
      if (!entry.name.endsWith(".json")) continue;

      scanned++;

      try {
        const raw = await fs.readFile(
          fullPath,
          "utf-8"
        );
        const meta = JSON.parse(raw);

        if (!meta.expiresAt) continue;

        const expired =
          Date.now() >
          new Date(meta.expiresAt).getTime();

        if (!expired) continue;

        const dataFile = fullPath.replace(
          /\.json$/,
          ""
        );

        // Delete file + metadata
        await fs.rm(dataFile, {
          force: true,
        });
        await fs.rm(fullPath, {
          force: true,
        });

        deleted++;
      } catch {
        // Corrupt metadata → skip
        continue;
      }
    }
  }

  try {
    await walk(UPLOAD_DIR);
  } catch {
    // uploads folder might not exist yet
  }

  return { scanned, deleted };
}
