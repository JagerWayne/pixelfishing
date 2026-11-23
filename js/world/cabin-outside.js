/* Around the cabin (v12.2.0): the timber deck on the sea side under the roof overhang (two loungers and a planter),
   the front garden on Market Lane (a paved path, flower beds, a small tree and the mailbox, the cabin's mail stop),
   every walk collider of the cabin and its rooms, and the seating deck where the old cabin stood on the boardwalk. */
import { THREE } from '../engine/three.js';
import { COL, SEA_DECK } from './layout.js';
import { Colliders } from '../data/recipes.js';

/* the deck and the garden, in the cabin's local frame (added to the cabin group) */
export function buildCabinOutside(K, km, g, C) {
  const M = K.M, W = C.w, D = C.d, box = (w, h, d, m, x, y, z) => K.sharpBox(g, w, h, d, m, x, y, z);
  const deck = M(0xb98a5c, 0.9), gap = M(0x7c5a3a, 0.9), stone = M(0xb8b2a7, 0.9);
  box(9.0, 0.06, 1.8, deck, 0, 0.03, -0.95);
  for (let x = -4.4; x < 4.5; x += 0.3) box(0.012, 0.065, 1.8, gap, x, 0.03, -0.95);
  [-2.6, 1.9].forEach(x => {                                                     // sun loungers facing the sea
    box(0.65, 0.08, 1.5, km.white, x, 0.32, -1.0); box(0.65, 0.5, 0.08, km.white, x, 0.52, -0.3).rotation.x = -0.45;
    [[-0.28, -1.65], [0.28, -1.65], [-0.28, -0.35], [0.28, -0.35]].forEach(([dx, z]) => box(0.05, 0.28, 0.05, km.frame, x + dx, 0.14, z));
    box(0.6, 0.06, 0.5, M(0x0ea5e9, 0.9), x, 0.39, -1.45);
  });
  box(0.5, 0.45, 0.5, km.concrete, -0.4, 0.25, -1.4); K.sph(g, 0.33, km.leaf2, -0.4, 0.7, -1.4, 8, 6);
  // the front garden: a lawn, the paved path from the door to the lane, flower beds, a tree and the mailbox
  box(W, 0.03, 1.5, M(0x3b7a30, 0.9), 0, 0.015, D + 0.85);
  for (let i = 0; i < 3; i++) box(1.0, 0.04, 0.38, stone, C.doorX, 0.03, D + 0.3 + i * 0.5);
  const flowers = [0xf472b6, 0xfacc15, 0xf8fafc, 0xa78bfa].map(c => M(c, 0.9));
  [[-0.2, 2.6], [3.6, 2.6]].forEach(([x, len]) => {
    box(len, 0.14, 0.6, km.concrete, x, 0.07, D + 0.55); box(len - 0.1, 0.05, 0.5, M(0x4a3426, 0.9), x, 0.13, D + 0.55);
    for (let k = 0; k < len * 4; k++) K.sph(g, 0.08, k % 3 ? flowers[k % 4] : km.leaf, x - len / 2 + 0.15 + k * 0.25, 0.22, D + 0.5 + (k % 2) * 0.12, 6, 4);
  });
  K.cyl(g, 0.08, 0.12, 2.2, km.trunk, -4.6, 1.1, D + 0.9, 7); K.sph(g, 0.8, km.leaf, -4.6, 2.6, D + 0.9, 9, 7); K.sph(g, 0.55, km.leaf2, -4.2, 2.25, D + 1.1, 9, 7);
  const mx = C.doorX + 1.0, mz = D + 1.3;                                        // the mailbox beside the path
  K.cyl(g, 0.04, 0.04, 1.0, km.frame, mx, 0.5, mz, 6); box(0.3, 0.26, 0.42, M(0x0e7490, 0.9), mx, 1.08, mz);
  box(0.04, 0.16, 0.04, M(0xdc2626, 0.9), mx + 0.17, 1.2, mz - 0.1);
}

/* every walk collider of the cabin, in world units */
export function cabinColliders(C) {
  const W = COL.WALK, hw = C.w / 2, x0 = C.x, z0 = C.z, D = C.d, dl = C.doorX - C.doorW / 2, dr = C.doorX + C.doorW / 2;
  const at = (name, x, z, hx, hz) => Colliders.box(name, x0 + x, z0 + z, hx, hz, W);
  at('cabin wall N', 0, -0.07, hw + 0.07, 0.11); at('cabin wall W', -hw + 0.07, D / 2, 0.11, D / 2 + 0.1); at('cabin wall E', hw - 0.07, D / 2, 0.11, D / 2 + 0.1);
  at('cabin front W', (-hw + dl) / 2, D + 0.07, (dl + hw) / 2, 0.12); at('cabin front E', (dr + hw) / 2, D + 0.07, (hw - dr) / 2, 0.12);
  at('cabin partition', C.partX, 1.3, 0.09, 1.38);
  at('cabin bed', hw - 0.62, 2.55, 0.5, 0.95);
  at('wardrobe', C.wardrobe.x - x0, C.wardrobe.z - z0, 0.72, 0.32);
  at('bookshelf', C.shelf.x - x0 + 0.02, C.shelf.z - z0, 0.2, 0.78);
  at('sofa', -0.15, 3.78, 1.07, 0.47); at('side table', 1.35, 3.95, 0.27, 0.27); at('house plant', -hw + 0.45, 4.25, 0.24, 0.24);
  [-4.3, 4.3].forEach(x => at('deck post', x, -1.85, 0.08, 0.08));
  [-2.6, 1.9].forEach(x => at('lounger', x, -1.0, 0.34, 0.78)); at('deck planter', -0.4, -1.4, 0.27, 0.27);
  at('mailbox', C.doorX + 1.0, D + 1.3, 0.18, 0.23); at('garden tree', -4.6, D + 0.9, 0.2, 0.2);
}

/* the seating deck on the boardwalk where the old cabin stood (its two benches and lamps are EXTRA_BENCHES) */
export function buildSeaDeck(K, root) {
  const M = K.M, S = SEA_DECK, g = new THREE.Group(); g.position.set(S.x, 1.56, 0); root.add(g);
  const deck = M(0x8a6443, 0.9), gap = M(0x5c4029, 0.9), box = (w, h, d, m, x, y, z) => K.sharpBox(g, w, h, d, m, x, y, z);
  box(S.w, 0.05, S.d, deck, 0, 0.025, S.d / 2);
  for (let x = -S.w / 2 + 0.3; x < S.w / 2; x += 0.3) box(0.012, 0.055, S.d, gap, x, 0.025, S.d / 2);
  [-S.w / 2 + 0.4, S.w / 2 - 0.4].forEach(x => {
    box(0.6, 0.5, 0.6, M(0xa8a29e, 0.9), x, 0.3, 0.6); K.sph(g, 0.36, M(0x3f9440, 0.9), x, 0.82, 0.6, 8, 6);
    Colliders.box('deck planter', S.x + x, 0.6, 0.32, 0.32, COL.WALK);
  });
  K.cyl(g, 0.04, 0.05, 4.2, M(0xf8fafc, 0.9), 0, 2.1, 0.45, 8);                 // a flagpole with a pennant
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.5), M(0x0e7490, 0.9, 0, { side: THREE.DoubleSide })); flag.position.set(0.47, 3.85, 0.45); g.add(flag);
  Colliders.circle('flagpole', S.x, 0.45, 0.08, COL.WALK);
  return g;
}
