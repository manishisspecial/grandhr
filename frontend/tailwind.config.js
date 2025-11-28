/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./offer-letter.html",
    "./salary-slip.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5b8fc',
          400: '#8189f8',
          500: '#667eea',
          600: '#764ba2',
          700: '#5a3d7a',
          800: '#4a2f5f',
          900: '#3d2649',
        },
      },
    },
  },
  plugins: [],
}

