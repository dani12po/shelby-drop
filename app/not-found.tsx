'use client'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#050508',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      textAlign: 'center',
      padding: '24px'
    }}>
      <div style={{
        fontSize: '6rem',
        fontWeight: 800,
        background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: 1,
        marginBottom: '16px'
      }}>
        404
      </div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
        Halaman tidak ditemukan
      </h1>
      <p style={{ color: '#64748b', marginBottom: '32px', maxWidth: '400px' }}>
        Halaman yang kamu cari tidak ada atau sudah dipindahkan.
      </p>
      <Link href="/" style={{
        padding: '12px 32px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
        color: 'white',
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '0.9rem'
      }}>
        Kembali ke Home
      </Link>
    </div>
  )
}
