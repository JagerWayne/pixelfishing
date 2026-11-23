/* The Town Square's props (v12.1.0): the modern fountain (a low square basin, a stepped centre and four jets) and the
   three market stalls of TOWN.stalls (fish, fruit, crafts) under striped fabric canopies. Each is its own fade group. */
import { THREE } from '../engine/three.js';
import { COL, TOWN, faceYaw, townGround } from './layout.js';
import { Colliders } from '../data/recipes.js';

/* the fountain in the middle of the square; returns its group (a fade group) */
export function buildFountain(K, km, root, fade) {
  const M = K.M, F = TOWN.well, f = new THREE.Group(), s = F.r * 2;
  f.position.set(F.x, townGround(F.z) + 0.06, F.z); f.userData.townFade = true; root.add(f); fade.push(f);
  const stone = M(0xd6d3d1, 0.9), dark = M(0x57534e, 0.9);
  [[0, s / 2 - 0.12], [0, -s / 2 + 0.12]].forEach(([x, z]) => K.sharpBox(f, s, 0.45, 0.24, stone, x, 0.23, z));   // basin rim
  [[s / 2 - 0.12, 0], [-s / 2 + 0.12, 0]].forEach(([x, z]) => K.sharpBox(f, 0.24, 0.45, s - 0.48, stone, x, 0.23, z));
  K.sharpBox(f, s + 0.1, 0.05, 0.34, dark, 0, 0.47, s / 2 - 0.12); K.sharpBox(f, s + 0.1, 0.05, 0.34, dark, 0, 0.47, -s / 2 + 0.12);
  K.sharpBox(f, 0.34, 0.05, s - 0.48, dark, s / 2 - 0.12, 0.47, 0); K.sharpBox(f, 0.34, 0.05, s - 0.48, dark, -s / 2 + 0.12, 0.47, 0);
  K.sharpBox(f, s - 0.46, 0.04, s - 0.46, M(0x2a8fb0, 0.15, 0.2), 0, 0.34, 0);  // water
  [[1.3, 0.25], [0.9, 0.55], [0.5, 0.95]].forEach(([w, h]) => K.sharpBox(f, w, h, w, stone, 0, h / 2, 0));   // stepped centre
  const jet = M(0xbae6fd, 0.1, 0.2, { transparent: true, opacity: 0.6, depthWrite: false });
  K.cyl(f, 0.05, 0.09, 0.7, jet, 0, 1.3, 0, 8); K.sph(f, 0.14, jet, 0, 1.68, 0, 8, 6);
  [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dz]) => {                    // four arcing jets from the corners of the steps
    const j = K.cyl(f, 0.025, 0.04, 0.7, jet, dx * 0.85, 0.62, dz * 0.85, 6); j.rotation.set(dz * 0.55, 0, -dx * 0.55);
  });
  Colliders.box('fountain', F.x, F.z, F.r + 0.05, F.r + 0.05, COL.WALK);
  return f;
}

/* the goods on a stall counter, by kind */
function goods(K, km, g, kind) {
  const M = K.M;
  if (kind === 'fish') {
    K.sharpBox(g, 1.5, 0.06, 0.55, M(0xf1f5f9, 0.9), 0, 0.82, 0.05);
    [[-0.5, 0x60a5fa], [-0.15, 0x94a3b8], [0.2, 0xf87171], [0.55, 0x60a5fa]].forEach(([x, c], i) => {
      const fsh = K.sph(g, 0.1, M(c, 0.9), x, 0.89, 0.05 + (i % 2) * 0.12, 8, 6); fsh.scale.set(2.2, 0.6, 0.9); fsh.rotation.y = 0.3 * (i % 2 ? 1 : -1);
    });
  } else if (kind === 'fruit') {
    [[-0.5, 0xdc2626], [0, 0xf97316], [0.5, 0xfacc15]].forEach(([x, c]) => {
      K.sharpBox(g, 0.44, 0.14, 0.44, M(0xa16207, 0.9), x, 0.84, 0.05);
      for (let k = 0; k < 5; k++) K.sph(g, 0.07, M(c, 0.9), x + ((k * 37) % 5 - 2) * 0.06, 0.95, 0.05 + ((k * 53) % 3 - 1) * 0.1, 7, 5);
    });
    K.sph(g, 0.16, M(0x16a34a, 0.9), 0.75, 0.95, -0.15, 8, 6).scale.set(1, 0.85, 1.25);   // a watermelon
  } else {
    [[-0.55, 0x0e7490], [-0.2, 0xc2410c], [0.15, 0x7c3aed]].forEach(([x, c], i) => K.cyl(g, 0.09 + i * 0.02, 0.07, 0.24 + i * 0.05, M(c, 0.9), x, 0.9 + i * 0.025, 0.05, 10));
    [[0.5, 0xfde68a], [0.5, 0xf9a8d4], [0.5, 0x93c5fd]].forEach(([x, c], i) => K.sharpBox(g, 0.42, 0.05, 0.32, M(c, 0.9), x, 0.81 + i * 0.05, 0.05));
  }
}

/* the three market stalls */
export function buildStalls(K, km, root) {
  const M = K.M, wood = M(0x9a7350, 0.9), white = km.white;
  TOWN.stalls.forEach(S => {
    const g = new THREE.Group(); g.position.set(S.x, townGround(S.z) + 0.06, S.z); g.rotation.y = faceYaw(S.face); g.userData.fade = true; root.add(g);
    K.sharpBox(g, 1.8, 0.78, 0.75, wood, 0, 0.39, 0); K.sharpBox(g, 1.9, 0.05, 0.85, M(0xf5f5f4, 0.9), 0, 0.8, 0);
    K.sharpBox(g, 1.82, 0.12, 0.02, M(S.canopy, 0.9), 0, 0.7, 0.385);
    [[-0.85, 0.35], [0.85, 0.35], [-0.85, -0.4], [0.85, -0.4]].forEach(([x, z]) => K.cyl(g, 0.035, 0.035, 2.3, km.frame, x, 1.15, z, 6));
    const col = M(S.canopy, 0.9);
    for (let i = 0; i < 6; i++) { const c = K.sharpBox(g, 0.34, 0.04, 1.2, i % 2 ? white : col, -0.85 + 0.17 + i * 0.34, 2.32, 0.02); c.rotation.x = 0.2; }
    for (let i = 0; i < 6; i++) { const v = K.sharpBox(g, 0.34, 0.2, 0.02, i % 2 ? white : col, -0.85 + 0.17 + i * 0.34, 2.12, 0.63); v.rotation.x = 0.2; }
    goods(K, km, g, S.kind);
    const side = S.face === 'E' || S.face === 'W';
    Colliders.box('market stall', S.x, S.z, side ? 0.45 : 0.95, side ? 0.95 : 0.45, COL.WALK);
  });
}
