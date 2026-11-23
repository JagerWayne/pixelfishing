/* The town's walking graph and paths, and the town sheet. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { ISLAND, STREETS, TOWN, TOWN_BUILDINGS, doorOf } from '../world/layout.js';
import { PHYS } from '../data/recipes.js';
import { Physics } from '../engine/physics.js';
import { walkColliders } from '../render/lights.js';
import { addXp, bumpStat } from '../save/career.js';
import { saveGame } from '../save/save-game.js';
import { showToast } from '../ui/toasts.js';
import { ShopUI } from '../shop/shop-ui.js';
import { updateHUD } from '../ui/hud.js';

/* ---- walking around town: a few open-lane waypoints, joined where nothing solid is in the way ---- */
export const townNav = { nodes: null, adj: null, cols: null };
const townCol = c => c.z > ISLAND.zGate - 1;
function townBlocked(x, z, m = 0.3) {
  if (x < -ISLAND.xMax + 0.2 || x > ISLAND.xMax - 0.2 || z > ISLAND.zMax - 0.1 || z < ISLAND.zIn + 0.1) return true;
  if (Physics.on && PHYS.walk === 'rapier') return Physics.blocked(x, z, m, townCol);   // v8.2.0: one Rapier query instead of a scan
  for (const c of townNav.cols) {
    if (c.kind === 'box') { if (Math.abs(x - c.x) < c.hx + m && Math.abs(z - c.z) < c.hz + m) return true; }
    else if (Math.hypot(x - c.x, z - c.z) < c.r + m) return true;
  }
  return x < -ISLAND.xMax + 0.2 || x > ISLAND.xMax - 0.2 || z > ISLAND.zMax - 0.1 || z < ISLAND.zIn + 0.1;
}
function townSegClear(a, b) {
  const d = Math.hypot(b.x - a.x, b.z - a.z), n = Math.max(1, Math.ceil(d / 0.3));
  if (Physics.on && PHYS.walk === 'rapier') {   // v8.2.0: one shape cast along the segment, plus the town edges
    for (let i = 1; i < n; i++) { const t = i / n, x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t; if (x < -ISLAND.xMax + 0.2 || x > ISLAND.xMax - 0.2 || z > ISLAND.zMax - 0.1 || z < ISLAND.zIn + 0.1) return false; }
    return Physics.segClear(a, b, 0.26, townCol);
  }
  for (let i = 1; i < n; i++) { const t = i / n; if (townBlocked(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t, 0.26)) return false; }
  return true;
}
export function townNavInit() {
  townNav.cols = walkColliders.filter(c => c.z > ISLAND.zGate - 1);
  // v12.0.0: waypoints from the plan: every 3 m along each street, a grid over the square, and every building's door
  const N = [];
  STREETS.forEach(st => {
    for (let k = 0; k < st.pts.length - 1; k++) {
      const [ax, az] = st.pts[k], [bx, bz] = st.pts[k + 1], n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / 3));
      for (let i = 0; i <= n; i++) N.push({ x: ax + (bx - ax) * i / n, z: az + (bz - az) * i / n });
    }
  });
  const S = TOWN.square;
  for (let x = S.x0 + 1.2; x < S.x1; x += 3.2) for (let z = S.z0 + 1.0; z < S.z1; z += 3.0) N.push({ x, z });
  TOWN_BUILDINGS.concat(['board', 'cabin']).forEach(id => N.push(doorOf(TOWN[id], 0.8)));
  // v12.2.0: inside your cabin, behind the door, in the living room and in the bedroom
  N.push(doorOf(TOWN.cabin, -0.9), doorOf(TOWN.cabin, -1.6), doorOf(TOWN.cabin, -1.6, 6.6), doorOf(TOWN.cabin, -3.0, 2.6));
  N.push({ x: TOWN.scope.x, z: TOWN.scope.z + 0.75 }, { x: TOWN.pool.x - TOWN.pool.r - 0.8, z: TOWN.pool.z });   // behind the telescope, beside the pool
  townNav.nodes = N.filter(p => !townBlocked(p.x, p.z));
  townNav.adj = townNav.nodes.map((a, i) => townNav.nodes.map((b, j) => (i !== j && Math.hypot(a.x - b.x, a.z - b.z) < 14 && townSegClear(a, b) ? Math.hypot(a.x - b.x, a.z - b.z) : 0)));
}
/* points to walk from a to b inside the town (b included, a not): straight if clear, else through the waypoints */
export function townPath(a, b) {
  if (!townNav.nodes) townNavInit();
  if (townSegClear(a, b)) return [{ x: b.x, z: b.z }];
  const N = townNav.nodes, n = N.length, dist = new Array(n + 2).fill(Infinity), prev = new Array(n + 2).fill(-1), done = new Array(n + 2).fill(false);
  const S = n, E = n + 1, P = i => (i === S ? a : i === E ? b : N[i]);
  const edge = (i, j) => {
    if (i < n && j < n) return townNav.adj[i][j];
    const p = P(i), q = P(j), d = Math.hypot(p.x - q.x, p.z - q.z);
    return (i === S && j === E) ? 0 : (d < 16 && townSegClear(p, q) ? d : 0);
  };
  dist[S] = 0;
  for (;;) {
    let u = -1; for (let i = 0; i < n + 2; i++) if (!done[i] && dist[i] < Infinity && (u < 0 || dist[i] < dist[u])) u = i;
    if (u < 0 || u === E) break; done[u] = true;
    for (let v = 0; v < n + 2; v++) { if (done[v] || v === S) continue; const w = edge(u, v); if (w > 0 && dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = u; } }
  }
  if (prev[E] < 0) return [{ x: b.x, z: b.z }];
  const out = []; for (let v = E; v !== S && v >= 0; v = prev[v]) out.unshift({ x: P(v).x, z: P(v).z });
  return out;
}

