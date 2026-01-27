/**
 * Shelby Explorer API Route
 * 
 * Server-side proxy to avoid CORS issues when fetching from Shelby Explorer
 * Handles wallet file discovery and metadata extraction
 */

import { NextResponse } from "next/server";
import { searchWalletFiles } from "@/lib/shelby/explorerService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  console.log("🔍 SHELBY EXPLORER API REQUEST");
  
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');
    
    console.log("📋 WALLET PARAMETER:", wallet);

    if (!wallet) {
      return NextResponse.json(
        { 
          error: "Missing wallet parameter",
          details: "Wallet address is required",
          stage: "validation"
        },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{64}$/.test(wallet)) {
      return NextResponse.json(
        { 
          error: "Invalid wallet address",
          details: "Wallet address must be a valid Aptos address",
          stage: "validation"
        },
        { status: 400 }
      );
    }

    console.log("🔍 SEARCHING WALLET FILES FOR:", wallet);
    
    // Use the existing explorer service (server-side)
    const result = await searchWalletFiles(wallet);
    
    console.log("✅ WALLET SEARCH SUCCESS:", {
      fileCount: result.files.length,
      wallet: result.wallet,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("❌ WALLET SEARCH ERROR:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to search wallet files",
        details: error instanceof Error ? error.message : "Unknown error",
        stage: "execution"
      },
      { status: 500 }
    );
  }
}
