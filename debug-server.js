import express from 'express'
import { createServer as createViteServer } from 'vite'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function createServer() {
  const app = express()
  
  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  })
  
  // Use vite's connect instance as middleware
  app.use(vite.middlewares)
  
  // Debug middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
    next()
  })
  
  app.listen(8081, () => {
    console.log('Debug server running on http://localhost:8081')
    console.log('This server logs all requests to help debug the 404 issue')
  })
}

createServer()