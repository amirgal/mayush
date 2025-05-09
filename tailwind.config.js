/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        book: {
          light: '#f5e6d8',
          page: '#fffaf0',
          dark: '#8b4513',
          accent: '#d4a76a',
        },
      },
      fontFamily: {
        serif: ['Merriweather', 'serif'],
        cursive: ['Dancing Script', 'cursive'],
        sans: ['Assistant', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
