/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Claude.ai inspired warm palette
        'claude': {
          50: '#fdfcfb',
          100: '#f8f6f3',
          200: '#f3ede6',
          300: '#e8dfd4',
          400: '#d4c4b0',
          500: '#b8a08a',
          600: '#9d8169',
          700: '#7d6552',
          800: '#5d4a3d',
          900: '#3d3128',
        },
        'accent': {
          50: '#fef6ee',
          100: '#fde9d3',
          200: '#fad0a5',
          300: '#f7b06d',
          400: '#f38533',
          500: '#f06a13',
          600: '#e15109',
          700: '#ba3c09',
          800: '#94300e',
          900: '#782a0f',
        },
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'body': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar')
  ],
}
