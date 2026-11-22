/* Loading screen progress: one line per step (game files, 3D engine, physics engine, building the harbour) and
   the big overall percentage, weighted by how long each step takes. */
import './files.js';

/* Shared loader state, written by the download steps and read by paint(). world: 0 waiting, 1 building, 2 done. */
export const L = {
  loaded: 0, loadedR: 0, three: false, physics: false, stage: '', world: 0,
  filesDone: 0, gameReady: false,
};
const GAME_FILES = (self.PF_FILES || []).filter(u => /^(index\.html|css\/.*\.css|js\/.*\.js)$/.test(u) && !/nomodule/.test(u));
const seen = new Set();

export function fmt(n) { return n >= 1048576 ? (n / 1048576).toFixed(2) + ' MB' : Math.max(0, Math.round(n / 1024)) + ' KB'; }
export function setText(t) { const el = document.getElementById('loading-text'); if (el) el.textContent = t; }

/* count the game's own files as the browser finishes each one (the page, stylesheets and modules) */
export function watchGameFiles() {
  const base = new URL('./', document.baseURI).href;
  const note = e => {
    const rel = e.name.startsWith(base) ? e.name.slice(base.length).split(/[?#]/)[0] || 'index.html' : '';
    if (rel && GAME_FILES.includes(rel) && !seen.has(rel)) { seen.add(rel); L.filesDone = seen.size; paint(); }
  };
  note({ name: base + 'index.html' });
  try {
    performance.getEntriesByType('resource').forEach(note);
    new PerformanceObserver(list => list.getEntries().forEach(note)).observe({ type: 'resource', buffered: true });
  } catch (e) {}
}

export function paint() {
  const pg = window.PF_PAGE_BYTES_GUESS, T = window.PF_THREE_BYTES, R = window.PF_RAPIER_BYTES;
  const total = Math.max(1, GAME_FILES.length);
  const pPage = L.gameReady ? 1 : Math.min(0.95, L.filesDone / total), pThree = L.three ? 1 : Math.min(1, L.loaded / T);
  const ph = L.physics;
  const pPhysDl = ph === true || ph === 'init' || ph === 'off' ? 1 : Math.min(1, L.loadedR / R);
  const pPhysInit = ph === true || ph === 'off' ? 1 : ph === 'init' ? 0.5 : 0;
  const pWorld = L.world === 2 ? 1 : L.world === 1 ? 0.5 : 0;
  // weights: bytes for the downloads, plus fixed shares for starting the physics and building the world
  const wPage = pg, wThree = T, wPhys = R, wInit = R * 0.25, wWorld = (pg + T + R) * 0.15;
  const all = (pPage * wPage + pThree * wThree + pPhysDl * wPhys + pPhysInit * wInit + pWorld * wWorld) / (wPage + wThree + wPhys + wInit + wWorld);
  const pct = Math.min(100, Math.floor(all * 100));
  const big = document.getElementById('loading-pct'); if (big) big.textContent = pct + '%';
  const bar = document.getElementById('loading-bar-fill'); if (bar) bar.style.width = pct + '%';
  if (!L.stage) setText('Loading... ' + fmt(Math.min(pg + T + R, pPage * pg + L.loaded + L.loadedR)) + ' / ' + fmt(pg + T + R));
  row('ls-page', pPage, L.gameReady ? 'ok' : '', Math.min(L.filesDone, total) + ' / ' + total + ' files');
  row('ls-three', pThree, L.three ? 'ok' : '', fmt(Math.min(L.loaded, T)) + ' / ' + fmt(T));
  row('ls-phys', pPhysDl * 0.8 + pPhysInit * 0.2, ph === true ? 'ok' : ph === 'off' ? 'off' : '',
    ph === 'init' ? 'starting' : ph === 'off' ? 'built-in collisions' : fmt(Math.min(L.loadedR, R)) + ' / ' + fmt(R));
  row('ls-world', pWorld, L.world === 2 ? 'ok' : '', L.world === 1 ? 'building' : L.world === 2 ? '' : 'waiting');
}

/* one line per step: name, percentage (and size or state) and a small bar */
function row(id, p, state, note) {
  const el = document.getElementById(id); if (!el) return;
  const pc = Math.min(100, Math.floor(p * 100));
  el.querySelector('i').style.width = pc + '%';
  el.querySelector('em').textContent = (state === 'off' ? '' : pc + '%') + (note ? (state === 'off' ? '' : ' · ') + note : '');
  el.className = 'ls-row' + (state ? ' ' + state : '');
}
