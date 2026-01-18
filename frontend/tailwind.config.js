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
        'tk-dark': '#121212',
        'tk-gold': '#D4AF37',
        'tk-light-gold': '#F1D592',
      }
    },
  },
  plugins: [],
}