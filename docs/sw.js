const CACHE = 'rajis-v1';
const ASSETS = [
  '/rajis/',
  '/rajis/index.html',
  '/rajis/css/style.css',
  '/rajis/js/config.js',
  '/rajis/js/save.js',
  '/rajis/js/audio.js',
  '/rajis/js/world.js',
  '/rajis/js/combat.js',
  '/rajis/js/gameplay.js',
  '/rajis/js/enemies.js',
  '/rajis/js/ui.js',
  '/rajis/js/main.js',
  '/rajis/js/multiplayer.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
