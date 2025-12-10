// service-worker.js - ADICIONE ESTAS LINHAS NO TOPO
const CACHE_VERSION = 'v2.0'; // MUDE ESTE NÚMERO SEMPRE QUE ATUALIZAR
const CACHE_NAME = `frequencia-${CACHE_VERSION}`;

// AUTO-ATUALIZAÇÃO: Mata caches antigos
self.addEventListener('activate', event => {
  console.log('Service Worker: Ativando e limpando caches antigos');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Ativado! Versão:', CACHE_VERSION);
      return self.clients.claim();
    })
  );
});
// service-worker.js - VERSÃO SIMPLIFICADA E FUNCIONAL
const CACHE_NAME = 'controle-frequencia-v1';

self.addEventListener('install', event => {
  console.log('Service Worker: Instalado');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Ativado');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // Não intercepta requisições para Google
  if (event.request.url.includes('script.google.com')) {
    return;
  }
  
  // Para páginas HTML, tenta cache primeiro
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html')
        .then(response => response || fetch(event.request))
    );
    return;
  }
  
  // Para outros recursos, busca na rede primeiro
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
