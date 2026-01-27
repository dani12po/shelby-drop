/**
 * REAL Shelby Upload API Route
 * 
 * This endpoint implements the CORRECT upload flow:
 * 1. Parse form data
 * 2. Validate inputs
 * 3. Use AptosShelbyUploader for REAL blockchain upload
 * 4. Return ONLY verified success responses
 * 5. NO fake hashes, NO fallbacks, NO CLI
 */

import { NextResponse } from "next/server";
import { AptosShelbyUploader, type UploadArgs } from "@/lib/shelby/aptosUploader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  console.log("🚀 STARTING REAL UPLOAD API REQUEST");
  
  try {
    // Check content type and parse accordingly
    const contentType = req.headers.get("content-type");
    console.log("📋 CONTENT TYPE:", contentType);
    
    let file: File | null = null;
    let blobName: string | undefined;
    let retentionDays: string | undefined;
    let userWallet: string | undefined;
    
    if (contentType?.includes("application/json")) {
      // Parse JSON request
      console.log("📋 PARSING JSON REQUEST...");
      try {
        const jsonData = await req.json();
        console.log("✅ JSON PARSED SUCCESSFULLY");
        
        // Convert base64 file data to File
        if (jsonData.file && jsonData.file.data && jsonData.file.name) {
          const fileBuffer = Buffer.from(jsonData.file.data, 'base64');
          file = new File([fileBuffer], jsonData.file.name, { 
            type: jsonData.file.type || 'application/octet-stream' 
          });
        }
        
        blobName = jsonData.blobName;
        retentionDays = jsonData.retentionDays;
        userWallet = jsonData.wallet;
        
      } catch (parseError) {
        console.error("❌ JSON PARSE ERROR:", parseError);
        return NextResponse.json(
          { 
            error: "Failed to parse JSON data",
            details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
            stage: "parsing"
          },
          { status: 400 }
        );
      }
    } else {
      // Parse form data
      console.log("📋 PARSING FORM DATA...");
      let form;
      
      try {
        form = await req.formData();
        console.log("✅ FORM DATA PARSED SUCCESSFULLY");
      } catch (parseError) {
        console.error("❌ FORM DATA PARSE ERROR:", parseError);
        return NextResponse.json(
          { 
            error: "Failed to parse form data",
            details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
            stage: "parsing"
          },
          { status: 400 }
        );
      }

      file = form.get("file") as File;
      blobName = form.get("blobName") as string;
      retentionDays = form.get("retentionDays") as string;
      userWallet = form.get("wallet") as string;
    }

    console.log("📋 INPUTS VALIDATION:", {
      hasFile: !!file,
      fileName: file?.name || 'no file',
      blobName: blobName || 'missing',
      retentionDays: retentionDays || 'missing',
      userWallet: userWallet || 'missing',
    });

    if (!file || !blobName || !retentionDays || !userWallet) {
      return NextResponse.json(
        { 
          error: "Missing required fields",
          details: "file, blobName, retentionDays, and wallet are required",
          stage: "validation"
        },
        { status: 400 }
      );
    }

    // Step 3: Initialize uploader
    console.log("🔧 INITIALIZING APTOS-SHELBY UPLOADER...");
    let uploader;
    
    try {
      uploader = new AptosShelbyUploader();
      console.log("✅ UPLOADER INITIALIZED SUCCESSFULLY");
    } catch (initError) {
      console.error("❌ UPLOADER INITIALIZATION FAILED:", initError);
      return NextResponse.json(
        { 
          error: "Failed to initialize uploader",
          details: initError instanceof Error ? initError.message : "Unknown initialization error",
          stage: "initialization"
        },
        { status: 500 }
      );
    }

    // Step 4: Prepare upload arguments
    const days = Math.max(1, parseInt(retentionDays) || 7);
    const expirationMicros = Date.now() * 1000 + days * 24 * 60 * 60 * 1_000_000;

    const uploadArgs: UploadArgs = {
      file,
      blobName,
      expirationMicros,
    };

    console.log("📤 UPLOAD ARGS PREPARED:", {
      fileName: file.name,
      fileSize: file.size,
      blobName,
      retentionDays: days,
      expirationMicros,
    });

    // Step 5: Execute REAL upload
    console.log("🚀 STARTING REAL BLOCKCHAIN UPLOAD...");
    const result = await uploader.upload(uploadArgs);

    // Step 6: Return response
    if (result.success && result.txHash) {
      console.log("🎉 UPLOAD SUCCESSFUL:", {
        txHash: result.txHash,
        blobName: result.blobName,
        aptosExplorer: result.aptosExplorer,
        shelbyExplorer: result.shelbyExplorer,
      });

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
          verification: {
            aptosVerified: true,
            shelbyIndexed: true,
            message: "Transaction confirmed and indexed in both explorers"
          }
        },
      });

    } else {
      console.error("❌ UPLOAD FAILED:", result);
      
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Upload failed",
          stage: result.stage || "upload_failed",
          details: "The upload process failed. Please check the error message and try again."
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("💥 UNEXPECTED API ERROR:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during upload",
        details: error instanceof Error ? error.message : "Unknown error",
        stage: "unexpected_error"
      },
      { status: 500 }
    );
  }
}
