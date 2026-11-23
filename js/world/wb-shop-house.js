/* WorldBuilder method: buildShopHouse, the boardwalk shop buildings. */
import { THREE } from '../engine/three.js';

export const wbShopHouseStatics = {
  /* A small harbour shop house in the town's modern style (v12.1.0): a wide serving hatch with a counter, a mono-pitch
     roof, an awning, a painted sign and a shopkeeper, plus props for its trade. Front faces +Z (rotate it to face the sea). */
  buildShopHouse(kind, sh, textures) {
    const g = new THREE.Group();
    const K = this.propKit(textures);
    const W = sh.w, D = sh.d, H = 2.4;
    const pal = {
      boatyard: { wall: 0xe2e8f0, trim: 0x1e3a8a, roof: 0x1d4ed8, stripeA: '#1d4ed8', stripeB: '#f8fafc', cap: 0x1e3a8a, shirt: 0xf97316 },
      fish:     { wall: 0xf8fafc, trim: 0x0369a1, roof: 0x0c4a6e, stripeA: '#0284c7', stripeB: '#f8fafc', cap: 0xf8fafc, shirt: 0x0ea5e9 },
      dive:     { wall: 0x5eead4, trim: 0x0f766e, roof: 0x115e59, stripeA: '#facc15', stripeB: '#111827', cap: 0x111827, shirt: 0xfacc15 },
      aquashop: { wall: 0xcffafe, trim: 0x0e7490, roof: 0x155e75, stripeA: '#22d3ee', stripeB: '#ecfeff', cap: 0x0e7490, shirt: 0x22d3ee }
    }[kind];
    const wallM = K.M(0xf8fafc, 0.9), trimM = K.M(pal.trim, 0.9), frameM = K.M(0x1f2937, 0.9), cladM = K.M(0xd9b48a, 0.9), slatM = K.M(0x9c7b58, 0.9);
    const roofM = K.M(0x2b3442, 0.9), box = (w, h, d, m, x, y, z) => K.sharpBox(g, w, h, d, m, x, y, z);
    const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
    // v12.1.0 modern kiosk: a concrete plinth, white render, timber-slatted sides, a dark mono-pitch roof, a glass corner
    // window and a wall lamp that glow at night (userData.glow, switched by updateTownProps); the hatch, counter,
    // shopkeeper and sign keep their places so the stand views and the shop actions do not move
    const glass = K.M(0x8fbfcf, 0.12, 0.25, { emissive: new THREE.Color(0xffc56e), emissiveIntensity: 0 }); glass.userData.glow = 'window';
    const lampM = K.M(0xfff1c2, 0.4, 0, { emissive: new THREE.Color(0xfbbf24), emissiveIntensity: 0 }); lampM.userData.glow = 'lamp';
    box(W + 0.24, 0.12, D + 0.24, K.M(0xa8a29e, 0.9), 0, 0.06, 0);
    box(W, H, 0.14, wallM, 0, H / 2, -D / 2 + 0.07);
    [-1, 1].forEach(sd => {
      box(0.14, H, D, wallM, sd * (W / 2 - 0.07), H / 2, 0);
      box(0.05, H - 0.2, D - 0.1, cladM, sd * (W / 2 + 0.02), H / 2 + 0.05, 0);   // timber cladding and slats on the sides
      for (let z = -D / 2 + 0.3; z < D / 2 - 0.1; z += 0.3) box(0.03, H - 0.2, 0.035, slatM, sd * (W / 2 + 0.055), H / 2 + 0.05, z);
    });
    const hatchW = W * 0.62, pierW = (W - hatchW) / 2;
    box(W, 0.95, 0.14, wallM, 0, 0.475, D / 2 - 0.07);
    box(W, 0.42, 0.14, wallM, 0, H - 0.21, D / 2 - 0.07);
    [-1, 1].forEach(sd => box(pierW, H - 1.37, 0.14, wallM, sd * (W / 2 - pierW / 2), 0.95 + (H - 1.37) / 2, D / 2 - 0.07));
    // dark frames: the corners, the hatch, the glass corner window on the right pier, a wall lamp on the left
    [-1, 1].forEach(sx => box(0.1, H, 0.1, frameM, sx * (W / 2 - 0.03), H / 2, D / 2 - 0.03));
    box(hatchW + 0.1, 0.07, 0.2, frameM, 0, 1.98, D / 2 - 0.05);
    [-1, 1].forEach(sd => box(0.07, 1.03, 0.2, frameM, sd * (hatchW / 2 + 0.02), 1.47, D / 2 - 0.05));
    const gx = W / 2 - pierW / 2;
    box(pierW - 0.12, 0.98, 0.05, frameM, gx, 1.5, D / 2 + 0.01); box(pierW - 0.22, 0.86, 0.04, glass, gx, 1.5, D / 2 + 0.035);
    box(0.05, 0.98, 0.7, frameM, W / 2 + 0.085, 1.5, D / 2 - 0.45); box(0.04, 0.86, 0.6, glass, W / 2 + 0.11, 1.5, D / 2 - 0.45);
    box(0.14, 0.2, 0.1, lampM, -(W / 2 - pierW / 2), 1.75, D / 2 + 0.04);
    box(W + 0.05, 0.12, 0.18, trimM, 0, H - 0.1, D / 2 - 0.02);                  // accent fascia
    // counter shelf and goods shelves inside
    K.box(g, hatchW + 0.2, 0.07, 0.5, K.lightWood, 0, 1.0, D / 2 + 0.1);
    [1.25, 1.75].forEach(y => K.box(g, W - 0.4, 0.05, 0.3, K.darkWood, 0, y, -D / 2 + 0.3));
    { // mono-pitch roof, low at the front, rising to the back, with the wall infill under it
      const rise = 0.6, L = Math.hypot(D + 0.6, rise), a = Math.atan2(rise, D + 0.6);
      const s2 = new THREE.Shape(); s2.moveTo(-D / 2, 0); s2.lineTo(D / 2, 0); s2.lineTo(D / 2, rise); s2.closePath();
      const fg = new THREE.ExtrudeGeometry(s2, { depth: W, bevelEnabled: false }); fg.rotateY(Math.PI / 2); fg.translate(-W / 2, 0, 0);
      const fill = new THREE.Mesh(fg, wallM); fill.position.y = H; g.add(fill);
      const r = box(W + 0.5, 0.12, L, roofM, 0, H + rise / 2 + 0.07, 0); r.rotation.x = a;
    }
    // a flat awning in the shop's colours over the hatch
    const stripeTex = canvasTex(64, 16, (x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? pal.stripeB : pal.stripeA; x.fillRect(i * 8, 0, 8, h); } });
    const awning = new THREE.Mesh(new THREE.BoxGeometry(hatchW + 0.5, 0.05, 0.9), new THREE.MeshStandardMaterial({ map: stripeTex, roughness: 0.9, side: THREE.DoubleSide }));
    awning.position.set(0, 2.14, D / 2 + 0.42); awning.rotation.x = 0.12; g.add(awning);
    box(hatchW + 0.5, 0.1, 0.03, trimM, 0, 2.06, D / 2 + 0.87);
    // the sign on the front eave
    const signTex = canvasTex(256, 64, (x, w, h) => {
      x.fillStyle = '#0b1220'; x.fillRect(0, 0, w, h);
      x.strokeStyle = sh.color; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6);
      x.fillStyle = '#fef3c7'; x.font = 'bold 34px "Courier New", monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(sh.name, w / 2, h / 2 + 2);
    });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(2.6, W * 0.8), 0.62), new THREE.MeshBasicMaterial({ map: signTex }));
    sign.position.set(0, H + 0.42, D / 2 + 0.36); sign.rotation.x = -0.12; g.add(sign);
    box(Math.min(2.6, W * 0.8) + 0.12, 0.72, 0.05, frameM, 0, H + 0.42, D / 2 + 0.33).rotation.x = -0.12;
    // shopkeeper behind the counter
    {
      const kp = new THREE.Group(), skin = K.M(0xf5c9a0, 0.75);
      K.cyl(kp, 0.24, 0.28, 0.6, K.M(pal.shirt, 0.85), 0, 0.3, 0, 10);
      K.sph(kp, 0.19, skin, 0, 0.78, 0, 12, 10);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), K.M(pal.cap, 0.8)); cap.position.set(0, 0.84, 0); kp.add(cap);
      [-0.07, 0.07].forEach(x => K.sph(kp, 0.024, new THREE.MeshBasicMaterial({ color: 0x0f172a }), x, 0.8, 0.17, 6, 5));
      [-0.27, 0.27].forEach(x => { const arm = K.cyl(kp, 0.065, 0.06, 0.4, K.M(pal.shirt, 0.85), x, 0.32, 0.18, 8); arm.rotation.x = 1.0; });
      kp.position.set(0.3, 0.45, D / 2 - 0.55); g.add(kp);
    }
    const iron = K.iron;
    if (kind === 'boatyard') {
      // fuel pump on the right, an outboard on a stand on the left, life rings and crossed oars
      const pump = new THREE.Group();
      K.box(pump, 0.46, 1.2, 0.34, K.M(0xdc2626, 0.5), 0, 0.6, 0);
      K.box(pump, 0.34, 0.24, 0.02, K.M(0x0b1220, 0.2, 0, { emissive: new THREE.Color(0x22c55e), emissiveIntensity: 0.6 }), 0, 0.95, 0.18);
      K.box(pump, 0.5, 0.1, 0.38, K.M(0xf8fafc, 0.5), 0, 1.25, 0);
      const hose = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 6, 14, Math.PI * 1.5), K.M(0x111827, 0.6)); hose.position.set(0.24, 0.6, 0.05); hose.rotation.y = Math.PI / 2; pump.add(hose);
      K.box(pump, 0.08, 0.2, 0.1, K.M(0x111827, 0.5), 0.27, 0.78, 0.12);
      pump.position.set(W / 2 + 0.45, 0.06, D / 2 - 0.2); g.add(pump);
      const stand = new THREE.Group();
      K.box(stand, 0.5, 0.06, 0.5, K.darkWood, 0, 0.75, 0); [-0.2, 0.2].forEach(x => [-0.2, 0.2].forEach(z => K.box(stand, 0.05, 0.75, 0.05, K.darkWood, x, 0.375, z)));
      K.box(stand, 0.36, 0.42, 0.46, K.M(0x111827, 0.4, 0.2), 0, 1.0, 0); K.box(stand, 0.37, 0.05, 0.47, K.M(0xdc2626, 0.5), 0, 0.9, 0);
      K.box(stand, 0.12, 0.7, 0.16, K.M(0x94a3b8, 0.4, 0.3), 0, 0.55, 0.12);
      stand.position.set(-W / 2 - 0.5, 0.06, D / 2 - 0.25); g.add(stand);
      [-1, 1].forEach(sd => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.065, 8, 16), K.M(0xf97316, 0.5)); r.position.set(sd * (W / 2 - pierW / 2), 1.5, D / 2 + 0.02); g.add(r); });
      [-0.5, 0.5].forEach(r => { const oar = K.cyl(g, 0.025, 0.025, 2.0, K.lightWood, 0, H + 0.42, D / 2 + 0.42, 6); oar.rotation.z = Math.PI / 2 + r; oar.position.y = H + 0.9; });
    } else if (kind === 'dive') {
      // a rack of yellow tanks, fins and a diver-down flag
      const rack = new THREE.Group();
      K.box(rack, 0.9, 0.06, 0.32, iron, 0, 1.05, 0); K.box(rack, 0.9, 0.06, 0.32, iron, 0, 0.3, 0);
      for (let i = 0; i < 3; i++) { K.cyl(rack, 0.1, 0.1, 0.8, K.M(0xfacc15, 0.4, 0.3), -0.3 + i * 0.3, 0.62, 0.02, 12); K.cyl(rack, 0.04, 0.04, 0.12, K.M(0x111827, 0.4, 0.5), -0.3 + i * 0.3, 1.08, 0.02, 8); }
      rack.position.set(W / 2 + 0.47, 0.06, D / 2 - 0.25); g.add(rack);
      [0, 0.22].forEach((dx, i) => { const fin = K.box(g, 0.2, 0.55, 0.03, K.M(i ? 0x2563eb : 0xf97316, 0.5), -W / 2 - 0.35 + dx, 0.36, D / 2 + 0.1); fin.rotation.z = 0.12 - i * 0.2; });
      K.cyl(g, 0.03, 0.03, 2.6, iron, -W / 2 - 0.55, 1.36, D / 2 - 0.2, 6);
      const flagTex = canvasTex(64, 44, (x, w, h) => { x.fillStyle = '#dc2626'; x.fillRect(0, 0, w, h); x.strokeStyle = '#f8fafc'; x.lineWidth = 9; x.beginPath(); x.moveTo(0, 0); x.lineTo(w, h); x.stroke(); });
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.42), new THREE.MeshStandardMaterial({ map: flagTex, side: THREE.DoubleSide, roughness: 0.8 }));
      flag.position.set(-W / 2 - 0.24, 2.4, D / 2 - 0.2); g.add(flag);
      // a mask and a speargun on the counter
      K.box(g, 0.24, 0.12, 0.08, K.M(0x111827, 0.4), -0.45, 1.1, D / 2 + 0.15); K.box(g, 0.18, 0.08, 0.02, K.M(0x7dd3fc, 0.1, 0.1, { transparent: true, opacity: 0.6 }), -0.45, 1.11, D / 2 + 0.2);
      const gun = K.cyl(g, 0.02, 0.02, 0.9, K.M(0x334155, 0.4, 0.5), 0.6, 1.07, D / 2 + 0.12, 6); gun.rotation.z = Math.PI / 2;
    } else if (kind === 'fish') {
      // an iced display bench of fish in front of the counter, a hanging scale, a crate stack and a chalk board
      const bench = new THREE.Group();
      K.box(bench, hatchW + 0.2, 0.75, 0.6, K.lightWood, 0, 0.375, 0);
      const ice = K.box(bench, hatchW + 0.1, 0.1, 0.56, K.M(0xe0f2fe, 0.3, 0.05), 0, 0.8, 0); ice.rotation.x = -0.25;
      const cols = [[0x38bdf8, 0xf97316], [0x94a3b8, 0x1e3a8a], [0xfacc15, 0xdc2626], [0xf472b6, 0x7c3aed], [0x22c55e, 0x166534]];
      for (let i = 0; i < 5; i++) for (let r = 0; r < 2; r++) {
        const f = this.miniFish(cols[(i + r) % 5][0], cols[(i + r) % 5][1], K); f.scale.setScalar(0.55);
        f.position.set(-hatchW / 2 + 0.2 + i * (hatchW - 0.2) / 4, 0.9 + r * 0.06, -0.12 + r * 0.22); f.rotation.set(-0.25, 0.3 * (r ? 1 : -1), 0); bench.add(f);
      }
      bench.position.set(0, 0.06, D / 2 + 0.55); g.add(bench);
      K.cyl(g, 0.012, 0.012, 0.35, iron, W / 2 - pierW / 2, 1.82, D / 2 + 0.2, 4);
      K.cyl(g, 0.14, 0.14, 0.03, K.brass, W / 2 - pierW / 2, 1.6, D / 2 + 0.2, 12);
      [[0, 0], [0.03, 0.36]].forEach(([dx, dy], i) => K.box(g, 0.44, 0.34, 0.4, K.M(i % 2 ? 0x0e7490 : 0xb45309, 0.8), W / 2 + 0.3 + dx, 0.23 + dy, D / 2 - 0.4));
      const board = canvasTex(96, 72, (x, w, h) => { x.fillStyle = '#1f2a24'; x.fillRect(0, 0, w, h); x.fillStyle = '#e5e7eb'; x.font = 'bold 13px monospace'; x.fillText('TODAY', 26, 16); for (let i = 0; i < 4; i++) { x.fillRect(10, 28 + i * 10, 46 - (i % 2) * 14, 3); x.fillText('$', 70, 32 + i * 10); } });
      const bd = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.48), new THREE.MeshStandardMaterial({ map: board, roughness: 0.9 }));
      bd.position.set(-W / 2 - 0.36, 0.75, D / 2 - 0.1); bd.rotation.y = 0.35; g.add(bd);
      [-0.25, 0.25].forEach(dx => { const leg = K.box(g, 0.04, 1.0, 0.04, K.darkWood, -W / 2 - 0.36 + dx * Math.cos(0.35), 0.5, D / 2 - 0.1 - dx * Math.sin(0.35)); });
    }
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return g;
  },
};
