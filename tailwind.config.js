/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Candlelight theme
        'bg-primary': '#F6F1EB',
        'bg-secondary': '#EDE6DD',
        'surface': '#FFFFFF',
        'surface-secondary': '#F9F5F0',
        'border': '#DDD4C8',
        'accent-primary': '#C8A96A',
        'accent-secondary': '#A88F5C',
        'text-primary': '#2B2B2B',
        'text-secondary': '#6B6258',
        'alert': '#B56A4D',
        // Legacy aliases for compatibility
        primary: '#C8A96A',
        accent: '#A88F5C',
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


