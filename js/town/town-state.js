/* Town state and validation, reputation titles and the day's random numbers. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { settings } from '../core/settings.js';
import { BOAT_TIERS, sfx } from '../data/equipment.js';
import { ZONES } from '../data/catalog.js';
import { BOAT_PAINTS, JOB_KIND_IDS, JOB_LANTERNS } from '../world/layout.js';
import { NPCS, SMOKE_MAX, cleanNote } from '../data/townsfolk.js';
import { RECIPE_BY_ID, cleanName } from '../data/recipes.js';
import { renderer } from '../render/renderer.js';
import { standFocus } from '../sim/runtime.js';
import { camOrbit } from '../sim/controls-state.js';
import { CATALOG_INDEX } from '../save/career.js';
import { camDrag, tapToWalk } from '../sim/tap-walk.js';
import { closeScope, scope } from './telescope-dice.js';
import { isAnyModalOpen } from '../utils.js';
import { shopBrowse } from '../shop/shop-kinds.js';
import { gamePause } from '../ui/pause.js';

/* =========================================================================
   HARBOUR TOWN LIFE (v6.3.0): town jobs (noticeboard and Post Office), the lookout telescope, dice at Sailors' Rest,
   crab traps in the tide pool, boat paint at Barnaby's Workshop, Talia's greenhouse and the Post Office counter.
   Everything is saved in state.town (sanitizeTown); places are SPOTS entries; walking routes use townPath.
   ========================================================================= */
export function defaultTown() { return { rep: 0, jobsDone: 0, jobs: { day: -1, list: [], active: null }, traps: [null, null, null], paint: {}, herbs: 0, dice: { played: 0, won: 0 }, scopeDay: -1, mapDay: -1, stamps: 0, lit: [], litDay: -1, watch: -1, met: {}, comm: null, commDay: -1, crave: { day: -1, done: [] },
  proj: { weather: false, smoke: false, slip: false }, smoke: { kg: 0, value: 0 }, wall: null, bosses: [], recs: {}, notes: [], chal: null, chalDone: 0 }; }
