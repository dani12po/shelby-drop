"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

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
    answer: "APT testnet bisa didapatkan melalui Petra wallet dengan klik tombol 'Faucet' setelah switch ke network Shelbynet. ShelbyUSD testnet bisa didapatkan dengan bergabung di Discord Shelby (discord.gg/shelbyserves) dan request di channel yang tersedia.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#050508' }}>
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
                color: 'white',
                marginBottom: '24px',
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Frequently Asked Questions
              </h1>
              <p style={{ fontSize: '18px', color: '#94a3b8' }}>
                Jawaban untuk pertanyaan yang sering diajukan
              </p>
            </motion.div>
          </section>

          {/* FAQ Section */}
          <section style={{ marginBottom: '60px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    background: 'rgba(15,15,23,0.7)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '20px 24px',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ color: 'white', fontWeight: 500, fontSize: '16px', flex: 1, paddingRight: '16px' }}>{faq.question}</span>
                    <span style={{ 
                      color: '#94a3b8', 
                      transition: 'transform 0.2s',
                      transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div style={{ padding: '0 24px 20px', color: '#94a3b8', lineHeight: 1.7 }}>
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
          <section style={{ padding: '60px 0', background: 'rgba(15,15,23,0.5)', borderRadius: '16px', textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ maxWidth: '500px', margin: '0 auto', padding: '0 24px' }}
            >
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
                Masih ada pertanyaan?
              </h2>
              <p style={{ color: '#94a3b8', marginBottom: '32px' }}>
                Jika Anda tidak menemukan jawaban yang Anda cari, jangan ragu untuk menghubungi kami.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <a
                  href="https://docs.shelby.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: 500,
                    textDecoration: 'none'
                  }}
                >
                  Dokumentasi
                </a>
                <a
                  href="https://x.com/Iq_dani26"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: 500,
                    textDecoration: 'none'
                  }}
                >
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
