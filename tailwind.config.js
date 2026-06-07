/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        pitch: '#0B3B2E',
        navy: '#07142E',
        gold: '#F7C948',
        scarlet: '#E11D48',
      },
      boxShadow: {
        glow: '0 0 35px rgba(247, 201, 72, 0.16)',
        card: '0 18px 50px rgba(0, 0, 0, 0.22)',
      },
    },
  },
  plugins: [],
};
