'use client'
import { useTheme } from '@/hooks/useTheme'
import { Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const TOGGLE_WIDTH  = 56
const TOGGLE_HEIGHT = 30
const THUMB_SIZE    = 22
const THUMB_PADDING = 4
const THUMB_TRAVEL  = TOGGLE_WIDTH - THUMB_SIZE - THUMB_PADDING * 2

export default function ThemeToggle() {
  const { toggleTheme, isDark, themeInfo, mounted: themeMounted } = useTheme()
  const [showTooltip, setShowTooltip] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Prevent hydration mismatch by rendering a placeholder of the same size
  if (!mounted || !themeMounted) {
    return <div style={{ width: TOGGLE_WIDTH, height: TOGGLE_HEIGHT, borderRadius: TOGGLE_HEIGHT / 2, background: 'rgba(255,255,255,0.05)' }} />
  }

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && themeInfo && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 10px)',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '6px 12px',
              borderRadius: '10px',
              background: 'var(--bg-dropdown)',
              border: '1px solid var(--border)',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3), 0 0 15px var(--glow)',
              whiteSpace: 'nowrap',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              zIndex: 100,
              backdropFilter: 'blur(12px)',
              pointerEvents: 'none',
            }}
          >
            <span style={{ marginRight: '6px' }}>{themeInfo.emoji}</span>
            {themeInfo.label} Mode
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleTheme}
        whileHover={{ scale: 1.05, borderColor: isDark ? 'rgba(139,92,246,0.8)' : 'rgba(99,102,241,0.6)' }}
        whileTap={{ scale: 0.95 }}
        aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
        style={{
          position: 'relative',
          width: TOGGLE_WIDTH,
          height: TOGGLE_HEIGHT,
          borderRadius: TOGGLE_HEIGHT / 2,
          border: `1.5px solid ${isDark ? 'rgba(139,92,246,0.5)' : 'rgba(99,102,241,0.3)'}`,
          background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: THUMB_PADDING,
          transition: 'background 0.4s, border-color 0.3s, box-shadow 0.3s',
          backdropFilter: 'blur(12px)',
          outline: 'none',
          boxShadow: isDark 
            ? '0 0 15px rgba(139,92,246,0.15), inset 0 2px 4px rgba(0,0,0,0.5)' 
            : '0 4px 12px rgba(99,102,241,0.1), inset 0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        {/* Thumb */}
        <motion.div
          layout
          animate={{ x: isDark ? 0 : THUMB_TRAVEL }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: '50%',
            background: isDark
              ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
              : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isDark
              ? '0 0 15px rgba(139,92,246,0.8), 0 2px 4px rgba(0,0,0,0.3)'
              : '0 0 15px rgba(251,191,36,0.6), 0 2px 4px rgba(0,0,0,0.1)',
            flexShrink: 0,
            zIndex: 2,
          }}
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="moon"
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <Moon size={12} strokeWidth={3} color="white" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <Sun size={12} strokeWidth={3} color="white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Hint icon on opposite side */}
        <div style={{
          position: 'absolute',
          right: isDark ? '10px' : 'auto',
          left: isDark ? 'auto' : '10px',
          opacity: 1,
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
        }}>
          {isDark
            ? <Sun  size={14} strokeWidth={2.5} color="#fbbf24" />
            : <Moon size={14} strokeWidth={2.5} color="#6366f1" />
          }
        </div>
      </motion.button>
    </div>
  )
}
