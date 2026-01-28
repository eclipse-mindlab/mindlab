const CACHE_NAME = 'mindlab-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/sim-idea-thief.html',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/tier-ruby.png',
  '/tier-amethyst.png',
  '/tier-sapphire.png',
  '/tier-emerald.png',
  '/tier-obsidian.png',
  '/tier-gold.png',
  '/book-philosophy.png',
  '/book-psychology.png'
];

// 설치
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 요청 가로채기
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에 있으면 캐시에서, 없으면 네트워크에서
        return response || fetch(event.request);
      })
  );
});

// 업데이트
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
