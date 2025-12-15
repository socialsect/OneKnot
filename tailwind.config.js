/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#dd212b',
        accent: '#dd212b',
        white: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Gambarino', 'Stardom', 'system-ui', 'sans-serif'],
        primary: ['Gambarino', 'system-ui', 'sans-serif'],
        secondary: ['Stardom', 'system-ui', 'sans-serif'],
        gambarino: ['Gambarino', 'system-ui', 'sans-serif'],
        stardom: ['Stardom', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


