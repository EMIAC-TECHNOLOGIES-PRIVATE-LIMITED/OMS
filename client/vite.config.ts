import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': '../shared/dist',
      "@": path.resolve(__dirname, "./src")
    }

  },
  server: {
    hmr: {
      overlay: false
    }
  }
})
