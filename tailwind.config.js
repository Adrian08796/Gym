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
        'btn-close': '#1F2937',
        'btn-hover': '#4a5568',
        'color1': '#45FFCA',
        'backgroundDark': '#1F2937',
        'text': {
          light: '#2d3748',
          dark: '#e2e8f0',
        },
      },
      fontFamily: {
        'sans': ['Roboto', 'Arial', 'sans-serif'],
        'heading': ['Montserrat', 'Helvetica', 'sans-serif'],
      },
      scrollSnapType: {
        x: 'x',
        y: 'y',
        both: 'both',
        none: 'none',
      },
      scrollSnapAlign: {
        start: 'start',
        end: 'end',
        center: 'center',
      },
      scrollSnapStop: {
        normal: 'normal',
        always: 'always',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}