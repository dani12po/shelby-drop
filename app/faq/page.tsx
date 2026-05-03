"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WalletModal from "../components/wallet/WalletModal";
import { ChevronDown, ExternalLink, MessageCircle } from "lucide-react";

const faqs = [
  {
    question: "Apa itu Shelby Drop?",
    answer: "Shelby Drop adalah platform penyimpanan file terdesentralisasi yang dibangun di atas blockchain Aptos melalui Shelby Network. Platform ini memungkinkan pengguna untuk mengupload, menyimpan, dan berbagi file dengan keamanan blockchain.",
  },
  {
    question: "Apa itu Shelby Network?",
    answer: "Shelby Network adalah infrastruktur blockchain berbasis Aptos yang menyediakan layanan penyimpanan data terdesentralisasi. Shelby Network menawarkan kecepatan tinggi, biaya rendah, dan keamanan yang dijamin oleh teknologi blockchain.",
  },
  {
    question: "Wallet apa saja yang didukung?",
    answer: "Shelby Drop mendukung berbagai wallet Aptos termasuk Petra, OKX, Martian, dan Backpack. Anda dapat memilih wallet mana saja yang ingin digunakan untuk connect ke aplikasi.",
  },
  {
    question: "Berapa biaya upload file?",
    answer: "Biaya upload file di Shelby Drop bervariasi tergantung pada ukuran file dan lama penyimpanan (retention days). Biaya ini digunakan untuk menutupi biaya transaksi di blockchain Aptos. Anda memerlukan APT (Aptos token) untuk membayar biaya transaksi.",
  },
  {
    question: "Apakah file saya aman?",
    answer: "Ya, file Anda aman. Setiap file yang diupload ke Shelby Drop disimpan secara terdesentralisasi di blockchain. Kepemilikan file dapat diverifikasi secara on-chain, memberikan bukti transparan bahwa Anda adalah pemilik file tersebut.",
  },
  {
    question: "Apa itu Retention Days?",
    answer: "Retention Days adalah periode berapa lama file akan disimpan di jaringan blockchain. Anda dapat memilih antara 1 hingga 365 hari. Setelah periode ini, file mungkin tidak lagi dapat diakses tergantung pada konfigurasi.",
  },
  {
    question: "Bagaimana cara download file orang lain?",
    answer: "Anda dapat menggunakan fitur Explorer untuk mencari wallet address tertentu dan melihat file-file yang dimiliki oleh wallet tersebut. Selama file tersebut publik, Anda dapat melihat preview dan mendownloadnya.",
  },
  {
    question: "Bagaimana cara share file?",
    answer: "Klik tombol Share pada file yang ingin Anda bagikan. Sistem akan menghasilkan link yang dapat Anda bagikan ke siapa pun. Penerima dapat membuka link tersebut untuk melihat preview atau mendownload file.",
  },
  {
    question: "Apakah Shelby Drop gratis digunakan?",
    answer: "Shelby Drop gratis untuk diakses dan browse file. Untuk upload file, Anda memerlukan APT tokens (untuk gas fee) dan ShelbyUSD tokens (untuk biaya storage) di Shelby Testnet. Kedua token ini bisa didapatkan gratis melalui faucet testnet.",
  },
  {
    question: "Di mana saya bisa mendapatkan APT dan ShelbyUSD untuk testnet?",
    answer: "APT testnet bisa didapatkan melalui Petra wallet dengan klik tombol 'Faucet' setelah memastikan berada di network Testnet. ShelbyUSD testnet bisa didapatkan dengan bergabung di Discord Shelby (discord.gg/shelbyserves) dan request di channel yang tersedia.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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
              <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-extrabold mb-6 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Frequently Asked Questions
              </h1>
              <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-[600px] mx-auto">
                Jawaban untuk pertanyaan yang sering diajukan tentang Shelby Drop.
              </p>
            </motion.div>
          </section>

          {/* FAQ Section */}
          <section className="mb-20">
            <div className="max-w-[800px] mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden backdrop-blur-xl"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left transition-colors hover:bg-[var(--bg-card-hover)]"
                  >
                    <span className="text-[var(--text-primary)] font-bold text-sm md:text-base pr-8">
                      {faq.question}
                    </span>
                    <ChevronDown 
                      size={20} 
                      className={`text-[var(--text-muted)] transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 text-[var(--text-secondary)] text-sm md:text-base leading-relaxed border-t border-[var(--border)] pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-[600px] mx-auto p-10 rounded-3xl bg-gradient-to-b from-[var(--bg-card)] to-transparent border border-[var(--border)]"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">
                Masih ada pertanyaan?
              </h2>
              <p className="text-[var(--text-secondary)] mb-10">
                Jika Anda tidak menemukan jawaban yang Anda cari, jangan ragu untuk menghubungi kami.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://docs.shelby.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                  <ExternalLink size={18} />
                  Dokumentasi
                </a>
                <a
                  href="https://x.com/Iq_dani26"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-8 py-3.5 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl font-bold hover:border-[var(--text-accent)] transition-all"
                >
                  <MessageCircle size={18} />
                  Hubungi Kami
                </a>
              </div>
            </motion.div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
