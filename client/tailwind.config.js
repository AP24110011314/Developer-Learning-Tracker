/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Primary — indigo/violet
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Accent violet
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        // Accent pink
        pink: {
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
        },
        // Accent cyan
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        // Surface tokens
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f8fafc',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
        'card-gradient-violet': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        'card-gradient-cyan': 'linear-gradient(135deg, #06b6d4, #6366f1)',
        'card-gradient-emerald': 'linear-gradient(135deg, #10b981, #06b6d4)',
        'card-gradient-amber': 'linear-gradient(135deg, #f59e0b, #ef4444)',
        'card-gradient-pink': 'linear-gradient(135deg, #ec4899, #8b5cf6)',
        'btn-gradient': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        'btn-gradient-hover': 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 4px 16px 0 rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 24px 0 rgb(99 102 241 / 0.15), 0 1px 4px 0 rgb(0 0 0 / 0.08)',
        glow: '0 0 20px rgb(99 102 241 / 0.35)',
        'glow-sm': '0 0 10px rgb(99 102 241 / 0.25)',
        modal: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      },
      animation: {
        'count-up': 'countUp 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        countUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
