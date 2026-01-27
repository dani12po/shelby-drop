/**
 * CLI-Compatible Upload API
 * 
 * This endpoint uses the same upload method as Shelby CLI
 * to ensure files are properly registered in Shelby Explorer.
 */

import { NextResponse } from "next/server";
import { CliCompatibleUploader, type CliUploadConfig } from "@/lib/shelby/cliCompatibleUploader";
import { shelbyConfig } from "@/config/shelby";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===============================
   POST /api/upload/cli
   CLI-Compatible upload endpoint
================================ */
export async function POST(req: Request) {
  try {
    /* ===============================
       VALIDATE CONFIGURATION
    ================================ */
    const configValidation = CliCompatibleUploader.validateConfig();
    if (!configValidation.valid) {
      return NextResponse.json(
        { 
          error: "Server configuration error: Shelby wallet credentials not configured",
          details: configValidation.error
        },
        { status: 500 }
      );
    }

    /* ===============================
       PARSE FORM DATA
    ================================ */
    const form = await req.formData();
    const file = form.get("file");
    const blobName = form.get("blobName") as string;
    const retentionDays = form.get("retentionDays") as string;
    const userWallet = form.get("wallet") as string;

    /* ===============================
       VALIDATE INPUTS
    ================================ */
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Invalid file" },
        { status: 400 }
      );
    }

    if (!blobName) {
      return NextResponse.json(
        { error: "Blob name is required" },
        { status: 400 }
      );
    }

    if (!userWallet) {
      return NextResponse.json(
        { error: "User wallet is required" },
        { status: 400 }
      );
    }

    const days = Math.max(1, parseInt(retentionDays) || 7); // Default 7 days
    const expirationMicros = CliCompatibleUploader.calculateExpirationMicros(days);

    /* ===============================
       INITIALIZE UPLOADER
    ================================ */
    const uploader = new CliCompatibleUploader();

    /* ===============================
       UPLOAD TO SHELBY (CLI-style)
    ================================ */
    const result = await uploader.upload({
      file,
      blobName,
      expirationMicros,
    });

    /* ===============================
       RESPONSE
    ================================ */
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "File uploaded successfully to Shelby network",
        data: {
          blobName: result.blobName,
          txHash: result.txHash,
          uploadedAt: result.uploadedAt,
          userWallet,
          retentionDays: days,
          expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
          explorerUrls: {
            aptos: result.aptosExplorer,
            shelby: result.shelbyExplorer,
          },
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: "Upload failed",
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("CLI Upload API Error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error during upload",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
