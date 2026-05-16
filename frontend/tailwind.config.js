// tailwind.config.js
// Tells Tailwind which files to scan for class names.
// Only classes found here will be included in the final CSS bundle.
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom design tokens — single source of truth for our palette.
      // Using CSS variables makes these accessible in both Tailwind
      // classes AND plain CSS if needed.
      fontFamily: {
        mono:  ['"DM Mono"', 'monospace'],
        sans:  ['"Lato"', 'sans-serif'],
      },
      colors: {
        slate: {
          950: '#0a0f1a',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        amber: {
          400: '#fbbf24',
          300: '#fcd34d',
        },
      },
    },
  },
  plugins: [],
}