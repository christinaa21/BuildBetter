/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        customWhite: {
          '50': '#FFFFFF',
          '100': '#F5F5F9'
        },
        customGray: {
          '50': '#D9D9D9',
          '100': '#C6C6C6'
        },
        customGreen: {
          '50': '#BBCBCD',
          '100': '#ABC4BE',
          '200': '#45605A',
          '300': '#30534B', // Primary
          '400': '#36534D',
          '500': '#15322C'
        },
        customOlive: {
          '50': '#3F473D', // Primary
          '100': '#222920'
        }
      }
    },
  },
  plugins: [],
}

