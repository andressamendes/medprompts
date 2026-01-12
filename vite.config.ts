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
            // React core (mais específico primeiro)
            if (id.includes('node_modules/react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('node_modules/react/') && !id.includes('node_modules/react-')) {
              return 'react-vendor';
            }
            // React Router
            if (id.includes('node_modules/react-router')) {
              return 'router-vendor';
            }
            // UI libraries
            if (id.includes('node_modules/lucide-react')) {
              return 'icons-vendor';
            }
            // Driver.js (tutorial) - lazy loaded
            if (id.includes('node_modules/driver.js')) {
              return 'tutorial-vendor';
            }
            // Recharts (dashboard)
            if (id.includes('node_modules/recharts')) {
              return 'charts-vendor';
            }
            // Scheduler (React dependency)
            if (id.includes('node_modules/scheduler')) {
              return 'react-vendor';
            }
            // Phaser 3 (game engine - ~800KB)
            if (id.includes('node_modules/phaser')) {
              return 'phaser-vendor';
            }
            // Colyseus (multiplayer client - ~50KB)
            if (id.includes('node_modules/colyseus.js')) {
              return 'colyseus-vendor';
            }
            // Other large node_modules
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        },
      },
      chunkSizeWarningLimit: 1200, // Increased to accommodate Phaser (~800KB)
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
