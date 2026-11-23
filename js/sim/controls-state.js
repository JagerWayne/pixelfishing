/* Rest spots and benches, walking numbers, the fishing and fight state, weather, keys and the stick state. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { BW_HALF, EXTRA_BENCHES, SEA_DECK, PIER_HW, PIER_WALK, RECYCLE, SHORE_SHOPS, TOWN } from '../world/layout.js';

export let CHEAT_GULL, joyEl, knobEl, primaryBtn;
let BENCH_SEATS;

/* ---- rest spots: bench seats and railing stretches (see findRestSpot) ---- */
export const restState = { idle: 0, spot: null, last: null, w: 0 };
/* the bench seat in front of you (r: how close, scaled along the bench's depth) */
export function benchSeatNear(px, pz, r = 0.62) {
  let best = null, bd = r;
  BENCH_SEATS.forEach(s => { const fz = s.fz || 4.8, d = Math.hypot(px - s.x, (pz - fz) * 1.6); if (pz > fz - 0.5 && pz < fz + 0.7 && d < bd) { bd = d; best = s; } });
  return best;
}
export function findRestSpot(px, pz) {
  // bench: in front of one of the two benches at the back of the boardwalk
  { const best = benchSeatNear(px, pz); if (best) return best; }
  // pier sides: along the walking limit, away from the stairs, bucket, toolbox, bollards, rod rack and lamp posts
  if (Math.abs(px) > PIER_WALK - 0.15 && pz < -0.3 && pz > -10.9) {
    const side = px > 0 ? 1 : -1;
    const blocked = [[-7.6, 0.95], [-9.6, 0.55], [-2.2, 0.35], [-8.0, 0.35]].some(([z, r]) => Math.abs(pz - z) < r)
      || (side < 0 && ((pz < -4.4 && pz > -6.8) || (pz < -8.5 && pz > -9.65)));
    if (!blocked) return { kind: 'rail', x: side * (PIER_WALK + 0.12), z: pz, yaw: -side * Math.PI / 2, railX: side * PIER_HW, railZ: null, side };
  }
  // boardwalk sea-edge rail, between the stands
  if (pz < 0.62 && Math.abs(px) > PIER_HW + 0.15 && Math.abs(px) < BW_HALF - 0.6) {
    const busy = [[-9.55, -5.5], [-5.4, -3.0], [RECYCLE.x - RECYCLE.w / 2 - 0.2, RECYCLE.x + RECYCLE.w / 2 + 0.2], [SEA_DECK.x - SEA_DECK.w / 2 - 0.2, SEA_DECK.x + SEA_DECK.w / 2 + 0.2]].some(([a, b]) => px > a && px < b)
      || Object.values(SHORE_SHOPS).some(sh => Math.abs(px - sh.x) < sh.w / 2 + sh.extra / 2 + 0.4);
    if (!busy) return { kind: 'rail', x: px, z: 0.33, yaw: 0, railX: null, railZ: 0.12, side: 0 };
  }
  return null;
}
export const WALK_SPEED = 4.2;
/* Movement (v6.0): the stick is camera-relative, the angler speeds up and slows down smoothly, a light push walks
   and a full push (or Shift) runs; a tap on the ground walks there by itself; dragging on the screen orbits the camera. */
export const MOVE = { walk: 2.4, run: 3.8, auto: 2.8, back: 0.6, turn: 2.4, uturn: 8, runAt: 0.9, accel: 10, brake: 14 };
export const revTurn = { on: false, yaw: 0 };
export const walkVel = { x: 0, z: 0 };
export const _phMove = { x: 0, z: 0 };
export const camOrbit = { yaw: 0, look: 0, steerT: 0 };
shared.autoWalk = null;
shared.anglerPrevMode = 'PIER_IDLE';
      shared.anglerPrevOnBoat = false;
      shared.anglerCrank = 0;
export let bobberPos = new THREE.Vector3();
export let bobberVel = new THREE.Vector3();
shared.bobberInWater = false;
// Session-only cheat toggles (unlocked through the secret seagull menu)
export const cheats = { fastBites: false, noSnap: false, luck: false, freeBait: false, freeFuel: false, infAir: false, noDepth: false, autoHit: false, fastReload: false, bigBag: false };
shared.cheatTaps = 0;
export const CHEAT_TAPS = 31;
shared.waitTimer = 0;
shared.biteTimer = 0;
shared.activeCatch = null;
shared.tension = 0.32;
shared.fightFed = false;
      shared.fightJig = false;
shared.reelProgress = 0;
shared.initialLineDist = 14;
shared.underpoweredTimer = 0;
shared.fishPullPhase = 0;
shared.fishSwimDir = 0;
shared.fishDirTimer = 0;
shared.fishLateralPos = 0;
shared.rodPullAngle = 0;

shared.rescueTimer = 0;
export let rescueStartPos = new THREE.Vector3();
shared.rescueFeePaid = 0;

shared.weatherTimer = 95;
shared.pendingWeather = null;
/* each day has an outlook (from the day number) that weights the weather; the Weather Station forecasts it (v6.6.0) */
const OUTLOOKS = [{ id: 'fair', icon: '☀️', name: 'Fair', w: [0.6, 0.28, 0.1, 0.02] }, { id: 'changeable', icon: '⛅', name: 'Changeable', w: [0.45, 0.27, 0.18, 0.10] }, { id: 'stormy', icon: '⛈️', name: 'Stormy', w: [0.2, 0.25, 0.25, 0.3] }];
export function dayOutlook(d) { let a = ((d * 17 + 9) * 2654435761) >>> 0; a = Math.imul(a ^ (a >>> 15), 2246822507) >>> 0; const r = (a % 1000) / 1000; return r < 0.4 ? OUTLOOKS[0] : r < 0.82 ? OUTLOOKS[1] : OUTLOOKS[2]; }
export function rollWeather() {
  const w = dayOutlook(shared.state.dayCount || 0).w, roll = Math.random();
  return roll < w[0] ? 'CLEAR' : roll < w[0] + w[1] ? 'OVERCAST' : roll < w[0] + w[1] + w[2] ? 'RAIN' : 'STORM';
}
shared.lightningFlash = 0;
shared.nextLightningTimer = 7;

export const keys = {};
shared.isHoldingAction = false;
shared.actionKey = null;
shared.actionPointerId = null;

export const joyState = {
  active: false,
  pointerId: null,
  x: 0,
  y: 0
};

export function init() {
  BENCH_SEATS = [-4.6, 4.6].flatMap(cx => [cx - 0.4, cx + 0.4]).map(x => ({ kind: 'bench', x, z: 5.27, yaw: 0, seatH: 0.53 }));
  // the Lookout Pavilion's bench (v6.3.0): fz is where you stand in front of it
  BENCH_SEATS.push(...[-0.4, 0.4].map(dx => ({ kind: 'bench', x: TOWN.lookoutBench.x + dx, z: TOWN.lookoutBench.z + 0.02, yaw: 0, seatH: 0.59, fz: TOWN.lookoutBench.z - 0.45 })));
  EXTRA_BENCHES.forEach(b => BENCH_SEATS.push(...[-0.4, 0.4].map(dx => ({ kind: 'bench', x: b.x + dx, z: b.z + 0.02, yaw: 0, seatH: 0.53, fz: b.z - 0.45 }))));
  CHEAT_GULL = { x: -(BW_HALF - 0.1), z: 0.12, radius: 2.7 };

  joyEl = document.getElementById('virtual-joystick');
  knobEl = document.getElementById('joystick-knob');
  primaryBtn = document.getElementById('btn-primary-action');
}
