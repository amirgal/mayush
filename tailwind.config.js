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
          light: '#F4ECD8',  // Cream
          dark: '#4A3933',    // Rich brown
          accent: '#8B4513',  // Saddle brown
          burgundy: '#800020', // Deep burgundy
          gold: '#D4AF37',   // Gold
          ivory: '#FFFFF0',   // Ivory
          page: '#FFFAF0',    // Page background
        },
      },
      boxShadow: {
        'book-page': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'book-card': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'bg-black-to-white': 'bgBlackToWhite 3s ease-in-out forwards',
        'page-turn': 'pageTurn 0.5s ease-in-out',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'hover-lift': 'hoverLift 0.3s ease-in-out',
        'book-open': 'book-open 1s ease-in-out forwards',
        'fade-scale': 'fade-scale 0.5s ease-out forwards',
      },
      keyframes: {
        bgBlackToWhite: {
          '0%': { backgroundColor: 'rgb(0, 0, 0)' },
          '100%': { backgroundColor: 'rgb(255, 255, 255)' },
        },
        pageTurn: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        hoverLift: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-5px)' },
        },
        'fade-in': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'book-open': {
          '0%': { 
            transform: 'rotateY(0deg)',
            transformOrigin: 'center'
          },
          '100%': { 
            transform: 'rotateY(-180deg)',
            transformOrigin: 'center'
          }
        },
        'fade-scale': {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.8)'
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)'
          }
        },
      },
      fontFamily: {
        serif: ['Heebo', 'Merriweather', 'serif'],
        cursive: ['Dancing Script', 'cursive'],
        sans: ['Assistant', 'Heebo', 'system-ui', 'sans-serif'],
        'handwritten': ['"Caveat"', 'cursive'],
        'book-title': ['Heebo', '"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
}
