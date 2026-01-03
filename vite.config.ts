import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base URL para GitHub Pages (comentado para desenvolvimento local)
  // Descomente antes de fazer deploy para GitHub Pages
  // base: '/medprompts/',
  base: '/',
})
