import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/medprompts/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
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
          // Separa React e ReactDOM em chunk separado
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Separa UI components em chunk separado
          'ui-vendor': ['lucide-react'],
          
          // Separa hooks e utilitários
          'utils': [
            './src/hooks/useSecureStorage',
            './src/hooks/useAccessibility',
            './src/lib/crypto',
            './src/lib/validation',
            './src/lib/accessibility',
          ],
        },
        // Nome dos chunks para melhor cache
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk';
          return `assets/js/[name]-[hash].js`;
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') ?? [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // Otimizações adicionais
    chunkSizeWarningLimit: 1000, // Avisa se chunk > 1MB
    cssCodeSplit: true, // Divide CSS em chunks separados
  },
  // Otimizações de performance para dev
  server: {
    hmr: {
      overlay: true,
    },
  },
})
