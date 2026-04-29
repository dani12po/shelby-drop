# Prompt: Fix clay.wasm + Redesign Upload Flow dengan User Transaction Confirmation

---

## MASALAH 1 — clay.wasm Tidak Ditemukan di Vercel (ROOT CAUSE)

Error:
```
Unable to locate clay.wasm. Tried:
/vercel/path0/node_modules/@shelby-protocol/clay-codes/dist/clay.wasm,
/vercel/path0/node_modules/@shelby-protocol/clay-codes/dist/clay.wasm
```

### Kenapa Terjadi

Vercel serverless function **tidak menyertakan node_modules** dalam bundle secara default.
`outputFileTracingIncludes` di `next.config.ts` hanya bekerja untuk path yang benar-benar
di-trace oleh Next.js. Karena `@shelby-protocol/clay-codes` menggunakan `import.meta.url`
secara internal untuk menemukan `clay.wasm`, Vercel file tracer tidak bisa mengikuti
referensi dinamis tersebut — sehingga file tidak masuk ke bundle.

Script `patch-clay-wasm.js` dan `copy-wasm.js` yang sudah ada tidak cukup karena:
1. `postinstall` berjalan saat npm install di Vercel, tapi output discard setelah build
2. `.next/server/` direktori belum ada saat `postinstall` berjalan
3. Pada saat runtime, file sudah hilang dari path yang dicari

### SOLUSI YANG BENAR

Ada dua pendekatan, pilih yang paling mudah diimplementasikan:

---

#### SOLUSI A — `outputFileTracingIncludes` yang Benar + Path Eksplisit (Paling Mudah)

Perbarui `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  // ... existing config ...

  outputFileTracingIncludes: {
    // Cover semua route API yang menggunakan Shelby SDK
    "/api/upload": [
      "./node_modules/@shelby-protocol/clay-codes/dist/**",
      "./node_modules/@shelby-protocol/sdk/**/*.wasm",
    ],
  },

  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "app"),
    };

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // KUNCI: Untuk server bundle, JANGAN treat .wasm sebagai asset/resource
    // Biarkan webpack meng-bundle WASM secara normal agar ikut dalam deployment
    if (isServer) {
      config.module.rules.push({
        test: /\.wasm$/,
        type: "asset/resource",
        generator: {
          // Simpan ke direktori yang bisa diakses saat runtime
          filename: "static/wasm/[name][ext]",
        },
      });
    }

    return config;
  },
};
```

Kemudian perbarui `app/lib/shelby/wasmPatch.ts` — tambahkan path Vercel yang benar
berdasarkan lokasi `static/wasm/`:

```typescript
const WASM_SEARCH_PATHS = [
  // Dari webpack output (path baru)
  resolve(process.cwd(), ".next/server/static/wasm/clay.wasm"),
  resolve(process.cwd(), ".next/static/wasm/clay.wasm"),
  // Vercel: path standar node_modules
  resolve(process.cwd(), "node_modules/@shelby-protocol/clay-codes/dist/clay.wasm"),
  "/vercel/path0/node_modules/@shelby-protocol/clay-codes/dist/clay.wasm",
  // Public fallback (sudah dicopy oleh copy-wasm.js)
  resolve(process.cwd(), "public/clay.wasm"),
  // Relative dari file ini
  resolve(dirname(fileURLToPath(import.meta.url)), "clay.wasm"),
];
```

Perbarui `package.json` build script agar clay.wasm dicopy ke `public/` SEBELUM build,
bukan setelah:

```json
{
  "scripts": {
    "postinstall": "node scripts/patch-clay-wasm.js && node scripts/copy-wasm.js",
    "build": "next build"
  }
}
```

---

#### SOLUSI B — Pindahkan Upload ke Browser-Side (Arsitektur Lebih Benar)

Ini adalah solusi yang **secara arsitektur lebih tepat** untuk blockchain app dan sekaligus
menjawab pertanyaan tentang konfirmasi transaksi user.

Lihat bagian **MASALAH 2** di bawah untuk detail implementasinya.

---

## MASALAH 2 — Haruskah User Konfirmasi Transaksi?

### Jawaban: YA, untuk upload via wallet user sendiri

Saat ini arsitektur yang dipakai adalah **"server wallet"** — semua transaksi ditandatangani
oleh private key server (dari env `SHELBY_ACCOUNT_PRIVATE_KEY`). User tidak perlu konfirmasi
apapun, tapi semua biaya gas dibayar oleh server wallet.

**Ini ada trade-off:**

