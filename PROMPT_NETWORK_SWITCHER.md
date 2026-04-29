# Prompt: Tambah Network Switcher (Testnet ↔ Shelbynet)

Paste prompt ini ke sesi baru untuk mengimplementasikan fitur network switching.

---

## KONTEKS PENTING

Shelby Protocol punya **2 jaringan aktif** yang berbeda:

| | **Testnet** (baru, Early Access) | **Shelbynet** (devnet lama) |
|---|---|---|
| Status | Early Access sejak April 2026 | Masih aktif, devnet lama |
| Aptos Node | `https://api.testnet.aptoslabs.com/v1` (standard Aptos testnet) | `https://api.shelbynet.shelby.xyz/v1` |
| Aptos Indexer | `https://api.testnet.aptoslabs.com/v1/graphql` | `https://api.shelbynet.shelby.xyz/v1/graphql` |
| Explorer path | `https://explorer.shelby.xyz/testnet/...` | `https://explorer.shelby.xyz/shelbynet/...` |
| Aptos Explorer | `?network=testnet` | `?network=shelbynet` |
| SDK Network | `Network.TESTNET` | `Network.CUSTOM` |
| Token | APT + ShelbyUSD | APT + ShelbyUSD |

Kode project saat ini sudah menggunakan **testnet** (benar untuk jaringan baru). Tugas kita adalah menambahkan kemampuan **switch ke shelbynet** juga via UI, tanpa merusak setup testnet yang sudah ada.

---

## YANG HARUS DIBUAT

### 1. `app/config/shelby.ts` — Tambah network config map

Tambahkan type dan konfigurasi per-network:

```typescript
export type ShelbyNetwork = 'testnet' | 'shelbynet';

export interface NetworkConfig {
  label: string;
  aptosNetwork: string;
  aptosNodeUrl: string;
  aptosIndexerUrl: string;
  shelbyExplorerBase: string;
  aptosExplorerBase: string;
  aptosExplorerNetwork: string; // query param untuk Aptos Explorer
  faucetUrl?: string;
  sdkNetwork: 'testnet' | 'custom'; // untuk Network enum di SDK
}

export const NETWORK_CONFIGS: Record<ShelbyNetwork, NetworkConfig> = {
  testnet: {
    label: 'Testnet (Early Access)',
    aptosNetwork: 'testnet',
    aptosNodeUrl: 'https://api.testnet.aptoslabs.com/v1',
    aptosIndexerUrl: 'https://api.testnet.aptoslabs.com/v1/graphql',
    shelbyExplorerBase: 'https://explorer.shelby.xyz/testnet',
    aptosExplorerBase: 'https://explorer.aptoslabs.com',
    aptosExplorerNetwork: 'testnet',
    faucetUrl: 'https://aptos.dev/en/network/faucet',
    sdkNetwork: 'testnet',
  },
  shelbynet: {
    label: 'Shelbynet (Devnet)',
    aptosNetwork: 'shelbynet',
    aptosNodeUrl: 'https://api.shelbynet.shelby.xyz/v1',
    aptosIndexerUrl: 'https://api.shelbynet.shelby.xyz/v1/graphql',
    shelbyExplorerBase: 'https://explorer.shelby.xyz/shelbynet',
    aptosExplorerBase: 'https://explorer.aptoslabs.com',
    aptosExplorerNetwork: 'shelbynet',
    faucetUrl: 'https://faucet.shelbynet.shelby.xyz',
    sdkNetwork: 'custom',
  },
};

// Fungsi helper untuk mendapatkan config aktif berdasarkan env atau default
export function getNetworkConfig(network?: string): NetworkConfig {
  const net = (network || process.env.SHELBY_NETWORK || 'testnet') as ShelbyNetwork;
  return NETWORK_CONFIGS[net] ?? NETWORK_CONFIGS.testnet;
}
```

Update juga `shelbyConfig` agar helper functions menerima optional network parameter:

```typescript
export const shelbyConfig = {
  // ... existing fields tetap ada sebagai fallback ...
  
  getTransactionUrl: (txHash: string, network?: string) => {
    const cfg = getNetworkConfig(network);
    return `${cfg.aptosExplorerBase}/txn/${txHash}?network=${cfg.aptosExplorerNetwork}`;
  },
  
  getExplorerUrl: (walletAddress: string, network?: string) => {
    const cfg = getNetworkConfig(network);
    return `${cfg.shelbyExplorerBase}/account/${walletAddress}`;
  },
  
  getShelbyTransactionUrl: (txHash: string, network?: string) => {
    const cfg = getNetworkConfig(network);
    return `${cfg.shelbyExplorerBase}/tx/${txHash}`;
  },
  
  getFileUrl: (wallet: string, filename: string) => {
    const gateway = process.env.NEXT_PUBLIC_S3_GATEWAY_ORIGIN || 'https://gateway.shelby.xyz';
    return `${gateway}/${wallet}/${filename}`;
  }
};
```

