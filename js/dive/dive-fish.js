/* Diving: prop updates, dive fish, the whale, marine snow and bubbles. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { WorldBuilder } from '../world/world-builder.js';
import { textures } from '../render/lights.js';
import { DIVE_FISH_TARGET, diveFish, diveZoneAt, pickDiveFishItem, rollDiveFishStats, waypointY } from './dive-state.js';
import { CELL, DG, DM, diveRoot, lurkDone, mk, propCells, propRadius } from './dive-seabed.js';
import { dropCell, makeCell } from './dive-cells.js';

export let snowPos, snowOff, bubPos, bubVel, bubLife;
let snowPts, bubPts;

export function updateProps(cx, cz, force) {
  const ci = Math.floor(cx / CELL), cj = Math.floor(cz / CELL);
  if (!force && ci === shared.propKeyI && cj === shared.propKeyJ) return;
  shared.propKeyI = ci; shared.propKeyJ = cj;
  const R = propRadius();
  const need = new Set();
  for (let i = ci - R; i <= ci + R; i++) for (let j = cj - R; j <= cj + R; j++) need.add(i + ',' + j);
  for (const key of [...propCells.keys()]) if (!need.has(key)) dropCell(key);
  for (let i = ci - R; i <= ci + R; i++) for (let j = cj - R; j <= cj + R; j++) { const key = i + ',' + j; if (!propCells.has(key)) makeCell(i, j); }
}
export function clearProps() {
  for (const key of [...propCells.keys()]) dropCell(key);
  lurkDone.clear();
  shared.propKeyI = shared.propKeyJ = 1e9; shared.seabedKeyX = shared.seabedKeyZ = 1e9;
}

/* fish models: one template per species, cloned (geometry and materials are shared) and scaled to the fish's length */
const fishTemplates = {};
function getFishTemplate(item) {
  if (fishTemplates[item.id]) return fishTemplates[item.id];
  const m = WorldBuilder.buildFishModel(item, textures);
  const bb = new THREE.Box3().setFromObject(m), size = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3());
  m.position.sub(c);
  const holder = new THREE.Group(); holder.add(m);
  return (fishTemplates[item.id] = { obj: holder, k: 1 / Math.max(size.x, 0.01) });
}
export function spawnDiveFish(item, zone, x, z, opts = {}) {
  const st = rollDiveFishStats(item, zone);
  const tpl = getFishTemplate(item);
  const mesh = tpl.obj.clone();
  mesh.rotation.order = 'YZX';
  mesh.scale.setScalar(tpl.k * st.len);
  const f = Object.assign(st, {
    mesh, state: 'swim', pos: new THREE.Vector3(x, 0, z), tgt: new THREE.Vector3(), threat: new THREE.Vector3(),
    h: Math.random() * 6.28, p: 0, v: st.speed * 0.6, wait: 0, fleeT: 0, leader: opts.leader || null,
    off: opts.off || new THREE.Vector3(), wig: Math.random() * 6.28
  });
  f.pos.y = waypointY(f, x, z);
  f.tgt.copy(f.pos);
  mesh.position.copy(f.pos);
  diveRoot.add(mesh);
  diveFish.push(f);
  return f;
}
export function removeDiveFish(f) {
  diveRoot.remove(f.mesh);
  const i = diveFish.indexOf(f); if (i >= 0) diveFish.splice(i, 1);
  diveFish.forEach(o => { if (o.leader === f) o.leader = null; });
}
export function populateDiveFish(diverPos, near) {
  if (diveFish.length >= DIVE_FISH_TARGET() + 6) return;
  const a = Math.random() * 6.28, d = near ? 14 + Math.random() * 14 : 26 + Math.random() * 26;
  const x = THREE.MathUtils.clamp(diverPos.x + Math.cos(a) * d, -220, 220), z = Math.min(-4.5, diverPos.z + Math.sin(a) * d);
  const zone = diveZoneAt(z);
  const item = pickDiveFishItem(zone.id);
  const lead = spawnDiveFish(item, zone, x, z);
  if ((item.rarity === 'Common' || item.rarity === 'Uncommon') && Math.random() < 0.4) {
    const n = 2 + Math.floor(Math.random() * 4);
    for (let k = 0; k < n; k++) {
      const off = new THREE.Vector3((Math.random() - 0.5) * 6.28, (Math.random() - 0.5) * 1.6, 1.2 + Math.random() * 2.2);
      const fx = x + Math.cos(off.x) * off.z, fz = Math.min(-4.5, z + Math.sin(off.x) * off.z);
      const fol = spawnDiveFish(item, zone, fx, fz, { leader: lead, off });
      fol.weight = +Math.max(item.minW, lead.weight * (0.7 + Math.random() * 0.4)).toFixed(2);
      fol.value = Math.max(1, Math.round(lead.value * fol.weight / lead.weight));
    }
  }
}

/* the whale that sometimes drifts past in the blue (pure ambience) */
export const whale = new THREE.Group();
export const whaleState = { t: 0, dir: new THREE.Vector3(), life: 0 };

/* marine snow and bubbles: two small point clouds (square pixels suit the look) */
export const SNOW_N = 150, SNOW_BOX = 28;
export const snowGeo = new THREE.BufferGeometry();

export const BUB_N = 70;
export const bubGeo = new THREE.BufferGeometry();
shared.bubCursor = 0;

export function init() {
  (() => {
    whale.add(mk(DG.blob, DM.whale, 0, 0, 0, 7.5, 2.1, 2.5));
    whale.add(mk(DG.blob, DM.whale, -6.4, 0.2, 0, 2.8, 1.0, 1.3));
    const fl = mk(DG.box, DM.whale, -9.2, 0.5, 0, 0.5, 0.15, 3.8); fl.rotation.z = 0.25; whale.add(fl);
    const fin = mk(DG.box, DM.whale, 1.0, -1.2, 1.9, 2.0, 0.12, 0.9); fin.rotation.set(0.6, 0, 0.3); whale.add(fin);
    const fin2 = fin.clone(); fin2.position.z = -1.9; fin2.rotation.x = -0.6; whale.add(fin2);
    whale.visible = false; diveRoot.add(whale);
  })();
  snowPos = new Float32Array(SNOW_N * 3);
  for (let i = 0; i < SNOW_N; i++) { snowPos[i * 3] = (Math.random() - 0.5) * SNOW_BOX; snowPos[i * 3 + 1] = (Math.random() - 0.5) * SNOW_BOX * 0.6; snowPos[i * 3 + 2] = (Math.random() - 0.5) * SNOW_BOX; }
  snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
  snowPts = new THREE.Points(snowGeo, new THREE.PointsMaterial({ color: 0xdff2ff, size: 0.07, transparent: true, opacity: 0.55, depthWrite: false }));
  snowPts.frustumCulled = false;
diveRoot.add(snowPts);
  snowOff = new Float32Array(SNOW_N * 3);
  for (let i = 0; i < SNOW_N * 3; i++) snowOff[i] = snowPos[i];
  bubPos = new Float32Array(BUB_N * 3).fill(1e4);
  bubVel = new Float32Array(BUB_N);
      bubLife = new Float32Array(BUB_N);
  bubGeo.setAttribute('position', new THREE.BufferAttribute(bubPos, 3));
  bubPts = new THREE.Points(bubGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.11, transparent: true, opacity: 0.75, depthWrite: false }));
  bubPts.frustumCulled = false;
diveRoot.add(bubPts);
}
