/* Diving: static solids, collisions, props, chests and wrecks. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { COL } from '../world/layout.js';
import { Colliders } from '../data/recipes.js';
import { hash2 } from './dive-state.js';
import { DG, DM, diveSolids, mk } from './dive-seabed.js';

export function buildDiveStatic() {
  // every DIVE collider in the registry (pilings, lighthouse rocks, buoys near the surface); circles only, as cylinders
  shared.diveStatic = Colliders.of(COL.DIVE).filter(c => c.kind === 'circle').map(c => ({ x: c.x, z: c.z, r: c.name === 'buoy' ? 0.9 : c.r, y0: c.y0, y1: Math.min(c.y1, 3) }));
}
export function resolveDiveSolids(pos, rad, halfH) {
  let hit = false;
  const one = s => {
    if (pos.y + halfH < s.y0 || pos.y - halfH > s.y1) return;
    const dx = pos.x - s.x, dz = pos.z - s.z, m = s.r + rad, d2 = dx * dx + dz * dz;
    if (d2 < m * m) { const d = Math.sqrt(d2) || 1e-3; pos.x = s.x + dx / d * m; pos.z = s.z + dz / d * m; hit = true; }
  };
  for (let i = 0; i < diveSolids.length; i++) one(diveSolids[i]);
  for (let i = 0; i < shared.diveStatic.length; i++) one(shared.diveStatic[i]);
  return hit;
}
export function pointInDiveSolid(p) {
  for (const list of [diveSolids, shared.diveStatic]) for (const s of list) {
    if (p.y < s.y0 || p.y > s.y1) continue;
    const dx = p.x - s.x, dz = p.z - s.z;
    if (dx * dx + dz * dz < s.r * s.r) return true;
  }
  return false;
}
export function buildProp(kind, h, depth) {
  const g = new THREE.Group();
  const r = k => hash2(Math.floor(h * 1e6) + k * 131, k * 977 + 5);
  if (kind === 'kelp') {
    const n = 3 + Math.floor(r(1) * 3), H = Math.min(9, 2.5 + r(2) * 3.5 + depth * 0.12);
    for (let b = 0; b < n; b++) {
      const blade = mk(DG.kelpBlade, depth > 12 ? DM.kelpDeep : DM.kelp, (r(b + 3) - 0.5) * 0.9, H / 2, (r(b + 9) - 0.5) * 0.9, 1 + r(b + 20), H * (0.7 + r(b + 30) * 0.4), 1);
      blade.rotation.y = r(b + 40) * 3; g.add(blade);
    }
    g.userData.sway = 0.07 + r(5) * 0.06; g.userData.phase = r(6) * 6.28;
  } else if (kind === 'coral') {
    const m = DM.coral[Math.floor(r(1) * DM.coral.length)];
    g.add(mk(DG.blob, m, 0, 0.35, 0, 0.7, 0.55, 0.7));
    const n = 3 + Math.floor(r(2) * 4);
    for (let b = 0; b < n; b++) {
      const br = mk(DG.branch, m, (r(b + 3) - 0.5) * 0.9, 0.6 + r(b + 8) * 0.3, (r(b + 13) - 0.5) * 0.9, 1, 0.8 + r(b + 18) * 0.9, 1);
      br.rotation.set((r(b + 23) - 0.5) * 0.9, 0, (r(b + 28) - 0.5) * 0.9); g.add(br);
    }
  } else if (kind === 'rock') {
    const s = 0.5 + r(1) * 1.6;
    const rk = mk(DG.rock, depth > 35 ? DM.rockDark : DM.rock, 0, s * 0.35, 0, s, s * (0.5 + r(2) * 0.4), s * (0.8 + r(3) * 0.4));
    rk.rotation.set(r(4) * 0.5, r(5) * 6, r(6) * 0.5); g.add(rk);
    if (r(7) > 0.55) { const s2 = s * 0.5; g.add(mk(DG.rock, DM.rock, s * 0.9, s2 * 0.3, s * 0.3, s2, s2 * 0.7, s2)); }
  } else if (kind === 'grass') {
    const n = 6 + Math.floor(r(1) * 6);
    for (let b = 0; b < n; b++) {
      const bl = mk(DG.grass, DM.grass, (r(b + 3) - 0.5) * 1.3, 0.35, (r(b + 15) - 0.5) * 1.3, 1, 0.5 + r(b + 27) * 0.9, 1);
      bl.rotation.set((r(b + 40) - 0.5) * 0.4, 0, (r(b + 50) - 0.5) * 0.4); g.add(bl);
    }
    g.userData.sway = 0.1; g.userData.phase = r(6) * 6.28;
  } else if (kind === 'tube') {
    const n = 2 + Math.floor(r(1) * 4);
    for (let b = 0; b < n; b++) g.add(mk(DG.tube, DM.tube, (r(b + 3) - 0.5) * 0.9, 0.5 + r(b + 9) * 0.5, (r(b + 13) - 0.5) * 0.9, 1, 1 + r(b + 19) * 1.5, 1));
  } else if (kind === 'orb') {
    const n = 2 + Math.floor(r(1) * 3);
    for (let b = 0; b < n; b++) {
      const hgt = 1.2 + r(b + 3) * 1.6, px = (r(b + 8) - 0.5) * 1.6, pz = (r(b + 13) - 0.5) * 1.6;
      g.add(mk(DG.stalk, DM.stalk, px, hgt / 2, pz, 1, hgt, 1));
      g.add(mk(DG.orb, r(b + 20) > 0.5 ? DM.orb : DM.orb2, px, hgt + 0.1, pz, 1.2, 1.2, 1.2));
    }
    g.userData.pulse = true; g.userData.phase = r(6) * 6.28;
  }
  return g;
}
export function buildChest() {
  const g = new THREE.Group();
  g.add(mk(DG.box, DM.wood, 0, 0.22, 0, 0.8, 0.44, 0.5));
  g.add(mk(DG.box, DM.gold, 0, 0.22, 0.2, 0.84, 0.1, 0.12));
  g.add(mk(DG.box, DM.gold, 0, 0.22, -0.2, 0.84, 0.1, 0.12));
  const lidPivot = new THREE.Group(); lidPivot.position.set(0, 0.44, 0.25);
  lidPivot.add(mk(DG.box, DM.wood, 0, 0.1, -0.25, 0.8, 0.2, 0.5));
  lidPivot.add(mk(DG.box, DM.gold, 0, 0.1, -0.05, 0.84, 0.22, 0.06));
  g.add(lidPivot);
  g.add(mk(DG.box, DM.gold, 0, 0.42, -0.26, 0.1, 0.12, 0.05));
  g.userData.lid = lidPivot; g.userData.chest = true;
  return g;
}
/* a sunken wooden ship lying on its side: keel, ribs, the planks that are left, deck beams, a stem post and a broken
   mast. Same footprint as before (about 10 x 3.4 m along local X), so its seabed colliders still fit. */
