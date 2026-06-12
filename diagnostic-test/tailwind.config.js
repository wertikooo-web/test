/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        muted: '#667085',
        line: '#d9dfeb',
        paper: '#ffffff',
        wash: '#fbf6ed',
        cream: '#fbf6ed',
        creamLine: '#eadfce',
        primary: '#3458d4',
        violet: '#7c3aed',
        teal: '#0f9f8f',
        amber: '#d97706',
        rose: '#d9486e',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(28, 39, 69, 0.08)',
      },
    },
  },
  plugins: [],
};
