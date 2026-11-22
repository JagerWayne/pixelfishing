/* WorldBuilder methods: the aquarium tank and its decorations. */
import { THREE } from '../engine/three.js';
import { PixelTextureFactory } from '../render/texture-factory.js';

export const wbAquariumStatics = {
  /* AQUARIUM (v5.0.0, sized per tier since v5.5.0). Origin: floor, centre of the footprint, front +Z.
     The whole tank stays out of mergeStatic: it is rebuilt when the tier changes (aquaSync). */
  /* the aquarium, sized by tier: glass W wide and GH tall on a cabinet (front faces +Z, origin on the floor) */
  buildAquariumTank(textures, tank) {
    const W = (tank && tank.w) || 2.4, GH = (tank && tank.h) || 1.14, hw = W / 2, gy = 0.91 + GH / 2, top = 0.91 + GH;
    const g = new THREE.Group(), K = this.propKit(textures);
    const live = new THREE.Group(); g.add(live); g.userData.live = live; g.userData.tier = (tank && tank.tier) || 1; g.userData.w = W;
    // cabinet with doors and brass handles
    K.box(g, W + 0.1, 0.84, 0.86, K.darkWood, 0, 0.42, 0);
    const nd = Math.max(2, Math.round(W / 1.2)), dw = (W - 0.1) / nd;
    for (let k = 0; k < nd; k++) { const x = -hw + 0.05 + dw * (k + 0.5); K.box(g, dw - 0.1, 0.64, 0.03, K.wood, x, 0.42, 0.44); K.cyl(g, 0.02, 0.02, 0.1, K.brass, x + (k % 2 ? -1 : 1) * (dw / 2 - 0.15), 0.42, 0.47, 6); }
    K.box(g, W + 0.18, 0.07, 0.94, K.lightWood, 0, 0.875, 0);
    // glass (front and sides), corner posts, backdrop
    const glassM = new THREE.MeshStandardMaterial({ color: 0x9bd8f5, transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.1, depthWrite: false });
    const pane = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), glassM); m.position.set(x, y, z); m.renderOrder = 6; g.add(m); };
    pane(W, GH, 0.02, 0, gy, 0.41); pane(0.02, GH, 0.82, -hw, gy, 0); pane(0.02, GH, 0.82, hw, gy, 0);
    [[-hw, -0.41], [hw, -0.41], [-hw, 0.41], [hw, 0.41]].forEach(([x, z]) => K.box(g, 0.07, GH + 0.04, 0.07, K.iron, x, gy - 0.01, z));
    const bc = document.createElement('canvas'); bc.width = 8; bc.height = 64; { const x = bc.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#0b3b5c'); gr.addColorStop(1, '#0e6f9b'); x.fillStyle = gr; x.fillRect(0, 0, 8, 64); }
    const bt = new THREE.CanvasTexture(bc); bt.colorSpace = THREE.SRGBColorSpace;
    const back = new THREE.Mesh(new THREE.PlaneGeometry(W, GH), new THREE.MeshBasicMaterial({ map: bt })); back.position.set(0, gy, -0.4); g.add(back);
    // hood with a light strip and the sign
    K.box(g, W + 0.2, 0.3, 0.96, K.darkWood, 0, top + 0.15, 0);
    K.box(g, W - 0.1, 0.04, 0.6, K.M(0xe0f2fe, 0.3, 0, { emissive: new THREE.Color(0x7dd3fc), emissiveIntensity: 1.0 }), 0, top - 0.02, 0);
    K.box(g, Math.min(1.6, W * 0.55), 0.22, 0.04, new THREE.MeshBasicMaterial({ map: PixelTextureFactory.makeSignTexture('🐠 ' + ((tank && tank.name) || 'AQUARIUM').toUpperCase(), 320, 64) }), 0, top + 0.15, 0.49);
    // sand, gravel and the air stone with its pipe
    K.box(g, W - 0.02, 0.1, 0.82, K.M(0xe8d5a0, 0.95), 0, 0.98, 0);
    const ng = Math.round(W * 11);
    for (let i = 0; i < ng; i++) { const s = K.sph(g, 0.03 + (i % 3) * 0.012, K.M([0x9ca3af, 0xd6c08e, 0x78716c][i % 3], 0.9), -hw + 0.15 + (i * 0.37) % (W - 0.3), 1.045, -0.32 + ((i * 0.53) % 0.64), 5, 4); s.scale.y = 0.6; }
    K.cyl(g, 0.045, 0.05, 0.05, K.M(0x64748b, 0.8), -hw + 0.25, 1.06, -0.28, 8);
    // water (tinted by cleanliness at run time), bubbles, fish, decor
    const water = new THREE.Mesh(new THREE.BoxGeometry(W - 0.04, GH - 0.2, 0.8), new THREE.MeshBasicMaterial({ color: 0x5ec5ee, transparent: true, opacity: 0.2, depthWrite: false }));
    water.position.set(0, 0.93 + (GH - 0.2) / 2 + 0.06, 0); water.renderOrder = 5; live.add(water); g.userData.water = water;
    const bubbles = [], nb = Math.round((GH - 0.3) / 0.1);
    for (let i = 0; i < nb; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.018 + (i % 3) * 0.006, 6, 5), new THREE.MeshBasicMaterial({ color: 0xe0f7ff, transparent: true, opacity: 0.7, depthWrite: false })); b.position.set(-hw + 0.25, 1.1 + i * 0.1, -0.28); b.renderOrder = 7; live.add(b); bubbles.push(b); }
    g.userData.bubbles = bubbles; g.userData.bubbleTop = 1.1 + nb * 0.1;
    g.userData.fishGroup = new THREE.Group(); live.add(g.userData.fishGroup);
    g.userData.decorGroup = new THREE.Group(); live.add(g.userData.decorGroup);
    g.traverse(o => { if (o.isMesh && !o.material.transparent) { o.castShadow = true; o.receiveShadow = true; } });
    return g;
  },

  /* decoration for the tank (origin on the sand, about 0.4 m wide at most) */
  buildAquariumDecor(id, textures) {
    const g = new THREE.Group(), K = this.propKit(textures), M = K.M;
    if (id === 'plants') {
      for (let i = 0; i < 7; i++) { const h = 0.3 + (i % 3) * 0.14; const bl = K.cyl(g, 0.004, 0.03, h, M([0x16a34a, 0x22c55e, 0x15803d][i % 3], 0.8, 0, { side: THREE.DoubleSide }), -0.14 + i * 0.047, h / 2, (i % 2 ? 0.04 : -0.04), 5); bl.rotation.z = (i - 3) * 0.06; bl.userData.sway = i; }
    } else if (id === 'rocks') {
      [[0, 0.1, 0, 0.16], [0.16, 0.06, 0.05, 0.1], [-0.15, 0.05, 0.03, 0.09]].forEach(([x, y, z, r], i) => { const rk = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), M(i % 2 ? 0x78716c : 0x57534e, 0.95)); rk.position.set(x, y, z); rk.scale.y = 0.75; g.add(rk); });
    } else if (id === 'driftwood') {
      const a = K.cyl(g, 0.035, 0.05, 0.5, M(0x9a7b4f, 0.9), 0, 0.12, 0, 6); a.rotation.z = 1.2; const b = K.cyl(g, 0.02, 0.03, 0.26, M(0x9a7b4f, 0.9), 0.14, 0.26, 0, 6); b.rotation.z = -0.5;
    } else if (id === 'coral') {
      [[0, 0xf472b6], [-0.1, 0xfb7185], [0.11, 0xc084fc]].forEach(([x, c], i) => { const h = 0.18 + i * 0.05; K.cyl(g, 0.012, 0.03, h, M(c, 0.7), x, h / 2, 0, 6); [-0.05, 0.05].forEach(dx => { const br = K.cyl(g, 0.01, 0.018, 0.12, M(c, 0.7), x + dx, h * 0.8, 0, 5); br.rotation.z = dx * 7; K.sph(g, 0.022, M(c, 0.6), x + dx * 1.7, h * 0.8 + 0.07, 0, 6, 5); }); });
    } else if (id === 'castle') {
      K.box(g, 0.3, 0.14, 0.2, M(0xd6c08e, 0.9), 0, 0.07, 0); [-0.12, 0.12].forEach(x => { K.cyl(g, 0.045, 0.05, 0.26, M(0xd6c08e, 0.9), x, 0.13, 0.0, 8); K.cyl(g, 0.0, 0.06, 0.1, M(0xdc2626, 0.7), x, 0.31, 0, 8); });
      K.box(g, 0.12, 0.2, 0.12, M(0xc8b27a, 0.9), 0, 0.2, 0);
    } else if (id === 'chest') {
      K.box(g, 0.24, 0.12, 0.15, M(0x7c4a1e, 0.85), 0, 0.06, 0); const lid = K.box(g, 0.24, 0.07, 0.15, M(0x92400e, 0.85), 0, 0.15, -0.03); lid.rotation.x = -0.5; K.box(g, 0.05, 0.05, 0.02, K.brass, 0, 0.1, 0.08);
      K.sph(g, 0.03, M(0xfacc15, 0.3, 0.6, { emissive: new THREE.Color(0xf59e0b), emissiveIntensity: 0.6 }), 0.0, 0.14, 0.0, 6, 5);
    } else if (id === 'wreck') {
      const h = K.box(g, 0.42, 0.12, 0.16, M(0x78350f, 0.9), 0, 0.1, 0); h.rotation.z = 0.35; K.cyl(g, 0.012, 0.012, 0.3, M(0x57534e, 0.9), -0.05, 0.28, 0, 5).rotation.z = 0.5; const sl = K.box(g, 0.14, 0.12, 0.014, M(0xe5e7eb, 0.8), 0.02, 0.3, 0); sl.rotation.z = 0.5;
    } else if (id === 'lights') {
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; K.sph(g, 0.03, new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(i / 8, 0.9, 0.6) }), Math.cos(a) * 0.15, 0.07, Math.sin(a) * 0.08, 6, 5); }
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.012, 5, 16), M(0x334155, 0.5)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.05; ring.scale.z = 0.55; g.add(ring);
    }
    return g;
  },
};
