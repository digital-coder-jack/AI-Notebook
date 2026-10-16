/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#fbfaf7',
          50: '#ffffff',
          100: '#fdfcf9',
          200: '#f7f5ef',
          300: '#f2f1ec',
          400: '#ebe9e2',
        },
        ink: {
          DEFAULT: '#2d3038',
          light: '#4c5059',
          muted: '#81848c',
          faint: '#9c9da2',
        },
        line: {
          DEFAULT: '#e5e3dc',
          strong: '#d4d1c8',
        },
        indigo: {
          DEFAULT: '#5558ac',
          soft: '#eeedff',
          deep: '#3d3f8a',
          light: '#7b7ec9',
          50: '#f3f3fb',
          100: '#e8e8f7',
          200: '#d1d1ef',
          300: '#a9a9df',
          400: '#7b7ec9',
          500: '#5558ac',
          600: '#3d3f8a',
          700: '#2e306b',
          800: '#1f2050',
          900: '#13132f',
        },
        accent: {
          amber: '#c8a64b',
          rose: '#c64e6b',
          teal: '#3d8b85',
          sage: '#7a9a6e',
        },
        success: '#3d8b85',
        warning: '#c8a64b',
        error: '#c64e6b',
      },
      fontFamily: {
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        soft: '0 2px 12px -4px rgba(0, 0, 0, 0.08)',
        card: '0 8px 32px -12px rgba(0, 0, 0, 0.12)',
        lift: '0 16px 48px -16px rgba(0, 0, 0, 0.16)',
        glow: '0 0 24px -6px rgba(85, 88, 172, 0.25)',
        'inner-soft': 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        '2.5xl': '1.125rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'blink-cursor': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fade-in 0.5s ease forwards',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        float: 'float 5s ease-in-out infinite',
        'slide-in-left': 'slide-in-left 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-in-right': 'slide-in-right 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        'blink-cursor': 'blink-cursor 1s step-end infinite',
      },
    },
  },
  plugins: [],
};
