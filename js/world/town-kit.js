/* The modern coastal building kit (v12.0.0): white render and timber cladding, dark metal roofs (flat, mono-pitch or
   gable), framed glazing that glows at night, a door with a canopy, mat, wall lamp and sign, plus extras by name. */
import { THREE } from '../engine/three.js';
import { PixelTextureFactory } from '../render/texture-factory.js';

/* materials shared by the whole town; window glass and wall lamps carry userData.glow so the night switch finds them */
export function townKitMaterials(K) {
  const M = K.M;
  const m = {
    glass: M(0x8fbfcf, 0.12, 0.25, { emissive: new THREE.Color(0xffc56e), emissiveIntensity: 0 }),
    lamp: M(0xfff1c2, 0.4, 0, { emissive: new THREE.Color(0xfbbf24), emissiveIntensity: 0 }),
    frame: M(0x1f2937, 0.9), roof: M(0x2b3442, 0.45, 0.35), concrete: M(0xa8a29e, 0.9), mat: M(0x3f3f46, 0.9),
    solar: M(0x1e3a5f, 0.25, 0.55), leaf: M(0x2f7a32, 0.9), leaf2: M(0x3f9440, 0.9), trunk: M(0x6b4a2e, 0.9), white: M(0xf8fafc, 0.9)
  };
  m.glass.userData.glow = 'window'; m.lamp.userData.glow = 'lamp';
  return m;
}

/* a triangular prism: the wall infill under a sloped roof. high: 'back' (mono-pitch) or 'mid' (gable); extruded along x */
function wedge(w, d, rise, high) {
  const s = new THREE.Shape();
  s.moveTo(-d / 2, 0); s.lineTo(d / 2, 0); s.lineTo(high === 'mid' ? 0 : d / 2, rise); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false });
  g.rotateY(Math.PI / 2); g.translate(-w / 2, 0, 0);
  return g;
}

