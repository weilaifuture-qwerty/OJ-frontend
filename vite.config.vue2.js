import { defineConfig } from 'vite'
import { createVuePlugin } from '@vitejs/plugin-vue2'
import path from 'path'
import { createHtmlPlugin } from 'vite-plugin-html'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    createVuePlugin(),
    createHtmlPlugin({
      minify: true,
      pages: [
        {
          entry: 'src/pages/oj/index.js',
          filename: 'index.html',
          template: 'src/pages/oj/index.html',
          injectOptions: {
            data: {
              title: 'Online Judge'
            }
          }
        },
        {
          entry: 'src/pages/admin/index.js',
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
      '~': path.resolve(__dirname, './src'),
      'vue': 'vue/dist/vue.esm.js'
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
          'vue-vendor': ['vue', 'vue-router', 'vuex'],
          'ui-vendor': ['element-ui', 'iview'],
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
        modifyVars: {},
        additionalData: '@import "@/styles/common.less";'
      }
    }
  },
  define: {
    'process.env': {}
  }
})