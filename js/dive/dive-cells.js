/* Diving: prop cells, vents, overhangs and lurkers. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { CATCH_CATALOG } from '../data/catalog.js';
import { rarityAtLeast } from '../data/townsfolk.js';
import { showToast } from '../ui/toasts.js';
import { dive, diveChests, diveZoneAt, hash2, seabedY } from './dive-state.js';
import { CELL, addDiveSolid, addSolidFromObject, addWreckSolids, diveOpened, diveRoot, diveSolids, lurkDone, propCells,
  swayList, ventList } from './dive-seabed.js';
import { buildChest, buildProp, buildWreck } from './dive-props.js';
import { spawnDiveFish } from './dive-fish.js';

function pickPropKind(depth, zoneId, roll) {
  if (depth < 14) {
    if (roll < 0.28) return 'kelp';
    if (roll < 0.28 + (zoneId === 2 ? 0.34 : 0.14)) return 'coral';
    if (roll < 0.78) return 'grass';
    return 'rock';
  }
  if (depth < 40) return roll < 0.4 ? 'rock' : roll < 0.62 ? 'coral' : roll < 0.74 ? 'kelp' : 'tube';
  return roll < 0.5 ? 'rock' : roll < 0.8 ? 'orb' : 'tube';
}
export function makeCell(i, j) {
  const key = i + ',' + j;
  const parts = [];
  const px = (i + 0.15 + hash2(i, j) * 0.7) * CELL, pz = (j + 0.15 + hash2(j, i + 91) * 0.7) * CELL;
  const place = (obj, x, z, extraY = 0) => {
    if (z > -4.2) return;
    const y = seabedY(x, z);
    obj.position.set(x, y + extraY, z);
    obj.rotation.y = obj.rotation.y || hash2(i * 3, j * 7) * 6.28;
    diveRoot.add(obj); parts.push(obj);
  };
  const roll = hash2(i * 3 + 11, j * 5 + 17);
  if (roll < 0.55 && pz < -4.2) {
    const depth = -seabedY(px, pz);
    const zoneId = diveZoneAt(pz).id;
    const kind = pickPropKind(depth, zoneId, roll / 0.55);
    const p = buildProp(kind, hash2(i, j + 5), depth);
    p.rotation.y = hash2(i + 9, j) * 6.28;
    place(p, px, pz, -0.05);
    if (kind === 'rock') addSolidFromObject(key, p, 0.8); else if (kind === 'coral') addSolidFromObject(key, p, 0.7);
    if (p.userData.sway || p.userData.pulse) swayList.push(p);
  }
  // v6.5.0: thermal vents (rising bubbles: lift and +15% air) and reef overhangs (shy, valuable lurkers) from the Coastal Reef out
  {
    const vx = (i + 0.5) * CELL, vz = (j + 0.5) * CELL, hv = hash2(i + 313, j - 41);
    if (vz < -24 && diveZoneAt(vz).id >= 2 && hv < 0.05) { const v = buildVent(); v.rotation.y = 0.001; place(v, vx, vz); ventList.push(v); addDiveSolid(key, v.position.x, v.position.z, 0.7, v.position.y - 0.2, v.position.y + 0.7); }
    else if (vz < -24 && diveZoneAt(vz).id >= 2 && hv > 0.955) {
      const o = buildOverhang(); o.rotation.y = 0.001; place(o, vx, vz);
      const y = o.position.y; [-1.3, 1.3].forEach(dx => addDiveSolid(key, vx + dx, vz, 0.55, y - 0.2, y + 2.0)); addDiveSolid(key, vx, vz, 1.7, y + 1.85, y + 2.5);
      if (!lurkDone.has(key)) { lurkDone.add(key); spawnLurkers(diveZoneAt(vz), vx, vz); }
    }
  }
  const cx = (i + 0.2 + hash2(i + 71, j - 3) * 0.6) * CELL, cz = (j + 0.2 + hash2(i - 5, j + 71) * 0.6) * CELL;
  if (cz < -8 && hash2(i + 501, j - 77) < 0.045 && !diveOpened.has(key)) {
    const c = buildChest(); c.userData.key = key; c.rotation.y = hash2(i, j * 3) * 6.28;
    place(c, cx, cz);
    addDiveSolid(key, c.position.x, c.position.z, 0.55, c.position.y - 0.1, c.position.y + 0.55);
    diveChests.push(c);
  } else if (cz < -20 && -seabedY(cx, cz) > 5 && hash2(i - 33, j + 909) < 0.012) {
    { const wk = buildWreck(); place(wk, cx, cz, -0.3); addWreckSolids(key, wk); }
    const c = buildChest(); c.userData.key = key + 'w'; c.rotation.y = 1.4;
    if (!diveOpened.has(key + 'w')) { place(c, cx + 3.5, cz + 2.5); addDiveSolid(key, c.position.x, c.position.z, 0.55, c.position.y - 0.1, c.position.y + 0.55); diveChests.push(c); }
  }
  propCells.set(key, parts);
}
export function dropCell(key) {
  const parts = propCells.get(key);
  if (!parts) return;
  parts.forEach(o => {
    diveRoot.remove(o);
    const si = swayList.indexOf(o); if (si >= 0) swayList.splice(si, 1);
    const ci = diveChests.indexOf(o); if (ci >= 0) diveChests.splice(ci, 1);
    const vi = ventList.indexOf(o); if (vi >= 0) ventList.splice(vi, 1);
  });
  propCells.delete(key);
  for (let i = diveSolids.length - 1; i >= 0; i--) if (diveSolids[i].key === key) diveSolids.splice(i, 1);
}
const _bubGeo = new THREE.SphereGeometry(0.1, 6, 5), _bubMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.7 });
function buildVent() {
  const g = new THREE.Group(), M = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, flatShading: true });
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.9, 7, 1, true), M(0x3f3f46)); cone.position.y = 0.4; g.add(cone);
  const glow = new THREE.Mesh(new THREE.CircleGeometry(0.28, 10), new THREE.MeshBasicMaterial({ color: 0xfb923c })); glow.rotation.x = -Math.PI / 2; glow.position.y = 0.82; g.add(glow);
  const bub = []; for (let k = 0; k < 9; k++) { const b = new THREE.Mesh(_bubGeo, _bubMat); b.scale.setScalar(0.6 + (k % 3) * 0.4); g.add(b); bub.push(b); }
  g.userData.bub = bub; g.userData.usedT = -999; return g;
}
function buildOverhang() {
  const g = new THREE.Group(), rock = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.95, flatShading: true });
  [-1.3, 1.3].forEach(dx => { const p = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6, 0), rock); p.scale.set(0.9, 2.0, 0.9); p.position.set(dx, 1.0, 0); g.add(p); });
  const slab = new THREE.Mesh(new THREE.DodecahedronGeometry(1.0, 0), rock); slab.scale.set(2.0, 0.45, 1.2); slab.position.y = 2.15; g.add(slab);
  [[-0.8, 0xf472b6], [0.5, 0xfb923c], [1.1, 0xa3e635]].forEach(([x, c]) => { const k = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 5), new THREE.MeshStandardMaterial({ color: c, flatShading: true })); k.position.set(x, 2.55, 0.3); g.add(k); });
  return g;
}
/* lurkers: eels and rare fish under an overhang, worth half again as much, that bolt if you come in fast */
function spawnLurkers(zone, x, z) {
  const pool = CATCH_CATALOG.filter(c => c.category === 'Fish' && c.zones.includes(zone.id) && !c.fullMoonOnly && !c.stormOnly && c.rarity !== 'Legendary' && (c.shape === 'fish_eel' || rarityAtLeast(c.rarity, 'Rare')));
  if (!pool.length) return;
  const n = 1 + (hash2(Math.round(x), Math.round(z)) > 0.5 ? 1 : 0);
  for (let k = 0; k < n; k++) {
    const f = spawnDiveFish(pool[Math.floor(Math.random() * pool.length)], zone, x + (k - 0.5) * 0.8, z + 0.2);
    f.lurk = true; f.skit = 0; f.depthPref = 0; f.value = Math.round(f.value * 1.5); f.speed *= 1.3;
  }
}
export function updateVents(dt) {
  ventList.forEach(v => {
    v.userData.bub.forEach((b, k) => { const t = (shared.elapsed * 1.4 + k * 0.83) % 7.5; b.position.set(Math.sin(t * 2 + k) * 0.15, 0.9 + t * 1.6, Math.cos(t * 1.7 + k) * 0.15); });
    if (dt <= 0) return;
    const dx = dive.pos.x - v.position.x, dz = dive.pos.z - v.position.z, hy = dive.pos.y - v.position.y;
    if (dx * dx + dz * dz < 6.8 && hy > -0.5 && hy < 13) {
      dive.vy += 1.6 * dt;   // the warm water lifts you
      if (dive.t - v.userData.usedT > 45) { v.userData.usedT = dive.t; dive.air = Math.min(dive.airMax, dive.air + dive.airMax * 0.15); sfx.playTick(); showToast('♨️ Thermal vent: +15% air'); }
    }
  });
}
