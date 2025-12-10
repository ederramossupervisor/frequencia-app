// sw-simple.js - APENAS para limpar cache no Android
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

self.addEventListener('fetch', event => {
  // SEMPRE busca da rede primeiro, ignora cache
  event.respondWith(fetch(event.request));
});
