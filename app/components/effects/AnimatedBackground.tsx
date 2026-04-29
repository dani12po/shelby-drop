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

      {/* ORB 1 — DARK mode only: purple */}
      {isDark && (
        <div style={{
          position: 'absolute',
          top: '-20%', left: '-15%',
          width: '65vw', height: '65vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(139,92,246,0.25) 0%, rgba(99,102,241,0.15) 35%, transparent 70%)',
          animation: 'orbFloat1 14s ease-in-out infinite',
          filter: 'blur(35px)',
          willChange: 'transform',
          pointerEvents: 'none',
        }} />
      )}

      {/* ORB 2 — DARK mode only: blue-cyan */}
      {isDark && (
        <div style={{
          position: 'absolute',
          top: '5%', right: '-20%',
          width: '58vw', height: '58vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(59,130,246,0.2) 0%, rgba(6,182,212,0.12) 40%, transparent 70%)',
          animation: 'orbFloat2 18s ease-in-out infinite',
          filter: 'blur(35px)',
          willChange: 'transform',
          pointerEvents: 'none',
        }} />
      )}

      {/* ORB 3 — DARK mode only: pink-purple */}
      {isDark && (
        <div style={{
          position: 'absolute',
          bottom: '-15%', left: '20%',
          width: '55vw', height: '55vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(236,72,153,0.15) 0%, rgba(139,92,246,0.1) 50%, transparent 70%)',
          animation: 'orbFloat3 22s ease-in-out infinite',
          filter: 'blur(40px)',
          willChange: 'transform',
          pointerEvents: 'none',
        }} />
      )}

      {/* ORB 4 — DARK mode only: cyan-blue */}
      {isDark && (
        <div style={{
          position: 'absolute',
          bottom: '15%', left: '-8%',
          width: '40vw', height: '40vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(6,182,212,0.15) 0%, rgba(59,130,246,0.08) 55%, transparent 70%)',
          animation: 'orbFloat2 16s ease-in-out infinite reverse',
          filter: 'blur(30px)',
          willChange: 'transform',
          pointerEvents: 'none',
        }} />
      )}

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
