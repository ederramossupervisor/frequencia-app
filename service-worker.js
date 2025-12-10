// SERVICE WORKER PARA APLICATIVO PWA

const CACHE_NAME = 'controle-frequencia-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/config.js',
  '/js/utils.js',
  '/js/api.js',
  '/js/frequencia.js',
  '/js/acompanhamento.js',
  '/js/configuracoes.js',
  '/manifest.json'
];

// Instala o Service Worker e cacheia recursos
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cacheando recursos');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Instalação completa');
        return self.skipWaiting();
      })
  );
});

// Ativa o Service Worker e limpa caches antigos
self.addEventListener('activate', event => {
  console.log('Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Ativação completa');
      return self.clients.claim();
    })
  );
});

// Intercepta requisições
self.addEventListener('fetch', event => {
  // Não cacheia requisições para o Google Apps Script
  if (event.request.url.includes('script.google.com')) {
    return;
  }
  
  // Para requisições de dados, usa network-first
  if (event.request.url.includes('/api/') || event.request.headers.get('Accept')?.includes('application/json')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clona a resposta para cache (se for cacheável)
          if (event.request.method === 'GET' && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback para cache se offline
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Para recursos estáticos, usa cache-first
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se encontrado
        if (response) {
          return response;
        }
        
        // Se não encontrado no cache, busca na rede
        return fetch(event.request)
          .then(response => {
            // Verifica se a resposta é válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clona a resposta para cache
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Fallback para página offline
            if (event.request.headers.get('Accept')?.includes('text/html')) {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Lida com mensagens do app principal
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Lida com notificações push (para implementações futuras)
self.addEventListener('push', event => {
  console.log('Service Worker: Push recebido', event);
  
  const options = {
    body: event.data?.text() || 'Nova notificação do Controle de Frequência',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23556B2F"/><text x="50" y="70" font-family="Arial" font-size="60" text-anchor="middle" fill="%23F5F5F5">📊</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23556B2F"/><text x="50" y="70" font-family="Arial" font-size="60" text-anchor="middle" fill="%23F5F5F5">📊</text></svg>',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir App',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="white" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/></svg>'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="white" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Controle de Frequência', options)
  );
});

// Lida com cliques em notificações
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notificação clicada', event.notification.tag);
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // Abre/foca o app
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      // Verifica se já tem uma janela aberta
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Se não tem, abre nova janela
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Lida com sincronização em segundo plano (para implementações futuras)
self.addEventListener('sync', event => {
  console.log('Service Worker: Sincronização em segundo plano', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Função para sincronizar dados
async function syncData() {
  console.log('Service Worker: Sincronizando dados...');
  
  // Esta função pode ser expandida para sincronizar dados pendentes
  try {
    // Exemplo: obter dados pendentes do IndexedDB e enviar
    return Promise.resolve();
  } catch (error) {
    console.error('Service Worker: Erro na sincronização:', error);
    return Promise.reject(error);
  }
}
