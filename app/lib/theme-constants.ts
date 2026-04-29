/**
 * Theme Constants — Single Source of Truth
 */

export const THEME_STORAGE_KEY = 'shelby-theme'

export const THEMES = {
  dark: {
    value: 'dark',
    label: 'Dark',
    emoji: '🌙',
    dataTheme: 'dark',
    isDark: true,
    description: 'Dark mode',
  },
  light: {
    value: 'light',
    label: 'Light',
    emoji: '☀️',
    dataTheme: 'light',
    isDark: false,
    description: 'Light mode',
  },
} as const

export type ThemeKey = keyof typeof THEMES
export type ThemeValue = typeof THEMES[ThemeKey]['value']

export const DEFAULT_THEME: ThemeKey = 'dark'
export const VALID_THEME_KEYS = Object.keys(THEMES) as ThemeKey[]

export function isValidTheme(value: string | null | undefined): value is ThemeKey {
  if (!value) return false
  return VALID_THEME_KEYS.includes(value as ThemeKey)
}

export function getTheme(key: ThemeKey) {
  return THEMES[key]
}
