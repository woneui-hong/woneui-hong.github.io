const path = require('path')
const srcDir = path.join(__dirname, '..', 'src')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(srcDir, 'components/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(srcDir, 'app/**/*.{js,ts,jsx,tsx,mdx}'),
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e293b',
          dark: '#0f172a',
        },
        accent: {
          DEFAULT: '#f59e0b',
          teal: '#14b8a6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Pretendard', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
