const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'index.html',
    './src/*.{html,js}',
  ],
  plugins: [
    require('@tailwindcss/forms'),
  ],
  theme: {
    extend: {
      colors: {
        'warm-pink-700': '#BA3458',
        'warm-pink-600': '#D93D66',
        'warm-pink-500': '#DB3D68',
        'warm-pink-400': '#E26184',
        'warm-pink-300': '#E67795',
        'warm-pink-200': '#EDA0B5',
        'warm-pink-100': '#FAE2E8'
      },
    },
  },
}
