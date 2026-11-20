/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F8F7F4',
          surface: '#FFFFFF',
          primary: '#6B4E3D',
          'primary-hover': '#583f31',
          secondary: '#E8DED3',
          'secondary-light': '#F4EFEA',
          text: '#292725',
          muted: '#77716B',
          border: '#E8DED3',
        },
        status: {
          success: '#2F6B4F',
          warning: '#A86616',
          error: '#A83A32',
          info: '#356A83',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