---

### 2. `app/lib/shelby/aptosUploader.ts` — Terima network parameter

Ubah constructor dan class agar network-aware:

```typescript
export class AptosShelbyUploader {
  private aptos: Aptos;
  private account: Account;
  private shelbyClient: ShelbyNodeClient;
  private accountAddress: string;
  private networkConfig: NetworkConfig; // tambahkan ini

  constructor(networkOverride?: ShelbyNetwork) {
    this.validateConfiguration();
    
    // Gunakan network dari parameter atau env
    const networkName = networkOverride || (process.env.SHELBY_NETWORK as ShelbyNetwork) || 'testnet';
    this.networkConfig = NETWORK_CONFIGS[networkName];
    
    const aptosConfig = new AptosConfig({
      network: Network.CUSTOM,
      fullnode: this.networkConfig.aptosNodeUrl,
      indexer: this.networkConfig.aptosIndexerUrl,
    });

    this.aptos = new Aptos(aptosConfig);

    // ... rest of constructor sama ...

    // SDK: gunakan TESTNET untuk testnet, CUSTOM untuk shelbynet
    const sdkNetwork = networkName === 'testnet' ? Network.TESTNET : Network.CUSTOM;
    
    this.shelbyClient = new ShelbyNodeClient({
      network: sdkNetwork,
      apiKey: process.env.SHELBY_API_KEY!,
    });
    
    // Jika shelbynet (CUSTOM), override URL
    // Note: Cek dokumentasi SDK terbaru apakah perlu custom URL atau tidak
  }
  
  // Helper untuk URL yang network-aware
  private getTransactionUrl(txHash: string): string {
    return shelbyConfig.getTransactionUrl(txHash, this.networkConfig.aptosNetwork);
  }
  
  private getExplorerUrl(): string {
    return shelbyConfig.getExplorerUrl(this.accountAddress, this.networkConfig.aptosNetwork);
  }
}
```

---

### 3. `app/api/upload/route.ts` — Baca network dari request

```typescript
// Ambil network dari form data atau JSON body
let network: string | undefined;

if (contentType?.includes("application/json")) {
  // ... existing parsing ...
  network = jsonData.network; // tambahkan ini
} else {
  // ... existing form parsing ...
  network = form.get("network") as string; // tambahkan ini
}

// Kirim ke uploader
const uploader = new AptosShelbyUploader(network as ShelbyNetwork);
```

---

### 4. `app/api/shelby/list/route.ts` — Baca network dari query param

```typescript
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet');
  const network = (searchParams.get('network') || process.env.SHELBY_NETWORK || 'testnet') as ShelbyNetwork;
  
  const networkCfg = NETWORK_CONFIGS[network] ?? NETWORK_CONFIGS.testnet;
  
  // Gunakan networkCfg.aptosNodeUrl dan networkCfg.aptosIndexerUrl
  // sebagai ganti constants hardcoded di atas
}
```

---

### 5. `app/lib/uploadService.ts` — Kirim network saat upload

```typescript
export type ShelbyUploadArgs = {
  file: File;
  wallet: string;
  path?: string[];
  retentionDays: number;
  network?: string; // TAMBAHKAN INI
};

export async function uploadToShelby({
  file, wallet, path = [], retentionDays, network,
}: ShelbyUploadArgs): Promise<UploadMetadata> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("wallet", wallet);
  formData.append("path", path.join("/"));
  formData.append("blobName", blobName);
  formData.append("retentionDays", String(retentionDays));
  if (network) formData.append("network", network); // TAMBAHKAN INI
  
  // ... rest sama ...
}
```

---

### 6. Buat `app/components/ui/NetworkSwitcher.tsx` — Komponen UI

```tsx
"use client";

import { useNetwork } from "@/hooks/useNetwork";
import type { ShelbyNetwork } from "@/config/shelby";
import { NETWORK_CONFIGS } from "@/config/shelby";

export function NetworkSwitcher() {
  const { network, setNetwork } = useNetwork();
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs">
      {/* Dot status indicator */}
      <span className={`w-1.5 h-1.5 rounded-full ${network === 'testnet' ? 'bg-green-400' : 'bg-yellow-400'}`} />
      
      <select
        value={network}
        onChange={(e) => setNetwork(e.target.value as ShelbyNetwork)}
        className="bg-transparent text-xs font-medium cursor-pointer outline-none"
      >
        {Object.entries(NETWORK_CONFIGS).map(([key, cfg]) => (
          <option key={key} value={key}>{cfg.label}</option>
        ))}
      </select>
    </div>
  );
}
```

