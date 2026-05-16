// vite.config.js
// Vite's build and dev server configuration.
// @vitejs/plugin-react enables JSX transformation and React Fast Refresh
// (hot module replacement that preserves component state on save).
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,   // Explicit port so it never conflicts with the backend (5000)
  },
})