| | Server Wallet (sekarang) | User Wallet (disarankan) |
|---|---|---|
| UX | Lebih mudah, upload langsung | User perlu approve di Petra/wallet |
| Keamanan | Private key di server, risiko lebih tinggi | Key tetap di tangan user |
| Biaya | Server bayar semua gas | User bayar gas sendiri |
| Ownership | File terdaftar di server address | File terdaftar di wallet user |
| clay.wasm | Harus di server | Ada di browser SDK, tidak perlu fix |

### Rekomendasi: Hybrid Approach

Pertahankan server wallet untuk "gasless upload" (pengguna biasa), tapi tambahkan opsi
"upload with own wallet" untuk power user yang ingin ownership di wallet sendiri.

---

## IMPLEMENTASI: Upload dengan Wallet User (Browser-Side)

Jika memilih untuk menambahkan opsi upload dengan wallet user, gunakan `ShelbyClient`
(browser version, bukan `ShelbyNodeClient`) yang dijalankan di client-side.

### Keuntungan teknis

`@shelby-protocol/sdk/browser` menggunakan `ShelbyClient` yang sudah include WASM
untuk dijalankan di browser — masalah clay.wasm di Vercel **otomatis hilang** karena
tidak perlu dijalankan di server.

### File yang perlu dibuat/dimodifikasi

#### 1. Buat `app/lib/shelby/browserUploader.ts`

```typescript
/**
 * Browser-Side Shelby Upload
 * 
 * Menggunakan ShelbyClient dari browser SDK.
 * Upload dilakukan di browser user — transaksi ditandatangani oleh wallet user.
 * clay.wasm dijalankan di browser, bukan di server Vercel.
 */
import { ShelbyClient } from "@shelby-protocol/sdk/browser";
import { Network } from "@aptos-labs/ts-sdk";

export interface BrowserUploadArgs {
  file: File;
  blobName: string;
  expirationMicros: number;
  walletSignFn: (transaction: unknown) => Promise<{ hash: string }>;
  apiKey: string;
  network?: "testnet" | "shelbynet";
}

export interface BrowserUploadResult {
  success: boolean;
  txHash?: string;
  blobName?: string;
  error?: string;
}

export async function uploadWithBrowserWallet(
  args: BrowserUploadArgs
): Promise<BrowserUploadResult> {
  try {
    const shelbyClient = new ShelbyClient({
      network: args.network === "shelbynet" ? Network.CUSTOM : Network.TESTNET,
      apiKey: args.apiKey,
    });

    const fileBuffer = await args.file.arrayBuffer();

    // Upload — ini akan meminta user sign di wallet mereka
    const result = await shelbyClient.upload({
      blobData: new Uint8Array(fileBuffer),
      signer: {
        // Adapter untuk wallet user (Petra, dll)
        signAndSubmitTransaction: args.walletSignFn,
      },
      blobName: args.blobName,
      expirationMicros: args.expirationMicros,
    });

    return {
      success: true,
      txHash: result?.hash || result?.txHash,
      blobName: args.blobName,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}
```

#### 2. Buat `app/components/upload/UploadWithWalletButton.tsx`

Komponen yang menampilkan flow upload dengan konfirmasi user:

