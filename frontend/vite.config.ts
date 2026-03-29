import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega as variáveis do .env na raiz (../)
  const env = loadEnv(mode, '../', '');

  return {
    plugins: [react()],
    envDir: '../',
    build: {
      outDir: 'dist',
      sourcemap: true,
      chunkSizeWarningLimit: 1600
    },
    server: {
      port: 5173,
      strictPort: false,
      proxy: {
        // Proxy unificado para o backend
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
})
