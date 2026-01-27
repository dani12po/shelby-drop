# Transaction Hash Notification System

## 📋 Overview

Sistem notifikasi baru yang menampilkan transaction hash dan wallet address dengan format profesional dan clickable links ke explorer.

## ✅ Features Implemented

### 1. **Blockchain Formatting Utilities** (`/app/lib/blockchain/formatTx.ts`)
```typescript
// Shorten addresses for display
shortenWallet("0x1234567890abcdef1234567890abcdef12345678") 
// → "0x1234...5678"

shortenTxHash("0xabcdef1234567890abcdef1234567890abcdef12")
// → "0xabcdef...12"

// Build explorer URLs
buildTxExplorerUrl("0x...")
// → "https://explorer.shelby.xyz/shelbynet/tx/0x..."

buildWalletExplorerUrl("0x...")
// → "https://explorer.shelby.xyz/shelbynet/account/0x..."
```

### 2. **Enhanced Notification System**
```typescript
// New notification API with transaction support
notify({
  title: "✅ Upload berhasil",
  message: "File berhasil diupload ke Shelby network",
  type: "success",
  txHash: "0xabcdef1234567890...",
  wallet: "0x1234567890abcdef...",
});
```

### 3. **Professional Notification UI**
- **Title** - Berwarna sesuai status (hijau/merah/biru)
- **Message** - Deskripsi singkat
- **Wallet** - `Wallet: 0x1234...5678 ↗` (clickable)
- **Transaction** - `Tx: 0xabcd...12ef ↗` (clickable)
- **External Link Icon** - Indikator link ke explorer

## 🎯 Target UX Examples

### ✅ Success Notification:
```
✅ Upload berhasil
File berhasil diupload ke Shelby network

Wallet: 0x12ab...9f3e ↗
Tx: 0x7c91...a2f9 ↗
```

### ❌ Error Notification:
```
❌ Upload gagal
Reason: Insufficient balance

Wallet: 0x12ab...9f3e ↗
Tx: 0x91fe...0031 ↗
```

## 🔧 Usage Examples

### Upload Success:
```typescript
// In UploadModal.tsx
if (result.success && result.data) {
  notify({
    title: "✅ Upload berhasil",
    message: "File berhasil diupload ke Shelby network",
    type: "success",
    txHash: result.data.txHash,
    wallet: result.data.userWallet,
  });
}
```

### Upload Error:
```typescript
if (!result.success) {
  notify({
    title: "❌ Upload gagal",
    message: result.error || "Terjadi kesalahan saat upload",
    type: "error",
    wallet: wallet,
    error: result.error,
  });
}
```

### Generic Info:
```typescript
notify({
  title: "ℹ️ Info",
  message: "Transaksi sedang diproses",
  type: "info",
  txHash: pendingTxHash,
});
```

## 🎨 Styling Guidelines

### Colors:
- **Success**: `text-green-400` / `border-green-500`
- **Error**: `text-red-400` / `border-red-500`
- **Info**: `text-blue-400` / `border-blue-500`
- **Links**: `text-cyan-400 hover:text-cyan-300`

### Typography:
- **Title**: `font-medium` + color
- **Message**: `text-white text-xs`
- **Wallet/Tx**: `text-white/70 text-xs`
- **Links**: `underline flex items-center gap-1`

### Layout:
```
┌─────────────────────────────────┐
│ Title (colored)                 │
│ Message (white)                 │
│ Wallet: 0x1234...5678 ↗         │
│ Tx: 0xabcd...12ef ↗            │
│                              ✕ │
└─────────────────────────────────┘
```

## 🔗 Explorer URLs

### Priority Order:
1. **Shelby Explorer** (preferred)
   - Transaction: `https://explorer.shelby.xyz/shelbynet/tx/{TX_HASH}`
   - Wallet: `https://explorer.shelby.xyz/shelbynet/account/{WALLET}`

2. **Aptos Explorer** (fallback)
   - Transaction: `https://explorer.aptoslabs.com/txn/{TX_HASH}?network=devnet`

### Network Configuration:
- **Target**: Shelby Devnet
- **Chain ID**: shelbynet
- **Explorer**: explorer.shelby.xyz

## 🛡️ Safety & SSR

### Validation:
```typescript
// Only render if valid hash/address
{txHash && isValidHash(txHash) && (
  <a href={buildTxExplorerUrl(txHash)} target="_blank">
    {shortenTxHash(txHash)}
  </a>
)}
```

### SSR Safety:
- No `window` or `document` usage
- All links use `target="_blank" rel="noopener noreferrer"`
- Validation functions prevent invalid renders

## 📱 Responsive Design

### Notification Size:
- **Width**: `320px` (expanded from 280px)
- **Min Height**: `60px` (auto-expands with content)
- **Padding**: `px-3 py-2`
- **Border**: `border-l-4` (color-coded)

### Icon Size:
- **External Link**: `size={10}` (small, unobtrusive)
- **Close Button**: `text-xs` (minimal)

## 🔄 Auto-Dismiss

### Timing:
- **Default**: 5 seconds (increased from 3s)
- **Reason**: More time to read transaction info
- **Manual**: Click ✕ to dismiss immediately

## 🚀 Production Ready

### Build Status: ✅
- TypeScript compilation: ✅
- SSR safety: ✅
- Responsive design: ✅
- Accessibility: ✅

### Performance:
- Minimal re-renders
- Efficient hash validation
- Optimized link generation
- Smooth animations

## 📝 Future Enhancements

### Planned Features:
- [ ] Transaction status polling
- [ ] Real-time confirmation updates
- [ ] Copy hash to clipboard
- [ ] QR code for mobile sharing
- [ ] Batch transaction notifications

### API Extensions:
```typescript
// Future notification options
notify({
  title: "✅ Upload berhasil",
  message: "File berhasil diupload",
  type: "success",
  txHash: "0x...",
  wallet: "0x...",
  status: "confirmed", // pending | confirmed | failed
  confirmations: 12,
  gasUsed: "0.001 APT",
});
```

## 🎯 Mission Accomplished

✅ **Professional transaction hash display**  
✅ **Clickable explorer links**  
✅ **Consistent styling with Shelby brand**  
✅ **SSR-safe implementation**  
✅ **Production-ready build**  

**🚀 Transaction hash notification system siap production!** 🎉
