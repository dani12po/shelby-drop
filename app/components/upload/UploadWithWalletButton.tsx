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
  | "switching_network"
  | "generating"
  | "waiting_signature"
  | "confirming"
  | "uploading"
  | "done"
  | "error";

const STEP_LABELS: Record<UploadStep, string> = {
  idle:              "Upload dengan Wallet",
  preparing:         "Menyiapkan file...",
  switching_network: "Mengganti network wallet...",
  generating:        "Menghitung commitments...",
  waiting_signature: "Menunggu konfirmasi di wallet...",
  confirming:        "Menunggu konfirmasi L1...",
  uploading:         "Mengupload ke Shelby...",
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
  const [resolvedNetwork, setResolvedNetwork] = useState<"testnet" | "shelbynet">("testnet");

  const isActive = step !== "idle" && step !== "done" && step !== "error";

  async function handleUpload() {
    if (!account?.address) {
      notify("error", "Wallet belum terkoneksi");
      return;
    }

    setStep("preparing");
    setTxHash("");

    // Fetch API key from server
    let apiKey: string | undefined;
    try {
      const cfgRes = await fetch("/api/shelby/config");
      if (cfgRes.ok) {
        const cfg = await cfgRes.json();
        apiKey = cfg.apiKey;
      }
    } catch {
      // fall through
    }

    const blobName = `${Date.now()}-${file.name}`;
    const expirationMicros =
      Date.now() * 1000 + retentionDays * 24 * 60 * 60 * 1_000_000;

    setStep("switching_network");

    // Auto-switch wallet to the correct Shelby network before signing
    // Petra wallet exposes window.aptos.changeNetwork()
    // Also detect the actual wallet network after switch for use in waitForTransaction
    let actualNetwork: "testnet" | "shelbynet" = network as "testnet" | "shelbynet";

    try {
      if (typeof window !== "undefined" && (window as any).aptos?.changeNetwork) {
        const isShelbynet = (network === "shelbynet");
        const targetNet = isShelbynet
          ? { name: "Shelbynet", chainId: "0x4", url: "https://api.shelbynet.shelby.xyz/v1" }
          : { name: "Testnet",   chainId: "0x2", url: "https://api.testnet.aptoslabs.com/v1" };
        try {
          await (window as any).aptos.changeNetwork(targetNet);
          console.log("✅ Wallet switched to:", targetNet.name);
          actualNetwork = isShelbynet ? "shelbynet" : "testnet";
        } catch (e: any) {
          // User rejected or already on correct network — detect current network
          console.warn("⚠️ Network switch skipped:", e?.message || e);
          // Try to read current network from wallet
          try {
            const walletNet = await (window as any).aptos.getNetwork?.();
            if (walletNet?.name?.toLowerCase().includes("shelby")) {
              actualNetwork = "shelbynet";
            } else if (walletNet?.chainId === "0x4" || walletNet?.chainId === 4) {
              actualNetwork = "shelbynet";
            }
          } catch { /* ignore */ }
        }
      }
    } catch {
      // Non-critical
    }

    setStep("generating");

    // Save the resolved network to state so JSX can use it
    setResolvedNetwork(actualNetwork);

    const result = await uploadWithBrowserWallet({
      file,
      blobName,
      expirationMicros,
      accountAddress: account.address.toString(),
      network: actualNetwork,
      apiKey,
      signAndSubmitTransaction: async (tx) => {
        setStep("waiting_signature");
        const response = await signAndSubmitTransaction(tx as any);
        setStep("confirming");
        return response as { hash: string };
      },
    });

    if (result.success && result.txHash) {
      setTxHash(result.txHash);
      setStep("done");
      notify("success", "Upload berhasil! File tersimpan di blockchain.", {
        txHash: result.txHash,
        network: resolvedNetwork,
        duration: 10000,
      });

      // Record in local index
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
      onError?.(result.error || "Upload gagal");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Network info */}
      {step === "idle" && (
        <div style={{
          padding: "8px 12px", borderRadius: "8px",
          background: "rgba(139,92,246,0.06)",
          border: "1px solid rgba(139,92,246,0.15)",
          fontSize: "0.72rem", color: "#94a3b8",
          display: "flex", alignItems: "center", gap: "6px",
        }}>
          <span style={{ color: "#a78bfa" }}>ℹ</span>
          Wallet akan otomatis pindah ke <strong style={{ color: "#a78bfa" }}>
            {network === "shelbynet" ? "Shelbynet" : "Testnet"}
          </strong> sebelum transaksi.
        </div>
      )}
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
            <strong>Cek wallet kamu</strong> — Petra akan menampilkan popup
            konfirmasi transaksi. Gas fee dikenakan dalam APT.
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
          <span>Upload berhasil!</span>
          <a
            href={`https://explorer.aptoslabs.com/txn/${txHash}?network=${resolvedNetwork}`}
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
