'use client'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      textAlign: 'center',
      padding: '24px'
    }}>
      {/* Grid background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* 404 number */}
        <div style={{
          fontSize: 'clamp(6rem, 20vw, 10rem)',
          fontWeight: 800,
          lineHeight: 1,
          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '16px',
          letterSpacing: '-0.05em'
        }}>
          404
        </div>

        <h1 style={{
          fontSize: '1.5rem', fontWeight: 700,
          color: '#f1f5f9', marginBottom: '8px'
        }}>
          Halaman tidak ditemukan
        </h1>

        <p style={{
          color: '#64748b', marginBottom: '40px',
          maxWidth: '360px', lineHeight: 1.6,
          fontSize: '0.95rem'
        }}>
          Halaman yang kamu cari tidak ada atau
          sudah dipindahkan ke alamat lain.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{
            padding: '12px 28px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            color: 'white', textDecoration: 'none',
            fontWeight: 600, fontSize: '0.9rem',
            transition: 'opacity 0.2s'
          }}>
            Kembali ke Home
          </Link>
          <Link href="/guide" style={{
            padding: '12px 28px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8', textDecoration: 'none',
            fontWeight: 600, fontSize: '0.9rem',
            transition: 'all 0.2s'
          }}>
            Lihat Panduan
          </Link>
        </div>
      </div>
    </div>
  )
}
