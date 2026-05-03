"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WalletModal from "../components/wallet/WalletModal";
import { Shield, Infinity, Zap, Lock, ExternalLink, Github, Twitter, Linkedin } from 'lucide-react';

type Feature = {
  icon: React.ReactNode
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: <Lock size={28} strokeWidth={1.8} className="text-purple-500" />,
    title: "Terdesentralisasi",
    description: "File disimpan di jaringan blockchain Aptos, bukan server terpusat. Data Anda sepenuhnya milik Anda.",
  },
  {
    icon: <Infinity size={28} strokeWidth={1.8} className="text-blue-500" />,
    title: "Permanen",
    description: "File akan tetap tersimpan selama Anda menentukan retention period. Tanpa takut data hilang.",
  },
  {
    icon: <Zap size={28} strokeWidth={1.8} className="text-cyan-500" />,
    title: "Cepat",
    description: "Dibangun di atas infrastruktur Shelby Network yang modern dan responsif.",
  },
  {
    icon: <Shield size={28} strokeWidth={1.8} className="text-emerald-500" />,
    title: "Aman",
    description: "Setiap file dienkripsi dan diverifikasi secara on-chain. Bukti kepemilikan transparan.",
  },
];

export default function AboutPage() {
  const { wallets, connect, connected, disconnect } = useWallet();
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-transparent relative z-[1]">
      <Header 
        connected={connected} 
        onConnect={() => setWalletModalOpen(true)} 
        onDisconnect={disconnect} 
      />
      
      <WalletModal
        open={walletModalOpen}
        wallets={wallets.map((w) => w.name)}
        onSelectWallet={(name) => {
          connect(name);
          setWalletModalOpen(false);
        }}
        onClose={() => setWalletModalOpen(false)}
      />
      
      <main className="flex-1 pt-16">
        <div className="max-w-[1280px] mx-auto px-6 py-12 md:py-20">
          
          {/* Hero Section */}
          <section className="mb-16 md:mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-extrabold mb-6 bg-gradient-to-br from-[var(--heading-from)] to-[var(--heading-to)] bg-clip-text text-transparent">
                Tentang Shelby Drop
              </h1>
              <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-[700px] mx-auto leading-relaxed">
                Platform penyimpanan file terdesentralisasi di blockchain Aptos 
                melalui Shelby Network. Upload, simpan, dan share file dengan 
                keamanan blockchain.
              </p>
            </motion.div>
          </section>

          {/* Features Section */}
          <section className="mb-16 md:mb-24">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] text-center mb-12"
            >
              Keunggulan Shelby Drop
            </motion.h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 backdrop-blur-xl hover:border-[var(--text-accent)] transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">{feature.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* About Section */}
          <section className="mb-16 md:mb-24 bg-[var(--bg-card)]/30 border border-[var(--border)] rounded-3xl overflow-hidden">
            <div className="max-w-[800px] mx-auto px-6 py-12 md:py-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-8"
              >
                Latar Belakang
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="space-y-6 text-[var(--text-secondary)] text-base md:text-lg leading-relaxed"
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
          <section className="text-center mb-16 md:mb-24">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-10"
            >
              Link Tambahan
            </motion.h2>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://shelby.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20"
              >
                Shelby.xyz <ExternalLink size={16} />
              </a>
              <a
                href="https://docs.shelby.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl font-semibold hover:border-[var(--text-accent)] transition-all"
              >
                Dokumentasi <ExternalLink size={16} />
              </a>
              <a
                href="https://explorer.shelby.xyz/testnet"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl font-semibold hover:border-[var(--text-accent)] transition-all"
              >
                Shelby Explorer <ExternalLink size={16} />
              </a>
            </div>
          </section>

          {/* Creator Section */}
          <section className="py-12 md:py-16 text-center">
            <div className="max-w-[600px] mx-auto p-8 rounded-3xl bg-gradient-to-b from-[var(--bg-card)] to-transparent border border-[var(--border)]">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mx-auto mb-6 flex items-center justify-center text-3xl shadow-xl shadow-purple-500/20">
                👨‍💻
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                Dibuat oleh Imam Qolandani
              </h3>
              <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed mb-8">
                Web3 developer yang passionate tentang decentralized technology
                dan ekosistem Aptos blockchain.
              </p>
              <div className="flex items-center justify-center gap-6">
                <a href="https://x.com/Iq_dani26" target="_blank" className="text-[var(--text-secondary)] hover:text-blue-400 transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="https://github.com/dani12po" target="_blank" className="text-[var(--text-secondary)] hover:text-white transition-colors">
                  <Github size={20} />
                </a>
                <a href="https://www.linkedin.com/in/imam-qolandani-070373149/" target="_blank" className="text-[var(--text-secondary)] hover:text-blue-600 transition-colors">
                  <Linkedin size={20} />
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
