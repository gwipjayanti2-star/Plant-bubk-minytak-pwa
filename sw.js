const CACHE_NAME = 'plant-pwa-v2';

// Daftar aset statis yang akan di-cache untuk keperluan offline load UI dasar
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass Cache sepenuhnya untuk API Google Apps Script karena bersifat dinamis
  if (url.origin === 'https://script.google.com') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Untuk aset statis, gunakan strategi Cache First
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) { return response; }
      return fetch(event.request).catch(() => {
          console.log("[SW] Offline and asset not cached:", event.request.url);
      });
    })
  );
});
