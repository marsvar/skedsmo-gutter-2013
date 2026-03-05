import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        nff: {
          blue: '#003087',
          red:  '#c6180e',
          gold: '#f5a623',
        },
        skedsmo: {
          red:   '#c6180e',
          dark:  '#0b0b0b',
          light: '#e1e8f2',
          gray:  '#444444',
        },
        day: {
          monday:   { DEFAULT: '#2563eb', light: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
          tuesday:  { DEFAULT: '#16a34a', light: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
          thursday: { DEFAULT: '#f97316', light: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
          saturday: { DEFAULT: '#9333ea', light: '#faf5ff', border: '#e9d5ff', text: '#7e22ce' },
        },
      },
    },
  },
  plugins: [],
}

export default config
