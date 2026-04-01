import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5f9',
          100: '#e0eaf3',
          200: '#b8cfe3',
          300: '#7fb3cd',
          400: '#4797b7',
          500: '#2e75b6',
          600: '#1b4f72',
          700: '#163d5f',
          800: '#143450',
          900: '#122a42',
        },
        secondary: {
          50: '#f0f4f8',
          100: '#e0e9f1',
          200: '#b8d0e0',
          300: '#7fb3cd',
          400: '#4797b7',
          500: '#2e75b6',
          600: '#265b94',
          700: '#1f467a',
          800: '#173460',
          900: '#0f254f',
        },
        accent: {
          50: '#f0f7fc',
          100: '#e0eef9',
          200: '#b8ddf3',
          300: '#7fb9ed',
          400: '#4796e8',
          500: '#3498db',
          600: '#2e7ab5',
          700: '#265c8f',
          800: '#1f476a',
          900: '#173250',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
