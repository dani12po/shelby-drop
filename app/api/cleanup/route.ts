import { NextResponse } from "next/server";
import { runRetentionCleanup } from "@/lib/retention/cleanup";

export const runtime = "nodejs";

export async function POST() {
  const result = await runRetentionCleanup();

  return NextResponse.json({
    success: true,
    ...result,
  });
}