/* one building, front on +Z, origin at the ground centre. Returns { g, cols } (cols: extra solid parts, local [x, z, hw, hd]) */
export function buildModernBuilding(K, km, b, signText) {
  const M = K.M, g = new THREE.Group(), cols = [], ex = new Set(b.extras || []);
  const W = b.w, D = b.d, H1 = 2.8, H2 = 2.3, P = 0.16, F = D / 2;
  // every matte surface shares one roughness, so a building bakes into a handful of meshes (matte, roof, glass, lamp, sign)
  const wallM = M(b.wall, 0.9), cladM = M(b.clad, 0.9), slatM = M(new THREE.Color(b.clad).multiplyScalar(0.72).getHex(), 0.9), accM = M(b.accent, 0.9);
  const slats = (w, h, x, y, z, side = 0) => {   // vertical timber slats over a clad panel
    const n = Math.max(2, Math.round((side ? D : w) / 0.32));
    for (let i = 1; i < n; i++) { const t = -0.5 + i / n; side ? box(0.02, h, 0.035, slatM, x + side * 0.015, y, z + t * D) : box(0.035, h, 0.02, slatM, x + t * w, y, z); }
  };
  const box = (w, h, d, mat, x, y, z) => K.sharpBox(g, w, h, d, mat, x, y, z);
  const win = (w, h, x, y, z, side = 0) => {   // a framed pane on the front (side 0), left (-1) or right (+1) wall
    const fr = side ? box(0.05, h + 0.12, w + 0.12, km.frame, x, y, z) : box(w + 0.12, h + 0.12, 0.05, km.frame, x, y, z);
    const gl = side ? box(0.04, h, w, km.glass, x + side * 0.03, y, z) : box(w, h, 0.04, km.glass, x, y, z + 0.03);
    return [fr, gl];
  };
  box(W + 0.24, P, D + 0.24, km.concrete, 0, P / 2, 0);                       // plinth
  box(W, H1, D, wallM, 0, P + H1 / 2, 0);                                     // ground floor in white render
  const cw = Math.min(1.5, W * 0.3);                                           // timber cladding: left of the front and the left side
  box(cw, H1 - 0.1, 0.06, cladM, -W / 2 + cw / 2, P + H1 / 2, F + 0.03); slats(cw, H1 - 0.1, -W / 2 + cw / 2, P + H1 / 2, F + 0.065);
  box(0.06, H1 - 0.1, D, cladM, -W / 2 - 0.03, P + H1 / 2, 0); slats(0, H1 - 0.1, -W / 2 - 0.065, P + H1 / 2, 0, -1);
  const dx = b.doorX || 0;
  // the front: a glass shopfront, or windows either side of the door
  if (ex.has('glass')) {
    const x0 = -W / 2 + cw + 0.15, x1 = W / 2 - 0.25;
    [[x0, dx - 0.65], [dx + 0.65, x1]].forEach(([a, c]) => { if (c - a > 0.3) win(c - a, 1.9, (a + c) / 2, P + 1.25, F + 0.02); });
  } else {
    const rw = Math.min(1.6, W / 2 - 0.9 - Math.abs(dx));
    if (rw > 0.4) win(rw, 1.2, dx + 0.65 + 0.35 + rw / 2, P + 1.5, F + 0.02);
    win(0.5, 1.6, -W / 2 + cw / 2, P + 1.35, F + 0.06);
  }
  [-1, 1].forEach(s => win(Math.min(1.2, D * 0.4), 1.0, s * (W / 2 + 0.02), P + 1.55, -D * 0.1, s));
  win(Math.min(1.4, W * 0.3), 1.0, W * 0.2, P + 1.55, -F - 0.1);
  // the door with its canopy, mat, wall lamp and the sign above
  box(0.95, 2.05, 0.06, M(new THREE.Color(b.clad).multiplyScalar(0.55).getHex(), 0.9), dx, P + 1.03, F + 0.04);
  box(0.06, 0.5, 0.04, km.frame, dx + 0.32, P + 1.05, F + 0.08);
  box(1.6, 0.08, 0.75, km.roof, dx, P + 2.35, F + 0.37);
  box(1.1, 0.02, 0.6, km.mat, dx, 0.012, F + 0.42);
  box(0.16, 0.24, 0.12, km.lamp, dx + 0.75, P + 2.0, F + 0.08);
  if (signText) {
    const sw = Math.min(W * 0.62, 3.4);
    g.userData.sign = K.box(g, sw, sw * 0.17, 0.05, new THREE.MeshBasicMaterial({ map: PixelTextureFactory.makeSignTexture(signText, 384, 64) }), dx, P + 2.62, F + 0.07);
  }
  box(W + 0.02, 0.14, 0.04, accM, 0, P + H1 - 0.08, F + 0.03);                // accent fascia
  let top = P + H1;
  if (b.floors === 2) {                                                        // a timber-clad upper floor with a window band
    box(W + 0.1, 0.12, D + 0.1, km.concrete, 0, top + 0.06, 0); top += 0.12;
    box(W * 0.92, H2, D * 0.86, cladM, 0, top + H2 / 2, -D * 0.07);
    slats(W * 0.92, H2, 0, top + H2 / 2, F - D * 0.14 + 0.01);
    win(W * 0.55, 1.0, 0, top + 1.2, F - D * 0.14 + 0.02);
    [-1, 1].forEach(s => win(0.8, 0.8, s * (W * 0.46 + 0.02), top + 1.2, -D * 0.07, s));
    top += H2;
  }
  const ud = b.floors === 2 ? D * 0.86 : D, uz = b.floors === 2 ? -D * 0.07 : 0, uw = b.floors === 2 ? W * 0.92 : W;
  if (b.roof === 'flat') {
    box(uw + 0.3, 0.16, ud + 0.3, km.roof, 0, top + 0.08, uz);
    [[0, ud / 2 + 0.1, uw + 0.3, 0.08], [0, -ud / 2 - 0.1, uw + 0.3, 0.08], [uw / 2 + 0.1, 0, 0.08, ud + 0.3], [-uw / 2 - 0.1, 0, 0.08, ud + 0.3]]
      .forEach(([x, z, w, d]) => box(w, 0.32, d, wallM, x, top + 0.24, uz + z));
    if (ex.has('solar')) [-0.55, 0.55].forEach(x => { const p = box(0.9, 0.05, 1.3, km.solar, x * uw * 0.5, top + 0.45, uz - ud * 0.1); p.rotation.x = -0.35; });
  } else if (b.roof === 'mono') {
    const rise = 0.75, L = Math.hypot(ud + 0.6, rise), a = Math.atan2(rise, ud + 0.6);
    const fill = new THREE.Mesh(wedge(uw, ud, rise, 'back'), wallM); fill.position.set(0, top, uz); g.add(fill);
    const r = box(uw + 0.5, 0.14, L, km.roof, 0, top + rise / 2 + 0.08, uz); r.rotation.x = a;
  } else {                                                                     // gable, ridge along the facade
    const rise = 1.2, h = ud / 2 + 0.35, L = Math.hypot(h, rise), a = Math.atan2(rise, h);
    const fill = new THREE.Mesh(wedge(uw, ud, rise, 'mid'), wallM); fill.position.set(0, top, uz); g.add(fill);
    [-1, 1].forEach(s => { const r = box(uw + 0.5, 0.14, L, km.roof, 0, top + rise / 2 + 0.06, uz + s * h / 2); r.rotation.x = s * a; });
  }
  // extras
  if (ex.has('awning')) { const aw = box(W - cw - 0.6, 0.05, 1.2, accM, cw / 2 + 0.1, P + 2.55, F + 0.6); aw.rotation.x = 0.22; }
  if (ex.has('planters')) [-1, 1].forEach(s => {
    const x = s * (W / 2 - 0.35); box(0.5, 0.42, 0.5, km.concrete, x, 0.21, F + 0.4);
    K.sph(g, 0.3, s < 0 ? km.leaf : km.leaf2, x, 0.62, F + 0.4, 8, 6); cols.push([x, F + 0.4, 0.3, 0.3]);
  });
  if (ex.has('clock')) {
    const c = K.cyl(g, 0.42, 0.42, 0.06, km.white, 0, P + H1 + 0.12 + 1.35, F - D * 0.14 + 0.05, 20); c.rotation.x = Math.PI / 2;
    box(0.05, 0.3, 0.02, km.frame, 0, P + H1 + 0.12 + 1.45, F - D * 0.14 + 0.1); box(0.22, 0.05, 0.02, km.frame, 0.08, P + H1 + 0.12 + 1.35, F - D * 0.14 + 0.1);
  }
  if (ex.has('shedDoor')) {   // the boat shed's wide door, ribbed, beside the person door
    const sx = W / 4 + 0.15; box(2.3, 2.4, 0.07, M(0x94a3b8, 0.9), sx, P + 1.2, F + 0.04);
    for (let i = 0; i < 5; i++) box(2.3, 0.04, 0.09, km.frame, sx, P + 0.3 + i * 0.45, F + 0.05);
  }
  if (ex.has('deck')) {       // a timber deck across the front, with rails at its ends
    box(W + 1.2, 0.12, 1.7, cladM, 0, 0.06, F + 0.85);
    [-1, 1].forEach(s => { box(0.06, 0.9, 1.7, cladM, s * (W / 2 + 0.57), 0.55, F + 0.85); cols.push([s * (W / 2 + 0.57), F + 0.85, 0.08, 0.85]); });
  }
  if (ex.has('barrels')) [-1, 1].forEach(s => {
    const x = s * (W / 2 + 0.25); K.cyl(g, 0.28, 0.28, 0.62, M(0x7c2d12, 0.9), x, 0.43, F + 1.95, 10); cols.push([x, F + 1.95, 0.3, 0.3]);
  });
  return { g, cols };
}

/* a round-crowned street tree (two or three leafy spheres on a trunk) */
export function buildRoundTree(K, km, seed) {
  const g = new THREE.Group(), h = 2.2 + (seed % 3) * 0.35;
  K.cyl(g, 0.09, 0.14, h, km.trunk, 0, h / 2, 0, 7);
  [[0, h + 0.5, 0, 0.95], [0.45, h + 0.15, 0.2, 0.7], [-0.4, h + 0.25, -0.25, 0.72]].slice(0, 2 + (seed % 2)).forEach(([x, y, z, r], i) =>
    K.sph(g, r, i % 2 ? km.leaf2 : km.leaf, x, y, z, 9, 7));
  return g;
}
