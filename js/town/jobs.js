/* Job props, pickups, lanterns, town props and the noticeboard. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { ZONES } from '../data/catalog.js';
import { ISLAND, JOB_LANTERNS, TOWN, townGround } from '../world/layout.js';
import { townFadeState } from '../sim/tap-walk.js';
import { FRIEND_PERKS, NPCS, friendPerk } from '../data/townsfolk.js';
import { scene } from '../render/renderer.js';
import { world } from '../render/lights.js';
import { catchOfDay } from '../fishing/market.js';
import { saveGame } from '../save/save-game.js';
import { showToast } from '../ui/toasts.js';
import { friendHearts } from './talk.js';
import { restoOpen } from './restaurant.js';
import { cravingLines } from './cooking.js';
import { repTitle, town } from './town-state.js';
import { openTownSheet, townRefresh } from './town-nav.js';
import { JOB_KINDS, acceptJob, activeJob, clearJobProps, dropJob, ensureJobs, finishJob, jobProps, mailStop } from './town-jobs.js';
import { projectRows } from '../fishing/rigs.js';
import { shopMoney } from '../shop/shop-kinds.js';

export function syncJobProps() {
  clearJobProps(); const a = activeJob(); if (!a || !a.pts.length) return;
  a.pts.forEach(p => {
    const g = new THREE.Group(), y = p.z > ISLAND.zGate ? townGround(p.z) : 1.55, M = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, flatShading: true });
    if (a.kind === 'cleanup') {
      const k = Math.abs(Math.round(p.x * 3 + p.z)) % 3;
      if (k === 0) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.9, 6), M(0x8b6a4a)); m.rotation.z = Math.PI / 2; m.rotation.y = p.x; m.position.y = 0.08; g.add(m); }
      else if (k === 1) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.26, 8), M(0x15803d)); m.rotation.z = Math.PI / 2; m.position.y = 0.06; g.add(m); }
      else { const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.24), M(0x9ca3af)); m.position.y = 0.06; m.rotation.y = p.z; g.add(m); }
    } else if (a.variant === 'shells') { const m = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.2, 7), M(0xfbcfe8)); m.rotation.z = 1.3; m.position.y = 0.07; g.add(m); }
    else { for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.28, 5), M(0x22c55e)); m.position.set(Math.cos(i * 1.6) * 0.07, 0.14, Math.sin(i * 1.6) * 0.07); g.add(m); } }
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.38, 20), new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.7, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; g.add(ring);
    g.position.set(p.x, y, p.z); g.userData.p = p; scene.add(g); jobProps.push(g);
  });
}
export function nearPickup() {
  const a = activeJob(); if (!a || !a.pts.length) return -1;
  return a.pts.findIndex(p => Math.hypot(shared.playerX - p.x, shared.playerZ - p.z) < 1.0);
}
export function takePickup() {
  const a = activeJob(), i = nearPickup(); if (i < 0) return;
  a.pts.splice(i, 1); a.n++; sfx.playTick(); syncJobProps();
  if (a.n >= a.need) finishJob(true); else { saveGame(); showToast(`${JOB_KINDS[a.kind].icon} ${a.n} / ${a.need}`); }
}
/* the street lanterns: lit by the night watch, they glow until morning */
export function nearLantern() {
  const a = activeJob(); if (!a || a.kind !== 'lantern' || a.stage !== 1) return -1;
  return JOB_LANTERNS.findIndex((p, i) => !town().lit.includes(i) && Math.hypot(shared.playerX - p.x, shared.playerZ - p.z) < 1.3);
}
export function lightLantern() {
  const a = activeJob(), i = nearLantern(); if (i < 0) return;
  const T = town(); if (T.litDay !== (shared.state.dayCount || 0) && !a.n) T.lit = [];
  T.lit.push(i); T.litDay = shared.state.dayCount || 0; a.n++; sfx.playTick();
  if (a.n >= a.need) finishJob(true); else { saveGame(); showToast(`🏮 ${a.n} / ${a.need} lanterns lit`); }
}
export function updateTownProps() {
  const D = world && world.district; if (!D) return;
  const T = town(), night = shared.state.timeOfDay > 0.75 || shared.state.timeOfDay < 0.25;
  const litNow = T.litDay === (shared.state.dayCount || 0) || (T.litDay === (shared.state.dayCount || 0) - 1 && shared.state.timeOfDay < 0.25);
  D.lanterns.forEach((l, i) => { const on = night && litNow && T.lit.includes(i); l.glass.emissiveIntensity = on ? 1.4 : 0; });
  D.benchLamps.forEach(l => { l.head.emissiveIntensity = night ? 1.6 : 0; l.pool.opacity = night ? 0.55 : 0; });
  // v12.0.0: windows and door lamps glow at night (the fade gives each building its own copy, so find the copies once)
  if (D.glowVer !== townFadeState.ver) {
    D.glowVer = townFadeState.ver; D.glow = [];
    world.islandScenery.traverse(o => { if (o.isMesh && o.material && o.material.userData.glow && !D.glow.includes(o.material)) D.glow.push(o.material); });
    D.glowNight = null;
  }
  if (D.glowNight !== night) { D.glowNight = night; D.glow.forEach(m => { m.emissiveIntensity = night ? (m.userData.glow === 'lamp' ? 1.5 : 0.85) : 0; }); }
  D.trapFloats.forEach((f, i) => { f.visible = !!T.traps[i]; if (f.visible) f.position.y = townGround(TOWN.pool.z) + 0.08 + Math.sin(shared.elapsed * 2 + i) * 0.02; });
}

