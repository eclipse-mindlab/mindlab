const CACHE_NAME = 'dilem-v45';
const urlsToCache = [
  './',
  './index.html',
  './daily.html',
  './dex.html',
  './read-me.html',
  './read-me-challenge.html',
  './read-me-results.html',
  './my-challenges.html',
  './sim-idea-thief.html',
  './sim-experience-machine.html',
  './sim-money-friend.html',
  './sim-trolley.html',
  './sim-clone.html',
  './sim-template.css',
  './sim-template.js',
  './sim-survival-test.html',
  './og-image.png',
  './og-read-me.png',
  './logo.png',
  './icon-192.png',
  './icon-512.png',
  './tier-ruby.png',
  './tier-amethyst.png',
  './tier-sapphire.png',
  './tier-emerald.png',
  './tier-obsidian.png',
  './tier-gold.png',
  './book-philosophy.png',
  './book-psychology.png'
];

// 설치 - 새 캐시 생성
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // 즉시 활성화
  );
});

// 요청 가로채기 - 네트워크 우선, 실패시 캐시
self.addEventListener('fetch', event => {
  // POST 요청은 캐시하지 않음
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 네트워크 응답을 캐시에 저장
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // 네트워크 실패시 캐시에서
        return caches.match(event.request);
      })
  );
});

// 활성화 - 이전 캐시 삭제
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
    }).then(() => self.clients.claim()) // 즉시 모든 클라이언트에 적용
  );
});
