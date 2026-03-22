'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SearchBox from '@/components/explorer/SearchBox'
import WalletSearchController from '@/components/explorer/WalletSearchController'
import { useWallet } from '@aptos-labs/wallet-adapter-react'

export default function ExplorerPublicPage() {
  const [searchWallet, setSearchWallet] = useState<string | null>(null)
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const { connected, disconnect } = useWallet()

  return (
    <div style={{
      minHeight: '100vh', background: 'transparent',
      display: 'flex', flexDirection: 'column',
      position: 'relative', zIndex: 1
    }}>
      <Header
        connected={connected}
        onConnect={() => setWalletModalOpen(true)}
        onDisconnect={disconnect}
      />
      <main style={{ flex: 1, paddingTop: '64px' }}>
        <div style={{
          maxWidth: '800px', margin: '0 auto',
          padding: '80px 24px 40px', textAlign: 'center'
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '20px', marginBottom: '24px',
            background: 'rgba(139,92,246,0.1)',
            border: '1px solid rgba(139,92,246,0.3)',
            fontSize: '0.8rem', color: '#a78bfa'
          }}>
            🔍 Public Explorer
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 800, marginBottom: '16px',
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Explore Wallet Files
          </h1>

          <p style={{
            color: '#94a3b8', marginBottom: '40px',
            fontSize: '1rem', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto 40px'
          }}>
            Masukkan wallet address siapapun untuk melihat
            file yang tersimpan di Shelby Network
          </p>

          <SearchBox onSearch={(w) => {
            setSearchWallet(null)
            requestAnimationFrame(() => setSearchWallet(w))
          }} />

          <p style={{
            marginTop: '16px', fontSize: '0.75rem', color: '#334155'
          }}>
            Contoh: 0x50093856644bfcf8e33e3979b52f1a71f79f24a6ed7da94aa92b5b4057e0d0bb
          </p>
        </div>
      </main>

      {searchWallet && (
        <WalletSearchController
          wallet={searchWallet}
          onClose={() => setSearchWallet(null)}
        />
      )}

      <Footer />
    </div>
  )
}