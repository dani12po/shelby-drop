'use client'
import { useEffect } from 'react'
import { THEME_STORAGE_KEY, DEFAULT_THEME, isValidTheme } from '@/lib/theme-constants'

export default function ThemeProvider({
  children
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    const theme = isValidTheme(saved) ? saved : DEFAULT_THEME

    // Clear stale old theme keys (space/aurora → dark)
    if (saved && !isValidTheme(saved)) {
      localStorage.setItem(THEME_STORAGE_KEY, DEFAULT_THEME)
    }

    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  return <>{children}</>
}
