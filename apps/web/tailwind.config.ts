import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',                 // next-themes sets .dark on <html>
  theme: {
    extend: {
      colors: {
        /* Map every Tailwind color name to a CSS variable */
        bg:      'hsl(var(--bg))',
        surface: 'hsl(var(--surface))',
        subtle:  'hsl(var(--subtle))',
        fg:      'hsl(var(--fg))',
        muted:   'hsl(var(--fg-muted))',
        border:  'hsl(var(--border))',

        brand: {
          DEFAULT: 'hsl(var(--brand))',
          fg:      'hsl(var(--brand-fg))',
        },

        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        danger:  'hsl(var(--danger))',

        /* Keep these so existing code that references background/foreground still works */
        background: 'hsl(var(--bg))',
        foreground: 'hsl(var(--fg))',
      },

      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },

      borderRadius: {
        sm:  'calc(var(--radius) - 2px)',
        DEFAULT: 'var(--radius)',
        md:  'var(--radius)',
        lg:  'calc(var(--radius) + 4px)',
        xl:  'calc(var(--radius) + 8px)',
        '2xl': '1rem',
        full: '9999px',
      },

      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },

      keyframes: {
        loading: {
          '0%': { width: '0%', transform: 'translateX(0)' },
          '50%': { width: '70%', transform: 'translateX(10%)' },
          '100%': { width: '100%', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        loading: 'loading 2s ease-in-out forwards',
        float: 'float 3s ease-in-out infinite',
      },
    },

  },
  plugins: [],
};

export default config;
