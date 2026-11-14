/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores custom Qullqa
        tierra: {
          50: '#faf8f3',
          100: '#f5f1e7',
          200: '#ede6d3',
          300: '#ddd1b8',
          400: '#c9b59d',
          500: '#b39882',
          DEFAULT: '#8B6F47',
          700: '#7a6141',
          800: '#6a533a',
          900: '#5a4733',
        },
        inti: {
          50: '#fffaf0',
          100: '#fffae6',
          200: '#fff5cc',
          300: '#ffd966',
          400: '#ffcc00',
          500: '#ffb300',
          DEFAULT: '#D4AF37',
          700: '#cc9900',
          800: '#b3852d',
          900: '#99701a',
        },
        noche: {
          50: '#f3f3f7',
          100: '#e6e6f0',
          200: '#ccccdd',
          300: '#9999bb',
          400: '#666688',
          500: '#333355',
          DEFAULT: '#1a1a2e',
          700: '#151524',
          800: '#0f0f18',
          900: '#0a0a0f',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      spacing: {
        safe: 'max(1rem, env(safe-area-inset-right))',
      },
    },
  },
  plugins: [],
}
