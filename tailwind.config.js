/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fffaf0',
          100: '#fff0d6',
          200: '#ffe0ad',
          300: '#ffcb7a',
          400: '#ffb247',
          500: '#ff9600', // Màu cam chủ đạo chính thức của website
          600: '#e68400',
          700: '#cc7200',
          800: '#a85c00',
          900: '#854700',
        },
        brand: {
          orange: '#ff9600',
          dark: '#3b3b3b',
          gray: '#f5f5f5',
          border: '#e5e7eb',
        },
        emerald: {
          600: '#ff9600', // Đảm bảo các component cũ chuyển sang tông cam đồng bộ
          700: '#e68400',
          800: '#cc7200',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Roboto', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
