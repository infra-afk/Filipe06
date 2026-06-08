/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'step-in':   'stepIn 0.35s cubic-bezier(0.16,1,0.3,1)',
        'fade-up':   'fadeUp 0.25s ease-out',
        'pop':       'pop 0.2s ease-out',
        'progress':  'progress 0.6s ease-out',
      },
      keyframes: {
        stepIn: {
          '0%':   { opacity: '0', transform: 'translateX(24px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.12)' },
          '100%': { transform: 'scale(1)' },
        },
        progress: {
          '0%':   { width: '0%' },
        },
      },
      colors: {
        bg: '#F8FAFC',
        card: '#FFFFFF',
        primary: {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          100: '#DBEAFE',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
