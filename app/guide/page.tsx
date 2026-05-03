"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WalletModal from "../components/wallet/WalletModal";
import { Wallet, Link2, Upload, FolderOpen, Share2, Download, Check, ArrowRight } from 'lucide-react';
import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: <Wallet size={24} />,
    title: "Install Wallet",
    description: "Pasang wallet Aptos seperti Petra atau OKX di browser Anda. Wallet ini akan digunakan untuk menyimpan dan mengakses file Anda.",
  },
  {
    number: "02", 
    icon: <Link2 size={24} />,
    title: "Connect Wallet",
    description: "Klik tombol 'Connect Wallet' di pojok kanan atas. Pilih wallet yang sudah dipasang dan approve koneksi.",
  },
  {
    number: "02.5",
    icon: <Check size={24} />,
    title: "Dapatkan Token Testnet",
    description: "Untuk upload file, kamu butuh APT dan ShelbyUSD di Shelby Testnet. Buka Petra wallet, pastikan berada di network Testnet, lalu klik tombol 'Faucet'. Untuk ShelbyUSD, bergabunglah di Discord Shelby.",
  },
  {
    number: "03",
    icon: <Upload size={24} />,
    title: "Upload File",
    description: "Drag & drop file ke area upload atau klik untuk memilih. Isi nama blob dan lama penyimpanan, lalu klik Upload.",
  },
  {
    number: "04",
    icon: <FolderOpen size={24} />,
    title: "Kelola File",
    description: "Lihat semua file Anda di Explorer. Anda dapat preview, download, atau share file ke orang lain.",
  },
  {
    number: "05",
    icon: <Share2 size={24} />,
    title: "Share File",
    description: "Klik tombol Share pada file untuk menghasilkan link. Link dapat Anda bagikan ke siapa pun.",
  },
  {
    number: "06",
    icon: <Download size={24} />,
    title: "Download File",
    description: "Klik tombol Download pada file untuk mengunduh. File akan disimpan dengan nama asli.",
  },
];

export default function GuidePage() {
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
          <section className="mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-extrabold mb-6 bg-gradient-to-br from-[var(--heading-from)] to-[var(--heading-to)] bg-clip-text text-transparent">
                Panduan Penggunaan
              </h1>
              <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-[600px] mx-auto">
                Langkah mudah menggunakan Shelby Drop untuk penyimpanan file terdesentralisasi.
              </p>
            </motion.div>
          </section>

          {/* Steps Section */}
          <section className="mb-20">
            <div className="max-w-[900px] mx-auto space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col md:flex-row gap-6 items-start"
                >
                  {/* Icon & Number */}
                  <div className="flex-shrink-0 flex md:flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                      {step.icon}
                    </div>
                    <div className="text-xs font-mono font-bold text-[var(--text-accent)] bg-[var(--bg-card)] px-3 py-1 rounded-full border border-[var(--border)]">
                      {step.number}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 backdrop-blur-xl hover:border-[var(--text-accent)] transition-colors group">
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--text-accent)] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-sm md:text-base">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Tips Section */}
          <section className="mb-20 py-16 bg-[var(--bg-card)]/30 border-y border-[var(--border)]">
            <div className="max-w-[1000px] mx-auto px-6">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] text-center mb-12"
              >
                Tips Penggunaan
              </motion.h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl hover:border-emerald-500/50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Check size={14} className="text-emerald-500" />
                    </div>
                    <span className="text-sm text-[var(--text-secondary)]">{tip}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-[600px] mx-auto p-10 rounded-3xl bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/20"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">
                Siap memulai?
              </h2>
              <p className="text-[var(--text-secondary)] mb-8">
                Connect wallet Anda dan mulai upload file pertama Anda ke Shelby Drop
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-xl shadow-purple-500/20 group"
              >
                Mulai Sekarang
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
