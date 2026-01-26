import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Shelby list API is currently DISABLED.
 *
 * Reason:
 * - Shelby does not expose public listing APIs
 * - Listing requires privileged API key + origin whitelist
 * - Explorer is operating in VIEWER MODE (connected wallet only)
 *
 * This route is intentionally kept as a placeholder
 * and can be re-enabled once official Shelby API access is granted.
 */
export async function GET() {
  return NextResponse.json(
    {
      disabled: true,
      reason:
        "Shelby list API is disabled pending official API access from Shelby team",
      folders: [],
      files: [],
    },
    { status: 503 }
  );
}
