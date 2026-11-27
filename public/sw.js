const CACHE_VERSION = 'v3';
const STATIC_CACHE = `gamestart-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `gamestart-dynamic-${CACHE_VERSION}`;

const APP_SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/css/app.css',
  '/js/install.js',
  '/js/db.js',
  '/js/native-apis.js',
  '/js/app.js',
  '/data/games.json',
  '/icons/icon-192.png',
  '/icons/icon-192-maskable.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
  '/images/games/zelda-totk.svg',
  '/images/games/elden-ring.svg',
  '/images/games/hollow-knight.svg',
  '/images/games/cyberpunk-2077.svg',
  '/images/games/hades-2.svg',
  '/images/games/mario-wonder.svg',
  '/images/games/baldurs-gate-3.svg',
  '/images/games/celeste.svg'
];

// Instalacion: precache del App Shell y recursos estaticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL_ASSETS))
  );
  self.skipWaiting();
});

// Activacion: limpieza de caches de versiones anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Estrategia Network First para navegacion y datos JSON
async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      return (await caches.match('/')) || Response.error();
    }
    return Response.error();
  }
}

// Estrategia Cache First para recursos estaticos
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    return Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (
    request.mode === 'navigate' ||
    url.pathname.startsWith('/data/') ||
    url.pathname.startsWith('/api/')
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
