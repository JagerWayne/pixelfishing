/* Loading and saving the game, item icons, zone and distance queries, and the stand views. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { BAIT_TIERS, BOAT_TIERS, BUCKET_TIERS, ROD_TIERS } from '../data/equipment.js';
import { CATCH_CATALOG, ZONES } from '../data/catalog.js';
import { PixelTextureFactory } from '../render/texture-factory.js';
import { CABIN, RECYCLE, SHORE_SHOPS, TOWN, doorOf } from '../world/layout.js';
import { boatPos } from '../sim/runtime.js';
import { SAVE_KEY } from '../fishing/bounties.js';
import { applyAnglerGender, defaultSaveState } from './defaults.js';
import { SAVE_BACKUP_KEY } from './queries.js';
import { sanitizeSave } from './sanitize.js';
import { isNearAquarium, isNearPierBounty, isNearPierGallery, isNearPierShop, isNearRecycle, nearShoreShop } from '../sim/spots.js';
import { isNearResto } from '../town/resto-sheet.js';

export let STAND_VIEWS;

// Was there a saved game when the page opened? (the game writes its own save right after loading, so ask first)
shared.hadSavedGame = false;
function loadSaveState() {
  let text = null;
  try { text = localStorage.getItem(SAVE_KEY); } catch {}
  shared.hadSavedGame = !!text;
  if (!text) return defaultSaveState();
  try {
    return sanitizeSave(JSON.parse(text));
  } catch {
    // Unreadable save: keep the raw text so progress isn't silently destroyed, then start fresh.
    try { localStorage.setItem(SAVE_BACKUP_KEY, text); } catch {}
    return defaultSaveState();
  }
}

export function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(shared.state));
  } catch {}
}

export const ITEM_ICONS = {};

export function getDistanceMeters() {
  if (!shared.onBoat) return 0;
  return Math.max(0, Math.round(Math.max(0, -boatPos.z - 12)));
}

export function getZoneForDistance(dist) {
  for (const z of ZONES) { if (dist >= z.minM && dist < z.maxM) return z; }
  return ZONES[ZONES.length - 1];
}

export function getCurrentZone() {
  const dist = getDistanceMeters();
  for (const z of ZONES) {
    if (dist >= z.minM && dist < z.maxM) return z;
  }
  return ZONES[ZONES.length - 1];
}

export function getBucketWeight() {
  return shared.state.bucket.reduce((sum, item) => sum + item.weight, 0);
}

export function getBucketCapacity() {
  return BUCKET_TIERS[shared.state.bucketTier - 1].capacity;
}

export function getCurrentBoat() {
  return BOAT_TIERS[shared.state.boatTier];
}

export function getCurrentRod() {
  return ROD_TIERS[shared.state.rodTier - 1];
}

export function getCurrentBait() {
  return BAIT_TIERS[shared.state.baitTier - 1];
}

export function estimateReturnFuelNeeded() {
  if (!shared.onBoat || shared.state.boatTier === 0) return 0;
  const dist = getDistanceMeters();
  if (dist <= 15) return 0;
  return +(dist * getCurrentBoat().burnRate).toFixed(1);
}

// A stand reacts only when you are right in front of it: within `reach` metres of the front edge of its solid
// box (the closest you can walk) and not beyond its sides. The other spots use small circles around the object.
export function nearStandFront(sx, halfWidth, frontZ, reach) {
  return !shared.onBoat && shared.mode === 'PIER_IDLE' && Math.abs(shared.playerX - sx) <= halfWidth && shared.playerZ >= frontZ - 0.05 && shared.playerZ <= frontZ + reach;
}
export function nearSpot(x, z, radius) {
  return !shared.onBoat && shared.mode === 'PIER_IDLE' && Math.hypot(shared.playerX - x, shared.playerZ - z) <= radius;
}
export function currentStandView() {
  for (const st of STAND_VIEWS) if (st.focus && st.near()) return st;   // v6.6.2: only the bounty board and the aquarium zoom in; shops just frame themselves under their sheet
  return null;
}
export const _standPos = new THREE.Vector3(), _standLook = new THREE.Vector3();
/* the aquarium view: straight in front of the glass; when the tank is wider than the screen the view sweeps
   slowly from its right end to its left end and back (aquaPan.phase advances with dt in the stand-focus code) */
export const aquaPan = { phase: 0 };

export function init() {
  shared.state = loadSaveState();
  applyAnglerGender(shared.state.anglerGender || 'male', false);
  CATCH_CATALOG.forEach(item => {
    ITEM_ICONS[item.id] = PixelTextureFactory.generateItemIcon(item);
  });

  /* Stands that auto-zoom the camera. cx/cy/cz = centre of the display, halfW/halfH = half size that must fit on
     screen, side = which side the camera swings to (+1 = towards +X) so the player never blocks the view. */
  STAND_VIEWS = [
    { id: 'shop',    near: () => isNearPierShop(),     cx: -7.6, cy: 3.0, cz: 1.0, halfW: 1.55, halfH: 1.4, side: 1 },
    { id: 'bounty',  focus: true, near: () => isNearPierBounty(),   cx: -4.2, cy: 2.75, cz: 0.9, halfW: 0.74, halfH: 0.58, minDist: 2.0, pad: 1.05, add: 0.25, yaw: 0.3, side: 1 },
    { id: 'gallery', near: () => isNearPierGallery(),  cx: CABIN.galleryX, cy: 3.0, cz: 0.8, halfW: 1.45, halfH: 1.4, side: 1 },
    { id: 'aquarium', focus: true, near: () => isNearAquarium(),     cx: CABIN.aquaX,    cy: 1.56 + 1.45, cz: 0.5, halfW: 0.9, halfH: 0.82, side: 1, pan: true },
    { id: 'resto',   near: () => isNearResto(),       cx: doorOf(TOWN.resto, 0).x, cy: 1.5 + 1.7, cz: doorOf(TOWN.resto, 0).z, halfW: 2.8, halfH: 1.6, side: 1, dir: [TOWN.resto.fx, TOWN.resto.fz] },
    { id: 'recycle', near: () => isNearRecycle(),      cx: RECYCLE.x,      cy: 2.5, cz: 0.8, halfW: RECYCLE.w / 2 + 0.3, halfH: 1.6, side: -1 },
    ...Object.entries(SHORE_SHOPS).map(([k, sh]) => ({ id: k, near: () => nearShoreShop(sh), cx: sh.x, cy: 1.56 + 1.75 * sh.s, cz: sh.z + sh.d / 2, halfW: sh.w / 2 + 0.5, halfH: 1.55 * sh.s + 0.1, side: sh.x < 0 ? 1 : -1 }))
  ];
}
