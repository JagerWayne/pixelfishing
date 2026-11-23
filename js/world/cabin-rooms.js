/* The cabin's rooms (v12.2.0), in the cabin's local frame (origin: back wall centre at floor level, front +Z).
   Living room (west): rug, sofa facing the aquarium, a side table with a lamp, the bookshelf on the west wall, a plant.
   Bedroom (east, behind a partition): the bunk with the Trophy Wall above it (trophy-wall.js), the wardrobe on the
   back wall, a bedside rug. Two pendant lamps glow at night (userData.glow, switched by updateTownProps). The walk
   colliders for all of this are registered by buildWorld (cabinColliders in cabin-outside.js). */
import { THREE } from '../engine/three.js';

export function furnishCabin(K, km, g, C) {
  const M = K.M, W = C.w, D = C.d, hw = W / 2, H = 2.8, px = C.partX;
  const box = (w, h, d, m, x, y, z) => K.sharpBox(g, w, h, d, m, x, y, z);
  const wood = M(0x8a6240, 0.9), dark = M(0x3f2a1d, 0.9), white = km.white;
  const lampM = Object.assign(M(0xfff1c2, 0.4, 0, { emissive: new THREE.Color(0xfbbf24), emissiveIntensity: 0 }), { userData: { glow: 'lamp' } });
  // the partition between the living room and the bedroom, open at the front
  box(0.1, H, 2.6, M(0xf1f5f9, 0.9), px, H / 2, 1.3); box(0.14, H, 0.14, wood, px, H / 2, 2.6);
  // living room: rug, sofa (its back to the front windows), side table and lamp, a plant
  box(3.2, 0.015, 1.9, M(0x0e7490, 0.9), -0.4, 0.05, 2.9); box(2.8, 0.018, 1.5, M(0xe0f2fe, 0.9), -0.4, 0.052, 2.9);
  const sofa = M(0x475569, 0.9), cushion = M(0x64748b, 0.9);
  box(2.1, 0.42, 0.85, sofa, -0.15, 0.25, 3.75); box(2.1, 0.55, 0.2, sofa, -0.15, 0.7, 4.1);
  [-1, 1].forEach(s => box(0.18, 0.62, 0.85, sofa, -0.15 + s * 0.96, 0.33, 3.75));
  [-0.55, 0.25].forEach(x => box(0.78, 0.12, 0.62, cushion, -0.15 + x + 0.15, 0.52, 3.68));
  box(0.4, 0.3, 0.3, M(0xf59e0b, 0.9), -0.85, 0.68, 3.95).rotation.z = 0.2;            // a cushion
  box(0.5, 0.55, 0.5, wood, 1.35, 0.28, 3.95); K.cyl(g, 0.12, 0.16, 0.3, white, 1.35, 0.72, 3.95, 10);
  K.cyl(g, 0.17, 0.22, 0.22, lampM, 1.35, 0.98, 3.95, 12);
  K.cyl(g, 0.2, 0.15, 0.4, M(0xc2410c, 0.9), -hw + 0.45, 0.2, 4.25, 10); K.sph(g, 0.34, km.leaf, -hw + 0.45, 0.7, 4.25, 9, 7);
  // the bookshelf on the west wall, facing into the room
  { const sx = C.shelf.x - C.x + 0.02, sz = C.shelf.z - C.z, len = 1.5, hgt = 2.0;
    box(0.36, hgt, len, wood, sx, hgt / 2, sz); box(0.3, hgt - 0.1, len - 0.1, dark, sx + 0.04, hgt / 2, sz);
    const books = [0xb91c1c, 0x1d4ed8, 0x15803d, 0xeab308, 0x7c3aed, 0xf97316, 0x0e7490].map(c => M(c, 0.9));
    for (let r = 0; r < 4; r++) {
      box(0.34, 0.04, len - 0.08, wood, sx + 0.02, 0.15 + r * 0.48, sz);
      let z = sz - len / 2 + 0.1;
      for (let k = 0; z < sz + len / 2 - 0.15; k++) { const t = 0.05 + ((k * 7 + r * 3) % 4) * 0.02, h = 0.28 + ((k * 5 + r) % 3) * 0.05; box(0.22, h, t, books[(k + r * 2) % 7], sx + 0.06, 0.17 + r * 0.48 + h / 2, z + t / 2); z += t + 0.01; }
    }
  }
  // pendant lamps over the living room and the bedroom
  [[-0.15, 2.3], [3.9, 2.4]].forEach(([x, z]) => { K.cyl(g, 0.01, 0.01, 0.6, km.frame, x, H - 0.3, z, 4); K.cyl(g, 0.08, 0.25, 0.2, lampM, x, H - 0.68, z, 14); });
  // bedroom: the bunk along the east wall (as in the old cabin), the wardrobe on the back wall, a rug
  { const bx = hw - 0.62, bz = 2.55;
    [[-0.42, -0.85], [0.42, -0.85], [-0.42, 0.85], [0.42, 0.85]].forEach(([x, z]) => box(0.07, 1.5, 0.07, K.darkWood, bx + x, 0.8, bz + z));
    [0.42, 1.12].forEach((y, k) => { box(0.9, 0.12, 1.75, K.darkWood, bx, y, bz); box(0.84, 0.1, 1.6, M(k ? 0x1d4ed8 : 0x0f766e, 0.9), bx, y + 0.1, bz); box(0.6, 0.1, 0.34, white, bx, y + 0.2, bz + 0.62); });
    box(0.05, 0.9, 0.4, K.darkWood, bx - 0.45, 0.8, bz + 0.98);
    box(1.4, 0.015, 1.0, M(0xfde68a, 0.9), bx - 1.1, 0.05, bz + 0.2);
  }
  { const wx = C.wardrobe.x - C.x, wz = C.wardrobe.z - C.z;
    box(1.4, 2.05, 0.6, M(0xe7e5e4, 0.9), wx, 1.03, wz);
    box(0.02, 1.9, 0.02, dark, wx, 1.03, wz + 0.31);
    [-0.1, 0.1].forEach(x => box(0.03, 0.3, 0.03, km.frame, wx + x, 1.1, wz + 0.32));
    box(0.5, 1.2, 0.02, M(0xbae6fd, 0.1, 0.4), wx - 0.4, 1.2, wz + 0.31);           // a mirror on the left door
  }
}
