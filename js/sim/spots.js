/* Stand cameras, interaction spots (shops, bunk, bench), the day change and the dock checks. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { BOAT_TERMINAL, CABIN, DOCK_PUMP, MOOR, PIER_TOOLBOX_X, RECYCLE, SHORE_SHOPS, shopFrontZ } from '../world/layout.js';
import { fuelPrice } from '../data/townsfolk.js';
import { camera } from '../render/renderer.js';
import { world } from '../render/lights.js';
import { benchSeatNear, restState, walkVel } from './controls-state.js';
import { releaseAllInputs } from './joystick.js';
import { aquaTankOf, aquariumDay } from '../town/aquarium.js';
import { BOOKS } from '../town/books.js';
import { readPages, selectedBook, stopReading } from '../town/reading.js';
import { getMoonPhase } from '../save/queries.js';
import { _standLook, _standPos, aquaPan, nearSpot, nearStandFront, saveGame } from '../save/save-game.js';
import { showToast } from '../ui/toasts.js';
import { npcSnap } from '../town/npcs.js';
import { updateRestaurant } from '../town/cooking.js';
import { ensureJobs, townClock } from '../town/town-jobs.js';
import { openBunk } from '../town/trophy-wall.js';
import { openCustomize } from '../ui/customise.js';
import { openBooksModal } from '../shop/books-aquarium.js';
import { updateHUD } from '../ui/hud.js';

export let BED;

export function standCameraPose(st) {
  const tv = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
  const th = tv * camera.aspect;
  if (st.pan) {
    const t = aquaTankOf(shared.state.aquarium || {}), tw = t.w, halfH = (t.h + 0.75) / 2, cy = CABIN.floor + 0.91 + t.h / 2 + 0.12;
    const dist = THREE.MathUtils.clamp(halfH / tv * 1.12 + 0.45, 2.2, 3.4);
    const visHalf = th * (dist - 0.45), span = Math.max(0, tw / 2 + 0.12 - visHalf);
    const x = st.cx + span * Math.cos(aquaPan.phase);
    _standLook.set(x, cy, st.cz);
    _standPos.set(x, cy + 0.15, st.cz + dist);
    return;
  }
  const dist = THREE.MathUtils.clamp(Math.max(st.halfH / tv, st.halfW / th) * (st.pad || 1.2) + (st.add != null ? st.add : 0.8), st.minDist || 3.4, 12);
  const yaw = (st.yaw || 0.68) * st.side, pitch = 0.24;
  _standLook.set(st.cx, st.cy, st.cz);
  // dir: the way the front faces (default +Z); the camera swings sideways along the facade by yaw
  const [fx, fz] = st.dir || [0, 1], tx = Math.abs(fz), tz = Math.abs(fx);
  _standPos.set(
    st.cx + (tx * Math.sin(yaw) + fx * Math.cos(yaw)) * Math.cos(pitch) * dist,
    st.cy + Math.sin(pitch) * dist,
    st.cz + (tz * Math.sin(yaw) + fz * Math.cos(yaw)) * Math.cos(pitch) * dist
  );
}

export function isNearPierShop() { return nearStandFront(-7.6, 2.05, 2.55, 1.0); }
/* in front of a boardwalk shop (fronts face south, +Z) */
export function nearShoreShop(sh) { const fz = shopFrontZ(sh); return !shared.onBoat && shared.mode === 'PIER_IDLE' && Math.abs(shared.playerX - sh.x) <= sh.w / 2 + 0.35 && shared.playerZ >= fz - 0.1 && shared.playerZ <= fz + 1.35; }
export function shoreShopHere() { for (const k in SHORE_SHOPS) if (nearShoreShop(SHORE_SHOPS[k])) return k; return null; }
export function isNearPierBounty() { return nearStandFront(-4.2, 1.3, 1.65, 1.0); }
export function isNearPierGallery() { return nearStandFront(CABIN.galleryX, 1.6, CABIN.z + 1.75, 1.0); }
export function isNearRecycle() { return nearStandFront(RECYCLE.x, RECYCLE.w / 2 + 0.2, RECYCLE.frontZ, 1.0); }
export function isNearAquarium() { return nearStandFront(CABIN.aquaX, Math.min(2.2, aquaTankOf(shared.state.aquarium || {}).w / 2 + 0.15), CABIN.z + 1.0, 1.1); }

/* ---- interaction spots (v6.2.0): places the action button can use, checked after TALK and the kitchen.
   Each entry: icon, label, cls (button style), color [border, text], near(), prox() (banner text), press(), optional useless(). ---- */
export const SPOTS = [];
export function spotNear() { if (shared.onBoat || shared.mode !== 'PIER_IDLE') return null; return SPOTS.find(sp => sp.near()) || null; }
export function spotLabel(sp) { return typeof sp.label === 'function' ? sp.label() : sp.label; }

