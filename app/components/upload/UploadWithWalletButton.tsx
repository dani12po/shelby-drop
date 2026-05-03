"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useNetwork } from "@/hooks/useNetwork";
import { useNotifications } from "@/components/notifications/useNotifications";
import { uploadWithBrowserWallet } from "@/lib/shelby/browserUploader";
import { CheckCircle2, Loader2, Wallet, ExternalLink, Info } from "lucide-react";
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

    // Auto-switch wallet to Testnet before signing
    let actualNetwork: "testnet" | "shelbynet" = "testnet";

    setStep("switching_network");
    try {
      if (typeof window !== "undefined" && (window as any).aptos?.changeNetwork) {
        const targetNet = { name: "Testnet", chainId: "0x2", url: "https://api.testnet.aptoslabs.com/v1" };
        try {
          await (window as any).aptos.changeNetwork(targetNet);
          console.log("✅ Wallet switched to:", targetNet.name);
          actualNetwork = "testnet";
        } catch (e: any) {
          console.warn("⚠️ Network switch skipped:", e?.message || e);
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

    // Fetch API key and origin from server with network param
    let apiKey: string | undefined;
    let origin: string | undefined;
    try {
      const cfgRes = await fetch(`/api/shelby/config?network=${actualNetwork}`);
      if (cfgRes.ok) {
        const cfg = await cfgRes.json();
        apiKey = cfg.apiKey;
        origin = cfg.origin;
      }
    } catch {
      // fall through
    }

    const blobName = `${Date.now()}-${file.name}`;
    const expirationMicros =
      Date.now() * 1000 + retentionDays * 24 * 60 * 60 * 1_000_000;

    setStep("generating");

    const result = await uploadWithBrowserWallet({
      file,
      blobName,
      expirationMicros,
      accountAddress: account.address.toString(),
      network: actualNetwork,
      apiKey,
      origin,
      signAndSubmitTransaction: async (tx) => {
        setStep("waiting_signature");
        const response = await signAndSubmitTransaction(tx as any);
        setStep("confirming");
        return response as { hash: string };
      },
    });

    if (result.success && result.txHash) {
      const confirmedNet = result.confirmedNetwork ?? actualNetwork;
      setTxHash(result.txHash);
      setResolvedNetwork(confirmedNet);
      setStep("done");
      notify("success", "Upload berhasil! File tersimpan di blockchain.", {
        txHash: result.txHash,
        network: confirmedNet,
        duration: 10000,
      });

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

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("explorer:refresh"));
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
    <div className="flex flex-col gap-3">
      {/* Network info */}
      {step === "idle" && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-500/5 border border-violet-500/10 text-[10px] sm:text-xs text-slate-400">
          <Info size={14} className="text-violet-400 flex-shrink-0" />
          <span>
            Wallet akan otomatis pindah ke <strong className="text-violet-400">Testnet</strong> sebelum transaksi.
          </span>
        </div>
      )}

      {/* Wallet confirmation info */}
      {step === "waiting_signature" && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/80 leading-relaxed">
          <Wallet size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong className="text-amber-400 block mb-0.5">Cek wallet kamu</strong>
            Petra akan menampilkan popup konfirmasi transaksi. Gas fee dikenakan dalam APT.
          </span>
        </div>
      )}

      {/* Progress */}
      {isActive && (
        <div className="flex items-center gap-2 px-1 text-xs font-medium text-slate-400">
          <Loader2 size={14} className="animate-spin text-violet-400" />
          <span>{STEP_LABELS[step]}</span>
        </div>
      )}

      {/* Success */}
      {step === "done" && txHash && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
          <CheckCircle2 size={16} />
          <span className="flex-1">Upload berhasil!</span>
          <a
            href={`https://explorer.aptoslabs.com/txn/${txHash}?network=${resolvedNetwork}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
          >
            <ExternalLink size={12} />
            <span>Tx</span>
          </a>
        </div>
      )}

      {/* Button */}
      <button
        onClick={handleUpload}
        disabled={isActive}
        className={`
          w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all
          ${isActive 
            ? "bg-white/5 text-slate-500 cursor-not-allowed" 
            : "bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 hover:border-violet-500/40 active:scale-[0.98]"
          }
        `}
      >
        <Wallet size={18} />
        <span>
          {step === "idle"  ? "Upload dengan Wallet (Self-Pay Gas)" :
           step === "done"  ? "Upload Lagi" :
           step === "error" ? "Coba Lagi" :
           STEP_LABELS[step]}
        </span>
      </button>

      <p className="text-[10px] text-slate-500 text-center px-4 leading-relaxed">
        File terdaftar di wallet kamu sendiri. Butuh APT untuk gas.{" "}
        <a
          href="https://aptos.dev/en/network/faucet"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-white underline underline-offset-2 transition-colors"
        >
          Dapatkan APT testnet gratis
        </a>
      </p>
    </div>
  );
}