export function sanitizeTown(src) {
  const T = defaultTown(); if (!src || typeof src !== 'object') return T;
  const num = (v, lo, hi, d = lo) => { v = Number(v); return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d; };
  const int = (v, lo, hi) => Math.floor(num(v, lo, hi));
  T.rep = int(src.rep, 0, 1e5); T.jobsDone = int(src.jobsDone, 0, 1e6); T.herbs = int(src.herbs, 0, 999); T.stamps = int(src.stamps, 0, 6);
  T.scopeDay = int(src.scopeDay, -1, 1e6); T.mapDay = int(src.mapDay, -1, 1e6); T.litDay = int(src.litDay, -1, 1e6); T.watch = int(src.watch, -1, 1e6);
  T.lit = (Array.isArray(src.lit) ? src.lit : []).filter(i => Number.isInteger(i) && i >= 0 && i < JOB_LANTERNS.length).slice(0, JOB_LANTERNS.length);
  if (src.met && typeof src.met === 'object') Object.keys(NPCS).forEach(k => { const v = Math.floor(Number(src.met[k])); if (Number.isFinite(v)) T.met[k] = v; });
  T.commDay = int(src.commDay, -1, 1e6);
  if (src.comm && typeof src.comm === 'object') {
    if (src.comm.kind === 'species' && CATALOG_INDEX[src.comm.id]) T.comm = { kind: 'species', id: src.comm.id };
    else if (src.comm.kind === 'morph' && ['golden', 'albino', 'midnight'].includes(src.comm.form)) T.comm = { kind: 'morph', form: src.comm.form };
  }
  if (src.crave && typeof src.crave === 'object') {
    T.crave = { day: int(src.crave.day, -1, 1e6), done: (Array.isArray(src.crave.done) ? src.crave.done : []).filter(i => i === 0 || i === 1) };
    if (Array.isArray(src.crave.ids) && src.crave.ids.length === 2 && src.crave.ids.every(x => Array.isArray(x) && NPCS[x[0]] && RECIPE_BY_ID[x[1]])) T.crave.ids = src.crave.ids.map(x => [x[0], x[1]]);
  }
  if (src.proj && typeof src.proj === 'object') T.proj = { weather: !!src.proj.weather, smoke: !!src.proj.smoke, slip: !!src.proj.slip };
  if (src.smoke && typeof src.smoke === 'object') T.smoke = { kg: num(src.smoke.kg, 0, SMOKE_MAX), value: num(src.smoke.value, 0, 1e6) };
  const trophy = t => (t && typeof t === 'object' && CATALOG_INDEX[t.id] && CATALOG_INDEX[t.id].category === 'Fish' ? { id: t.id, w: num(t.w, 0.1, 5000), zone: int(t.zone, 1, ZONES.length), day: int(t.day, -1, 1e6), boss: !!t.boss } : null);
  T.wall = trophy(src.wall);
  T.bosses = (Array.isArray(src.bosses) ? src.bosses : []).map(trophy).filter(Boolean).slice(-10);
  if (src.recs && typeof src.recs === 'object') Object.keys(src.recs).forEach(id => { const t = trophy(Object.assign({}, src.recs[id], { id })); if (t) T.recs[id] = { w: t.w, zone: t.zone, day: t.day }; });
  T.notes = (Array.isArray(src.notes) ? src.notes : []).filter(n => n && typeof n === 'object').slice(-10).map(n => ({ m: cleanNote(n.m), from: cleanName(n.from) }));
  if (src.chal && typeof src.chal === 'object' && CATALOG_INDEX[src.chal.id]) T.chal = { id: src.chal.id, w: num(src.chal.w, 0.1, 5000), from: cleanName(src.chal.from) };
  T.chalDone = int(src.chalDone, 0, 1e5);
  if (src.dice && typeof src.dice === 'object') T.dice = { played: int(src.dice.played, 0, 1e6), won: int(src.dice.won, 0, 1e6) };
  T.traps = [0, 1, 2].map(i => { const t = Array.isArray(src.traps) ? src.traps[i] : null; return t && typeof t === 'object' ? { day: int(t.day, 0, 1e6) } : null; });
  if (src.paint && typeof src.paint === 'object') Object.keys(src.paint).forEach(k => {
    const tier = Number(k), p = src.paint[k]; if (!Number.isInteger(tier) || tier < 1 || tier >= BOAT_TIERS.length || !p || typeof p !== 'object') return;
    const c = v => (Number.isInteger(v) && v >= 0 && v < BOAT_PAINTS.length ? v : -1);
    T.paint[tier] = { hull: c(p.hull), trim: c(p.trim), flag: c(p.flag) };
  });
  const J = src.jobs;
  if (J && typeof J === 'object' && Array.isArray(J.list)) {
    T.jobs.day = int(J.day, -1, 1e6);
    T.jobs.list = J.list.filter(j => j && JOB_KIND_IDS.includes(j.kind)).slice(0, 3).map(j => sanitizeJob(j)).filter(Boolean);
    if (J.active && JOB_KIND_IDS.includes(J.active.kind)) T.jobs.active = sanitizeJob(J.active);
  }
  return T;
}
function sanitizeJob(j) {
  const num = (v, lo, hi) => { v = Number(v); return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : lo; };
  const out = { kind: j.kind, id: String(j.id || '').slice(0, 24), pay: Math.round(num(j.pay, 10, 500)), xp: Math.round(num(j.xp, 0, 200)), status: ['open', 'active', 'done', 'failed'].includes(j.status) ? j.status : 'open',
    stage: Math.floor(num(j.stage, 0, 5)), n: Math.floor(num(j.n, 0, 20)), need: Math.floor(num(j.need, 1, 20)), left: num(j.left, 0, 2000), to: typeof j.to === 'string' ? j.to.slice(0, 16) : '', variant: j.variant === 'shells' ? 'shells' : 'herbs' };
  out.pts = (Array.isArray(j.pts) ? j.pts : []).slice(0, 8).filter(p => p && Number.isFinite(p.x) && Number.isFinite(p.z)).map(p => ({ x: +p.x, z: +p.z }));
  return out;
}
export const town = () => shared.state.town || (shared.state.town = defaultTown());
const REP_TITLES = [[0, 'Newcomer'], [3, 'Familiar face'], [8, 'Helping hand'], [15, 'Local'], [25, 'Pillar of the town'], [40, 'Harbour hero']];
export const repTitle = r => REP_TITLES.filter(([n]) => r >= n).pop()[1];
export const PAINT_COST = 40;
/* daily pseudo-random numbers, the same all day */
export function dayRng(seed) { let a = (seed * 2654435761) >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export function init() {
  (function wireViewTouch() {
    const cv = renderer.domElement;
    cv.addEventListener('pointerdown', e => {
      if (camDrag.id !== null || isAnyModalOpen() || shopBrowse.active || gamePause.on) return;
      camDrag.id = e.pointerId; camDrag.x = camDrag.sx = e.clientX; camDrag.y = camDrag.sy = e.clientY; camDrag.t = performance.now(); camDrag.moved = false; camDrag.on = true;
    });
    cv.addEventListener('pointermove', e => {
      if (e.pointerId !== camDrag.id) return;
      const dx = e.clientX - camDrag.x; camDrag.x = e.clientX; camDrag.y = e.clientY;
      if (!camDrag.moved && Math.hypot(e.clientX - camDrag.sx, e.clientY - camDrag.sy) > 9) camDrag.moved = true;
      if (!camDrag.moved) return;
      if (scope.on) { scope.yaw -= dx * 0.0022; scope.auto = false; scope.idle = 0; return; }   // the telescope pans
      if (settings.firstPerson && !shared.onBoat) shared.playerYaw -= dx * 0.006;          // first person: look around
      else if (!shared.onBoat && !standFocus.stand) camOrbit.look = THREE.MathUtils.clamp(camOrbit.look - dx * 0.008, -Math.PI, Math.PI);   // third person: look around
    });
    const end = e => {
      if (e.pointerId !== camDrag.id) return;
      const tap = !camDrag.moved && performance.now() - camDrag.t < 350;
      camDrag.id = null; camDrag.on = false;
      if (tap) tapToWalk(e.clientX, e.clientY);
    };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    // the compass resets the camera to look out to sea
    const cmp = document.getElementById('hud-compass');
    if (cmp) { cmp.style.pointerEvents = 'auto'; cmp.addEventListener('click', () => { camOrbit.look = 0; sfx.playTick(); }); }
    // the telescope's buttons: hold to pan, Close to step back
    [['scope-left', 1], ['scope-right', -1]].forEach(([id, dir]) => {
      const b = document.getElementById(id); if (!b) return;
      b.addEventListener('pointerdown', e => { e.preventDefault(); scope.hold = dir; });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => b.addEventListener(ev, () => { scope.hold = 0; }));
    });
    const sc = document.getElementById('scope-close'); if (sc) sc.addEventListener('click', closeScope);
  })();
}
