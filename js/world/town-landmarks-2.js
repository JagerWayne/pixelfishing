/* Landmark details (v12.1.0), part 2: Talia's glass greenhouse annex and the Sailors' Rest (wraparound deck, balcony,
   the hanging sign that swings: its pivot is g.userData.swing and is kept out of merging through g.userData.keep). */
import { THREE } from '../engine/three.js';
import { PixelTextureFactory } from '../render/texture-factory.js';
import { ModelKit } from '../render/model-kit.js';

const P = 0.16, H1 = 2.8;

/* Talia's: a glass-and-steel annex on the east side with a glass gable roof and planting inside, a potting bench west */
export function addGreenhouse(K, km, b, g, cols) {
  const M = K.M, W = b.w, D = b.d, steel = M(0xe5e7eb, 0.9), wood = M(0x9a7350, 0.9);
  const pane = M(0xcdeef5, 0.1, 0.1, { transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide });
  const box = (w, h, d, mat, x, y, z) => K.sharpBox(g, w, h, d, mat, x, y, z);
  const aw = 2.6, ax = W / 2 + aw / 2, wh = 2.1, rise = 0.9;
  box(aw, 0.45, D, km.concrete, ax, 0.23, 0);                                   // the low base wall
  [-1, 1].forEach(sx => [-1, 0, 1].forEach(sz => box(0.06, wh, 0.06, steel, ax + sx * (aw / 2 - 0.03), 0.45 + wh / 2, sz * (D / 2 - 0.03))));
  box(aw, 0.06, 0.06, steel, ax, 0.45 + wh, D / 2 - 0.03); box(aw, 0.06, 0.06, steel, ax, 0.45 + wh, -D / 2 + 0.03);
  box(0.06, 0.06, D, steel, ax + aw / 2 - 0.03, 0.45 + wh, 0);
  box(aw - 0.1, wh - 0.05, 0.02, pane, ax, 0.45 + wh / 2, D / 2 - 0.03);       // glass walls
  box(aw - 0.1, wh - 0.05, 0.02, pane, ax, 0.45 + wh / 2, -D / 2 + 0.03);
  box(0.02, wh - 0.05, D - 0.1, pane, ax + aw / 2 - 0.03, 0.45 + wh / 2, 0);
  const L = Math.hypot(aw / 2 + 0.08, rise), a = Math.atan2(rise, aw / 2 + 0.08), top = 0.45 + wh;
  [-1, 1].forEach(s => {                                                       // the gable glass roof, ridge front to back
    const r = box(L, 0.02, D + 0.1, pane, ax + s * (aw / 4 + 0.02), top + rise / 2, 0); r.rotation.z = -s * a;
    const e = box(L, 0.05, 0.05, steel, ax + s * (aw / 4 + 0.02), top + rise / 2, D / 2 + 0.02); e.rotation.z = -s * a;
  });
  box(0.06, 0.06, D + 0.1, steel, ax, top + rise, 0);
  const wedge = new THREE.Shape(); wedge.moveTo(-aw / 2, 0); wedge.lineTo(aw / 2, 0); wedge.lineTo(0, rise); wedge.closePath();
  const gab = new THREE.Mesh(new THREE.ShapeGeometry(wedge), pane); gab.position.set(ax, top, D / 2 - 0.03); g.add(gab);
  box(aw - 0.5, 0.6, 0.5, wood, ax, 0.75, -D / 2 + 0.45);                      // a planting bench inside, along the back
  [-0.8, -0.25, 0.3, 0.85].forEach((x, i) => K.sph(g, 0.22 + (i % 2) * 0.06, i % 2 ? km.leaf : km.leaf2, ax + x, 1.2, -D / 2 + 0.45, 8, 6));
  [[-0.6, 0.5], [0.5, 0.2], [0.1, 0.9]].forEach(([x, z], i) => { K.cyl(g, 0.16, 0.12, 0.3, M(0xc2410c, 0.9), ax + x, 0.6, z, 10); K.sph(g, 0.24, i % 2 ? km.leaf2 : km.leaf, ax + x, 0.95, z, 8, 6); });
  cols.push([ax, 0, aw / 2 + 0.05, D / 2 + 0.05]);
  const px = -(W / 2 + 0.45);                                                   // the potting bench outside the west wall
  box(0.7, 0.08, 1.4, wood, px, 0.85, 0.2); [-0.55, 0.55].forEach(z => [-0.25, 0.25].forEach(x => box(0.06, 0.85, 0.06, wood, px + x, 0.43, 0.2 + z)));
  [-0.4, 0.05, 0.45].forEach((z, i) => { K.cyl(g, 0.11, 0.08, 0.18, M(0xc2410c, 0.9), px, 0.98, 0.2 + z, 8); if (i !== 1) K.sph(g, 0.14, km.leaf2, px, 1.15, 0.2 + z, 7, 5); });
  cols.push([px, 0.2, 0.4, 0.75]);
}