/* a new day: the day count, the aquarium's daily care and a save (the market, moon and weather follow the day number) */
export function dayRollover(quiet) {
  shared.state.dayCount = (shared.state.dayCount || 0) + 1;
  aquariumDay(); ensureJobs();
  saveGame();
  if (!quiet) { const newMoon = getMoonPhase(); showToast(`🌅 Day ${shared.state.dayCount + 1} • Tonight: ${newMoon.icon} ${newMoon.name}`); }
}
export const sleepState = { on: false };
export const bedTime = () => shared.state.timeOfDay >= BED.from || shared.state.timeOfDay < BED.wake - 0.02;
export function sleepTillMorning() {
  if (sleepState.on) return;
  if (!bedTime()) { showToast('🛏️ Too early to sleep. Turn in after 18:00.'); return; }
  const skip = Math.round(((BED.wake - shared.state.timeOfDay + 1) % 1) * 1440);
  sleepState.on = true; stopReading(); releaseAllInputs();
  const fade = document.getElementById('sleep-fade'); fade.textContent = '💤'; fade.classList.add('on');
  setTimeout(() => {
    let left = skip;   // let the clock run in 10-minute steps so the restaurant and the day change behave as if awake
    while (left > 0) {
      const m = Math.min(10, left); left -= m;
      shared.state.timeOfDay += m / 1440;
      if (shared.state.timeOfDay >= 1) { shared.state.timeOfDay -= 1; dayRollover(true); }
      updateRestaurant(m); townClock(m);
    }
    shared.state.timeOfDay = BED.wake;
    shared.weatherTimer = 0;   // the morning brings its own weather
    const id = selectedBook(), pages = readPages(id, BED.pages);
    npcSnap();
    saveGame(); updateHUD();
    setTimeout(() => {
      fade.classList.remove('on'); sleepState.on = false;
      const moon = getMoonPhase();
      showToast(`🌅 Good morning! Day ${shared.state.dayCount + 1}, 06:00 • Tonight: ${moon.icon} ${moon.name}` + (pages > 0.01 ? ` • Read ${Math.round(pages)} pages of ${BOOKS[id].title}` : ''));
    }, 700);
  }, 950);
}
/* v6.8.0: SIT at any bench (standing still for two seconds still sits you down too) */
export const SIT_SPOT = { id: 'sit', icon: '🪑', label: 'SIT', cls: 'shop', color: ['#a78bfa', '#ddd6fe'],
  near: () => !restState.spot && !!benchSeatNear(shared.playerX, shared.playerZ, 1.15), prox: () => '🪑 BENCH • SIT DOWN TO REST OR READ',
  press: () => { const sp = benchSeatNear(shared.playerX, shared.playerZ, 1.15); if (!sp) return; walkVel.x = walkVel.z = 0; restState.spot = sp; restState.idle = 2; sfx.playTick(); } };
export function isNearPierBucket() { const c = world.bucketCollider; return nearSpot(c.x, c.z, Math.max(1.25, Math.max(c.hx, c.hz) + 0.75)); }
export function isNearPierToolbox() { return nearSpot(PIER_TOOLBOX_X, -7.6, 1.25); }
export function isNearMooredBoat() { return nearSpot(MOOR.boardX, -5.6, 1.4) && !isNearBoatTerminal(); }
const dockDist = s => Math.hypot(shared.playerX - s.useX, shared.playerZ - s.useZ);
export function isNearBoatTerminal() { return nearSpot(BOAT_TERMINAL.useX, BOAT_TERMINAL.useZ, 0.72) && dockDist(BOAT_TERMINAL) <= dockDist(DOCK_PUMP); }
export function isNearDockPump() { return nearSpot(DOCK_PUMP.useX, DOCK_PUMP.useZ, 0.72) && dockDist(DOCK_PUMP) < dockDist(BOAT_TERMINAL); }
/* the dock pump fills the moored boat's tank ($0.50 a unit, as much as you can afford) */
/* pay for up to `missing` units of fuel (as many as the cash allows); null when not even one is affordable */
export function buyFuel(missing) {
  const units = Math.min(missing, Math.floor(shared.state.cash / fuelPrice())); if (units <= 0) return null;
  const cost = +(units * fuelPrice()).toFixed(2);
  shared.state.cash = +(shared.state.cash - cost).toFixed(2); shared.state.fuel = +(shared.state.fuel + units).toFixed(1);
  return { units, cost };
}

export function init() {
  /* ---- the cabin bunk: turn in for the night (from 18:00), wake at 06:00 having read 30 pages ---- */
  BED = { x: CABIN.x + CABIN.w / 2 - 0.62, z: CABIN.z + 2.55, from: 0.75, wake: 0.25, pages: 30 };
  SPOTS.push({ id: 'bed', icon: '🛏️', label: 'SLEEP', cls: 'shop', color: ['#818cf8', '#c7d2fe'],
    near: () => shared.playerX > BED.x - 1.7 && shared.playerX < BED.x - 0.35 && shared.playerZ > BED.z - 0.6 && shared.playerZ < BED.z + 0.95,
    prox: () => (bedTime() ? `🛏️ BUNK • SLEEP UNTIL 06:00${selectedBook() ? ' AND READ ' + BED.pages + ' PAGES' : ''}` : '🛏️ BUNK • TROPHY WALL • SLEEP AFTER 18:00'),
    press: () => openBunk() });
  /* v12.2.0: the wardrobe (bedroom) opens Customise, the bookshelf (living room) your skill books */
  SPOTS.push({ id: 'wardrobe', icon: '👕', label: 'WARDROBE', cls: 'shop', color: ['#f472b6', '#fbcfe8'],
    near: () => Math.abs(shared.playerX - CABIN.wardrobe.x) < 0.75 && shared.playerZ > CABIN.wardrobe.z + 0.35 && shared.playerZ < CABIN.wardrobe.z + 1.35,
    prox: () => '👕 WARDROBE • CHANGE YOUR LOOK', press: () => openCustomize() });
  SPOTS.push({ id: 'bookshelf', icon: '📚', label: 'BOOKS', cls: 'shop', color: ['#fbbf24', '#fde68a'],
    near: () => shared.playerX > CABIN.shelf.x + 0.2 && shared.playerX < CABIN.shelf.x + 1.3 && Math.abs(shared.playerZ - CABIN.shelf.z) < 0.6,
    prox: () => '📚 BOOKSHELF • YOUR SKILL BOOKS', press: () => openBooksModal() });
}
