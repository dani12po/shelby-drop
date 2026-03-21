"use client";

import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const roadmap = [
  { quarter: "Q1 2025", items: ["Launch Shelby Drop Beta", "Basic upload/download", "Wallet integration"] },
  { quarter: "Q2 2025", items: ["Multi-wallet support", "File preview", "Share links"] },
  { quarter: "Q3 2025", items: ["Bulk upload", "Folder organization", "Search & filter"] },
  { quarter: "Q4 2025", items: ["Mobile app", "Public API", "NFT integration"] },
];

export default function VisionPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#050508' }}>
      <Header />
      
      <main style={{ flex: 1, paddingTop: '64px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px' }}>
          
          {/* Hero Section */}
          <section style={{ marginBottom: '80px', textAlign: 'center' }}>
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
                Visi & Misi
              </h1>
              <p style={{ fontSize: '18px', color: '#94a3b8' }}>
                Membangun masa depan penyimpanan file terdesentralisasi
              </p>
            </motion.div>
          </section>

          {/* Vision Section */}
          <section style={{ marginBottom: '80px', padding: '60px 0', background: 'rgba(15,15,23,0.5)', borderRadius: '16px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  background: 'rgba(139,92,246,0.2)',
                  borderRadius: '9999px',
                  color: '#8b5cf6',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  Visi Kami
                </div>
                <h2 style={{
                  fontSize: 'clamp(20px, 3vw, 28px)',
                  fontWeight: 700,
                  color: 'white',
                  lineHeight: 1.5
                }}>
                  "Menjadi platform penyimpanan file terdesentralisasi terdepan 
                  di ekosistem Aptos, memberdayakan pengguna dengan kontrol penuh 
                  atas data mereka."
                </h2>
              </motion.div>
            </div>
          </section>

          {/* Mission Section */}
          <section style={{ marginBottom: '80px' }}>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: 'white',
                textAlign: 'center',
                marginBottom: '48px'
              }}
            >
              Misi Kami
            </motion.h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                  style={{
                    display: 'flex',
                    gap: '24px',
                    padding: '24px',
                    background: 'rgba(15,15,23,0.7)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px'
                  }}
                >
                  <span style={{
                    fontSize: '36px',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>{mission.number}</span>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>{mission.title}</h3>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{mission.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Roadmap Section */}
          <section style={{ padding: '60px 0', background: 'rgba(15,15,23,0.5)', borderRadius: '16px' }}>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: 'white',
                textAlign: 'center',
                marginBottom: '48px'
              }}
            >
              Roadmap 2025
            </motion.h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
              padding: '0 24px'
            }}>
              {roadmap.map((quarter, index) => (
                <motion.div
                  key={quarter.quarter}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    padding: '24px',
                    background: 'rgba(15,15,23,0.7)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px'
                  }}
                >
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#8b5cf6', marginBottom: '16px' }}>{quarter.quarter}</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {quarter.items.map((item) => (
                      <li key={item} style={{ fontSize: '14px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
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
