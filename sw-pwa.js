// sw-pwa.js - Service Worker SEGURO para PWA
self.addEventListener('install', function(event) {
  console.log('PWA: Instalando...');
  self.skipWaiting(); // Ativa imediatamente
});

self.addEventListener('activate', function(event) {
  console.log('PWA: Ativado!');
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // Serve normalmente, sem cache complexo
  event.respondWith(fetch(event.request));
});
