'use client'
import { useTheme } from '@/hooks/useTheme'
import { Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme()
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div 
      style={{ position: 'relative' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
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
              background: isDark ? 'rgba(15,15,35,0.95)' : 'rgba(255,255,255,0.95)',
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
            {isDark ? '☀️ Switch to Aurora Mode' : '🌙 Switch to Space Mode'}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleTheme}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'relative',
          width: '52px',
          height: '28px',
          borderRadius: '14px',
          border: `1px solid ${isDark ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.25)'}`,
          background: isDark
            ? 'rgba(139,92,246,0.15)'
            : 'rgba(167,139,250,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: '3px',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: 'blur(10px)',
          outline: 'none',
        }}
        aria-label="Toggle theme"
        title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      >
        {/* Thumb dengan icon */}
        <motion.div
          layout
          animate={{
            x: isDark ? 0 : 24,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: isDark
              ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
              : 'linear-gradient(135deg, #a855f7, #ec4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isDark
              ? '0 2px 8px rgba(139,92,246,0.5)'
              : '0 2px 8px rgba(168,85,247,0.5)',
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

        {/* Background icon hint */}
        <div style={{
          position: 'absolute',
          right: isDark ? '6px' : 'auto',
          left: isDark ? 'auto' : '6px',
          opacity: 0.3,
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
        }}>
          {isDark
            ? <Sun size={10} strokeWidth={2} color="#a78bfa" />
            : <Moon size={10} strokeWidth={2} color="#a855f7" />
          }
        </div>
      </motion.button>
    </div>
  )
}