/* ---- the noticeboard: today's jobs and your standing in town ---- */
export function openJobsSheet(title) {
  ensureJobs();
  openTownSheet(title || '📌 NOTICEBOARD: TOWN JOBS', ({ row, head, note }) => {
    const T = town(), a = T.jobs.active;
    note(`Town reputation <b>${T.rep}</b>: ${repTitle(T.rep)} • ${T.jobsDone} jobs done. New jobs every morning.`);
    if (a) {
      head('Your job');
      const K = JOB_KINDS[a.kind], st = a.kind === 'mail' ? (a.stage === 0 ? 'Collect the parcel at the Post Office.' : `Deliver to ${mailStop(a.to).name}: ${Math.floor(a.left / 60)}h ${String(Math.floor(a.left % 60)).padStart(2, '0')}m left.`)
        : a.kind === 'lantern' ? (a.stage === 1 ? `${a.n} / ${a.need} lit. Until 22:00.` : 'Starts at 18:00.') : a.kind === 'winch' ? 'Go to the winch beside the Boatyard.' : `${a.n} / ${a.need} found (yellow rings).`;
      row(`<span class="sl-n">${K.icon} ${K.name}<small>${st} • pays ${shopMoney(a.pay)}</small></span>`, [['Drop', 'red', () => { dropJob(); townRefresh(); }]]);
    }
    head("Today's jobs");
    T.jobs.list.forEach((j, i) => {
      const K = JOB_KINDS[j.kind];
      row(`<span class="sl-n">${K.icon} ${K.name}<small>${K.desc(j)} • ${shopMoney(j.pay)} + ${j.xp} XP</small></span>`,
        j.status === 'open' ? [['Take', '', () => { acceptJob(i); townRefresh(); }, !!a]] : [[j.status === 'done' ? 'Done' : j.status === 'failed' ? 'Missed' : 'Taken', '', () => {}, true]]);
    });
    craveRows({ row, head, note });
    projectRows({ row, head, note });
  });
}
/* the noticeboard also shows today's restaurant cravings, Ines' Catch of the Day tip and your friendships */
function craveRows({ row, head, note }) {
  if (restoOpen()) { head("Today's cravings at the restaurant"); note(cravingLines().join('<br>') + '<br>Have the dish in the fridge during that service: they pay double.'); }
  if (friendPerk('ines')) {
    const c = catchOfDay(), when = c.fullMoonOnly ? 'on full-moon nights' : c.stormOnly ? 'in storms' : 'at any time';
    head('🔬 Ines\' tip'); note(`Today's Catch of the Day is the <b>${c.name}</b>: it lives in ${c.zones.map(z => ZONES[z - 1].name).join(', ')}, ${when}. Worth three times its price today.`);
  }
  head('Friends');
  note(Object.keys(NPCS).map(id => `${NPCS[id].icon} ${NPCS[id].name} ${friendHearts(id)}${friendPerk(id) ? ` • ${FRIEND_PERKS[id]}` : ''}`).join('<br>'));
}
