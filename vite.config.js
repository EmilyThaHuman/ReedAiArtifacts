import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api/brave-search': {
          target: 'https://api.search.brave.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/brave-search/, '/res/v1/web/search'),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.error('proxy error', err)
              res.writeHead(500, {
                'Content-Type': 'application/json',
              })
              res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }))
            })
          },
          headers: {
            'Accept': 'application/json',
            'X-Subscription-Token': env.VITE_BRAVE_SEARCH_API_KEY,
          },
        },
        '/api/serper': {
          target: 'https://google.serper.dev',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/serper/, '/search'),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.error('proxy error', err)
              res.writeHead(500, {
                'Content-Type': 'application/json',
              })
              res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }))
            })
          },
          headers: {
            'X-API-KEY': env.VITE_GOOGLE_SERPER_API_KEY,
          },
        },
        '/api/anthropic': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.error('proxy error', err)
              res.writeHead(500, {
                'Content-Type': 'application/json',
              })
              res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }))
            })
          },
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
            'x-api-key': env.VITE_ANTHROPIC_API_KEY,
            'anthropic-dangerous-direct-browser-access': 'true',
          },
        },
      },
    },
  }
})