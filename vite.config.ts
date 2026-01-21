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
          pure_funcs: ['console.log', 'console.info'], // Remove console calls
          passes: 2, // More aggressive compression
        },
        mangle: {
          safari10: true, // Better Safari support
        },
      },
      cssMinify: true,
      cssCodeSplit: true, // Split CSS for better caching
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Phaser 3 (game engine - ~800KB) - separate because it's huge
            if (id.includes('node_modules/phaser')) {
              return 'phaser-vendor';
            }
            // PDF.js (~600KB) - separate, loaded only when needed via dynamic import
            if (id.includes('node_modules/pdfjs-dist')) {
              return 'pdf-vendor';
            }
            // Mammoth (~200KB) - separate, loaded only when needed via dynamic import
            if (id.includes('node_modules/mammoth')) {
              return 'docx-vendor';
            }
            // All other node_modules together (avoids circular dependencies)
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        },
      },
      chunkSizeWarningLimit: 800, // Adjusted for main vendor chunk
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
