import { NextResponse } from "next/server";
import { AptosShelbyUploader } from "@/lib/shelby/aptosUploader";
import { shelbyConfig } from "@/config/shelby";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const blobName = formData.get("blobName") as string;
    const wallet = formData.get("wallet") as string;
    const retentionDays = parseInt(formData.get("retentionDays") as string || "7");

    if (!file || !blobName || !wallet) {
      return NextResponse.json(
        { success: false, error: "Missing required fields", message: "file, blobName, and wallet are required" },
        { status: 400 }
      );
    }

    const uploader = new AptosShelbyUploader();
    
    // Calculate expiration in microseconds
    const nowMicros = BigInt(Date.now()) * 1000n;
    const retentionMicros = BigInt(retentionDays) * 24n * 60n * 60n * 1000000n;
    const expirationMicros = nowMicros + retentionMicros;

    const result = await uploader.upload({
      file,
      blobName,
      expirationMicros,
    });

    if (!result.success || !result.txHash) {
      throw new Error(result.error || "Upload failed");
    }

    const expiresAt = new Date(Number(expirationMicros / 1000n)).toISOString();

    return NextResponse.json({
      success: true,
      data: {
        blobName,
        txHash: result.txHash,
        uploadedAt: new Date().toISOString(),
        userWallet: wallet,
        retentionDays,
        expiresAt,
        explorerUrls: {
          aptos: shelbyConfig.getTransactionUrl(result.txHash),
          shelby: shelbyConfig.getShelbyTransactionUrl(result.txHash),
        }
      }
    });

  } catch (error: any) {
    console.error("❌ CLI UPLOAD ERROR:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.name || "UploadError", 
        message: error.message || "An unexpected error occurred during CLI upload" 
      },
      { status: 500 }
    );
  }
}
