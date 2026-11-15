import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],

  // WHY base: './' is required:
  // Without this, Vite emits absolute asset paths like /assets/index-xxx.js
  // which only work when served from the root of an HTTP server.
  // Opening dist/index.html directly via file:// gives a blank page because
  // the browser tries to load /assets/... from the filesystem root (C:\) which
  // doesn't exist. Setting base: './' makes all asset paths relative
  // (./assets/index-xxx.js), so both file:// and any subdirectory HTTP hosting work.
  base: './',

  build: {
    outDir: 'dist',
    // Inline tiny assets to reduce request count when served without a server
    assetsInlineLimit: 4096,
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
})
