import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  // Em desenvolvimento (npm run dev), usa '/'
  // Em produção (npm run build), usa '/medprompts/'
  const base = command === 'serve' ? '/' : '/medprompts/'
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    base,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      // ✅ Configurações para resolver problema de dynamic imports
      rollupOptions: {
        output: {
          // Mantém chunks separados mas com nomes consistentes
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['lucide-react'],
          },
          // Garante que os chunks usem caminhos relativos corretos
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      },
      // Aumenta o limite de aviso de chunk size
      chunkSizeWarningLimit: 1000,
    },
    // ✅ Garante que assets sejam servidos corretamente
    server: {
      fs: {
        strict: false
      }
    }
  }
})
