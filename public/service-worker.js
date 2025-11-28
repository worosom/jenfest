const CACHE_NAME = 'jenfest-v2';
const urlsToCache = [
  '/',
  '/jenfest_logo2.png',
  '/remfest_4.0_theme_song.m4a',
  '/map.jpg',
  '/manifest.json',
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching essential files');
      return cache.addAll(urlsToCache).catch((err) => {
        console.error('Service Worker: Failed to cache some files', err);
      });
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip Chrome extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Skip Firebase, Auth0, and other API requests
  if (url.pathname.startsWith('/__/') || 
      url.hostname.includes('firebase') ||
      url.hostname.includes('auth0') ||
      url.hostname.includes('googleapis') ||
      url.hostname.includes('netlify')) {
    return;
  }

  // Skip development server requests
  if (url.pathname.startsWith('/src/') ||
      url.pathname.includes('/@vite') || 
      url.pathname.includes('/@fs') ||
      url.pathname.includes('/@id') ||
      url.pathname.includes('.map') ||
      url.pathname.includes('node_modules') ||
      url.searchParams.has('import')) {
    return;
  }

  // Network-first strategy: try network, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache static assets only
        if (event.request.method === 'GET' && 
            (url.pathname.endsWith('.js') || 
             url.pathname.endsWith('.css') || 
             url.pathname.endsWith('.png') || 
             url.pathname.endsWith('.jpg') || 
             url.pathname.endsWith('.jpeg') || 
             url.pathname.endsWith('.svg') || 
             url.pathname.endsWith('.woff') || 
             url.pathname.endsWith('.woff2') ||
             url.pathname.endsWith('.mp3') ||
             url.pathname.endsWith('.m4a') ||
             url.pathname.endsWith('.json') ||
             url.pathname === '/')) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If requesting HTML, return cached index
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/');
          }
          
          // Otherwise return offline message
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});