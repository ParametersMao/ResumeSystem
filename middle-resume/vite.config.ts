import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
      dts: true,
      eslintrc: {
        enabled: true
      }
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: true
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3030,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('zrender')) {
            return 'vendor-zrender'
          }
          if (id.includes('vue-echarts')) {
            return 'vendor-vue-echarts'
          }
          if (id.includes('echarts')) {
            return 'vendor-echarts'
          }
          if (id.includes('element-plus') || id.includes('@element-plus')) {
            return 'vendor-element-plus'
          }
          if (id.includes('vue') || id.includes('pinia')) {
            return 'vendor-vue'
          }
          if (id.includes('lodash-es') || id.includes('dayjs') || id.includes('@vueuse')) {
            return 'vendor-utils'
          }
          return 'vendor'
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    }
  }
}) 
