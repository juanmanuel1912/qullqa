/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tierra andina
        tierra: {
          50: '#faf6ef',
          100: '#f3eadb',
          200: '#e6d5b8',
          300: '#d2b88f',
          400: '#b8956a',
          500: '#9c7a4f',
          600: '#8b6f47',
          DEFAULT: '#8b6f47',
          700: '#6e5537',
          800: '#54402a',
          900: '#3b2c1d',
        },
        // Inti: dorado del sol
        inti: {
          50: '#fdf8e8',
          100: '#faefc5',
          200: '#f4df8c',
          300: '#ecc955',
          400: '#e0b73f',
          500: '#d4af37',
          DEFAULT: '#d4af37',
          600: '#b8922a',
          700: '#96741f',
          800: '#74581a',
          900: '#533f13',
        },
        // Noche estrellada
        noche: {
          50: '#eef0f8',
          100: '#d9ddee',
          200: '#b3b9d9',
          300: '#8790bd',
          400: '#5d6699',
          500: '#3d4577',
          600: '#2a3060',
          700: '#20244a',
          800: '#1a1a2e',
          DEFAULT: '#1a1a2e',
          900: '#0f0f1c',
        },
        // Semáforo
        good: '#2f9e44',
        caution: '#f2b705',
        risk: '#d9480f',
        marte: { 400: '#e2725b', 500: '#c1440e', 700: '#7a2a0a' },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(59,44,29,0.06), 0 4px 16px rgba(59,44,29,0.08)',
      },
    },
  },
  plugins: [],
}
