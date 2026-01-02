import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Base é o nome do repositório no GitHub Pages
  base: '/medprompts/',
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // Otimizações de build
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    
    // Code splitting otimizado
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
        },
      },
    },
    
    // Performance
    chunkSizeWarningLimit: 1000,
  },
  
  // Preview local simula produção
  preview: {
    port: 4173,
    strictPort: true,
  },
  
  // Servidor de desenvolvimento
  server: {
    port: 5173,
    strictPort: true,
    host: true, // Permite acesso via rede local
  },
})
