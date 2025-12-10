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
