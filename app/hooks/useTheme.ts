'use client'
import { useState, useEffect } from 'react'
import {
  THEME_STORAGE_KEY,
  THEMES,
  DEFAULT_THEME,
  isValidTheme,
  type ThemeKey,
} from '@/lib/theme-constants'

export function useTheme() {
  const [theme, setTheme] = useState<ThemeKey>(DEFAULT_THEME)
  const [isDark, setIsDark] = useState(THEMES[DEFAULT_THEME].isDark)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)

    // Map old theme keys (space → dark, aurora → light)
    const legacyMap: Record<string, ThemeKey> = { space: 'dark', aurora: 'light' }
    const mapped = saved && legacyMap[saved] ? legacyMap[saved] : saved
    const initial: ThemeKey = isValidTheme(mapped) ? (mapped as ThemeKey) : DEFAULT_THEME

    // Fix stale value in localStorage
    if (saved !== initial) {
      localStorage.setItem(THEME_STORAGE_KEY, initial)
    }

    setTheme(initial)
    setIsDark(THEMES[initial].isDark)
    document.documentElement.setAttribute('data-theme', THEMES[initial].dataTheme)
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const next: ThemeKey = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setIsDark(THEMES[next].isDark)
    localStorage.setItem(THEME_STORAGE_KEY, next)
    document.documentElement.setAttribute('data-theme', THEMES[next].dataTheme)
  }

  return {
    theme,
    toggleTheme,
    isDark,
    mounted,
    themeInfo: THEMES[theme],
  }
}
