// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#3490dc',
        'secondary': '#ffed4a',
        'accent': '#f6993f',
        'background': {
          light: '#f8fafc',
          dark: '#1a202c',
        },
        'text': {
          light: '#2d3748',
          dark: '#e2e8f0',
        },
      },
      fontFamily: {
        'sans': ['Roboto', 'Arial', 'sans-serif'],
        'heading': ['Montserrat', 'Helvetica', 'sans-serif'],
      },
    },
  },
  variants: {
    scrollbar: ['rounded']
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ]
}