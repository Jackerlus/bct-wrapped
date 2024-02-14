/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/*.{html,js}", "./public/**/*.{html,js}"],
  theme: {
    fontFamily: {
      'sans': ['Montserrat', 'ui-sans-serif', 'system-ui']
    },
    extend: {},
    container: {
      center: true,
    },
  },
  plugins: [],
}

