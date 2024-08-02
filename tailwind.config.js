/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app-dark-green': '#054029',
        'app-light-green': '#0B5C3B',
        'app-bright-green': '#10A37F',
        'app-white': '#FFFFFF',
      },
    },
  },
  plugins: [],
}