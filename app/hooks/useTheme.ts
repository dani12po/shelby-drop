'use client'
import { useState, useEffect } from 'react'

export type Theme = 'dark' | 'light'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // Only run on client
    const saved = localStorage.getItem('shelby-theme') as Theme | null
    const initialTheme = saved || 'dark'
    setTheme(initialTheme)
    setIsDark(initialTheme === 'dark')
    document.documentElement.setAttribute('data-theme', initialTheme)
  }, [])

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setIsDark(next === 'dark')
    localStorage.setItem('shelby-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return { 
    theme, 
    toggleTheme, 
    isDark,
    mounted: true
  }
}
