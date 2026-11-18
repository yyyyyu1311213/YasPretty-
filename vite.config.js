import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        beautyShop: resolve(root, 'beauty-shop-3d.html'),
      },
    },
  },
  server: {
    watch: {
      ignored: ['**/.qa/**', '**/.qa-*/**', '**/chrome-qa*/**'],
    },
    proxy: {
      '/api': 'http://127.0.0.1:8787',
      '/proxy': 'http://127.0.0.1:8787',
      '/memory': 'http://127.0.0.1:8787',
    },
  },
})
