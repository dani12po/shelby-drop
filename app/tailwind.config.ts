import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        shelby: {
          bg: '#0b0f14',
          panel: '#111827',
          text: '#e5e7eb',
          muted: '#9ca3af',
          accent: '#3b82f6',
          accentHover: '#2563eb',
          hover: 'rgba(255,255,255,0.04)',
        },
      },
    },
  },
  plugins: [],
}

export default config
