import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        heading: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
        '6xl': ['3.75rem', { lineHeight: '1.2' }],
        '7xl': ['4.5rem', { lineHeight: '1.1' }],
        // Golden Ratio Typography Scale (φ = 1.618)
        'gr-xs': ['0.618rem', { lineHeight: '1.618' }],
        'gr-sm': ['0.764rem', { lineHeight: '1.618' }],
        'gr-base': ['1rem', { lineHeight: '1.618' }],
        'gr-lg': ['1.236rem', { lineHeight: '1.5' }],
        'gr-xl': ['1.618rem', { lineHeight: '1.382' }],
        'gr-2xl': ['2.618rem', { lineHeight: '1.236' }],
        'gr-3xl': ['4.236rem', { lineHeight: '1.1' }],
        'gr-4xl': ['6.854rem', { lineHeight: '1.05' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
        // Golden Ratio Spacing Scale (φ = 1.618)
        'gr-3xs': '0.236rem',   // ~3.8px
        'gr-2xs': '0.382rem',   // ~6.1px
        'gr-xs': '0.618rem',    // ~9.9px
        'gr-sm': '0.764rem',    // ~12.2px
        'gr-base': '1rem',      // 16px
        'gr-md': '1.236rem',    // ~19.8px
        'gr-lg': '1.618rem',    // ~25.9px (φ)
        'gr-xl': '2.618rem',    // ~41.9px (φ²)
        'gr-2xl': '4.236rem',   // ~67.8px (φ³)
        'gr-3xl': '6.854rem',   // ~109.7px (φ⁴)
        'gr-4xl': '11.09rem',   // ~177.4px (φ⁵)
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'large': '0 10px 40px rgba(0, 0, 0, 0.12)',
        // Golden Ratio Shadows
        'gr-sm': '0 0.236rem 0.618rem rgba(0, 0, 0, 0.04), 0 0.146rem 0.382rem rgba(0, 0, 0, 0.02)',
        'gr-md': '0 0.382rem 1rem rgba(0, 0, 0, 0.06), 0 0.236rem 0.618rem rgba(0, 0, 0, 0.04)',
        'gr-lg': '0 0.618rem 1.618rem rgba(0, 0, 0, 0.08), 0 0.382rem 1rem rgba(0, 0, 0, 0.04)',
        'gr-xl': '0 1rem 2.618rem rgba(0, 0, 0, 0.1), 0 0.618rem 1.618rem rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        // Golden Ratio Border Radius
        'gr-xs': '0.236rem',
        'gr-sm': '0.382rem',
        'gr-md': '0.618rem',
        'gr-lg': '1rem',
        'gr-xl': '1.618rem',
        'gr-2xl': '2.618rem',
      },
      // Golden Ratio Layout Utilities
      width: {
        'gr-major': '61.8%',
        'gr-minor': '38.2%',
      },
      maxWidth: {
        'gr-major': '61.8%',
        'gr-minor': '38.2%',
        'gr-content': '45rem',     // Optimal reading width
        'gr-container': '61.8rem', // ~989px
      },
      minHeight: {
        'gr-hero': '61.8vh',
        'gr-hero-tall': '76.4vh',
        'gr-section': '38.2vh',
      },
      aspectRatio: {
        'golden': '1.618 / 1',
        'golden-portrait': '1 / 1.618',
        'golden-wide': '2.618 / 1',
      },
      gridTemplateColumns: {
        'golden': '1fr 1.618fr',
        'golden-reverse': '1.618fr 1fr',
        'golden-thirds': '1fr 1.618fr 1fr',
      },
      flexBasis: {
        'gr-major': '61.8%',
        'gr-minor': '38.2%',
      },
      lineHeight: {
        'gr-tight': '1.236',
        'gr-snug': '1.382',
        'gr-normal': '1.5',
        'gr-relaxed': '1.618',
        'gr-loose': '2.0',
      },
      transitionDuration: {
        'gr-fast': '162ms',
        'gr-base': '262ms',
        'gr-slow': '424ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
