/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      'sm': '481px',
      'md': '769px',
      'lg': '1025px',
      'xl': '1441px',
    },
    extend: {},
  },
  plugins: [],
};