/* the Sailors' Rest: the front deck wraps round the east side, a balcony over the door and a sign hanging from a bracket */
export function addTavern(K, km, b, g, cols) {
  const M = K.M, W = b.w, D = b.d, F = D / 2, clad = M(b.clad, 0.9), dark = M(0x3f2a1d, 0.9);
  const box = (w, h, d, mat, x, y, z) => K.sharpBox(g, w, h, d, mat, x, y, z);
  const sx = W / 2 + 0.8;                                                       // the east side deck, back to the rear corner
  box(1.6, 0.12, D - 0.3, clad, sx, 0.06, 0.15);
  box(0.06, 0.9, D - 0.3, clad, W / 2 + 1.57, 0.55, 0.15); box(1.6, 0.9, 0.06, clad, sx, 0.55, -F + 0.33);
  cols.push([W / 2 + 1.57, 0.15, 0.08, (D - 0.3) / 2], [sx, -F + 0.33, 0.8, 0.08]);
  for (let z = -F + 0.6; z < F; z += 0.55) box(0.05, 0.9, 0.05, dark, W / 2 + 1.57, 0.55, z);
  const by = P + H1 + 0.06, bz = F - D * 0.14, bd = 1.05, bw = W * 0.6;         // the balcony over the door
  box(bw, 0.12, bd, clad, 0, by, bz + bd / 2 - 0.2);
  box(bw, 0.06, 0.06, dark, 0, by + 0.95, bz + bd - 0.23);
  [-1, 1].forEach(s => box(0.06, 0.06, bd, dark, s * (bw / 2 - 0.03), by + 0.95, bz + bd / 2 - 0.2));
  for (let x = -bw / 2 + 0.05; x <= bw / 2; x += 0.3) box(0.04, 0.9, 0.04, dark, x, by + 0.5, bz + bd - 0.23);
  [-1, 1].forEach(s => { const br = box(0.08, 0.6, 0.08, dark, s * (bw / 2 - 0.1), by - 0.3, bz + bd - 0.5); br.rotation.x = 0.7; });
  // the hanging sign: an iron bracket off the west corner, the board swings on its pivot
  const hx = -W / 2 + 0.35, hy = P + 2.55, out = 1.0;
  box(0.06, 0.06, out, km.frame, hx, hy, F + out / 2);
  const st = box(0.05, 0.05, 0.75, km.frame, hx, hy - 0.28, F + 0.32); st.rotation.x = -0.75;
  const pivot = new THREE.Group(); pivot.position.set(hx, hy - 0.04, F + out - 0.15); g.add(pivot);
  [-0.22, 0.22].forEach(x => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 4), km.frame); c.position.set(0, -0.08, x); pivot.add(c); });
  const tex = PixelTextureFactory.makeSignTexture("🍺 SAILORS' REST", 256, 96);
  const face = new THREE.MeshBasicMaterial({ map: tex });                       // faces along the street (±X), it swings about the arm
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, 0.72), dark); board.position.y = -0.37; pivot.add(board);
  [-1, 1].forEach(s => { const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.36), face); pl.position.set(s * 0.027, -0.37, 0); pl.rotation.y = s * Math.PI / 2; pivot.add(pl); });
  ModelKit.mergeStatic(pivot, [], { bakeColor: true });                       // the sign is one or two meshes that swing together
  g.userData.swing = pivot;
  g.userData.keep = (g.userData.keep || []).concat(pivot);
}
