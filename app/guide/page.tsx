"use client";

import { motion } from "framer-motion";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { Wallet, Link2, Upload, FolderOpen, Share2, Download, Check } from 'lucide-react';

const stepIcons = [
  <Wallet size={28} strokeWidth={1.8} color="white" />,
  <Link2 size={28} strokeWidth={1.8} color="white" />,
  <Upload size={28} strokeWidth={1.8} color="white" />,
  <FolderOpen size={28} strokeWidth={1.8} color="white" />,
  <Share2 size={28} strokeWidth={1.8} color="white" />,
  <Download size={28} strokeWidth={1.8} color="white" />,
];

const steps = [
  {
    number: "01",
    title: "Install Wallet",
    description: "Pasang wallet Aptos seperti Petra atau OKX di browser Anda. Wallet ini akan digunakan untuk menyimpan dan mengakses file Anda.",
  },
  {
    number: "02", 
    title: "Connect Wallet",
    description: "Klik tombol 'Connect Wallet' di pojok kanan atas. Pilih wallet yang sudah dipasang dan approve koneksi.",
  },
  {
    number: "02.5",
    title: "Dapatkan Token Testnet",
    description: "Untuk upload file, kamu butuh APT dan ShelbyUSD di Shelby Testnet. Buka Petra wallet, switch ke Shelbynet, lalu klik tombol 'Faucet'. Untuk ShelbyUSD, bergabunglah di Discord Shelby.",
  },
  {
    number: "03",
    title: "Upload File",
    description: "Drag & drop file ke area upload atau klik untuk memilih. Isi nama blob dan lama penyimpanan, lalu klik Upload.",
  },
  {
    number: "04",
    title: "Kelola File",
    description: "Lihat semua file Anda di Explorer. Anda dapat preview, download, atau share file ke orang lain.",
  },
  {
    number: "05",
    title: "Share File",
    description: "Klik tombol Share pada file untuk menghasilkan link. Link dapat Anda bagikan ke siapa pun.",
  },
  {
    number: "06",
    title: "Download File",
    description: "Klik tombol Download pada file untuk mengunduh. File akan disimpan dengan nama asli.",
  },
];

export default function GuidePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'transparent', position: 'relative', zIndex: 1 }}>
      <Header />
      
      <main style={{ flex: 1, paddingTop: '64px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px' }}>
          
          {/* Hero Section */}
          <section style={{ marginBottom: '60px', textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 style={{
                fontSize: 'clamp(28px, 5vw, 48px)',
                fontWeight: 700,
                marginBottom: '24px',
                background: 'linear-gradient(135deg, var(--heading-from), var(--heading-to))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Panduan Penggunaan
              </h1>
              <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
                Langkah mudah menggunakan Shelby Drop
              </p>
            </motion.div>
          </section>

          {/* Steps Section */}
          <section style={{ marginBottom: '60px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  style={{ display: 'flex', gap: '24px' }}
                >
                  {/* Number */}
                  <div style={{ flexShrink: 0 }}>
                    <div style={{
                      width: '64px', height: '64px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 4px 20px rgba(139,92,246,0.3)'
                    }}>
                      {stepIcons[index]}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div style={{
                    flex: 1,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontFamily: 'monospace', color: 'var(--text-accent)' }}>{step.number}</span>
                      <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>{step.title}</h3>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Tips Section */}
          <section style={{ marginBottom: '60px', padding: '60px 0' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                  marginBottom: '32px'
                }}
              >
                Tips Penggunaan
              </motion.h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                {[
                  "Gunakan nama file yang deskriptif untuk mudah dicari",
                  "Pilih retention period yang sesuai kebutuhan",
                  "Backup wallet Anda dengan aman",
                  "Jangan share private key kepada siapa pun",
                  "Gunakan Explorer untuk melihat file orang lain",
                  "Gunakan fitur Share untuk berbagi file dengan mudah",
                ].map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      borderRadius: '12px'
                    }}
                  >
                    <Check size={16} strokeWidth={2.5} style={{ color: 'var(--text-success)' }} />
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{tip}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section style={{ textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ maxWidth: '500px', margin: '0 auto' }}
            >
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Siap memulai?
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                Connect wallet Anda dan mulai upload file pertama Anda ke Shelby Drop
              </p>
              <a
                href="/"
                style={{
                  display: 'inline-block',
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-blue))',
                  color: 'var(--text-on-accent)',
                  borderRadius: '8px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Mulai Sekarang
              </a>
            </motion.div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
