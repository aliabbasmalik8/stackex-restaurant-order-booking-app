import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  // Absolute asset paths — required for BrowserRouter deep links (/orders, …)
  base: '/',
  // Expose plain FIREBASE_* keys from .env (no VITE_ / EXPO_PUBLIC_ prefix)
  envPrefix: 'FIREBASE_',
})
