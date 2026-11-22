/* Pixel Fishing service worker: makes the game installable and playable offline.
 *
 * - The cache name comes from the build version in this script's URL (sw.js?v=2.2.0), which the page sets from
 *   PF_VERSION in index.html. A new build therefore always installs a fresh worker and a fresh cache, and
 *   `activate` deletes every older cache. There is no number to bump in this file.
 * - The page loader also re-downloads the 3D engine on every start (bypassing the HTTP cache) and overwrites the
 *   cached copy, so the offline copy always matches the build that is running.
 * - The page itself is fetched network-first (never from the HTTP cache), falling back to the cached copy offline.
 * - The game's own code (css/, js/) is network-first and revalidated, so a new build never mixes with old files;
 *   the cached copy is used offline. The file list is js/boot/files.js, shared with the page loader.
 * - Static files (icons, manifest, vendor engines) are cache-first.
 */
const VERSION = new URL(self.location.href).searchParams.get('v') || 'dev';
const CACHE = `pixel-fishing-${VERSION}`;
importScripts('./js/boot/files.js');
const PRECACHE = ['./'].concat(self.PF_FILES || []);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      // Fetch fresh copies (skipping the HTTP cache), one by one, so a single missing file can't block installation.
      .then(cache => Promise.all(PRECACHE.map(url => cache.add(new Request(url, { cache: 'reload' })).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('pixel-fishing-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
  if (event.data === 'version' && event.source) event.source.postMessage({ version: VERSION });
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // CDN fallbacks etc. go straight to the network

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  if (/\/(css|js)\/[^/]+(\/[^/]+)*\.(css|js)$/.test(url.pathname)) {
    event.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then(res => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); }
          return res;
        })
        .catch(() => caches.match(req).then(r => r || Response.error()))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    }))
  );
});
