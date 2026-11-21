import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
const apiTarget = process.env.YAS_API_TARGET || 'http://127.0.0.1:8787'

export default defineConfig({
  cacheDir: process.env.YAS_FACE_COMPARISON === '1' ? '.runtime/vite-comparison' : 'node_modules/.vite',
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
      '/api': apiTarget,
      '/proxy': apiTarget,
      '/memory': apiTarget,
    },
  },
})
