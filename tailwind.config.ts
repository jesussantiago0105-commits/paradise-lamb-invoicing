import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f4faeb',
          100: '#e5f3d0',
          200: '#cce8a5',
          300: '#aad972',
          400: '#8dc63f',
          500: '#7ab518',
          600: '#5e8f12',
          700: '#496d10',
          800: '#3c5812',
          900: '#334b12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
