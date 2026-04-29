"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WalletModal from "../components/wallet/WalletModal";
import { Shield, Infinity, Zap, Lock } from 'lucide-react';

type Feature = {
  icon: React.ReactNode
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: <Lock size={28} strokeWidth={1.8} color="#8b5cf6" />,
    title: "Terdesentralisasi",
    description: "File disimpan di jaringan blockchain Aptos, bukan server terpusat. Data Anda sepenuhnya milik Anda.",
  },
  {
    icon: <Infinity size={28} strokeWidth={1.8} color="#3b82f6" />,
    title: "Permanen",
    description: "File akan tetap tersimpan selama Anda menentukan retention period. Tanpa takut data hilang.",
  },
  {
    icon: <Zap size={28} strokeWidth={1.8} color="#06b6d4" />,
    title: "Cepat",
    description: "Dibangun di atas infrastruktur Shelby Network yang modern dan responsif.",
  },
  {
    icon: <Shield size={28} strokeWidth={1.8} color="#10b981" />,
    title: "Aman",
    description: "Setiap file dienkripsi dan diverifikasi secara on-chain. Bukti kepemilikan transparan.",
  },
];

export default function AboutPage() {
  const { wallets, connect } = useWallet();
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const handleConnect = () => setWalletModalOpen(true);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'transparent', position: 'relative', zIndex: 1 }}>
      <Header connected={false} onConnect={handleConnect} onDisconnect={() => {}} />
      
      <WalletModal
        open={walletModalOpen}
        wallets={wallets.map((w) => w.name)}
        onSelectWallet={(name) => {
          connect(name);
          setWalletModalOpen(false);
        }}
        onClose={() => setWalletModalOpen(false)}
      />
      
      <main style={{ flex: 1, paddingTop: '64px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px' }}>
          
          {/* Hero Section */}
          <section style={{ marginBottom: '80px' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ textAlign: 'center' }}
            >
              <h1 style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: 700,
                marginBottom: '24px',
                background: 'linear-gradient(135deg, var(--heading-from), var(--heading-to))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Tentang Shelby Drop
              </h1>
              <p style={{
                fontSize: '18px',
                color: 'var(--text-secondary)',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: 1.6
              }}>
                Platform penyimpanan file terdesentralisasi di blockchain Aptos 
                melalui Shelby Network. Upload, simpan, dan share file dengan 
                keamanan blockchain.
              </p>
            </motion.div>
          </section>

          {/* Features Section */}
          <section style={{ marginBottom: '80px' }}>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                textAlign: 'center',
                marginBottom: '48px'
              }}
            >
              Keunggulan Shelby Drop
            </motion.h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '24px',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{
                    width: '56px', height: '56px',
                    borderRadius: '14px',
                    background: 'rgba(139,92,246,0.1)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '16px'
                  }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* About Section */}
          <section style={{ marginBottom: '80px', borderRadius: '16px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px' }}>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '24px'
                }}
              >
                Latar Belakang
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                style={{ color: 'var(--text-secondary)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <p>
                  Shelby Drop adalah aplikasi Web3 yang memungkinkan Anda menyimpan 
                  file secara permanen di blockchain Aptos melalui Shelby Network. 
                  Setiap file yang Anda upload akan memiliki bukti kepemilikan 
                  on-chain yang dapat diverifikasi siapa pun.
                </p>
                <p>
                  Dengan menggunakan teknologi terdesentralisasi, Shelby Drop 
                  menghilangkan ketergantungan pada server terpusat dan memberikan 
                  kontrol penuh kepada pengguna atas data mereka.
                </p>
                <p>
                  Platform ini dirancang untuk menjadi mudah digunakan sambil 
                  tetap mempertahankan prinsip-prinsip Web3: desentralisasi, 
                  transparansi, dan kepemilikan data.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Links Section */}
          <section style={{ textAlign: 'center' }}>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '32px'
              }}
            >
              Link Tambahan
            </motion.h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <a
                href="https://shelby.xyz"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, var(--accent-blue), var(--accent))',
                  color: 'var(--text-on-accent)',
                  borderRadius: '8px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Shelby.xyz
              </a>
              <a
                href="https://docs.shelby.xyz"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '12px 24px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  borderRadius: '8px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Dokumentasi
              </a>
              <a
                href="https://explorer.shelby.xyz/shelbynet"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '12px 24px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  borderRadius: '8px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Shelby Explorer
              </a>
            </div>
          </section>

          {/* Creator Section */}
          <section style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{
              maxWidth: '500px', margin: '0 auto',
              padding: '32px',
            }}>
              <div style={{
                width: '64px', height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-blue))',
                margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem'
              }}>👨‍💻</div>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '8px' }}>
                Dibuat oleh Imam Qolandani
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '20px' }}>
                Web3 developer yang passionate tentang decentralized technology
                dan ekosistem Aptos blockchain.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <a href="https://x.com/Iq_dani26" target="_blank"
                  style={{ color: 'var(--text-link)', fontSize: '0.85rem', textDecoration: 'none' }}>
                  Twitter/X
                </a>
                <a href="https://github.com/dani12po" target="_blank"
                  style={{ color: 'var(--text-link)', fontSize: '0.85rem', textDecoration: 'none' }}>
                  GitHub
                </a>
                <a href="https://www.linkedin.com/in/imam-qolandani-070373149/" target="_blank"
                  style={{ color: 'var(--text-link)', fontSize: '0.85rem', textDecoration: 'none' }}>
                  LinkedIn
                </a>
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
