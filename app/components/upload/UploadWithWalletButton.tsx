"use client";

import { Wallet, Info } from "lucide-react";

interface Props {
  file: File;
  retentionDays: number;
  onSuccess: (metadata: any) => void;
  onError?: (error: string) => void;
}

/**
 * Browser wallet upload — currently not supported with Shelby SDK v0.2.4.
 *
 * The SDK's upload() requires a full Account object (private key) and calls
 * signTransactionWithAuthenticator() internally, which browser wallets don't expose.
 *
 * For large files (>4 MB), the recommended workaround is to use the Shelby CLI
 * or wait for SDK support for browser wallet signing.
 *
 * TODO: Implement when Shelby SDK adds browser wallet support or exposes
 * a lower-level API that accepts signAndSubmitTransaction.
 */
export default function UploadWithWalletButton({ file }: Props) {
  const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Info banner */}
      <div style={{
        padding: "12px 14px", borderRadius: "10px",
        background: "rgba(59,130,246,0.08)",
        border: "1px solid rgba(59,130,246,0.2)",
        fontSize: "0.78rem", color: "#60a5fa",
        display: "flex", alignItems: "flex-start", gap: "8px",
      }}>
        <Info size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
        <span>
          Upload via wallet belum tersedia untuk file {fileSizeMB} MB.
          Shelby SDK v0.2.4 memerlukan private key langsung dan belum mendukung
          browser wallet signing. Fitur ini akan tersedia di versi SDK berikutnya.
        </span>
      </div>

      {/* Disabled button */}
      <button
        disabled
        style={{
          width: "100%", padding: "11px",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.03)",
          color: "#334155",
          fontSize: "0.85rem", fontWeight: 600,
          cursor: "not-allowed",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
        }}
      >
        <Wallet size={14} />
        Upload dengan Wallet (Belum Tersedia)
      </button>

      <p style={{ fontSize: "0.68rem", color: "#334155", textAlign: "center", margin: 0 }}>
        Untuk file besar, gunakan Shelby CLI atau tunggu update SDK.
      </p>
    </div>
  );
}
