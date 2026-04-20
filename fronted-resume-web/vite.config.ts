import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return
          }

          if (id.includes('element-plus') || id.includes('@element-plus')) {
            return 'vendor-element-plus'
          }

          if (id.includes('html2canvas')) {
            return 'vendor-html2canvas'
          }

          if (id.includes('jspdf')) {
            return 'vendor-jspdf'
          }

          if (id.includes('pagedjs')) {
            return 'vendor-pagedjs'
          }

          if (id.includes('@wangeditor')) {
            return 'vendor-editor'
          }

          if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
            return 'vendor-vue'
          }

          return 'vendor'
        }
      }
    }
  },
  server: {
    port: 5173,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/mock': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/resumes': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})


