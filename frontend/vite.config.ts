import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const parsed = Number.parseInt(env.VITE_DEV_PORT ?? '', 10)
  const port = Number.isFinite(parsed) && parsed > 0 ? parsed : 5173

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      port
    }
  }
})
