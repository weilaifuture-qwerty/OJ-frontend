import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const commonProxy = {
    target: env.TARGET || 'http://localhost:8000',
    changeOrigin: true,
    configure: (proxy, options) => {
      proxy.on('proxyReq', (proxyReq, req, res) => {
        proxyReq.setHeader('Referer', env.TARGET)
      })
    }
  }

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@oj': resolve(__dirname, 'src/pages/oj'),
        '@admin': resolve(__dirname, 'src/pages/admin'),
        '@components': resolve(__dirname, 'src/components')
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `@import "@/styles/theme.less";`
        }
      }
    },
    server: {
      port: env.PORT || 8080,
      open: true,
      proxy: {
        '/api': commonProxy,
        '/public': commonProxy
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'static',
      sourcemap: env.USE_SENTRY === '1',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          admin: resolve(__dirname, 'src/pages/admin/index.html')
        }
      }
    }
  }
}) 