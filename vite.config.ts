import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * NOAA no permite CORS. En local, Vite reenvía /api/enso/* a NOAA
 * (en producción lo hace Vercel con los rewrites de vercel.json).
 */
const noaaProxy = {
  '/api/enso/oni': {
    target: 'https://www.cpc.ncep.noaa.gov',
    changeOrigin: true,
    rewrite: () => '/data/indices/oni.ascii.txt',
  },
  '/api/enso/nino12': {
    target: 'https://www.cpc.ncep.noaa.gov',
    changeOrigin: true,
    rewrite: () => '/data/indices/sstoi.indices',
  },
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: noaaProxy,
  },
  preview: {
    proxy: noaaProxy,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
})
