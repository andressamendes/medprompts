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
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs em produção
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['lucide-react'],
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        },
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: false, // Desabilita sourcemaps em produção para menor bundle
    },
    // ✅ Garante que assets sejam servidos corretamente
    server: {
      fs: {
        strict: false
      }
    }
  }
})
