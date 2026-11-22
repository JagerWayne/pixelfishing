/* Town jobs: the kinds, stops and spots, taking and finishing a job, and the job props. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { CABIN, JOB_LANTERNS, LH_J, PLATFORM, TOWN } from '../world/layout.js';
import { PHYS } from '../data/recipes.js';
import { Physics } from '../engine/physics.js';
import { scene } from '../render/renderer.js';
import { walkColliders, world } from '../render/lights.js';
import { boatPos } from '../sim/runtime.js';
import { saveGame } from '../save/save-game.js';
import { showToast } from '../ui/toasts.js';
import { questEvent } from './story.js';
import { dayRng, repTitle, town } from './town-state.js';
import { townNav, townNavInit, townPay } from './town-nav.js';
import { syncJobProps } from './jobs.js';
import { shopMoney } from '../shop/shop-kinds.js';

/* ---- town jobs: three a day, one at a time ---- */
export const JOB_KINDS = {
  mail:    { icon: '📦', name: 'Cargo & mail runner', pay: [45, 90], xp: 20, desc: j => `Collect a parcel at the Post Office and bring it to ${mailStop(j.to).name} within ${Math.round(j.left / 60) || mailStop(j.to).hours} hours.` },
  cleanup: { icon: '🧹', name: 'Harbour cleanup crew', pay: [40, 70], xp: 18, desc: () => 'Pick up 5 pieces of washed-up litter along the boardwalk and the east terrace.' },
  lantern: { icon: '🏮', name: 'Night watch: lantern lighter', pay: [60, 100], xp: 24, desc: () => `Light the ${JOB_LANTERNS.length} street lanterns between 18:00 and 22:00.` },
  forage:  { icon: '🌿', name: 'Herb & shell foraging', pay: [35, 65], xp: 16, desc: j => (j.variant === 'shells' ? 'Gather 5 shells around the tide pool for Talia and Lorenzo.' : 'Gather 5 coastal herbs on Lighthouse Hill for Talia and Lorenzo.') },
  winch:   { icon: '🏗️', name: 'Dockhand winch assist', pay: [50, 85], xp: 20, desc: () => "Help Rook hoist 5 heavy crates at the winch beside the Boatyard: press HOIST when the hook is in the green." }
};
const MAIL_STOPS = [
  { id: 'platform', name: 'the mooring platform', at: () => ({ x: (PLATFORM.xOut + PLATFORM.xIn) / 2, z: (PLATFORM.zMin + PLATFORM.zMax) / 2 }), r: 1.8, hours: 4 },
  { id: 'resto', name: 'the restaurant', at: () => ({ x: TOWN.resto.x, z: TOWN.resto.z - TOWN.resto.d / 2 - 0.9 }), r: 1.8, hours: 4 },
  { id: 'cabin', name: 'the cabin', at: () => ({ x: CABIN.x, z: CABIN.d / 2 }), r: 2.0, hours: 4 },
  { id: 'tavern', name: "Sailors' Rest", at: () => ({ x: TOWN.tavern.x, z: TOWN.tavern.z - TOWN.tavern.d / 2 - 0.9 }), r: 1.8, hours: 4 },
  { id: 'jetty', name: 'the lighthouse jetty', at: () => ({ x: LH_J.x, z: LH_J.z }), r: 26, hours: 10, boat: true }
];
export const mailStop = id => MAIL_STOPS.find(s => s.id === id) || MAIL_STOPS[0];
const postFront = () => ({ x: TOWN.post.x, z: TOWN.post.z - TOWN.post.d / 2 - 0.85 });
const LITTER_SPOTS = [[-24, 3.8], [-20.4, 4.6], [-9.2, 3.7], [9.4, 4.6], [19.6, 3.9], [24.4, 4.4], [33.2, 16.2], [36.4, 16.6], [29.4, 22.4], [36.6, 22.8], [-35.2, 9.4], [26.2, 8.0]];
const HERB_SPOTS = [[-27.0, 16.4], [-31.8, 16.5], [-35.8, 17.8], [-36.4, 22.6], [-30.4, 23.0], [-26.6, 22.9], [-22.2, 22.6], [-35.6, 15.0], [-29.6, 21.6]];
const SHELL_SPOTS = [[30.9, 21.9], [36.9, 17.3], [37.0, 22.6], [31.6, 16.8], [30.4, 19.6], [33.9, 23.1], [37.1, 19.8]];
export function ensureJobs() {
  const T = town(), day = shared.state.dayCount || 0;
  if (T.jobs.day === day && T.jobs.list.length) return;
  if (T.jobs.active && T.jobs.day !== day && T.jobs.day >= 0) { T.jobs.active = null; clearJobProps(); showToast('📋 Yesterday\'s job has expired.'); }
  const r = dayRng(day * 7 + 3), kinds = Object.keys(JOB_KINDS).sort(() => r() - 0.5).slice(0, 3);
  T.jobs.day = day;
  T.jobs.list = kinds.map((kind, i) => {
    const K = JOB_KINDS[kind], j = { kind, id: `${day}-${i}`, pay: Math.round(K.pay[0] + r() * (K.pay[1] - K.pay[0])), xp: K.xp, status: 'open', stage: 0, n: 0, need: kind === 'lantern' ? JOB_LANTERNS.length : 5, left: 0, to: '', variant: r() < 0.5 ? 'herbs' : 'shells', pts: [] };
    if (kind === 'mail') { const stops = MAIL_STOPS.filter(s => !s.boat || (shared.state.ownedBoats || []).length); const s = stops[Math.floor(r() * stops.length)]; j.to = s.id; if (s.boat) j.pay += 60; }
    return j;
  });
}
export const activeJob = () => (shared.state.town && shared.state.town.jobs.active) || null;
export function acceptJob(idx) {
  const T = town(), j = T.jobs.list[idx]; if (!j || j.status !== 'open') return;
  if (T.jobs.active) { showToast('📋 Finish (or drop) your current job first.'); return; }
  j.status = 'active';
  const a = Object.assign({}, j, { pts: [] });
  if (a.kind === 'cleanup' || a.kind === 'forage') {
    const pool = (a.kind === 'cleanup' ? LITTER_SPOTS : a.variant === 'shells' ? SHELL_SPOTS : HERB_SPOTS).filter(([x, z]) => !townBlockedAny(x, z));
    a.pts = pool.sort(() => Math.random() - 0.5).slice(0, 5).map(([x, z]) => ({ x, z })); a.need = a.pts.length;
  }
  if (a.kind === 'mail') { a.stage = 0; a.left = mailStop(a.to).hours * 60; }
  T.jobs.active = a; syncJobProps(); saveGame();
  showToast(`${JOB_KINDS[a.kind].icon} Job taken: ${JOB_KINDS[a.kind].name}.`);
}
export function dropJob() {
  const T = town(), a = T.jobs.active; if (!a) return;
  const j = T.jobs.list.find(x => x.id === a.id); if (j) j.status = 'open';
  T.jobs.active = null; clearJobProps(); saveGame(); showToast('📋 Job dropped. You can take it again.');
}
export function finishJob(ok, msg) {
  const T = town(), a = T.jobs.active; if (!a) return;
  const j = T.jobs.list.find(x => x.id === a.id); if (j) j.status = ok ? 'done' : 'failed';
  T.jobs.active = null; clearJobProps();
  if (ok) {
    T.rep++; T.jobsDone++;
    if (a.kind === 'forage') T.herbs = Math.min(999, T.herbs + 5);
    if (a.kind === 'lantern') { T.litDay = (shared.state.dayCount || 0); }
    questEvent('job', { kind: a.kind });
    townPay(a.pay, a.xp, `${JOB_KINDS[a.kind].icon} Job done: +${shopMoney(a.pay)}, +${a.xp} XP, town reputation ${T.rep} (${repTitle(T.rep)}).`);
    sfx.playCatchFanfare(false);
  } else { saveGame(); showToast(msg || '📋 The job could not be finished in time.'); }
}
/* walk-over checks for the mail run (per frame) and the job clock (in-game minutes) */
let jobPropsSynced = false;
export function townJobTick() {
  if (!jobPropsSynced && world) { jobPropsSynced = true; syncJobProps(); }
  const a = activeJob(); if (!a) return;
  if (a.kind === 'mail') {
    if (a.stage === 0 && !shared.onBoat) { const p = postFront(); if (Math.hypot(shared.playerX - p.x, shared.playerZ - p.z) < 1.6) { a.stage = 1; saveGame(); showToast(`📦 Parcel collected. Take it to ${mailStop(a.to).name}.`); sfx.playTick(); } }
    else if (a.stage === 1) {
      const s = mailStop(a.to), p = s.at(), px = shared.onBoat ? boatPos.x : shared.playerX, pz = shared.onBoat ? boatPos.z : shared.playerZ;
      if (Math.hypot(px - p.x, pz - p.z) < s.r) finishJob(true);
    }
  }
  if (a.kind === 'lantern' && a.n < a.need && shared.state.timeOfDay >= 22 / 24 && shared.state.timeOfDay < 0.95 && a.stage === 1) finishJob(false, '🏮 22:00 came and some lanterns stayed dark.');
  if (a.kind === 'lantern' && shared.state.timeOfDay >= 18 / 24 && shared.state.timeOfDay < 22 / 24) a.stage = 1;
}
export function townClock(dMin) {
  const a = activeJob(); if (!a || dMin <= 0) return;
  if (a.kind === 'mail' && a.stage === 1) { a.left -= dMin; if (a.left <= 0) finishJob(false, '📦 Too late: the parcel had to arrive sooner.'); }
}
function townBlockedAny(x, z) { if (!townNav.cols) townNavInit(); if (Physics.on && PHYS.walk === 'rapier') return Physics.blocked(x, z, 0.35); return walkColliders.some(c => (c.kind === 'box' ? Math.abs(x - c.x) < c.hx + 0.35 && Math.abs(z - c.z) < c.hz + 0.35 : Math.hypot(x - c.x, z - c.z) < c.r + 0.35)); }
/* the pickups of a cleanup or foraging job */
export const jobProps = [];
export function clearJobProps() { jobProps.forEach(m => scene.remove(m)); jobProps.length = 0; }
