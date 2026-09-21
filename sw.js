const CACHE_NAME = 'sheet-app-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  // Melakukan cache file-file statis saat pertama kali SW diinstal
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  // 1. Jangan cache request yang ditujukan ke server API Google Spreadsheet
  if (event.request.url.includes('script.google.com') || event.request.url.includes('script.googleusercontent.com')) {
    return; // Biarkan request berjalan secara online tanpa intervensi SW
  }

  // 2. Hanya tangani method GET untuk cache
  if (event.request.method !== 'GET') return;

  // 3. Strategi Cache-First (Buka cache dulu, kalau tidak ada baru fetch ke jaringan)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika ada di cache, kembalikan dari cache
        if (response) {
          return response;
        }
        // Jika tidak ada di cache, ambil dari jaringan
        return fetch(event.request).catch(() => {
            console.log('Mode offline dan file tidak ada di cache');
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
