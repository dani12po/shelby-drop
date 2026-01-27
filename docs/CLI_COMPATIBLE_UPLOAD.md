# Shelby Drop - CLI-Compatible Upload System

## 📋 Overview

This document explains how the Shelby Drop web application now uses a CLI-compatible upload system to ensure files are properly registered in Shelby Explorer.

## 🔄 Problem Solved

### Previous Issues:
- ❌ Files uploaded via web were only stored locally (`public/uploads/`)
- ❌ No blockchain transaction was created
- ❌ Files never appeared in Shelby Explorer
- ❌ No proper blob registration

### New Solution:
- ✅ Uses same `@shelby-protocol/sdk` as CLI
- ✅ Creates actual blockchain transactions
- ✅ Files are properly registered in Shelby Explorer
- ✅ Follows exact CLI workflow

## 🏗️ Architecture

### 1. CLI-Compatible Uploader (`/app/lib/shelby/cliCompatibleUploader.ts`)
- Replicates exact CLI upload behavior
- Uses `ShelbyNodeClient` from Shelby SDK
- Handles wallet signing and transaction creation
- Provides same error handling as CLI

### 2. CLI Upload API (`/app/api/upload/cli/route.ts`)
- Server-side endpoint for CLI-compatible uploads
- Uses environment variables for wallet credentials
- Validates and processes upload requests
- Returns transaction hashes and Explorer URLs

### 3. Upload Service (`/app/lib/shelby/cliUploadService.ts`)
- Client-side service for upload operations
- Handles form data preparation
- Provides type-safe interfaces
- Converts results to legacy format for compatibility

### 4. Updated Upload Modal
- Uses CLI-compatible upload service
- Shows real-time upload status
- Triggers Explorer refresh after upload
- Provides proper error feedback

## 🔧 Configuration

### Required Environment Variables:
```bash
# Server wallet that pays for storage
SHELBY_WALLET_ADDRESS=0x...
SHELBY_WALLET_PRIVATE_KEY=ed25519-priv-0x...

# Optional: API key for higher rate limits
SHELBY_API_KEY=your_api_key_here
```

### Setup Instructions:
1. Get wallet address and private key
2. Fund wallet with APT and Shelby tokens
3. Set environment variables
4. Restart application

## 📊 Upload Flow

### CLI-Compatible Upload Process:
1. **File Selection** → User selects file in UploadModal
2. **Form Preparation** → Create FormData with blobName and retention
3. **API Call** → Send to `/api/upload/cli`
4. **SDK Upload** → Use `ShelbyNodeClient.upload()` like CLI
5. **Transaction** → Create and sign blockchain transaction
6. **Registration** → File registered in Shelby Explorer
7. **Response** → Return transaction hash and URLs
8. **UI Update** → Show success, trigger Explorer refresh

### Key Differences from Old System:
- **Before**: Local file storage only
- **After**: Blockchain registration with Explorer indexing

## 🎯 Success Criteria

### Files Will Appear in Explorer When:
✅ Wallet has sufficient APT for transaction fees  
✅ Wallet has sufficient Shelby tokens for storage  
✅ Environment variables are properly configured  
✅ Upload transaction is confirmed on blockchain  

### Expected Timeline:
- **Transaction Confirmation**: ~10-30 seconds
- **Explorer Indexing**: ~1-5 minutes
- **Full Availability**: ~5-10 minutes

## 🔍 Troubleshooting

### Common Issues:
1. **"Server configuration error"**
   - Check environment variables
   - Ensure wallet address and private key are set

2. **"Insufficient balance" errors**
   - Fund wallet with APT from faucet
   - Fund wallet with Shelby tokens

3. **"Rate limit exceeded"**
   - Add SHELBY_API_KEY environment variable
   - Wait and retry after rate limit

4. **"File not appearing in Explorer"**
   - Wait 5-10 minutes for indexing
   - Check transaction hash in Aptos Explorer
   - Verify wallet address matches

## 🧪 Testing

### Manual Testing:
1. Upload a small file (<1MB)
2. Check returned transaction hash
3. Verify in Aptos Explorer
4. Wait and check Shelby Explorer
5. Confirm file appears with correct metadata

### Automated Testing:
- Test with various file types
- Test different retention periods
- Test error handling scenarios
- Verify Explorer integration

## 📝 Notes

### Security Considerations:
- Private keys are server-side only
- Never expose private keys to client
- Use proper secret management in production
- Consider using Hardware Security Modules (HSM) for production

### Performance Considerations:
- Upload speed depends on network congestion
- Large files may take longer to process
- Consider implementing progress indicators for large uploads
- Monitor rate limits and implement backoff strategies

### Future Enhancements:
- Support for batch uploads
- Direct file preview from transaction hash
- Upload progress tracking
- Automatic retry on transient failures

## 🚀 Production Deployment

### Required Steps:
1. Set production environment variables
2. Fund production wallet adequately
3. Configure monitoring for upload failures
4. Set up alerts for low wallet balance
5. Test with real transactions before going live

### Monitoring:
- Track upload success rates
- Monitor transaction confirmation times
- Watch Explorer indexing delays
- Alert on wallet balance thresholds
