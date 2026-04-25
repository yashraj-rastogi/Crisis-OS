/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Crisis OS Design Tokens
        // Primary — Deep Crimson (crisis urgency)
        primary: {
          50:  '#fff0f0',
          100: '#ffe0e0',
          200: '#ffc5c5',
          300: '#ff9a9a',
          400: '#ff5f5f',
          500: '#ff2c2c',
          600: '#ed1010',
          700: '#c80a0a',
          800: '#a50d0d',
          900: '#881212',
          950: '#4b0404',
        },
        // Accent — Amber alert
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Neutral — Slate dark
        slate: {
          850: '#1a2235',
          900: '#0f172a',
          950: '#080d1a',
        },
        // Status colors
        status: {
          safe:    '#22c55e',
          help:    '#f59e0b',
          unable:  '#ef4444',
          pending: '#94a3b8',
          active:  '#3b82f6',
          resolved:'#10b981',
          draft:   '#64748b',
        },
        // Severity
        severity: {
          low:      '#22c55e',
          medium:   '#f59e0b',
          high:     '#ef4444',
          critical: '#7c3aed',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      boxShadow: {
        'glow-red':    '0 0 20px rgba(237,16,16,0.3)',
        'glow-amber':  '0 0 20px rgba(245,158,11,0.3)',
        'glow-green':  '0 0 20px rgba(34,197,94,0.3)',
        'glass':       '0 8px 32px rgba(0,0,0,0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-up':     'slideUp 0.3s ease-out',
        'slide-down':   'slideDown 0.3s ease-out',
        'fade-in':      'fadeIn 0.2s ease-out',
        'scale-in':     'scaleIn 0.2s ease-out',
        'ping-once':    'ping 0.6s cubic-bezier(0,0,0.2,1) 1',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
