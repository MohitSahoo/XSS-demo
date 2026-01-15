import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/reflected': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/stored': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/attacker': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})

