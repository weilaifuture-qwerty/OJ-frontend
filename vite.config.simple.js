import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
      dts: false
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: false
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@oj': path.resolve(__dirname, './src/pages/oj'),
      '@admin': path.resolve(__dirname, './src/pages/admin'),
      '~': path.resolve(__dirname, './src')
    },
    extensions: ['.js', '.vue', '.json']
  },
  server: {
    port: 8080,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: '@import "@/styles/common.less";'
      }
    }
  }
})