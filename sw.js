const CACHE = 'kiwoom-v8';
const BASE = '/http-127.0.0.1-7001-/';
const STATIC = [
  BASE,
  BASE + 'index.html',
  BASE + 'epc_data.js',
  BASE + 'manifest.json',
  BASE + 'icon.svg',
  BASE + 'icon-maskable.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // app.js, style.css → 항상 네트워크에서 최신 버전 가져오기
  if (url.includes('app.js') || url.includes('style.css')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  if (url.includes('supabase.co') || url.includes('googleapis.com') || url.includes('kakao')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match(BASE + 'index.html'));
    })
  );
});