/* ---- the town sheet: one bottom sheet for the noticeboard, Post Office, tavern, traps, workshop and greenhouse ---- */
export const townUI = { title: '', render: null, raf: 0 };
export function openTownSheet(title, render) {
  townUI.title = title; townUI.render = render;
  townRefresh(); document.getElementById('modal-town').classList.add('open');
}
export function townRefresh() {
  const host = document.getElementById('town-body'); if (!townUI.render) return;
  document.getElementById('town-title').textContent = townUI.title;
  const top = host.scrollTop, a = document.activeElement, key = a && host.contains(a) && a.dataset ? a.dataset.k : null;
  host.innerHTML = '';
  let n = 0;   // the same cards as the shop sheet (ShopUI.makeRow): every button names what it acts on
  const row = (html, buttons, cls) => { const r = ShopUI.makeRow(html, buttons, cls, null, n++); host.appendChild(r); return r; };
  const head = t => host.insertAdjacentHTML('beforeend', `<li class="sh-group"><span role="heading" aria-level="3">${t}</span></li>`);
  const note = t => host.insertAdjacentHTML('beforeend', `<li class="sh-note">${t}</li>`);
  townUI.render({ host, row, head, note });
  host.querySelectorAll('input, textarea').forEach(el => el.addEventListener('keydown', e => e.stopPropagation()));   // typing does not steer the angler
  host.scrollTop = top;
  if (key) { const b = host.querySelector(`[data-k="${key}"]`); if (b && !b.disabled) b.focus({ preventScroll: true }); }
}
export const townClose = () => { cancelAnimationFrame(townUI.raf); document.getElementById('modal-town').classList.remove('open'); };
export function townPay(cash, xp, msg) {
  if (cash) { shared.state.cash = +(shared.state.cash + cash).toFixed(2); bumpStat('earned', cash); }
  if (xp) addXp(xp);
  sfx.playCoin(); saveGame(); updateHUD(); if (msg) showToast(msg);
}
