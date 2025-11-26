/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#f0f9ff', // Calm background
          500: '#3b82f6', // Primary action
          600: '#2563eb', // Primary hover
          700: '#1d4ed8',
        },
        green: {
          50: '#f0fdf4', // Success/Feedback background
          200: '#bbf7d0', // Borders
          700: '#15803d', // Text/Success
        },
        teal: {
          500: '#14b8a6', // Accents
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}