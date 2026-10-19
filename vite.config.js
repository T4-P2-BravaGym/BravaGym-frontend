import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // "@/components/ui/Button" instead of "../../../components/ui/Button"
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  css: {
    preprocessorOptions: {
      // lets every .module.scss write: @use 'mixins' as *;
      scss: { loadPaths: [fileURLToPath(new URL('./src/styles', import.meta.url))] },
    },
  },
  server: { port: 5173 },
  // Vitest (T-10): `npm test` runs once, `npm run test:watch` re-runs on save.
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    // Run as a member in Madrid would, so a laptop and GitHub Actions (UTC) give the same result.
    env: { TZ: 'Europe/Madrid' },
  },
})