---

### 7. Buat `app/hooks/useNetwork.ts` — State management network

```typescript
"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ShelbyNetwork } from "@/config/shelby";

interface NetworkContextType {
  network: ShelbyNetwork;
  setNetwork: (n: ShelbyNetwork) => void;
}

const NetworkContext = createContext<NetworkContextType>({
  network: 'testnet',
  setNetwork: () => {},
});

export function NetworkProvider({ children }: { children: ReactNode }) {
  // Baca dari localStorage jika tersedia, default ke env atau 'testnet'
  const [network, setNetworkState] = useState<ShelbyNetwork>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shelby_network') as ShelbyNetwork;
      if (saved === 'testnet' || saved === 'shelbynet') return saved;
    }
    return (process.env.NEXT_PUBLIC_SHELBY_NETWORK as ShelbyNetwork) || 'testnet';
  });
  
  const setNetwork = useCallback((n: ShelbyNetwork) => {
    setNetworkState(n);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shelby_network', n);
    }
  }, []);
  
  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
```

---

### 8. Update `app/providers.tsx` — Wrap dengan NetworkProvider

```tsx
import { NetworkProvider } from "@/hooks/useNetwork";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NetworkProvider>
      {/* ... other providers ... */}
      {children}
    </NetworkProvider>
  );
}
```

---

### 9. Update `app/components/layout/Header.tsx` — Tampilkan NetworkSwitcher

Tambahkan `<NetworkSwitcher />` di Header, di sebelah kiri wallet connect button atau di area nav. Pastikan posisinya visible tapi tidak mengganggu layout existing.

---

### 10. Update semua komponen yang melakukan upload/fetch — Kirim network

Di setiap komponen yang memanggil `uploadToShelby()` atau fetch ke `/api/shelby/list`, tambahkan `network` dari `useNetwork()`:

```tsx
const { network } = useNetwork();

// Upload
await uploadToShelby({ file, wallet, retentionDays, network });

// Fetch list
const res = await fetch(`/api/shelby/list?wallet=${wallet}&network=${network}`);
```

---

## CATATAN PENTING SAAT IMPLEMENTASI

1. **Shelbynet SDK support** — Saat menggunakan `Network.CUSTOM` untuk shelbynet di ShelbyNodeClient, kemungkinan perlu URL override tambahan. Cek docs terbaru apakah `ShelbyNodeClient` sudah support parameter custom URL seperti `{ network: Network.CUSTOM, rpcUrl: '...' }`. Jika belum ada di docs, tambahkan TODO comment.

2. **Network indicator di UI** — Pastikan selalu ada indikator visual yang jelas jaringan mana yang aktif, terutama di halaman upload dan explorer. User harus tahu mereka sedang di testnet atau shelbynet.

3. **Warning banner untuk shelbynet** — Karena shelbynet adalah devnet lama, tambahkan small warning banner: *"Shelbynet adalah devnet yang lebih lama. Untuk Early Access resmi gunakan Testnet."*

4. **Jangan hapus env variable SHELBY_NETWORK** — Tetap baca dari env sebagai default, dengan UI sebagai override. Ini memungkinkan deployment khusus yang locked ke satu network.

5. **Test di kedua network** — Setelah selesai, pastikan flow upload, list file, dan preview bekerja di kedua network tanpa perlu restart server.

---

## URUTAN PENGERJAAN (prioritas)

1. `app/config/shelby.ts` — tambah `NETWORK_CONFIGS` dan `getNetworkConfig()`
2. `app/hooks/useNetwork.ts` — buat hook baru
3. `app/providers.tsx` — wrap dengan NetworkProvider
4. `app/components/ui/NetworkSwitcher.tsx` — buat komponen UI
5. `app/components/layout/Header.tsx` — tambahkan NetworkSwitcher
6. `app/lib/uploadService.ts` — tambah network param
7. `app/api/upload/route.ts` — baca & forward network param
8. `app/lib/shelby/aptosUploader.ts` — terima network param
9. `app/api/shelby/list/route.ts` — baca network dari query param
10. Semua komponen yang upload/fetch — inject `useNetwork()`

---

*Prompt ini dibuat berdasarkan analisis kode vs dokumentasi Shelby Protocol pada 29 April 2026.*
*Referensi: https://docs.shelby.xyz/protocol/architecture/networks*
