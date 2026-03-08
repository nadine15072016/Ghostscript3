// Service Worker untuk PWA EVIDEN LCS GHOSTSCRIPT
// Version 1.0.0
const CACHE_NAME = 'eviden-lcs-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './indexeddb-helper.js',
  './docx-exporter-modern.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(function(err) {
        console.error('[Service Worker] Cache failed:', err);
      })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          console.log('[Service Worker] Serving from cache:', event.request.url);
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(function(err) {
          console.error('[Service Worker] Fetch failed:', err);
          // Return offline page or fallback if needed
        });
      })
  );
});

// Background sync for backup (optional - advanced feature)
self.addEventListener('sync', function(event) {
  if (event.tag === 'backup-sync') {
    event.waitUntil(
      // Implement backup logic here if needed
      console.log('[Service Worker] Background sync triggered')
    );
  }
});

// Push notification support (optional)
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});
