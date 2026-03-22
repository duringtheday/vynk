import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        graphite: '#0D0F12',
        gold:     '#D4A84F',
        silver:   '#BFC3C9',
        smoke:    '#6F737A',
        carbon:   '#050607',
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      boxShadow: {
        'nm-raised':   '5px 5px 14px #08090B, -3px -3px 10px #141720',
        'nm-raised-sm':'3px 3px 8px #08090B, -2px -2px 6px #141720',
        'nm-inset':    'inset 4px 4px 10px #08090B, inset -3px -3px 8px #141720',
        'nm-inset-sm': 'inset 2px 2px 6px #08090B, inset -2px -2px 5px #141720',
        'nm-gold':     '4px 4px 14px #08090B, -2px -2px 8px #141720, 0 0 22px rgba(212,168,79,0.2)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4A84F 0%, #E8C06A 50%, #A07830 100%)',
        'silver-gradient': 'linear-gradient(135deg, #BFC3C9 0%, #E8EAED 50%, #8A8E94 100%)',
      },
    },
  },
  plugins: [],
}

export default config
