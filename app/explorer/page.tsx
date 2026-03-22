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
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            fontSize: '0.8rem', color: 'var(--text-accent)'
          }}>
            🔍 Public Explorer
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 800, marginBottom: '16px',
            background: 'linear-gradient(135deg, var(--heading-from), var(--heading-to))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Explore Wallet Files
          </h1>

          <p style={{
            color: 'var(--text-secondary)', marginBottom: '40px',
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
            marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)'
          }}>
            Contoh: 0x1234...abcd
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