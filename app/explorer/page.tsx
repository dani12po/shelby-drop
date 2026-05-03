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
    <div className="min-h-screen bg-transparent flex flex-col relative z-[1]">
      <Header
        connected={connected}
        onConnect={() => setWalletModalOpen(true)}
        onDisconnect={disconnect}
      />
      <main className="flex-1 pt-16">
        <div className="max-w-[800px] mx-auto px-6 py-12 md:py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full mb-6 bg-[var(--bg-card)] border border-[var(--border)] text-[0.8rem] text-[var(--text-accent)]">
            🔍 Public Explorer
          </div>

          <h1 className="text-[clamp(1.8rem,5vw,3rem)] font-extrabold mb-4 bg-gradient-to-br from-[var(--heading-from)] to-[var(--heading-to)] bg-clip-text text-transparent">
            Explore Wallet Files
          </h1>

          <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed max-w-[500px] mx-auto mb-10">
            Masukkan wallet address siapapun untuk melihat
            file yang tersimpan di Shelby Network
          </p>

          <SearchBox onSearch={(w) => {
            setSearchWallet(null)
            requestAnimationFrame(() => setSearchWallet(w))
          }} />

          <p className="mt-4 text-xs text-[var(--text-muted)]">
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
