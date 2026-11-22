/* WorldBuilder method: buildHarbourTown, the island town's first district. */
import { THREE } from '../engine/three.js';
import { PixelTextureFactory } from '../render/texture-factory.js';
import { COL, ISLAND, TOWN } from './layout.js';
import { Colliders } from '../data/recipes.js';

export const wbTownStatics = {
  /* a small fisherman's cottage: whitewashed walls, gabled roof, door, shuttered windows and a chimney (front +Z) */
  /* Harbour Town (v6.0): the gate through the seawall, hedges, the plaza with its well, lamps and noticeboard,
     Marta's hut and Lorenzo's restaurant. Buildings are fade groups (userData.townFade). */
  buildHarbourTown(root, fade, textures) {
    const K = this.propKit(textures), M = K.M, W = COL.WALK, G = ISLAND.gateHW;
    const stone = M(0x9ca3af, 0.95), stoneD = M(0x6b7280, 0.95), hedgeM = M(0x2f6f2a, 0.9), hedgeL = M(0x3d8a35, 0.9);
    // gate: steps over the seawall, two pillars and an arch with the town's name
    for (let i = 0; i < 4; i++) K.box(root, 2 * G + 0.4, 0.06, 0.32, i % 2 ? stone : stoneD, 0, 1.52 + i * 0.015, 5.85 + i * 0.3);
    [-1, 1].forEach(sx => { K.box(root, 0.5, 2.6, 0.5, stoneD, sx * (G + 0.3), 1.5 + 1.3, 6.3); K.box(root, 0.62, 0.14, 0.62, stone, sx * (G + 0.3), 2.86 + 1.3, 6.3); });
    K.box(root, 2 * G + 1.3, 0.16, 0.36, K.darkWood, 0, 4.1, 6.3);
    K.box(root, 2.4, 0.42, 0.06, new THREE.MeshBasicMaterial({ map: PixelTextureFactory.makeSignTexture('🏘️ HARBOUR TOWN', 320, 64) }), 0, 3.8, 6.1);
    Colliders.box('gate pillar W', -(G + 0.3), 6.3, 0.25, 0.25, W); Colliders.box('gate pillar E', G + 0.3, 6.3, 0.25, 0.25, W);
    // v6.6.1: no hedges along the terrace front any more: the whole boardwalk opens onto the town (the gate stays as a landmark)
    // the plaza: round paving, a well, two lamps and the noticeboard
    const P = ISLAND.plaza;
    const pave = new THREE.Mesh(new THREE.CylinderGeometry(P.r, P.r, 0.06, 28), M(0xb8b0a2, 0.95)); pave.position.set(P.x, 1.52, P.z); pave.receiveShadow = true; root.add(pave);
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; K.box(root, 0.5, 0.07, 0.24, stoneD, P.x + Math.cos(a) * (P.r - 0.15), 1.54, P.z + Math.sin(a) * (P.r - 0.15)).rotation.y = -a; }
    {
      const w = new THREE.Group(); w.position.set(TOWN.well.x, 1.5, TOWN.well.z); w.userData.townFade = true; root.add(w); fade.push(w);
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.72, 16, 1, true), M(0x78716c, 0.95)); ring.position.y = 0.36; ring.material.side = THREE.DoubleSide; w.add(ring);
      K.cyl(w, 0.6, 0.6, 0.05, M(0x1e3a5f, 0.2, 0.2), 0, 0.5, 0, 16);
      [-1, 1].forEach(sx => K.box(w, 0.1, 1.3, 0.1, K.darkWood, sx * 0.55, 1.0, 0));
      const roofW = K.box(w, 1.5, 0.08, 0.9, M(0x7f1d1d, 0.8), 0, 1.7, 0); roofW.rotation.z = 0;
      K.cyl(w, 0.05, 0.05, 1.1, K.darkWood, 0, 1.45, 0, 6).rotation.z = Math.PI / 2;
      K.cyl(w, 0.12, 0.1, 0.2, K.darkWood, 0, 1.15, 0, 8);
      Colliders.circle('well', TOWN.well.x, TOWN.well.z, 0.72, W);
    }
    [[-2.9, 8.0], [2.9, 11.6]].forEach(([x, z]) => {
      K.cyl(root, 0.06, 0.08, 2.6, K.iron, x, 1.5 + 1.3, z, 8);
      K.sph(root, 0.16, new THREE.MeshBasicMaterial({ color: 0xfde68a }), x, 4.15, z, 8, 6);
      K.box(root, 0.36, 0.06, 0.36, K.iron, x, 4.36, z);
      Colliders.circle('town lamp', x, z, 0.12, W);
    });
    {
      const b = new THREE.Group(); b.position.set(TOWN.board.x, 1.5, TOWN.board.z); b.rotation.y = Math.PI; root.add(b);
      [-0.7, 0.7].forEach(x => K.box(b, 0.1, 1.9, 0.1, K.darkWood, x, 0.95, 0));
      K.box(b, 1.6, 1.0, 0.08, K.wood, 0, 1.35, 0);
      K.box(b, 1.4, 0.24, 0.02, new THREE.MeshBasicMaterial({ map: PixelTextureFactory.makeSignTexture('📌 NOTICES', 256, 48) }), 0, 1.72, -0.05);
      [[-0.4, 1.3, 0xfef3c7], [0.1, 1.25, 0xfde68a], [0.48, 1.35, 0xf8fafc]].forEach(([x, y, c]) => K.box(b, 0.34, 0.42, 0.01, M(c, 0.9), x, y, -0.05));
      Colliders.box('noticeboard', TOWN.board.x, TOWN.board.z, 0.85, 0.15, W);
    }
    // Marta's hut: a small timber hut with a lantern, at the west end toward the lighthouse path
    {
      const t = TOWN.hut, h = new THREE.Group(); h.position.set(t.x, 1.5, t.z); h.rotation.y = Math.PI; h.userData.townFade = true; root.add(h); fade.push(h);
      K.box(h, t.w, 0.2, t.d, stoneD, 0, 0.1, 0); K.box(h, t.w - 0.1, 2.0, t.d - 0.1, M(0x8b5e34, 0.9, 0, { map: textures.wood }), 0, 1.2, 0);
      const r = K.box(h, t.w + 0.4, 0.1, t.d + 0.5, M(0x334155, 0.8), 0, 2.35, 0); r.rotation.x = 0.12;
      K.box(h, 0.7, 1.3, 0.06, K.darkWood, -0.4, 0.85, t.d / 2); K.box(h, 0.5, 0.4, 0.05, M(0x1e3a5f, 0.3, 0, { emissive: new THREE.Color(0xfbbf24), emissiveIntensity: 0.5 }), 0.5, 1.4, t.d / 2);
      K.cyl(h, 0.1, 0.12, 0.26, M(0xfacc15, 0.3, 0.4, { emissive: new THREE.Color(0xf59e0b), emissiveIntensity: 0.9 }), 0.25, 1.95, t.d / 2 + 0.12, 8);
      K.box(h, 1.4, 0.26, 0.04, new THREE.MeshBasicMaterial({ map: PixelTextureFactory.makeSignTexture("🗼 MARTA", 256, 48) }), 0, 2.15, t.d / 2 + 0.04);
      Colliders.box(t.name, t.x, t.z, t.w / 2 + 0.12, t.d / 2 + 0.12, W);
    }
    // Lorenzo's restaurant: a wide house with a striped awning and a terrace (opens in v6.1)
    {
      const t = TOWN.resto, h = new THREE.Group(); h.position.set(t.x, 1.5, t.z); h.rotation.y = Math.PI; h.userData.townFade = true; root.add(h); fade.push(h);
      K.box(h, t.w + 0.2, 0.25, t.d + 0.2, stoneD, 0, 0.12, 0); K.box(h, t.w, 2.5, t.d, M(0xfff7ed, 0.85), 0, 1.5, 0);
      K.box(h, t.w + 0.5, 0.3, t.d + 0.5, M(0x9a3412, 0.8), 0, 2.9, 0);
      const aw = K.box(h, t.w - 0.4, 0.06, 1.1, M(0xdc2626, 0.7), 0, 2.4, t.d / 2 + 0.5); aw.rotation.x = 0.25;
      for (let i = 0; i < 6; i++) K.box(h, (t.w - 0.4) / 12, 0.065, 1.1, M(0xf8fafc, 0.7), -((t.w - 0.4) / 2) + (i * 2 + 1.5) * (t.w - 0.4) / 12, 2.41, t.d / 2 + 0.5).rotation.x = 0.25;
      K.box(h, 0.9, 1.6, 0.06, K.darkWood, 0, 1.05, t.d / 2 + 0.01);
      [-1.6, 1.6].forEach(x => K.box(h, 1.0, 0.8, 0.05, M(0x1e3a5f, 0.3, 0, { emissive: new THREE.Color(0xfbbf24), emissiveIntensity: 0.45 }), x, 1.5, t.d / 2 + 0.02));
      h.userData.nameSign = K.box(h, 3.2, 0.44, 0.06, new THREE.MeshBasicMaterial({ map: PixelTextureFactory.makeSignTexture("🍝 FISHERMAN'S RESTAURANT", 384, 64) }), 0, 3.25, t.d / 2 + 0.28);
      h.userData.soonSign = K.box(h, 1.0, 0.5, 0.04, new THREE.MeshBasicMaterial({ map: PixelTextureFactory.makeSignTexture('OPENING SOON', 192, 64) }), 1.6, 0.6, t.d / 2 + 0.6);
      Colliders.box(t.name, t.x, t.z, t.w / 2 + 0.12, t.d / 2 + 0.12, W);
      // the terrace: three tables with stools, guests while service runs, a string of lights (an upgrade)
      const tables = [], guests = [], lights = new THREE.Group(); root.add(lights);
      const tz = t.z - t.d / 2 - 2.1, shirt = [0xdc2626, 0x2563eb, 0x16a34a, 0xeab308, 0x7c3aed, 0x0e7490];
      [-2.2, 0, 2.2].forEach((dx, ti) => {
        const tg = new THREE.Group(); tg.position.set(t.x + dx, 1.5, tz); root.add(tg); tables.push(tg);
        K.cyl(tg, 0.45, 0.45, 0.05, M(0xf8fafc, 0.6), 0, 0.74, 0, 16); K.cyl(tg, 0.05, 0.08, 0.72, K.iron, 0, 0.36, 0, 8);
        K.box(tg, 0.92, 0.012, 0.18, M(0xdc2626, 0.7), 0, 0.775, 0);
        [-0.75, 0.75].forEach((sx, si) => {
          K.cyl(tg, 0.17, 0.17, 0.05, K.darkWood, sx, 0.46, 0, 10); K.cyl(tg, 0.03, 0.03, 0.44, K.iron, sx, 0.22, 0, 6);
          const gst = new THREE.Group(); gst.position.set(sx, 0.48, 0); gst.rotation.y = sx < 0 ? -Math.PI / 2 : Math.PI / 2; tg.add(gst);
          K.cyl(gst, 0.15, 0.18, 0.5, M(shirt[(ti * 2 + si) % 6], 0.8), 0, 0.27, 0, 8);
          K.sph(gst, 0.13, M([0xfde0c8, 0xe0a878, 0x8d5524][(ti + si) % 3], 0.7), 0, 0.66, 0, 10, 8);
          K.box(gst, 0.1, 0.06, 0.16, M(0xf8fafc, 0.6), 0, 0.33, -0.22);
          gst.visible = false; guests.push(gst);
        });
        Colliders.circle('terrace table', t.x + dx, tz, 0.55, W);
      });
      for (let i = 0; i <= 12; i++) { const x = t.x - 3.1 + i * 0.52; K.sph(lights, 0.05, new THREE.MeshBasicMaterial({ color: [0xfde68a, 0xf472b6, 0x7dd3fc][i % 3] }), x, 3.15 - Math.sin(i / 12 * Math.PI) * 0.35, tz + 0.35, 6, 5); }
      lights.visible = false;
      return { tables, guests, lights, soon: h.userData.soonSign, sign: h.userData.nameSign };
    }
  },
};
