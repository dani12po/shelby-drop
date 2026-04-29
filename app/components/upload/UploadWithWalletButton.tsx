"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useNetwork } from "@/hooks/useNetwork";
import { useNotifications } from "@/components/notifications/useNotifications";
import { uploadWithBrowserWallet } from "@/lib/shelby/browserUploader";
import { CheckCircle2, Loader2, Wallet, ExternalLink } from "lucide-react";
import type { UploadMetadata } from "@/lib/uploadService";

interface Props {
  file: File;
  retentionDays: number;
  onSuccess: (metadata: UploadMetadata) => void;
  onError?: (error: string) => void;
}

type UploadStep =
  | "idle"
  | "preparing"
  | "waiting_signature"
  | "uploading"
  | "confirming"
  | "done"
  | "error";

const STEP_LABELS: Record<UploadStep, string> = {
  idle:              "Upload dengan Wallet",
  preparing:         "Menyiapkan file...",
  waiting_signature: "Menunggu konfirmasi di wallet...",
  uploading:         "Mengupload ke Shelby...",
  confirming:        "Mengkonfirmasi transaksi...",
  done:              "Upload berhasil!",
  error:             "Coba lagi",
};

export default function UploadWithWalletButton({
  file,
  retentionDays,
  onSuccess,
  onError,
}: Props) {
  const { signAndSubmitTransaction, account } = useWallet();
  const { network } = useNetwork();
  const { notify } = useNotifications();
  const [step, setStep] = useState<UploadStep>("idle");
  const [txHash, setTxHash] = useState("");

  const isActive = step !== "idle" && step !== "done" && step !== "error";

  async function handleUpload() {
    if (!account?.address) {
      notify("error", "Wallet belum terkoneksi");
      return;
    }

    setStep("preparing");
    setTxHash("");

    const blobName = `${Date.now()}-${file.name}`;
    const expirationMicros =
      Date.now() * 1000 + retentionDays * 24 * 60 * 60 * 1_000_000;

    setStep("waiting_signature");

    const result = await uploadWithBrowserWallet({
      file,
      blobName,
      expirationMicros,
      network: network as "testnet" | "shelbynet",
      signAndSubmitTransaction: async (tx) => {
        setStep("uploading");
        const response = await signAndSubmitTransaction(tx as any);
        setStep("confirming");
        return response as { hash: string };
      },
    });

    if (result.success && result.txHash) {
      setTxHash(result.txHash);
      setStep("done");
      notify("success", "Upload berhasil! File tersimpan di blockchain.");

      // Record in local index so it shows up in explorer immediately
      try {
        await fetch("/api/upload/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet: account.address.toString(),
            blob_name: blobName,
            size: file.size,
            contentType: file.type || "application/octet-stream",
            createdAt: result.uploadedAt,
          }),
        });
      } catch {
        // Non-critical
      }

      onSuccess({
        wallet: account.address.toString(),
        originalName: file.name,
        storedName: blobName,
        blob_name: blobName,
        size: file.size,
        mime: file.type || "application/octet-stream",
        hash: result.txHash,
        retentionDays,
        expiresAt: null,
        uploadedAt: result.uploadedAt || new Date().toISOString(),
      });
    } else {
      setStep("error");
      const errMsg = result.error || "Upload gagal";
      notify("error", errMsg);
      onError?.(errMsg);
    }
  }

  const explorerBase =
    network === "shelbynet"
      ? "https://explorer.aptoslabs.com"
      : "https://explorer.aptoslabs.com";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Wallet confirmation info */}
      {step === "waiting_signature" && (
        <div style={{
          padding: "10px 14px", borderRadius: "10px",
          background: "rgba(251,191,36,0.08)",
          border: "1px solid rgba(251,191,36,0.25)",
          fontSize: "0.78rem", color: "#fbbf24",
          display: "flex", alignItems: "flex-start", gap: "8px",
        }}>
          <Wallet size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
          <span>
            <strong>Cek wallet kamu</strong> — Petra atau wallet Aptos kamu akan
            menampilkan popup konfirmasi transaksi. Gas fee dikenakan dalam APT.
          </span>
        </div>
      )}

      {/* Progress */}
      {isActive && (
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          fontSize: "0.78rem", color: "#94a3b8",
        }}>
          <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
          <span>{STEP_LABELS[step]}</span>
        </div>
      )}

      {/* Success */}
      {step === "done" && txHash && (
        <div style={{
          padding: "8px 12px", borderRadius: "8px",
          background: "rgba(16,185,129,0.08)",
          border: "1px solid rgba(16,185,129,0.2)",
          fontSize: "0.75rem", color: "#34d399",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <CheckCircle2 size={13} />
          <span>Upload berhasil! File tersimpan di blockchain.</span>
          <a
            href={`${explorerBase}/txn/${txHash}?network=${network}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#34d399", marginLeft: "auto", display: "flex", alignItems: "center", gap: "3px" }}
          >
            <ExternalLink size={11} /> Tx
          </a>
        </div>
      )}

      {/* Button */}
      <button
        onClick={handleUpload}
        disabled={isActive}
        style={{
          width: "100%", padding: "11px",
          borderRadius: "10px",
          border: "1px solid rgba(139,92,246,0.3)",
          background: isActive ? "rgba(255,255,255,0.04)" : "rgba(139,92,246,0.1)",
          color: isActive ? "#475569" : "#a78bfa",
          fontSize: "0.85rem", fontWeight: 600,
          cursor: isActive ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
        }}
        onMouseEnter={e => {
          if (!isActive) {
            e.currentTarget.style.background = "rgba(139,92,246,0.2)";
            e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)";
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            e.currentTarget.style.background = "rgba(139,92,246,0.1)";
            e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)";
          }
        }}
      >
        <Wallet size={14} />
        {step === "idle"  ? "Upload dengan Wallet (Self-Pay Gas)" :
         step === "done"  ? "Upload Lagi" :
         step === "error" ? "Coba Lagi" :
         STEP_LABELS[step]}
      </button>

      <p style={{ fontSize: "0.68rem", color: "#475569", textAlign: "center", margin: 0 }}>
        File terdaftar di wallet kamu sendiri. Butuh APT untuk gas.{" "}
        <a
          href="https://aptos.dev/en/network/faucet"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#64748b" }}
        >
          Dapatkan APT testnet gratis
        </a>
      </p>
    </div>
  );
}
