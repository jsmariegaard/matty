// Offline-cache. Bump CACHE ved hver udgivelse, så telefonen henter det nye.
const CACHE = 'matty-v1.0.1';

const FILES = [
  './', './index.html', './manifest.webmanifest',
  './css/style.css',
  './js/main.js', './js/store.js', './js/engine.js', './js/facts.js',
  './js/mascot.js', './js/ui.js', './js/audio.js', './js/progress.js',
  './js/data/content.js',
  './js/screens/home.js', './js/screens/quiz.js', './js/screens/tables.js',
  './js/screens/album.js', './js/screens/stats.js', './js/screens/settings.js',
  './js/screens/onboarding.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Netværk først for HTML, så hun altid får nyeste version når hun er online.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => hit || new Response('Offline', { status: 503 })))
  );
});
