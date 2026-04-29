'use client'
import { useTheme } from '@/hooks/useTheme'
import { Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const TOGGLE_WIDTH  = 52
const TOGGLE_HEIGHT = 28
const THUMB_SIZE    = 20
const THUMB_PADDING = 3
const THUMB_TRAVEL  = TOGGLE_WIDTH - THUMB_SIZE - THUMB_PADDING * 2 // 24

export default function ThemeToggle() {
  const { toggleTheme, isDark, themeInfo, mounted: themeMounted } = useTheme()
  const [showTooltip, setShowTooltip] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted || !themeMounted) {
    return <div style={{ width: TOGGLE_WIDTH, height: TOGGLE_HEIGHT }} />
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 20px var(--glow)',
              whiteSpace: 'nowrap',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--text-primary)',
              zIndex: 100,
              backdropFilter: 'blur(10px)',
            }}
          >
            {themeInfo.emoji} {themeInfo.label}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleTheme}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
        style={{
          position: 'relative',
          width: TOGGLE_WIDTH,
          height: TOGGLE_HEIGHT,
          borderRadius: TOGGLE_HEIGHT / 2,
          border: `1px solid ${isDark ? 'rgba(100,150,255,0.3)' : 'rgba(100,120,180,0.25)'}`,
          background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(200,210,240,0.35)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: THUMB_PADDING,
          transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
          backdropFilter: 'blur(10px)',
          outline: 'none',
        }}
      >
        {/* Thumb */}
        <motion.div
          layout
          animate={{ x: isDark ? 0 : THUMB_TRAVEL }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: '50%',
            background: isDark
              ? 'linear-gradient(135deg, #6366f1, #3b82f6)'
              : 'linear-gradient(135deg, #f59e0b, #f97316)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isDark
              ? '0 2px 8px rgba(99,102,241,0.5)'
              : '0 2px 8px rgba(245,158,11,0.5)',
            flexShrink: 0,
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
                <Moon size={11} strokeWidth={2.5} color="white" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <Sun size={11} strokeWidth={2.5} color="white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Hint icon on opposite side */}
        <div style={{
          position: 'absolute',
          right: isDark ? '6px' : 'auto',
          left: isDark ? 'auto' : '6px',
          opacity: 0.35,
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
        }}>
          {isDark
            ? <Sun  size={10} strokeWidth={2} color="#818cf8" />
            : <Moon size={10} strokeWidth={2} color="#6b7280" />
          }
        </div>
      </motion.button>
    </div>
  )
}
