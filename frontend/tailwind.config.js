/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vitality: {
          50: '#f4f9f5',
          100: '#e5f3e8',
          200: '#cce6d3',
          500: '#2e7d32',
          600: '#1b5e20',
          softGreen: '#ecfdf5',
          borderGreen: '#a7f3d0',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

