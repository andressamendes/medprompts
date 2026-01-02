import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/medprompts/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      
      manifest: {
        name: 'MedPrompts - Sistema de Estudos Gamificado para Medicina',
        short_name: 'MedPrompts',
        description: 'Plataforma gamificada com prompts de IA para estudantes de medicina. Estude com badges, XP, missões diárias e conquistas!',
        theme_color: '#4F46E5',
        background_color: '#0F172A',
        display: 'standalone',
        scope: '/medprompts/',
        start_url: '/medprompts/',
        orientation: 'portrait-primary',
        
        icons: [
          {
            src: '/medprompts/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/medprompts/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/medprompts/pwa-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/medprompts/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        
        screenshots: [
          {
            src: '/medprompts/screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Dashboard principal do MedPrompts'
          },
          {
            src: '/medprompts/screenshot-mobile.png',
            sizes: '750x1334',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'MedPrompts mobile'
          }
        ],
        
        categories: ['education', 'medical', 'productivity'],
        shortcuts: [
          {
            name: 'Prompts Salvos',
            short_name: 'Favoritos',
            description: 'Ver prompts favoritos',
            url: '/medprompts/favorites',
            icons: [{ src: '/medprompts/icon-favorites.png', sizes: '96x96' }]
          },
          {
            name: 'Missões Diárias',
            short_name: 'Missões',
            description: 'Ver missões do dia',
            url: '/medprompts/missions',
            icons: [{ src: '/medprompts/icon-missions.png', sizes: '96x96' }]
          }
        ]
      },
      
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        
        // Cache de runtime
        runtimeCaching: [
          {
            // Cache de navegação (páginas HTML)
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 dias
              },
              networkTimeoutSeconds: 3
            }
          },
          {
            // Cache de assets estáticos (CSS, JS)
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60 // 7 dias
              }
            }
          },
          {
            // Cache de imagens
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 dias
              }
            }
          },
          {
            // Cache de fontes
            urlPattern: /\.(?:woff|woff2|ttf|otf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60 // 1 ano
              }
            }
          },
          {
            // Cache de Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 365 * 24 * 60 * 60
              }
            }
          },
          {
            // Cache de dados de API (se houver)
            urlPattern: /^https:\/\/api\..*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60 // 5 minutos
              },
              networkTimeoutSeconds: 5
            }
          }
        ],
        
        // Limpa caches antigos
        cleanupOutdatedCaches: true,
        
        // Pré-cache de rotas principais
        navigateFallback: '/medprompts/index.html',
        navigateFallbackDenylist: [/^\/api/]
      },
      
      devOptions: {
        enabled: false, // Desabilita em dev para não conflitar
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
