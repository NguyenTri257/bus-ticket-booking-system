import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const devHost = env.VITE_DEV_SERVER_HOST || '127.0.0.1'
  const devPort = Number(env.VITE_DEV_SERVER_PORT || 5173)
  const previewPort = Number(env.VITE_PREVIEW_PORT || 4173)
  const shouldUseHttps = env.VITE_DEV_SERVER_HTTPS === 'true'
  const httpsConfig = shouldUseHttps ? {} : undefined
  const hmrHost = env.VITE_HMR_HOST || devHost
  const hmrPort = Number(env.VITE_HMR_PORT || devPort)
  const hmrProtocol = env.VITE_HMR_PROTOCOL || (shouldUseHttps ? 'wss' : 'ws')
  const usePolling = env.VITE_USE_POLLING === 'true'
  const pollingInterval = Number(env.VITE_POLLING_INTERVAL || 200)

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: devHost,
      port: devPort,
      strictPort: true,
      https: httpsConfig,
      cors: true,
      hmr: {
        host: hmrHost,
        port: hmrPort,
        protocol: hmrProtocol,
      },
      watch: {
        usePolling,
        interval: pollingInterval,
      },
    },
    preview: {
      port: previewPort,
      strictPort: true,
    },
  }
})
