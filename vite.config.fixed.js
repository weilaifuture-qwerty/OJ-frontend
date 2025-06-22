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
    }),
    // Custom plugin to handle serving the correct HTML
    {
      name: 'serve-html',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Remove any public/index.html from being served
          if (req.url === '/index.html' && req.headers.accept?.includes('text/html')) {
            req.url = '/src/pages/oj/index.html'
          }
          next()
        })
      }
    }
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
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  publicDir: 'static', // Change public dir to avoid conflicts
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: '@import "@/styles/common.less";'
      }
    }
  }
})