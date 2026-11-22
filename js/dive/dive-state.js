/* Diving: the seabed shape, zones, air and light, and the dive state, fish and harpoon. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { settings } from '../core/settings.js';
import { CATCH_CATALOG, DIVE_GEAR, SPEAR_GUNS, ZONES } from '../data/catalog.js';
import { cheats } from '../sim/controls-state.js';
import { bookBonus } from '../town/books.js';
import { isFullMoonNight } from '../save/queries.js';
import { getZoneForDistance } from '../save/save-game.js';

export let dive;

/* =========================================================================
   SECTION N: DIVING, THE UNDERWATER WORLD & SPEARFISHING
   N1 terrain + rules (pure functions) · N2 fish + harpoon logic · N3 visuals · N4 dive loop & UI
   ========================================================================= */

/* ---- N1: seabed shape, depth, zones ---- */
const SEABED_TABLE = [[0, 2.2], [12, 5.5], [100, 10], [300, 19], [650, 34], [1500, 58], [3000, 88]];
function seabedBase(d) {
  for (let i = 1; i < SEABED_TABLE.length; i++) {
    if (d <= SEABED_TABLE[i][0]) {
      const a = SEABED_TABLE[i - 1], b = SEABED_TABLE[i];
      const t = (d - a[0]) / (b[0] - a[0]);
      return a[1] + (b[1] - a[1]) * t * t * (3 - 2 * t);
    }
  }
  return SEABED_TABLE[SEABED_TABLE.length - 1][1];
}
export function seabedNoise(x, z) {
  return Math.sin(x * 0.09 + Math.sin(z * 0.07) * 2.0) * 0.5 + Math.sin(z * 0.13 - x * 0.05) * 0.35 + Math.sin((x + z) * 0.31) * 0.15;
}
/* height of the sea floor (negative metres below the surface) at a world position */
export function seabedY(x, z) {
  const d = Math.max(0, -z - 2.5);
  const base = seabedBase(d);
  return -(base + seabedNoise(x, z) * (base * 0.11 + 0.3));
}
export function diveZoneAt(z) { return getZoneForDistance(Math.max(0, Math.round(-z - 12))); }
export function hash2(a, b) {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
export const wrapAngle = a => Math.atan2(Math.sin(a), Math.cos(a));
/* air consumption: 1 s of air per second at the surface, +10 % per metre-tenth of depth (pressure) */
export const diveAirRate = depth => 1 + Math.max(0, depth) / 10;
/* light left at a depth: the sea swallows it (used for fog, lamp and sun shafts) */
export const diveLightAt = depth => Math.exp(-Math.max(0, depth) * 0.052);
export const diveInput = { up: false, down: false };
export const harpoon = {
  state: 'ready',            // ready | flying | return
  pos: new THREE.Vector3(), prev: new THREE.Vector3(), vel: new THREE.Vector3(),
  travelled: 0, reloadT: 0, hit: null, muzzle: new THREE.Vector3(), power: 0
};
export const diveFish = [];
export const diveChests = [];
export const bagWeight = () => dive.bag.reduce((s, e) => s + e.weight, 0);
export const diveGear = () => DIVE_GEAR[shared.state.diveTier] || DIVE_GEAR[0];
export const spearGun = () => SPEAR_GUNS[shared.state.spearTier] || SPEAR_GUNS[0];
export const bagCapacity = () => (cheats.bigBag ? 99999 : diveGear().bagKg);
export const DIVE_FISH_TARGET = () => (settings.quality === 'low' ? 11 : 17);

/* which fish live where: the normal catalogue, fish only, with the usual rarity odds (and the luck cheat) */
export function pickDiveFishItem(zoneId, forceRarity) {
  const fullMoon = isFullMoonNight();
  const storm = shared.state.weather === 'STORM';
  let pool = CATCH_CATALOG.filter(c => c.category === 'Fish' && c.zones.includes(zoneId) && (!c.fullMoonOnly || fullMoon) && (!c.stormOnly || storm));
  if (forceRarity) { const fr = pool.filter(c => forceRarity.includes(c.rarity)); if (fr.length) pool = fr; }
  if (!pool.length) pool = CATCH_CATALOG.filter(c => c.category === 'Fish' && !c.fullMoonOnly && !c.stormOnly);
  const luck = cheats.luck ? 5 : 1, rb = bookBonus('diveRare');
  const wts = pool.map(it => {
    let w = 10;
    if (it.rarity === 'Common') w = 14;
    else if (it.rarity === 'Uncommon') w = 9 * (1 + rb * 1.5);
    else if (it.rarity === 'Rare') w = 5 * luck * (1 + rb * 2.2);
    else if (it.rarity === 'Epic') w = 2.5 * luck * (1 + rb * 3.0);
    else if (it.rarity === 'Legendary') w = 1.2 * luck * (1 + rb * 3.5);
    return w;
  });
  let roll = Math.random() * wts.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { roll -= wts[i]; if (roll <= 0) return pool[i]; }
  return pool[0];
}
export function rollDiveFishStats(item, zone) {
  const weight = +Math.max(0.1, item.minW + (item.maxW - item.minW) * Math.pow(Math.random(), 1.4)).toFixed(2);
  const ratio = weight / ((item.minW + item.maxW) * 0.5);
  const value = Math.max(1, Math.round(item.value * (0.85 + ratio * 0.25)));
  const len = THREE.MathUtils.clamp(0.38 + Math.cbrt(weight) * 0.45, 0.4, 6);
  return {
    item, weight, value, zoneObj: zone, len,
    radius: Math.max(0.24, len * 0.26),
    speed: Math.min(3.2, 0.7 + len * 0.38),
    skit: item.rarity === 'Legendary' || item.rarity === 'Epic' ? 0 : 3 + len * 1.3,
    curious: item.rarity === 'Epic' || item.rarity === 'Legendary',
    depthPref: item.rarity === 'Legendary' ? Math.random() * 0.35 : item.rarity === 'Epic' ? Math.random() * 0.5 : item.rarity === 'Rare' ? 0.1 + Math.random() * 0.6 : 0.3 + Math.random() * 0.7
  };
}
/* the swim target of a fish: depthPref 0 = hugging the sea floor, 1 = just under the surface */
export function waypointY(f, x, z) {
  const floor = seabedY(x, z) + f.radius + 0.5, top = -(f.radius + 1.0);
  if (floor >= top) return top;
  return floor + (top - floor) * THREE.MathUtils.clamp(f.depthPref + (Math.random() - 0.5) * 0.35, 0, 1);
}

export function init() {
  /* ---- N2: the dive state, fish and harpoon ---- */
  dive = {
    active: false, fromBoat: false, startX: 0, startZ: 0,
    pos: new THREE.Vector3(), yaw: 0, pitch: 0, vy: 0, vf: 0,
    air: 0, airMax: 0, bag: [], t: 0, surfacing: false, emergency: false,
    zone: ZONES[0], warned25: false, warned10: false, airBeep: 0, bubbleT: 2, whaleT: 40, sonarT: 12,
    depthWarnT: 0, lastLockMsg: 0, chestT: 20, hudT: 0
  };
}
