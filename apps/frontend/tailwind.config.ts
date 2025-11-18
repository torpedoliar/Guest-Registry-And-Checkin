import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2563eb',
          primarySoft: '#dbeafe',
          accent: '#22c55e',
          danger: '#ef4444',
          surface: '#ffffff',
          surfaceMuted: '#f8fafc',
          border: '#e2e8f0',
          text: '#0f172a',
          textMuted: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'ui-sans-serif', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        soft: '0 12px 30px rgba(15,23,42,0.08)',
        card: '0 18px 45px rgba(15,23,42,0.12)',
      },
    },
  },
  plugins: [],
} satisfies Config
