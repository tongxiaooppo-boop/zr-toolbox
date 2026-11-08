// Service worker：先連網、連不上才用快取（network-first）。
// 有網路時永遠拿最新版，所以不需要「有新版」提示，也沒有忘記改版本號的風險；離線時用最後一次看過的版本。
// 改這份檔要同步 tests/pwa.test.js。
const CACHE = 'zr-toolbox';
const PRECACHE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'css/app.css', 'js/pwa.js',
  'js/pages/home.js', 'js/ui/components.js', 'js/data/tools.js', 'js/data/glossary.js', 'js/core/format.js'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).catch(() => {}));
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(async () => (await caches.match(req, { ignoreSearch: true }))
    || (req.mode === 'navigate' && await caches.match('index.html')) || Response.error()));
});
