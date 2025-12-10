// SERVICE WORKER CORRIGIDO PARA SUA ESTRUTURA
const CACHE_NAME = 'controle-frequencia-v1.0.1';

// LISTA DE ARQUIVOS PARA CACHE - ATUALIZADA COM SEUS ARQUIVOS
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',  // AGORA COM O NOME CORRETO
  './js/acompanhamento.js',
  './js/api.js',
  './js/app.js',
  './js/config.js',
  './js/configuracoes.js',
  './js/frequencia.js',
  './js/utils.js'
];

// Instala o Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando e cacheando recursos...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto, adicionando recursos...');
        
        // Cacheia cada arquivo individualmente para capturar erros
        const cachePromises = urlsToCache.map(url => {
          return cache.add(url).catch(error => {
            console.warn(`Não conseguiu cachear ${url}:`, error.message);
            // Continua mesmo se um arquivo falhar
            return Promise.resolve();
          });
        });
        
        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log('Todos os recursos foram processados');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Erro durante a instalação:', error);
        // Mesmo com erro, continua
        return self.skipWaiting();
      })
  );
});

// Ativa o Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker pronto!');
      return self.clients.claim();
    })
  );
});

// Intercepta requisições - VERSÃO SIMPLIFICADA
self.addEventListener('fetch', event => {
  // Ignora requisições para o Google Apps Script
  if (event.request.url.includes('script.google.com')) {
    return;
  }
  
  // Ignora requisições POST
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se existir
        if (response) {
          return response;
        }
        
        // Se não estiver no cache, busca na rede
        return fetch(event.request)
          .then(response => {
            // Só cacheia se a resposta for válida
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
            // Se offline e não tem no cache, retorna página offline
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
            return new Response('Offline', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Mensagens do app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Para futuras implementações
self.addEventListener('push', () => {
  // Implementação futura
});

self.addEventListener('notificationclick', () => {
  // Implementação futura
});
