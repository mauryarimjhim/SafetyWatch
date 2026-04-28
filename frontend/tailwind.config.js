/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#060a13',
          800: '#0B1220',
          700: '#111a2e',
          600: '#1a2540',
          500: '#243055',
        },
        accent: {
          orange: '#f97316',
          pink: '#ec4899',
          red: '#ef4444',
          green: '#22c55e',
          blue: '#3b82f6',
          cyan: '#06b6d4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'sos-pulse': 'sosPulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(249,115,22,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(249,115,22,0.6)' },
        },
        sosPulse: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(239,68,68,0.7)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 15px rgba(239,68,68,0)' },
        },
      },
    },
  },
  plugins: [],
}
