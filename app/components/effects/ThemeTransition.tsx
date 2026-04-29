'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { useEffect, useState } from 'react'

export default function ThemeTransition() {
  const { isDark } = useTheme()
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    const t = setTimeout(() => setShow(false), 600)
    return () => clearTimeout(t)
  }, [isDark])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            pointerEvents: 'none',
            background: isDark
              ? 'radial-gradient(circle at center, rgba(80,100,200,0.4) 0%, transparent 70%)'
              : 'radial-gradient(circle at center, rgba(200,210,240,0.4) 0%, transparent 70%)',
          }}
        />
      )}
    </AnimatePresence>
  )
}
