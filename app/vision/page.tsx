"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WalletModal from "../components/wallet/WalletModal";

const roadmap = [
  { quarter: "Q1 2026", items: ["Launch Shelby Drop Beta", "Basic upload/download", "Wallet integration"] },
  { quarter: "Q2 2026", items: ["Multi-wallet support", "File preview", "Share links"] },
  { quarter: "Q3 2026", items: ["Bulk upload", "Folder organization", "Search & filter"] },
  { quarter: "Q4 2026", items: ["Mobile app", "Public API", "NFT integration"] },
];

export default function VisionPage() {
  const { wallets, connect } = useWallet();
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const handleConnect = () => setWalletModalOpen(true);

  return (
    <div className="min-h-screen flex flex-col bg-transparent relative z-[1]">
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
      
      <main className="flex-1 pt-16">
        <div className="max-w-[1280px] mx-auto px-6 py-10 md:py-16">
          
          {/* Hero Section */}
          <section className="mb-12 md:mb-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h1 className="text-[clamp(32px,5vw,48px)] font-extrabold text-[var(--text-primary)] mb-6 tracking-tight">
                Visi & Misi <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-blue)] bg-clip-text text-transparent">Shelby Drop</span>
              </h1>
              <p className="text-lg text-[var(--text-secondary)] max-w-[700px] mx-auto leading-relaxed">
                Membangun masa depan penyimpanan data yang aman, terdesentralisasi, dan sepenuhnya dalam kendali Anda.
              </p>
            </motion.div>
          </section>

          {/* Vision Section */}
          <section className="mb-12 md:mb-20 py-10 md:py-16">
            <div className="max-w-[800px] mx-auto px-6 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="p-8 md:p-12 bg-[var(--bg-card)] border border-[var(--border)] rounded-[24px] relative overflow-hidden"
              >
                <div className="text-[var(--text-accent)] text-[12px] font-semibold mb-4 uppercase tracking-[0.1em]">
                  Visi Kami
                </div>
                <h2 className="text-[clamp(20px,3vw,28px)] font-bold text-[var(--text-primary)] leading-relaxed">
                  "Menjadi platform penyimpanan file terdesentralisasi terdepan 
                  di ekosistem Aptos, memberdayakan pengguna dengan kontrol penuh 
                  atas data mereka."
                </h2>
              </motion.div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="mb-12 md:mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] text-center mb-10 md:mb-12"
            >
              Misi Kami
            </motion.h2>
            
            <div className="flex flex-col gap-6">
              {[
                {
                  number: "01",
                  title: "Mudah Diakses",
                  description: "Memberikan akses mudah ke Shelby Network untuk semua pengguna, tanpa memandang tingkat teknis mereka.",
                },
                {
                  number: "02",
                  title: "Keamanan & Kepemilikan",
                  description: "Menjamin keamanan dan kepemilikan data pengguna dengan teknologi blockchain yang transparan.",
                },
                {
                  number: "03",
                  title: "Infrastruktur Web3",
                  description: "Membangun infrastruktur Web3 yang ramah developer untuk ekosistem yang berkembang.",
                },
              ].map((mission, index) => (
                <motion.div
                  key={mission.number}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col sm:flex-row gap-6 p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl backdrop-blur-md"
                >
                  <span className="text-4xl font-bold bg-gradient-to-br from-[var(--accent)] to-[var(--accent-blue)] bg-clip-text text-transparent">
                    {mission.number}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{mission.title}</h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed">{mission.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Roadmap Section */}
          <section className="py-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[28px] font-bold text-[var(--text-primary)] text-center mb-12"
            >
              Roadmap 2026
            </motion.h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-0 sm:px-6">
              {roadmap.map((quarter, index) => (
                <motion.div
                  key={quarter.quarter}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl backdrop-blur-md"
                >
                  <h3 className="text-[18px] font-semibold text-[var(--accent)] mb-4">{quarter.quarter}</h3>
                  <ul className="list-none p-0 m-0 flex flex-col gap-2">
                    {quarter.items.map((item) => (
                      <li key={item} className="text-[14px] text-[var(--text-secondary)] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
