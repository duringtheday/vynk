import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        nm: {
          bg:     '#1a1a24',
          dark:   '#0d0d14',
          lite:   '#27273a',
          gold:   '#d4a843',
          'gold-lt': '#e8c96a',
          'gold-dk': '#a07830',
          text:   '#e8e8f0',
          muted:  '#6a6a8a',
          subtle: '#3a3a52',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #d4a843 0%, #e8c96a 50%, #a07830 100%)',
      },
      boxShadow: {
        'nm-raised':   '6px 6px 14px #0d0d14, -4px -4px 10px #27273a',
        'nm-raised-sm':'3px 3px 8px #0d0d14, -2px -2px 6px #27273a',
        'nm-inset':    'inset 4px 4px 10px #0d0d14, inset -3px -3px 8px #27273a',
        'nm-inset-sm': 'inset 2px 2px 6px #0d0d14, inset -2px -2px 4px #27273a',
        'nm-gold':     '4px 4px 12px #0d0d14, -2px -2px 8px #27273a, 0 0 20px rgba(212,168,67,0.18)',
        'nm-gold-lg':  '6px 6px 16px #0d0d14, -3px -3px 10px #27273a, 0 0 28px rgba(212,168,67,0.25)',
      },
    },
  },
  plugins: [],
}

export default config
