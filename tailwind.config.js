/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'oklch(var(--studio-slate-50-raw) / <alpha-value>)',
        surface: 'oklch(1 0 0 / <alpha-value>)',
        elevated: 'oklch(var(--studio-slate-100-raw) / <alpha-value>)',
        'border-subtle': 'oklch(var(--studio-slate-200-raw) / <alpha-value>)',
        'ink-primary': 'oklch(var(--studio-slate-900-raw) / <alpha-value>)',
        'ink-muted': 'oklch(var(--studio-slate-700-raw) / <alpha-value>)',
        brand: {
          primary: 'oklch(var(--studio-brand-600-raw) / <alpha-value>)',
          hover: 'oklch(var(--studio-brand-700-raw) / <alpha-value>)',
        },
        status: {
          success: 'oklch(var(--studio-emerald-600-raw) / <alpha-value>)',
          warning: 'oklch(var(--studio-amber-600-raw) / <alpha-value>)',
          error: 'oklch(var(--studio-rose-600-raw) / <alpha-value>)',
        },
      },
      fontSize: {
        h1: 'var(--fs-h1)',
        h2: 'var(--fs-h2)',
        h3: 'var(--fs-h3)',
        body: 'var(--fs-body)',
        small: 'var(--fs-small)',
      },
    },
  },
  plugins: [],
};
