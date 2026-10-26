/* VaiComigo: service worker conservador. Sem cache de dados privados. */
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
