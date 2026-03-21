'use client'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SearchBox from '@/components/explorer/SearchBox'
import WalletSearchController from '@/components/explorer/WalletSearchController'
import { useState } from 'react'

export default function ExplorerPublicPage() {
  const [searchWallet, setSearchWallet] = useState<string | null>(null)

  return (
    <div style={{ minHeight: '100vh', background: '#050508', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, paddingTop: '64px', padding: '80px 24px 40px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 800, marginBottom: '16px',
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Public Explorer
          </h1>
          <p style={{ color: '#94a3b8', marginBottom: '40px', fontSize: '1rem' }}>
            Lihat file yang disimpan oleh wallet address manapun di Shelby Network
          </p>
          <SearchBox onSearch={(w) => {
            setSearchWallet(null)
            requestAnimationFrame(() => setSearchWallet(w))
          }} />
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