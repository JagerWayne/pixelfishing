/* WorldBuilder methods: the recycling stand and the cabin (v12.2.0, in town). */
import { THREE } from '../engine/three.js';
import { PixelTextureFactory } from '../render/texture-factory.js';
import { CABIN } from './layout.js';
import { townKitMaterials } from './town-kit.js';
import { ModelKit } from '../render/model-kit.js';
import { furnishCabin } from './cabin-rooms.js';
import { buildCabinOutside } from './cabin-outside.js';

export const wbCabinStatics = {
  /* ------------------------------------------------------------------
     RECYCLING STAND (v4.9.0): three coloured skips (flora, metal, other) under a post sign. Origin on the
     boardwalk rail at the stand's centre; the front faces +Z like every stand.
     ------------------------------------------------------------------ */
  buildRecycleStand(textures) {
    const g = new THREE.Group(), K = this.propKit(textures);
    const label = (name, css) => {
      const c = document.createElement('canvas'); c.width = 256; c.height = 96; const x = c.getContext('2d');
      x.fillStyle = '#f8fafc'; x.fillRect(0, 0, 256, 96); x.strokeStyle = css; x.lineWidth = 8; x.strokeRect(4, 4, 248, 88);
      x.fillStyle = css; x.font = 'bold 54px "Courier New", monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(name, 128, 52);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    };
    [['FLORA', 0x16a34a, '#15803d'], ['METAL', 0x2563eb, '#1d4ed8'], ['OTHER', 0xeab308, '#a16207']].forEach(([name, col, css], i) => {
      const x = (i - 1) * 1.5, body = K.M(col, 0.55, 0.15), dark = K.M(0x111827, 0.6);
      K.box(g, 1.4, 0.06, 0.9, body, x, 0.16, 0.75);
      K.box(g, 1.4, 0.82, 0.06, body, x, 0.57, 1.17);
      K.box(g, 1.4, 0.82, 0.06, body, x, 0.57, 0.33);
      [-0.67, 0.67].forEach(sx => K.box(g, 0.06, 0.82, 0.9, body, x + sx, 0.57, 0.75));
      K.box(g, 1.48, 0.06, 0.06, dark, x, 0.99, 1.18); K.box(g, 1.48, 0.06, 0.06, dark, x, 0.99, 0.32);
      [-0.69, 0.69].forEach(sx => K.box(g, 0.06, 0.06, 0.92, dark, x + sx, 0.99, 0.75));
      [-0.5, 0.5].forEach(sx => K.box(g, 0.14, 0.12, 0.96, dark, x + sx, 0.06, 0.75));
      const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.375), new THREE.MeshBasicMaterial({ map: label(name, css) })); plate.position.set(x, 0.6, 1.205); g.add(plate);
      // a heap in each skip
      if (i === 0) [[-0.35, 0, 0x15803d], [0.05, 0.1, 0x22c55e], [0.4, -0.05, 0x166534], [-0.1, -0.15, 0x4ade80]].forEach(([dx, dz, c]) => { const s = K.sph(g, 0.22, K.M(c, 0.8), x + dx, 0.98, 0.75 + dz, 7, 5); s.scale.y = 0.55; });
      else if (i === 1) [[-0.4, 0.05], [-0.05, -0.1], [0.3, 0.1]].forEach(([dx, dz], k) => { K.cyl(g, 0.09, 0.09, 0.2, K.M(0xcbd5e1, 0.35, 0.7), x + dx, 1.0, 0.75 + dz, 10).rotation.z = k * 0.6; });
      else [[-0.4, 0.0, 0x7c4a1e], [0.0, 0.1, 0x57534e], [0.38, -0.05, 0x16a34a]].forEach(([dx, dz, c]) => K.box(g, 0.3, 0.2, 0.22, K.M(c, 0.8), x + dx, 0.98, 0.75 + dz).rotation.y = dx * 2);
    });
    // v12.1.0 modern look: dark steel posts, a slatted timber screen behind the skips and a flat dark roof over them
    const frameM = K.M(0x1f2937, 0.9), slat = K.M(0xc8a27a, 0.9);
    [-2.25, 2.25].forEach(sx => K.sharpBox(g, 0.12, 3.0, 0.12, frameM, sx, 1.5, 0.2));
    for (let i = 0; i < 21; i++) K.sharpBox(g, 0.14, 1.75, 0.05, slat, -2.0 + i * 0.2, 1.05, 0.12 - (i % 2) * 0.04);
    K.sharpBox(g, 4.4, 0.08, 0.1, frameM, 0, 1.96, 0.12); K.sharpBox(g, 4.4, 0.08, 0.1, frameM, 0, 0.16, 0.12);
    K.box(g, 4.7, 0.62, 0.08, new THREE.MeshBasicMaterial({ map: PixelTextureFactory.makeSignTexture('♻️ RECYCLING', 512, 96) }), 0, 2.55, 0.26);
    K.sharpBox(g, 4.84, 0.76, 0.05, frameM, 0, 2.55, 0.2);
    const roof = K.sharpBox(g, 4.9, 0.1, 1.6, K.M(0x2b3442, 0.9), 0, 3.02, 0.7); roof.rotation.x = 0.06;
    K.sharpBox(g, 4.92, 0.14, 0.04, K.M(0x15803d, 0.9), 0, 2.94, 1.5);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return g;
  },

  /* ------------------------------------------------------------------
     CABIN (v12.2.0): a modern single-storey beach house on your plot in town. Local origin: the centre of the back
     wall (north, toward the sea) at floor level; x from -W/2 to W/2, z from 0 (back) to D (front, the door, +Z).
     The walls are fade groups (userData.fadeWalls: { grp, side }) and the roof (userData.roof) fades while you are
     inside, so the chase camera can see in from any side (updateCabinFade). The furniture is cabin-rooms.js, the
     deck and the garden cabin-outside.js. The gallery and the aquarium are built by buildWorld on the back wall.
     ------------------------------------------------------------------ */
  buildCabin(textures) {
    const g = new THREE.Group(), K = this.propKit(textures), C = CABIN, km = townKitMaterials(K);
    const W = C.w, D = C.d, H = 2.8, T = 0.14, hw = W / 2, dx = C.doorX, dw = C.doorW / 2;
    const box = (p, w, h, d, m, x, y, z) => K.sharpBox(p, w, h, d, m, x, y, z);
    const roof = new THREE.Group(); g.add(roof); g.userData.roof = roof; g.userData.fadeWalls = [];
    const wall = side => { const grp = new THREE.Group(); g.add(grp); g.userData.fadeWalls.push({ grp, side }); return grp; };
    // each fade group has its own materials (fading changes their opacity)
    const mats = () => ({ render: K.M(0xf8fafc, 0.9), clad: K.M(0xd9b48a, 0.9), slat: K.M(0x9c7b58, 0.9), frame: K.M(0x1f2937, 0.9),
      glass: Object.assign(K.M(0x8fbfcf, 0.12, 0.25, { emissive: new THREE.Color(0xffc56e), emissiveIntensity: 0 }), { userData: { glow: 'window' } }) });
    const win = (p, m, w, h, x, y, z, side) => {   // four frame bars round a pane; side 0: front or back wall, ±1: a side wall
      const bar = (bw, bh, ox, oy) => side ? box(p, 0.08, bh, bw, m.frame, x, y + oy, z + ox) : box(p, bw, bh, 0.08, m.frame, x + ox, y + oy, z);
      bar(w + 0.12, 0.06, 0, h / 2 + 0.03); bar(w + 0.12, 0.06, 0, -h / 2 - 0.03); bar(0.06, h, -w / 2 - 0.03, 0); bar(0.06, h, w / 2 + 0.03, 0);
      if (side) box(p, 0.03, h, w, m.glass, x, y, z); else box(p, w, h, 0.03, m.glass, x, y, z);
    };
    box(g, W + 0.3, 0.1, D + 0.3, km.concrete, 0, -0.03, D / 2);                          // plinth
    box(g, W - 0.1, 0.04, D - 0.1, K.M(0xc89f6e, 0.9), 0, 0.02, D / 2);                 // oak floor
    for (let x = -hw + 0.5; x < hw; x += 0.5) box(g, 0.01, 0.045, D - 0.1, K.M(0xa57f52, 0.9), x, 0.02, D / 2);
    { // back wall: render with a glass band along the top (the gallery and the aquarium stand in front of it)
      const b = wall('back'), m = mats();
      box(b, W, 2.4, T, m.render, 0, 1.2, -T / 2); box(b, W, 0.12, T, m.render, 0, H - 0.06, -T / 2);
      for (let x = -hw + 0.1; x < hw - 0.1; x += 1.1) box(b, 0.08, 0.28, T + 0.02, m.frame, x, 2.54, -T / 2);
      box(b, W - 0.1, 0.28, 0.03, m.glass, 0, 2.54, -T / 2);
      box(b, W + 0.02, 1.0, 0.04, m.clad, 0, 0.5, -T - 0.02);                            // timber skirt outside
    }
    [-1, 1].forEach(sd => { // side walls: render inside, timber slats outside, one tall window each
      const b = wall(sd < 0 ? 'west' : 'east'), m = mats(), x = sd * (hw - T / 2);
      box(b, T, H, D + T, m.render, x, H / 2, D / 2 - T / 2);
      box(b, 0.04, H - 0.1, D, m.clad, x + sd * 0.09, H / 2, D / 2);
      for (let z = 0.3; z < D; z += 0.32) if (Math.abs(z - 4.0) > 0.45) box(b, 0.03, H - 0.1, 0.035, m.slat, x + sd * 0.12, H / 2, z);
      win(b, m, 0.7, 1.6, x + sd * 0.16, 1.35, 4.0, sd);
    });
    { // front wall: the doorway (open), a wide window by the sofa, the bedroom window, a canopy, lamp and sign
      const f = wall('front'), m = mats(), z = D + T / 2, piece = (x0, x1, y0, y1) => box(f, x1 - x0, y1 - y0, T, m.render, (x0 + x1) / 2, (y0 + y1) / 2, z);
      piece(-hw, dx - dw, 0, H); piece(dx + dw, -1.75, 0, H); piece(1.75, 3.2, 0, H); piece(4.9, hw, 0, H);
      piece(dx - dw, dx + dw, 2.25, H); piece(-1.75, 1.75, 0, 0.5); piece(-1.75, 1.75, 2.35, H); piece(3.2, 4.9, 0, 1.0); piece(3.2, 4.9, 2.2, H);
      win(f, m, 3.5, 1.85, 0, 1.42, z, 0); win(f, m, 1.7, 1.2, 4.05, 1.6, z, 0);
      box(f, 0.08, 2.3, T + 0.04, m.frame, dx - dw, 1.13, z); box(f, 0.08, 2.3, T + 0.04, m.frame, dx + dw, 1.13, z); box(f, C.doorW + 0.16, 0.08, T + 0.04, m.frame, dx, 2.27, z);
      { const a = 1.3; box(f, C.doorW - 0.1, 2.1, 0.05, K.M(0x7c5a3a, 0.9), dx + dw - 0.6 * Math.cos(a), 1.08, D - 0.6 * Math.sin(a)).rotation.y = Math.PI - a; }   // the door, open inward
      box(f, 2.0, 0.08, 0.9, m.frame, dx, 2.5, D + 0.45);
      box(f, 0.16, 0.24, 0.12, Object.assign(K.M(0xfff1c2, 0.4, 0, { emissive: new THREE.Color(0xfbbf24), emissiveIntensity: 0 }), { userData: { glow: 'lamp' } }), dx + dw + 0.3, 1.95, D + 0.22);
      box(f, W + 0.02, 0.14, 0.05, K.M(0x0e7490, 0.9), 0, H - 0.1, D + T + 0.01);       // teal accent fascia
      K.box(f, 1.3, 0.3, 0.05, new THREE.MeshBasicMaterial({ map: PixelTextureFactory.makeSignTexture('🏠 HOME', 256, 64) }), -hw + 1.1, 1.95, D + T + 0.03);
    }
    { // flat roof with a deep overhang over the sea deck, on two posts
      const m = mats();
      box(roof, W + 0.6, 0.2, D + 2.4, km.roof, 0, H + 0.1, D / 2 - 0.8);
      box(roof, W + 0.64, 0.22, 0.06, m.render, 0, H + 0.1, D / 2 - 0.8 + (D + 2.4) / 2);
      box(roof, W + 0.64, 0.22, 0.06, m.render, 0, H + 0.1, D / 2 - 0.8 - (D + 2.4) / 2);
      [-4.3, 4.3].forEach(x => box(roof, 0.12, H, 0.12, m.frame, x, H / 2, -1.85));
      [-0.55, 0.55].forEach(x => { const pnl = box(roof, 0.9, 0.05, 1.3, km.solar, x + 2.6, H + 0.38, D / 2 - 0.2); pnl.rotation.x = -0.3; });
    }
    furnishCabin(K, km, g, C); buildCabinOutside(K, km, g, C);
    // each fade group is merged on its own (its baked material stays its own, so it can fade), then made fadeable
    [roof, ...g.userData.fadeWalls.map(w => w.grp)].forEach(grp => { ModelKit.mergeStatic(grp, [], { bakeColor: true }); grp.traverse(o => { if (o.isMesh) o.material.transparent = true; }); });
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return g;
  },
};
