import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const PORT = Number(env.VITE_PORT || env.PORT || 3000)
  const BACKEND_URL = env.VITE_BACKEND_URL || env.BACKEND_URL || 'http://127.0.0.1:8000'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: PORT,
      watch: {
        ignored: ['**/backend/venv/**']
      },
      proxy: {
        '/api': {
          target: BACKEND_URL,
          changeOrigin: true,
        },
        '/ws': {
          target: BACKEND_URL,
          changeOrigin: true,
          ws: true,
          configure: (_proxy) => {
            _proxy.on('error', (err) => {
              console.log('WebSocket proxy error:', err.message);
            });
            _proxy.on('proxyReqWs', (proxyReq, req, socket) => {
              socket.on('error', (err) => {
                console.log('WebSocket socket error:', err.message);
              });
            });
          },
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    optimizeDeps: {
      entries: ['index.html', 'src/main.jsx']
    },
  }
})