```tsx
"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { uploadWithBrowserWallet } from "@/lib/shelby/browserUploader";

interface Props {
  file: File;
  onSuccess: (result: { txHash: string; blobName: string }) => void;
  onError: (error: string) => void;
}

type UploadStep = "idle" | "preparing" | "waiting_signature" | "uploading" | "confirming" | "done" | "error";

export function UploadWithWalletButton({ file, onSuccess, onError }: Props) {
  const { signAndSubmitTransaction, account } = useWallet();
  const [step, setStep] = useState<UploadStep>("idle");
  const [txHash, setTxHash] = useState<string>();

  const STEP_LABELS: Record<UploadStep, string> = {
    idle: "Upload dengan Wallet",
    preparing: "Menyiapkan file...",
    waiting_signature: "Menunggu tanda tangan di wallet...",
    uploading: "Mengupload ke Shelby...",
    confirming: "Mengkonfirmasi transaksi...",
    done: "Upload berhasil!",
    error: "Upload gagal",
  };

  async function handleUpload() {
    if (!account?.address) {
      onError("Wallet belum terkoneksi");
      return;
    }

    setStep("preparing");

    const blobName = `${Date.now()}-${file.name}`;
    const expirationMicros = Date.now() * 1000 + 7 * 24 * 60 * 60 * 1_000_000; // 7 hari

    setStep("waiting_signature");
    // ↑ Di titik ini wallet user (Petra, dll) akan muncul popup konfirmasi

    const result = await uploadWithBrowserWallet({
      file,
      blobName,
      expirationMicros,
      walletSignFn: async (tx) => {
        setStep("uploading");
        const response = await signAndSubmitTransaction(tx as any);
        setStep("confirming");
        return response;
      },
      apiKey: process.env.NEXT_PUBLIC_SHELBY_API_KEY!,
    });

    if (result.success && result.txHash) {
      setTxHash(result.txHash);
      setStep("done");
      onSuccess({ txHash: result.txHash, blobName: result.blobName! });
    } else {
      setStep("error");
      onError(result.error || "Upload gagal");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Step indicator */}
      {step !== "idle" && step !== "done" && step !== "error" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>{STEP_LABELS[step]}</span>
        </div>
      )}

      {/* Info box tentang konfirmasi wallet */}
      {step === "waiting_signature" && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-700 dark:text-amber-400">
          <strong>Cek wallet kamu</strong> — Petra atau wallet Aptos kamu akan menampilkan
          popup untuk konfirmasi transaksi upload ke blockchain Shelby.
          Gas fee akan dikenakan dalam APT.
        </div>
      )}

      {/* Success */}
      {step === "done" && txHash && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-700 dark:text-green-400">
          ✓ Upload berhasil! File tersimpan di blockchain.{" "}
          <a
            href={`https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Lihat transaksi
          </a>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={step !== "idle" && step !== "error" && step !== "done"}
        className="w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground 
                   font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed
                   hover:opacity-90 transition-opacity"
      >
        {step === "idle" ? "Upload dengan Wallet (Self-Pay Gas)" :
         step === "done" ? "Upload Lagi" :
         step === "error" ? "Coba Lagi" :
         STEP_LABELS[step]}
      </button>
    </div>
  );
}
```

#### 3. Tambahkan `NEXT_PUBLIC_SHELBY_API_KEY` ke `.env.example`

```
# API key untuk browser-side upload (bisa sama atau berbeda dengan server key)
# AMAN untuk expose ke client karena API key Shelby bukan private key
NEXT_PUBLIC_SHELBY_API_KEY=aptoslabs_your_api_key_here
```

---

## PENJELASAN: Kapan User Perlu Konfirmasi?

```
UPLOAD VIA SERVER WALLET (sekarang):
User → Upload File → Server → Tanda tangan otomatis → Shelby Network
✓ Tidak perlu konfirmasi
✗ File terdaftar di address server, bukan wallet user
✗ Gas dibayar server
✗ clay.wasm harus ada di Vercel server

UPLOAD VIA USER WALLET (baru):
User → Upload File → Browser SDK → Popup wallet muncul → User klik "Approve" → Shelby Network
✓ User konfirmasi → ownership jelas milik user
✓ Gas dibayar user sendiri (lebih fair)
✓ clay.wasm jalan di browser, tidak ada masalah Vercel
✗ User perlu punya APT untuk gas
✗ UX lebih banyak step
```

---

## RINGKASAN URUTAN PENGERJAAN

### Prioritas 1 — Fix clay.wasm (untuk server wallet yang sudah ada)
1. Update `package.json` build script — pindah `copy-wasm.js` ke `postinstall`
2. Update `next.config.ts` — perbaiki webpack config untuk wasm
3. Update `app/lib/shelby/wasmPatch.ts` — tambah lebih banyak fallback path

### Prioritas 2 — Tambah opsi Upload dengan Wallet User (opsional tapi recommended)
4. Tambah `NEXT_PUBLIC_SHELBY_API_KEY` ke `.env` dan `.env.example`
5. Buat `app/lib/shelby/browserUploader.ts`
6. Buat `app/components/upload/UploadWithWalletButton.tsx`
7. Integrasikan ke `UploadPanel.tsx` sebagai tab kedua atau toggle option

---

## CATATAN PENTING

- Jika menggunakan browser upload, `clay.wasm` jalan di browser user — masalah Vercel SELESAI
- Server wallet tetap bisa dipertahankan sebagai opsi "gasless" untuk pengguna yang tidak punya APT
- Untuk testnet: user bisa dapat APT gratis dari faucet `https://aptos.dev/en/network/faucet`
- API key Shelby (`aptoslabs_`) **aman** untuk di-expose ke client (bukan private key)
- Private key wallet server (`SHELBY_ACCOUNT_PRIVATE_KEY`) **JANGAN** pernah di-expose ke client

---

*Prompt ini dibuat berdasarkan analisis error clay.wasm dan arsitektur upload Shelby pada 29 April 2026.*
