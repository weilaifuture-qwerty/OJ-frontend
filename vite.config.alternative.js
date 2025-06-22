import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { createHtmlPlugin } from 'vite-plugin-html'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
      dts: false
    }),
    Components({
      resolvers: [ElementPlusResolver({
        importStyle: false
      })],
      dts: false
    }),
    createHtmlPlugin({
      minify: true,
      pages: [
        {
          entry: '/src/pages/oj/index.js',
          filename: 'oj.html',  // Changed from index.html to avoid conflict
          template: 'src/pages/oj/index.html',
          injectOptions: {
            data: {
              title: 'Online Judge'
            }
          }
        },
        {
          entry: '/src/pages/admin/index.js',
          filename: 'admin.html',
          template: 'src/pages/admin/index.html',
          injectOptions: {
            data: {
              title: 'OJ Admin'
            }
          }
        }
      ]
    }),
    compression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz'
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
  preview: {
    port: 8080,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'static',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/pages/oj/index.html'),
        admin: path.resolve(__dirname, 'src/pages/admin/index.html')
      },
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['element-plus', 'view-ui-plus'],
          'utils': ['axios', 'dayjs', 'nprogress'],
          'editor': ['codemirror', 'katex', 'highlight.js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
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