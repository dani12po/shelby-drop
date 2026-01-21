import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");

  if (!wallet || !wallet.startsWith("0x")) {
    return NextResponse.json(
      { error: "Invalid wallet address" },
      { status: 400 }
    );
  }

  const dir = path.join(
    process.cwd(),
    "public",
    "uploads",
    wallet
  );

  try {
    const files = await fs.readdir(dir);

    const metadataFiles = files.filter((f) =>
      f.endsWith(".json")
    );

    const list = await Promise.all(
      metadataFiles.map(async (file) => {
        const content = await fs.readFile(
          path.join(dir, file),
          "utf-8"
        );
        return JSON.parse(content);
      })
    );

    return NextResponse.json({
      wallet,
      files: list,
    });
  } catch {
    return NextResponse.json({
      wallet,
      files: [],
    });
  }
}
