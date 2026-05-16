// postcss.config.js
// Tailwind CSS requires PostCSS to process its directives
// (@tailwind base/components/utilities) into real CSS.
// Autoprefixer automatically adds vendor prefixes for browser compatibility.
// Vite picks this file up automatically — no extra configuration needed.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}