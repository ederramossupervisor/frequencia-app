// sw-simples.js - Service Worker MÍNIMO
self.addEventListener('install', (e) => {
  console.log('SW: Instalação simples');
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('SW: Ativação simples');
  return self.clients.claim();
});

// SEM fetch event - evita looping
