const CACHE_NAME = 'medprompts-v1.1';
const BASE_PATH = '/medprompts';

const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/favicon.svg`,
  `${BASE_PATH}/manifest.json`
];

// Install service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache aberto');
        return cache.addAll(urlsToCache).catch((error) => {
          console.error('[SW] Erro ao adicionar ao cache:', error);
        });
      })
  );
  // Força ativação imediata
  self.skipWaiting();
});

// Cache and return requests
self.addEventListener('fetch', (event) => {
  // Só cachear requests GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          console.log('[SW] Servindo do cache:', event.request.url);
          return response;
        }
        
        // Clone request pois só pode ser usado uma vez
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Verificar se resposta é válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone response pois só pode ser usado uma vez
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch((error) => {
          console.error('[SW] Erro no fetch:', error);
          return new Response('Offline - recurso não disponível', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

// Update service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...');
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[SW] Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Assume controle de todas as páginas imediatamente
  return self.clients.claim();
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
