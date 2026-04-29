# Prompt untuk Update Script Shelby Drop

Salin prompt ini dan paste ke sesi baru untuk melakukan perbaikan pada project.

---

## PROMPT

Kamu adalah senior TypeScript developer yang ahli di Aptos blockchain dan Shelby decentralized storage protocol. Aku perlu kamu memperbaiki beberapa file dalam project Next.js ini berdasarkan inkonsistensi yang ditemukan antara kode dan dokumentasi resmi Shelby.

### Konteks

Project ini adalah app upload file ke Shelby network (decentralized storage di atas Aptos). Shelby berjalan di jaringan terpisah bernama **shelbynet** — bukan Aptos testnet biasa. Docs resmi ada di https://docs.shelby.xyz

### Bug yang Harus Diperbaiki

#### 1. `app/config/shelby.ts` — Semua URL dan network name salah

**Yang salah:**
- `APTOS_NETWORK=testnet` → seharusnya `shelbynet`
- `SHELBY_NETWORK=testnet` → seharusnya `shelbynet`
- `APTOS_NODE_URL=https://api.testnet.shelby.xyz/v1` → seharusnya `https://api.shelbynet.shelby.xyz/v1`
- `APTOS_INDEXER_URL=https://api.testnet.shelby.xyz/v1/graphql` → seharusnya `https://api.shelbynet.shelby.xyz/v1/graphql`
- `SHELBY_EXPLORER_BASE=https://explorer.shelby.xyz/testnet` → seharusnya `https://explorer.shelby.xyz/shelbynet`

**Perbaikan yang diperlukan di `shelbyConfig`:**
- Default values semua URL harus menggunakan endpoint `shelbynet` yang benar
- Fungsi `getTransactionUrl()` harus menghasilkan `?network=shelbynet` bukan `?network=testnet`
- Fungsi `getExplorerUrl()` dan `getShelbyTransactionUrl()` harus menggunakan base URL dengan `/shelbynet/`

#### 2. `.env.example` — Semua environment variable URL salah

Perbarui semua nilai default URL dengan endpoint shelbynet yang benar:
```
APTOS_NETWORK=shelbynet
SHELBY_NETWORK=shelbynet
APTOS_NODE_URL=https://api.shelbynet.shelby.xyz/v1
APTOS_INDEXER_URL=https://api.shelbynet.shelby.xyz/v1/graphql
APTOS_EXPLORER_BASE=https://explorer.aptoslabs.com
SHELBY_EXPLORER_BASE=https://explorer.shelby.xyz/shelbynet
SHELBY_ENDPOINT=https://api.shelbynet.shelby.xyz/shelby
SHELBY_ORIGIN=https://explorer.shelby.xyz
NEXT_PUBLIC_SHELBY_NETWORK=shelbynet
```

#### 3. `app/lib/shelby/aptosUploader.ts` — ShelbyNodeClient config berlebihan

**Yang salah:** Constructor `ShelbyNodeClient` diberi config dengan nested `aptos: {...}` dan `indexer: {...}` yang tidak ada di dokumentasi resmi.

**Perbaikan:** Sederhanakan config sesuai docs resmi:
```typescript
this.shelbyClient = new ShelbyNodeClient({
  network: Network.CUSTOM, // atau gunakan constant shelbynet yang sesuai
  apiKey: process.env.SHELBY_API_KEY!,
});
```

Juga perbaiki `AptosConfig` agar menggunakan URL shelbynet yang benar:
```typescript
const aptosConfig = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: process.env.APTOS_NODE_URL || 'https://api.shelbynet.shelby.xyz/v1',
  indexer: process.env.APTOS_INDEXER_URL || 'https://api.shelbynet.shelby.xyz/v1/graphql',
});
```

#### 4. `app/lib/shelby/aptosUploader.ts` — extractTransactionHash() rawan race condition

**Yang salah:** Setelah `shelbyClient.upload()`, kode mencari tx hash dari daftar transaksi terbaru — ini bisa ambil tx yang salah jika ada upload lain sedang berjalan.

**Perbaikan yang disarankan:** Cek apakah return value dari `this.shelbyClient.upload()` sudah menyertakan transaction hash. Jika ya, gunakan langsung. Jika tidak, tambahkan comment `// TODO: use upload() return value when SDK supports it` dan pertahankan logika saat ini dengan window yang lebih ketat (misal 15 detik, bukan 60).

#### 5. `app/lib/shelby/aptosUploader.ts` — verifyShelbyExplorer() menggunakan HTML scraping

**Yang salah:** Verifikasi dilakukan dengan mem-fetch HTML halaman explorer dan mencari teks blob name di dalamnya — sangat rapuh karena halaman SPA tidak merender konten di HTML awal.

**Perbaikan:** Ganti dengan pengecekan via Shelby RPC API jika tersedia, atau cukup skip verifikasi Shelby explorer (sudah ada komentar bahwa ini best-effort) dan langsung return `false` dengan log yang jelas. Aptos verification sudah cukup sebagai konfirmasi transaksi.

#### 6. `app/lib/shelby/explorerService.ts` — URL explorer menggunakan `/testnet/`

Pastikan fungsi `searchWalletFiles()` menggunakan `shelbyConfig.shelbyExplorerBase` yang setelah fix #1 di atas sudah menggunakan `/shelbynet/`.

#### 7. `app/api/shelby/list/route.ts` — URL constants hardcoded salah

Perbarui constants di bagian atas file:
```typescript
const APTOS_NODE_URL = 
  process.env.APTOS_NODE_URL ?? 
  "https://api.shelbynet.shelby.xyz/v1";

const APTOS_INDEXER_URL = 
  process.env.APTOS_INDEXER_URL ?? 
  "https://api.shelbynet.shelby.xyz/v1/graphql";
```

### Instruksi Tambahan

1. Jangan ubah logic upload flow yang sudah ada — hanya perbaiki URL/network dan konfigurasi
2. Pertahankan semua error handling dan logging yang sudah ada
3. Jangan hapus komentar yang menjelaskan bug fix (BUG #X FIX) — update saja isinya jika relevan
4. Setelah selesai, buat ringkasan semua perubahan yang dilakukan

### File yang Perlu Diubah (prioritas urutan)

1. `.env.example` (paling kritis — template konfigurasi)
2. `app/config/shelby.ts` (core config)
3. `app/lib/shelby/aptosUploader.ts` (SDK init + verifikasi)
4. `app/api/shelby/list/route.ts` (hardcoded constants)
5. `app/lib/shelby/explorerService.ts` (cek URL — mungkin sudah fix otomatis setelah #2)

---

*Prompt ini dihasilkan dari analisis otomatis kode vs dokumentasi Shelby pada 29 April 2026.*
