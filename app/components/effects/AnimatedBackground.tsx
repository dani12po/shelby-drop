'use client'
import { useTheme } from '@/hooks/useTheme'

export default function AnimatedBackground() {
  const { isDark } = useTheme()

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      background: 'var(--bg-primary)',
      transition: 'background 0.6s ease',
    }}>

      {/* ORB 1 — kiri atas, DARK: purple, LIGHT: violet-rose */}
      <div style={{
        position: 'absolute',
        top: '-20%', left: '-15%',
        width: '65vw', height: '65vw',
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle at center, rgba(139,92,246,0.25) 0%, rgba(99,102,241,0.15) 35%, transparent 70%)'
          : 'radial-gradient(circle at center, rgba(192,132,252,0.3) 0%, rgba(251,113,133,0.15) 45%, transparent 70%)',
        animation: 'orbFloat1 14s ease-in-out infinite',
        filter: 'blur(50px)',
        willChange: 'transform',
        pointerEvents: 'none',
        transition: 'background 0.8s ease',
      }} />

      {/* ORB 2 — kanan atas, DARK: blue-cyan, LIGHT: peach-mint */}
      <div style={{
        position: 'absolute',
        top: '5%', right: '-20%',
        width: '58vw', height: '58vw',
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle at center, rgba(59,130,246,0.2) 0%, rgba(6,182,212,0.12) 40%, transparent 70%)'
          : 'radial-gradient(circle at center, rgba(251,191,36,0.2) 0%, rgba(52,211,153,0.15) 45%, transparent 70%)',
        animation: 'orbFloat2 18s ease-in-out infinite',
        filter: 'blur(45px)',
        willChange: 'transform',
        pointerEvents: 'none',
        transition: 'background 0.8s ease',
      }} />

      {/* ORB 3 — bawah tengah, DARK: pink-purple, LIGHT: amber-rose */}
      <div style={{
        position: 'absolute',
        bottom: '-15%', left: '20%',
        width: '55vw', height: '55vw',
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle at center, rgba(236,72,153,0.15) 0%, rgba(139,92,246,0.1) 50%, transparent 70%)'
          : 'radial-gradient(circle at center, rgba(251,113,133,0.2) 0%, rgba(251,191,36,0.12) 50%, transparent 70%)',
        animation: 'orbFloat3 22s ease-in-out infinite',
        filter: 'blur(55px)',
        willChange: 'transform',
        pointerEvents: 'none',
        transition: 'background 0.8s ease',
      }} />

      {/* ORB 4 — kiri bawah kecil */}
      <div style={{
        position: 'absolute',
        bottom: '15%', left: '-8%',
        width: '40vw', height: '40vw',
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle at center, rgba(6,182,212,0.15) 0%, rgba(59,130,246,0.08) 55%, transparent 70%)'
          : 'radial-gradient(circle at center, rgba(99,102,241,0.15) 0%, rgba(167,139,250,0.1) 55%, transparent 70%)',
        animation: 'orbFloat2 16s ease-in-out infinite reverse',
        filter: 'blur(40px)',
        willChange: 'transform',
        pointerEvents: 'none',
        transition: 'background 0.8s ease',
      }} />

      {/* NEBULA CENTER GLOW — dark mode only */}
      {isDark && (
        <div style={{
          position: 'absolute',
          top: '30%', left: '35%',
          width: '30vw', height: '30vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(139,92,246,0.08) 0%, rgba(99,102,241,0.05) 50%, transparent 70%)',
          animation: 'nebulaDrift 10s ease-in-out infinite',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />
      )}

      {/* AURORA SHIMMER — light mode only */}
      {!isDark && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(192,132,252,0.06) 0%, rgba(251,113,133,0.05) 35%, rgba(251,191,36,0.05) 65%, rgba(52,211,153,0.06) 100%)',
          backgroundSize: '300% 300%',
          animation: 'auroraShift 10s ease-in-out infinite alternate',
          pointerEvents: 'none',
        }} />
      )}

      {/* GRID PATTERN */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: isDark
          ? `linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)`
          : `linear-gradient(rgba(139,92,246,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.07) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
        transition: 'opacity 0.6s ease',
      }} />

    </div>
  )
}
