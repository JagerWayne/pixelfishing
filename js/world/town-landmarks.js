/* Landmark details (v12.1.0) added onto a kit building, in its own frame (front +Z, origin at the ground centre):
   Lorenzo's pergola terrace, the Post Office clock tower, Barnaby's boat shed. The greenhouse and the tavern are in
   town-landmarks-2.js. Solid parts go into cols as [x, z, half width, half depth]. */
import { THREE } from '../engine/three.js';
import { addGreenhouse, addTavern } from './town-landmarks-2.js';

const P = 0.16, H1 = 2.8, H2 = 2.3;

/* Lorenzo's: timber fins over the glass front, a slatted pergola over the terrace, planters and a menu board */
function addResto(K, km, b, g, cols) {
  const M = K.M, F = b.d / 2, W = b.w, fin = M(b.clad, 0.9), post = M(0x374151, 0.9);
  const box = (w, h, d, mat, x, y, z) => K.sharpBox(g, w, h, d, mat, x, y, z);
  for (let x = -W / 2 + 1.75; x < W / 2 - 0.2; x += 0.75) if (Math.abs(x - (b.doorX || 0)) > 0.7) box(0.08, 2.3, 0.2, fin, x, P + 1.25, F + 0.12);
  const z0 = F + 0.35, z1 = F + 4.6, top = 3.2;
  [-3.0, 3.0].forEach(x => {
    [z0, z1].forEach(z => { K.cyl(g, 0.07, 0.07, top, post, x, top / 2, z, 8); cols.push([x, z, 0.1, 0.1]); });
    box(0.12, 0.16, z1 - z0 + 0.2, post, x, top, (z0 + z1) / 2);
  });
  for (let z = z0 + 0.25; z < z1; z += 0.42) box(6.2, 0.06, 0.08, fin, 0, top + 0.1, z);
  [-1.6, 1.6].forEach(x => { box(0.5, 0.45, 0.5, km.concrete, x, 0.23, z1 + 0.1); K.sph(g, 0.32, km.leaf2, x, 0.68, z1 + 0.1, 8, 6); cols.push([x, z1 + 0.1, 0.3, 0.3]); });
  const mb = box(0.5, 0.75, 0.06, M(0x1f2937, 0.9), -2.7, 0.5, F + 0.5); mb.rotation.x = -0.18;   // menu board
  box(0.4, 0.5, 0.01, km.white, -2.7, 0.55, F + 0.54).rotation.x = -0.18;
}

/* the Post Office: a clock tower over the front with a flag, a red post box and a parcel locker on the side */
function addPost(K, km, b, g, cols) {
  const M = K.M, F = b.d / 2, W = b.w, D = b.d, acc = M(b.accent, 0.9), wall = M(b.wall, 0.9);
  const box = (w, h, d, mat, x, y, z) => K.sharpBox(g, w, h, d, mat, x, y, z);
  const top = P + H1 + 0.12 + H2, front = -D * 0.07 + D * 0.43, tz = front - 0.65;
  box(1.3, 1.9, 1.3, wall, 0, top + 0.95, tz); box(1.45, 0.14, 1.45, km.roof, 0, top + 1.97, tz);
  box(1.32, 0.12, 1.32, acc, 0, top + 0.2, tz);
  [[0, front + 0.02, 0], [0.67, tz, 1]].forEach(([x, z, side]) => {   // clock faces, front and side
    const c = K.cyl(g, 0.45, 0.45, 0.05, km.white, x, top + 1.05, z, 22);
    if (side) c.rotation.z = Math.PI / 2; else c.rotation.x = Math.PI / 2;
    const d = side ? [0.04, 0, 0] : [0, 0, 0.04];
    box(side ? 0.02 : 0.05, side ? 0.3 : 0.3, side ? 0.05 : 0.02, km.frame, x + d[0], top + 1.15, z + d[2]);
    box(side ? 0.02 : 0.22, 0.05, side ? 0.22 : 0.02, km.frame, x + d[0], top + 1.05, z + d[2] + (side ? 0.08 : 0)).position.x += side ? 0 : 0.08;
  });
  K.cyl(g, 0.03, 0.03, 1.6, km.frame, 0.45, top + 2.8, tz, 6);
  box(0.6, 0.38, 0.02, acc, 0.75, top + 3.35, tz);
  box(1.6, 0.1, 0.05, acc, b.doorX || 0, P + 2.31, F + 0.75);                // the blue edge of the door canopy
  K.cyl(g, 0.25, 0.25, 1.0, M(0xdc2626, 0.9), -1.75, 0.5, F + 0.45, 14); K.sph(g, 0.25, M(0xdc2626, 0.9), -1.75, 1.0, F + 0.45, 14, 8);
  box(0.2, 0.04, 0.02, km.frame, -1.75, 0.85, F + 0.71); cols.push([-1.75, F + 0.45, 0.28, 0.28]);
  box(0.3, 1.6, 1.0, M(0x94a3b8, 0.9), W / 2 + 0.17, 0.8 + P, F - 0.9);       // parcel locker
  for (let i = 0; i < 4; i++) box(0.02, 0.32, 0.9, km.frame, W / 2 + 0.33, 0.35 + P + i * 0.38, F - 0.9);
  cols.push([W / 2 + 0.17, F - 0.9, 0.2, 0.52]);
}

/* Barnaby's boat shed: a small boat on a cradle beside it, a workbench with paint tins, a coil of rope */
function addBoatShed(K, km, b, g, cols) {
  const M = K.M, W = b.w, wood = M(0x7c5a3a, 0.9);
  const box = (w, h, d, mat, x, y, z) => K.sharpBox(g, w, h, d, mat, x, y, z);
  const bx = -(W / 2 + 1.4);
  [-0.9, 0.9].forEach(z => { box(1.2, 0.1, 0.2, wood, bx, 0.55, z); [-0.5, 0.5].forEach(x => box(0.1, 0.55, 0.1, wood, bx + x, 0.28, z)); });
  const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(0xb91c1c, 0.9));
  hull.scale.set(0.62, 0.55, 1.5); hull.position.set(bx, 1.0, 0); g.add(hull);
  const deck = K.cyl(g, 1, 1, 0.05, km.white, bx, 1.0, 0, 18); deck.scale.set(0.62, 1, 1.5);
  box(0.3, 0.45, 0.25, km.frame, bx, 1.2, 1.55); box(0.08, 0.6, 0.1, km.frame, bx, 0.8, 1.6);   // outboard on the stern
  cols.push([bx, 0, 0.75, 1.65]);
  const t = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.06, 6, 16), M(0xa8845a, 0.9)); t.rotation.x = Math.PI / 2; t.position.set(bx + 0.95, 0.07, -1.3); g.add(t);
  box(0.6, 0.85, 1.4, wood, W / 2 + 0.45, 0.43, -0.6); cols.push([W / 2 + 0.45, -0.6, 0.35, 0.75]);
  [[0x2563eb, -0.95], [0xfacc15, -0.65], [0xdc2626, -0.35]].forEach(([c, z]) => K.cyl(g, 0.1, 0.1, 0.18, M(c, 0.9), W / 2 + 0.45, 0.95, z, 10));
}

const BUILDERS = { resto: addResto, post: addPost, boatshed: addBoatShed, greenhouse: addGreenhouse, tavern: addTavern };
export function addLandmark(K, km, b, g, cols) { const f = BUILDERS[b.landmark]; if (f) f(K, km, b, g, cols); }
