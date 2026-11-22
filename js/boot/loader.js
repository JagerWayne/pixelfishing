/* Loader: downloads the 3D engine and the physics engine side by side (always fresh, overwriting the offline cache),
   then the game's own modules, starts the physics, builds the world and starts the game. Without physics the game
   still runs on its built-in collisions. */
import { L, paint, setText, watchGameFiles } from './progress.js';
import { downloadThree, downloadPhysics } from './engines.js';

let startGame = null, physicsDone = false, started = false;

function refreshOfflineCache() {
  const V = window.PF_VERSION, CACHE = 'pixel-fishing-' + V;
  // new build: drop every older cache, re-download the game's own files fresh into the current one
  try {
    if (window.caches) {
      caches.keys().then(keys => Promise.all(keys.filter(k => k.indexOf('pixel-fishing-') === 0 && k !== CACHE).map(k => caches.delete(k)))).catch(() => {});
      caches.open(CACHE).then(c => {
        (self.PF_FILES || []).filter(u => u.indexOf('vendor/') !== 0).forEach(u => {
          fetch(u, { cache: 'reload' }).then(r => { if (r.ok) c.put(u, r); }).catch(() => {});
        });
      }).catch(() => {});
    }
  } catch (e) {}
  try { localStorage.setItem('pixel_fishing_build', V); } catch (e) {}
  // service worker: the version is in its URL, so every new build installs a fresh worker; check on every load
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js?v=' + encodeURIComponent(V), { updateViaCache: 'none' })
      .then(reg => { reg.update().catch(() => {}); }).catch(() => {});
  }
}

function fail(title, err) {
  const box = document.getElementById('loading-screen');
  if (!box) return;
  box.innerHTML = '<div class="pixel-box boot-error"><h2></h2><p></p><p>Please reload the page.</p></div>';
  box.querySelector('h2').textContent = title;
  box.querySelector('p').textContent = String(err && err.message || err);
}

function maybeStart() {
  if (started || !startGame || !L.three || !physicsDone) return;
  started = true;
  L.stage = 'start'; setText('Building the harbour... Please Wait!'); L.world = 1; paint();
  requestAnimationFrame(() => setTimeout(() => {
    try {
      startGame();
      L.world = 2; paint(); setText('Ready!');
    } catch (err) {
      fail('Could not start the game', err);
      return;
    }
    const ls = document.getElementById('loading-screen');
    if (ls) { ls.classList.add('done'); setTimeout(() => { ls.style.display = 'none'; }, 400); }
    refreshOfflineCache();
  }, 30));
}

/* loadGame() resolves to the function that starts the game; it is called once three.js is in place */
export function boot(loadGame) {
  watchGameFiles();
  paint();
  downloadThree().then(ok => {
    L.three = ok; paint();
    if (!ok) { L.stage = 'error'; setText('Could not download the game engine. Check your connection and reload.'); return; }
    if (!physicsDone) { L.stage = 'phys'; setText(L.physics === 'init' ? 'Starting the physics engine... Please Wait!' : 'Loading the physics engine... Please Wait!'); }
    loadGame().then(fn => { startGame = fn; L.gameReady = true; paint(); maybeStart(); })
      .catch(err => { L.stage = 'error'; fail('Could not load the game files', err); });
  });
  downloadPhysics().then(() => {
    physicsDone = true; paint();
    maybeStart();
  });
}
