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
          primary: '#3B82F6',
          primarySoft: '#DBEAFE',
          secondary: '#1E3A8A',
          accent: '#10B981',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
          surface: '#FFFFFF',
          surfaceMuted: '#F8FAFC',
          border: '#E2E8F0',
          text: '#0F172A',
          textMuted: '#6B7280',
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
        glass: '0 18px 45px rgba(15,23,42,0.25)',
      },
      transitionDuration: {
        fast: '150ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config
