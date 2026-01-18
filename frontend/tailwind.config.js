/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tk-black': '#050505',
        'tk-dark': '#111111',
        'tk-gold': '#FFB800',
        'tk-light-gold': '#F1D592',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'in': 'fadeIn 500ms ease-out',
        'slide-in-top': 'slideInFromTop4 500ms ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}