export function buildWreck() {
  const g = new THREE.Group();
  const hullG = new THREE.Group();
  hullG.add(mk(DG.box, DM.woodOld, 0.5, 0.25, 0, 10.2, 0.32, 0.36));                     // keel
  for (let i = 0; i < 9; i++) {                                                          // ribs
    const x = -4.0 + i * 1.05, sc = 1 - Math.pow(Math.max(0, (x - 2.5) / 3.5), 2) * 0.55;
    const rib = new THREE.Mesh(new THREE.TorusGeometry(1.55 * sc, 0.1, 4, 10, Math.PI * (i % 3 === 1 ? 0.75 : 1)), DM.woodOld);
    rib.rotation.set(0, Math.PI / 2, Math.PI); rib.position.set(x, 1.75 * sc + 0.2, 0); rib.scale.set(1, 1.15, 1);
    hullG.add(rib);
  }
  // planks that survived along the lower side, some broken short
  for (let k = 0; k < 6; k++) {
    const a = Math.PI * (0.58 + k * 0.08), len = [9.0, 8.2, 6.5, 7.6, 4.8, 3.2][k];
    const pl = mk(DG.box, DM.woodOld, -0.2 + (9 - len) * 0.3, 1.95 + Math.cos(a) * 1.6, Math.sin(a) * 1.6 * -1, len, 0.1, 0.36);
    pl.rotation.x = a - Math.PI / 2; hullG.add(pl);
  }
  for (let i = 0; i < 4; i++) hullG.add(mk(DG.box, DM.woodOld, -3 + i * 2.2, 2.6, 0, 0.22, 0.22, 3.0));   // deck beams
  const stem = mk(DG.box, DM.woodOld, 5.5, 1.7, 0, 0.3, 3.0, 0.3); stem.rotation.z = -0.45; hullG.add(stem);
  hullG.rotation.x = 0.35;                                                               // lying on its side
  g.add(hullG);
  const mast = mk(DG.box, DM.woodOld, -0.5, 3.4, 0.6, 0.3, 5.0, 0.3); mast.rotation.z = -0.9; mast.rotation.x = 0.3; g.add(mast);
  const yard = mk(DG.box, DM.woodOld, 1.6, 4.4, 0.9, 2.8, 0.18, 0.18); yard.rotation.z = -0.5; g.add(yard);
  g.rotation.y = 0.8;
  return g;
}
