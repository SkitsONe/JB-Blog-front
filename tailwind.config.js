// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  important: true, // Добавьте эту строку для повышения специфичности
  theme: {
    extend: {},
  },
  plugins: [],
}
