import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
      },
    }),
  ],
  base: '/admin/',
  resolve: {
    alias: {
      '@': '/src',
      '@/components': '/src/components',
      '@/pages': '/src/pages',
      '@/services': '/src/services',
      '@/hooks': '/src/hooks',
      '@/context': '/src/context',
      '@/utils': '/src/utils',
      '@/types': '/src/types',
      '@/config': '/src/config',
      '@/icons': '/src/icons',
      '@/assets': '/src/assets',
      '@/layout': '/src/layout',
    },
  },
  build: {
    outDir: '../backend/public/admin',
    emptyOutDir: true,
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/admin/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
