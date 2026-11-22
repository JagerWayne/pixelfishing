/* WorldBuilder method: buildShopItem, the 3D model of every good the shops sell. Kept whole. */
import { THREE } from '../engine/three.js';
import { PixelTextureFactory } from '../render/texture-factory.js';

export const wbShopItemStatics = {
  buildShopItem(key, d, textures) {
    const g = new THREE.Group(), K = this.propKit(textures), M = K.M;
    const glow = (hex, k = 0.8) => M(hex, 0.35, 0.2, { emissive: new THREE.Color(hex), emissiveIntensity: k });
    const torusY = (parent, r, tube, mat, x, y, z, rx = Math.PI / 2) => { const t = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 6, 14), mat); t.position.set(x, y, z); t.rotation.x = rx; parent.add(t); return t; };
    let maxDim = 0.9;
    if (key === 'rod') {
      const t = d.tier, col = d.color, winch = t >= 7;
      const r = new THREE.Group(); r.rotation.z = 0.1; g.add(r);
      const blank = M(col, 0.35, t >= 5 ? 0.6 : 0.1, t === 8 ? { emissive: new THREE.Color(col), emissiveIntensity: 0.4 } : {});
      const grip = M(t === 1 ? 0xb45309 : t <= 3 ? 0xd6a56a : 0x1f2937, 0.9);
      K.cyl(r, winch ? 0.05 : 0.03, winch ? 0.055 : 0.034, 0.34, grip, 0, 0.17, 0, 8);
      K.cyl(r, winch ? 0.04 : 0.011, winch ? 0.05 : 0.026, 1.2, blank, 0, 0.94, 0, 8);
      // reel: spinning reel (small), roller reel (large drum for the winch rods)
      const reelM = M(t >= 6 ? 0xe5e7eb : 0x475569, 0.3, 0.8);
      if (winch) { const drum = K.cyl(r, 0.13, 0.13, 0.16, reelM, 0.1, 0.42, 0, 14); drum.rotation.x = Math.PI / 2; K.cyl(r, 0.04, 0.04, 0.3, M(0xfacc15, 0.4, 0.7), 0.1, 0.42, 0, 8).rotation.x = Math.PI / 2; K.box(r, 0.05, 0.22, 0.05, reelM, 0.2, 0.42, 0.1); }
      else { K.cyl(r, 0.06, 0.07, 0.07, reelM, 0.06, 0.36, 0, 12); K.box(r, 0.12, 0.03, 0.03, reelM, 0.1, 0.34, 0); K.sph(r, 0.022, M(0xdc2626, 0.5), 0.17, 0.34, 0, 6, 5); }
      // guides (rollers on the big rods), bamboo nodes on the cane
      for (let i = 0; i < 5; i++) { const y = 0.6 + i * 0.22, rr = 0.05 - i * 0.006; torusY(r, Math.max(0.018, rr * (winch ? 0.9 : 0.6)), 0.006, K.steel, 0.012, y, 0, 0); }
      if (t === 1) for (let i = 0; i < 6; i++) torusY(r, 0.017, 0.007, M(0x7c4a1e, 0.9), 0, 0.5 + i * 0.2, 0, Math.PI / 2);
      K.sph(r, 0.016, K.steel, 0, 1.55, 0, 6, 5);
      // a stand: a post with a notch, a base plate
      K.cyl(g, 0.17, 0.2, 0.05, K.darkWood, 0, 0.025, 0, 12);
      K.box(g, 0.06, 0.7, 0.06, K.darkWood, -0.1, 0.4, -0.05);
      K.box(g, 0.1, 0.05, 0.1, K.iron, -0.1, 0.72, -0.05);
      maxDim = 1.45;
    } else if (key === 'cam') {
      K.cyl(g, 0.11, 0.11, 0.26, K.steel, 0, 0.25, 0, 14).rotation.z = Math.PI / 2;
      K.sph(g, 0.075, glow(0x38bdf8, 1.0), 0.14, 0.25, 0, 10, 8);
      K.sph(g, 0.03, glow(0xef4444, 1.2), -0.08, 0.32, 0.09, 6, 5);
      torusY(g, 0.07, 0.014, K.iron, -0.14, 0.25, 0, 0);
      K.cyl(g, 0.005, 0.005, 0.5, M(0xe5e7eb, 0.5), -0.3, 0.45, 0, 4);
      K.cyl(g, 0.16, 0.18, 0.04, K.darkWood, 0, 0.02, 0, 12);
      maxDim = 0.6;
    } else if (key === 'bait') {
      const tier = d.tier;
      if (tier === 1) { K.cyl(g, 0.26, 0.2, 0.16, M(0xb45309, 0.9, 0, { map: textures.wood }), 0, 0.08, 0, 14); }
      else {
        const lab = [0, 0, 0xf472b6, 0xfb923c, 0x22d3ee][tier];
        K.cyl(g, 0.18, 0.18, 0.34, M(0xbae6fd, 0.1, 0.1, { transparent: true, opacity: 0.35 }), 0, 0.2, 0, 14);
        K.cyl(g, 0.19, 0.19, 0.05, K.iron, 0, 0.395, 0, 14);
        K.box(g, 0.2, 0.12, 0.012, M(lab, 0.6), 0, 0.2, 0.185);
        K.box(g, 0.24, 0.015, 0.015, M(0x111827, 0.6), 0, 0.2, 0.195);
      }
      const bm = this.buildBaitMesh(tier); bm.scale.setScalar(tier === 1 ? 2.4 : 1.7); bm.position.set(0, tier === 1 ? 0.2 : 0.2, 0); g.add(bm);
      if (tier === 4) K.sph(g, 0.1, glow(0x22d3ee, 0.7), 0, 0.2, 0, 10, 8).material.transparent = true;
      maxDim = 0.6;
    } else if (key === 'bucket') {
      const b = this.buildPierBucketMesh(d.tier, 0, textures); g.add(b);
      maxDim = d.tier >= 4 ? 1.05 : 0.8;
    } else if (key === 'boat') {
      const b = this.buildBoatMesh(d.tier, textures); b.rotation.y = -Math.PI / 2 + 0.5; g.add(b);
      maxDim = 1.15;
    } else if (key === 'module') {
      if (d.id === 'sonar') {
        K.box(g, 0.5, 0.34, 0.26, K.iron, 0, 0.3, 0);
        K.box(g, 0.4, 0.24, 0.02, glow(0x16a34a, 0.9), 0, 0.31, 0.14);
        [0.07, 0.14, 0.2].forEach(rr => torusY(g, rr, 0.005, glow(0xbbf7d0, 1.0), 0, 0.31, 0.152, 0));
        K.cyl(g, 0.04, 0.12, 0.2, K.steel, 0, 0.03, 0, 10);
        K.box(g, 0.06, 0.26, 0.06, K.iron, 0, 0.13, 0);
      } else if (d.id === 'spotlight') {
        const lamp = K.cyl(g, 0.14, 0.17, 0.3, K.steel, 0, 0.36, 0, 14); lamp.rotation.x = Math.PI / 2 - 0.25;
        const lens = K.cyl(g, 0.15, 0.15, 0.02, glow(0xfef9c3, 1.3), 0, 0.36, 0, 14); lens.rotation.x = Math.PI / 2 - 0.25; lens.position.set(0, 0.405, 0.15);
        K.box(g, 0.34, 0.04, 0.04, K.iron, 0, 0.36, -0.02); K.cyl(g, 0.03, 0.04, 0.3, K.iron, 0, 0.17, 0, 8); K.cyl(g, 0.17, 0.2, 0.05, K.darkWood, 0, 0.025, 0, 12);
        const beam = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 14, 1, true), new THREE.MeshBasicMaterial({ color: 0xfef9c3, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide }));
        beam.rotation.x = -Math.PI / 2 - 0.25; beam.position.set(0, 0.5, 0.52); g.add(beam);
      } else {
        K.cyl(g, 0.22, 0.22, 0.42, M(0x0ea5e9, 0.3, 0.1, { transparent: true, opacity: 0.55 }), 0, 0.23, 0, 16);
        K.cyl(g, 0.23, 0.23, 0.04, K.iron, 0, 0.46, 0, 16); K.cyl(g, 0.23, 0.23, 0.04, K.iron, 0, 0.02, 0, 16);
        [[-0.07, 0.18, 0.08], [0.08, 0.3, -0.05], [0.0, 0.38, 0.1], [-0.1, 0.4, -0.04]].forEach(([x, y, z]) => K.sph(g, 0.03, M(0xe0f2fe, 0.1, 0, { transparent: true, opacity: 0.8 }), x, y, z, 6, 5));
        const fs = K.sph(g, 0.07, M(0xf97316, 0.4), 0.02, 0.15, 0, 8, 6); fs.scale.set(1.8, 0.8, 0.6);
        K.cyl(g, 0.025, 0.025, 0.25, K.iron, 0.24, 0.35, 0, 6).rotation.z = 0.9;
      }
      maxDim = 0.75;
    } else if (key === 'dive') {
      const t = d.tier, suit = M(0x111827, 0.8), yel = M(0xfacc15, 0.5), tank = M(0xfacc15, 0.3, 0.4);
      if (t === 1) {   // mask, snorkel, fins
        K.box(g, 0.3, 0.14, 0.06, M(0x111827, 0.7), 0, 0.45, 0); K.box(g, 0.24, 0.1, 0.02, M(0x7dd3fc, 0.1, 0.2, { transparent: true, opacity: 0.6 }), 0, 0.45, 0.04);
        torusY(g, 0.17, 0.014, M(0x111827, 0.7), 0, 0.45, -0.02, 0);
        K.cyl(g, 0.014, 0.014, 0.4, yel, 0.22, 0.55, 0, 6); K.sph(g, 0.03, yel, 0.22, 0.76, 0, 6, 5);
        [-0.12, 0.12].forEach(x => { const f = K.box(g, 0.12, 0.02, 0.46, M(0xf97316, 0.6), x, 0.05, 0.1); f.rotation.x = -0.12; });
      } else if (t === 2) {   // wetsuit torso + one tank
        K.cyl(g, 0.17, 0.2, 0.5, suit, 0, 0.5, 0, 12); K.cyl(g, 0.24, 0.17, 0.12, suit, 0, 0.8, 0, 12); K.sph(g, 0.1, M(0xfdba74, 0.7), 0, 0.98, 0, 10, 8);
        K.cyl(g, 0.09, 0.09, 0.62, tank, 0, 0.55, -0.22, 12); K.sph(g, 0.09, tank, 0, 0.86, -0.22, 10, 6);
        K.cyl(g, 0.014, 0.014, 0.3, K.iron, 0.05, 0.9, -0.12, 5); K.cyl(g, 0.15, 0.18, 0.05, K.darkWood, 0, 0.025, 0, 12);
        K.cyl(g, 0.04, 0.05, 0.22, K.darkWood, 0, 0.14, 0, 8);
      } else if (t === 3) {   // twin tanks + lamp
        [-0.11, 0.11].forEach(x => { K.cyl(g, 0.1, 0.1, 0.68, tank, x, 0.4, 0, 12); K.sph(g, 0.1, tank, x, 0.74, 0, 10, 6); K.cyl(g, 0.035, 0.035, 0.06, K.iron, x, 0.84, 0, 8); });
        K.box(g, 0.32, 0.04, 0.05, K.iron, 0, 0.7, 0.1); K.cyl(g, 0.014, 0.014, 0.35, K.iron, 0, 0.6, 0.14, 5);
        K.cyl(g, 0.07, 0.09, 0.14, K.iron, 0.3, 0.3, 0.1, 10).rotation.x = Math.PI / 2; K.cyl(g, 0.07, 0.07, 0.015, glow(0xfef9c3, 1.2), 0.3, 0.3, 0.18, 10).rotation.x = Math.PI / 2;
        K.cyl(g, 0.2, 0.22, 0.05, K.darkWood, 0, 0.025, 0, 12);
      } else if (t === 4) {   // rebreather + scooter
        K.box(g, 0.34, 0.5, 0.18, M(0x334155, 0.5, 0.5), -0.18, 0.4, 0); K.cyl(g, 0.05, 0.05, 0.4, K.iron, -0.18, 0.7, 0.09, 6);
        const sc = K.cyl(g, 0.12, 0.1, 0.55, yel, 0.18, 0.25, 0, 14); sc.rotation.z = Math.PI / 2; sc.position.set(0.18, 0.2, 0);
        torusY(g, 0.14, 0.02, K.iron, 0.46, 0.2, 0, Math.PI / 2).rotation.y = Math.PI / 2;
        for (let i = 0; i < 3; i++) { const bl = K.box(g, 0.01, 0.2, 0.05, K.steel, 0.5, 0.2, 0); bl.rotation.x = i * 2.1; }
        K.sph(g, 0.06, glow(0x38bdf8, 1.0), 0.0, 0.3, 0.1, 8, 6); K.cyl(g, 0.2, 0.22, 0.05, K.darkWood, 0, 0.025, 0, 12);
      } else {   // exo-suit
        const arm = M(0xf97316, 0.35, 0.7), dark = M(0x1f2937, 0.5, 0.6);
        K.box(g, 0.42, 0.5, 0.3, arm, 0, 0.66, 0); K.sph(g, 0.17, arm, 0, 1.02, 0, 12, 10);
        K.sph(g, 0.1, glow(0x67e8f9, 0.9), 0, 1.03, 0.1, 8, 6);
        [-1, 1].forEach(sd => { K.cyl(g, 0.07, 0.07, 0.5, dark, sd * 0.3, 0.64, 0, 8); K.sph(g, 0.1, arm, sd * 0.3, 0.9, 0, 8, 6); K.cyl(g, 0.09, 0.07, 0.5, arm, sd * 0.12, 0.2, 0, 8); K.box(g, 0.14, 0.06, 0.22, dark, sd * 0.12, 0.03, 0.05); });
        K.box(g, 0.3, 0.3, 0.14, dark, 0, 0.72, -0.2); K.cyl(g, 0.18, 0.2, 0.04, K.darkWood, 0, 0.0, 0, 12);
      }
      maxDim = t >= 5 ? 1.15 : t >= 2 ? 0.95 : 0.8;
    } else if (key === 'spear') {
      const t = d.tier, L = [0, 0.8, 1.0, 1.15, 1.3, 1.45][t] || 1;
      const body = M([0, 0x9ca3af, 0x0369a1, 0x0f766e, 0xdc2626, 0x7c3aed][t], 0.35, 0.5);
      const r = new THREE.Group(); g.add(r);
      if (t === 1) { K.cyl(r, 0.02, 0.016, 1.1, K.lightWood, 0, 0.5, 0, 6).rotation.z = Math.PI / 2; K.cyl(r, 0, 0.04, 0.16, K.steel, 0.62, 0.5, 0, 6).rotation.z = -Math.PI / 2; torusY(r, 0.05, 0.012, M(0x7c4a1e, 0.9), -0.3, 0.5, 0, 0).rotation.y = Math.PI / 2; }
      else {
        K.cyl(r, 0.045, 0.05, L, body, 0, 0.5, 0, 10).rotation.z = Math.PI / 2;
        K.box(r, 0.14, 0.26, 0.07, M(0x111827, 0.7), -L / 2 + 0.12, 0.36, 0).rotation.z = -0.3;
        K.cyl(r, 0.012, 0.012, L + 0.2, K.steel, 0.1, 0.5, 0, 6).rotation.z = Math.PI / 2;
        K.cyl(r, 0, 0.03, 0.16, K.steel, L / 2 + 0.2, 0.5, 0, 6).rotation.z = -Math.PI / 2;
        if (t === 2) { [-0.04, 0.04].forEach(z => K.cyl(r, 0.012, 0.012, L * 0.7, M(0xdc2626, 0.7), 0.1, 0.5, z * 2, 5).rotation.z = Math.PI / 2); }
        if (t === 3) K.cyl(r, 0.08, 0.08, 0.34, M(0x94a3b8, 0.3, 0.7), -0.1, 0.62, 0, 10).rotation.z = Math.PI / 2;
        if (t === 4) { K.cyl(r, 0.06, 0.06, 0.3, M(0xe5e7eb, 0.3, 0.7), -0.12, 0.6, 0, 10).rotation.z = Math.PI / 2; K.sph(r, 0.03, glow(0xfacc15, 1), -0.12, 0.66, 0.06, 6, 5); }
        if (t === 5) { [-0.05, 0.05].forEach(z => K.box(r, L * 0.9, 0.02, 0.02, glow(0xc4b5fd, 1.0), 0.05, 0.57, z)); K.box(r, 0.2, 0.12, 0.12, glow(0x8b5cf6, 0.8), -0.2, 0.5, 0); }
      }
      K.cyl(g, 0.25, 0.27, 0.05, K.darkWood, 0, 0.025, 0, 12); K.box(g, 0.04, 0.4, 0.04, K.iron, -0.25, 0.25, 0); K.box(g, 0.04, 0.4, 0.04, K.iron, 0.25, 0.25, 0);
      g.rotation.y = 0.75; maxDim = 1.05;
    } else if (key === 'fuel') {
      const red = M(0xdc2626, 0.5, 0.2);
      K.box(g, 0.4, 0.5, 0.2, red, 0, 0.3, 0); K.box(g, 0.2, 0.07, 0.07, red, -0.07, 0.6, 0);
      K.cyl(g, 0.04, 0.04, 0.1, K.iron, 0.12, 0.6, 0, 8); K.box(g, 0.2, 0.18, 0.012, M(0xfef08a, 0.7), 0, 0.3, 0.106);
      K.cyl(g, 0.012, 0.012, 0.35, K.iron, 0.28, 0.2, 0.1, 5).rotation.z = 1.2;
      [[-0.12, 0.05], [0.12, 0.05]].forEach(([x, y]) => K.box(g, 0.02, 0.5, 0.21, M(0x991b1b, 0.5), x, 0.3, 0));
      maxDim = 0.75;
    } else if (key === 'crate') {
      K.box(g, 0.8, 0.3, 0.55, K.lightWood, 0, 0.15, 0); K.box(g, 0.74, 0.04, 0.5, M(0xe0f2fe, 0.3, 0.1), 0, 0.31, 0);
      [[-0.22, 0.36, 0.0, 0xf97316], [0.05, 0.37, 0.1, 0x38bdf8], [0.25, 0.36, -0.08, 0xfacc15]].forEach(([x, y, z, c]) => { const f = K.sph(g, 0.1, M(c, 0.35, 0.15), x, y, z, 8, 6); f.scale.set(1.8, 0.65, 0.6); f.rotation.y = z * 4; });
      [[-0.3, 0.34, 0.18], [0.3, 0.34, 0.2], [0.1, 0.35, -0.2]].forEach(([x, y, z]) => K.box(g, 0.08, 0.08, 0.08, M(0xffffff, 0.2, 0, { transparent: true, opacity: 0.7 }), x, y, z));
      [0, 1, 2].forEach(i => K.cyl(g, 0.07, 0.07, 0.025, M(0xfacc15, 0.25, 0.8), 0.52, 0.015 + i * 0.027, 0.25, 12));
      maxDim = 0.95;
    } else if (key === 'tank') {
      const t = this.buildAquariumTank(textures, d); t.traverse(o => { if (o.isMesh && o.material && o.material.transparent && o.material.opacity < 0.3) o.material = o.material.clone(); });
      g.add(t); maxDim = 1.0;
    } else if (key === 'decor') {
      const base = K.box(g, 0.5, 0.05, 0.36, M(0xe8d5a0, 0.95), 0, 0.025, 0); base.receiveShadow = true;
      const dm = this.buildAquariumDecor(d.id, textures); dm.position.y = 0.05; g.add(dm); maxDim = 0.8;
    } else if (key === 'pellets') {
      K.cyl(g, 0.16, 0.16, 0.34, M(0xf97316, 0.5), 0, 0.17, 0, 14); K.cyl(g, 0.165, 0.165, 0.06, M(0x0e7490, 0.5), 0, 0.37, 0, 14);
      K.box(g, 0.2, 0.12, 0.01, new THREE.MeshBasicMaterial({ map: PixelTextureFactory.makeSignTexture('🐟 FOOD', 128, 64) }), 0, 0.18, 0.162); maxDim = 0.7;
    } else if (key === 'kit') {
      K.box(g, 0.5, 0.26, 0.3, M(0x22d3ee, 0.5), 0, 0.13, 0); K.box(g, 0.2, 0.05, 0.05, M(0x0e7490, 0.5), 0, 0.3, 0);
      K.cyl(g, 0.05, 0.05, 0.24, M(0xf8fafc, 0.4), -0.12, 0.38, 0, 10); K.box(g, 0.18, 0.06, 0.08, M(0xfacc15, 0.8), 0.12, 0.29, 0); maxDim = 0.8;
    } else if (key === 'book') {
      const cover = M(d.color, 0.7);
      g.rotation.x = 0.28;
      K.box(g, 0.5, 0.03, 0.66, cover, 0, 0.015, 0); K.box(g, 0.46, 0.09, 0.62, M(0xf5ecd0, 0.9), 0.015, 0.075, 0);
      K.box(g, 0.5, 0.03, 0.66, cover, 0, 0.135, 0); K.box(g, 0.045, 0.15, 0.66, cover, -0.26, 0.075, 0);
      K.box(g, 0.3, 0.006, 0.2, M(0xfde68a, 0.5, 0.3), 0.02, 0.153, -0.08); K.cyl(g, 0.045, 0.045, 0.006, M(0xfacc15, 0.3, 0.7), 0.02, 0.158, 0.17, 10);
      K.box(g, 0.02, 0.005, 0.5, M(0xdc2626, 0.7), 0.2, 0.155, 0.06);
      maxDim = 0.8;
    } else if (key === 'rig') {   // v6.5.0: a popper, a jig or a chum bucket
      if (d.id === 'popper') {
        const b = new THREE.Group(); b.rotation.z = Math.PI / 2; g.add(b);
        K.cyl(b, 0.09, 0.06, 0.42, M(0xf8fafc, 0.4), 0, 0, 0, 12); K.cyl(b, 0.1, 0.09, 0.08, M(d.color, 0.4), 0, 0.22, 0, 12);
        K.cyl(b, 0.06, 0.03, 0.12, M(d.color, 0.4), 0, -0.26, 0, 10); K.sph(b, 0.025, M(0x111827, 0.3), 0.06, 0.16, 0.06, 6, 5);
        [-0.12, -0.3].forEach(y => { const hk = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.006, 4, 10, Math.PI * 1.4), M(0xcbd5e1, 0.3, 0.8)); hk.position.set(0, y, 0.09); b.add(hk); });
        maxDim = 0.7;
      } else if (d.id === 'jig') {
        const j = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), M(d.color, 0.25, 0.85)); j.scale.set(0.5, 1.8, 0.35); j.rotation.z = 0.6; g.add(j);
        K.sph(g, 0.07, M(0x334155, 0.3, 0.8), -0.17, 0.24, 0, 8, 6);
        const hk = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.008, 4, 10, Math.PI * 1.4), M(0xcbd5e1, 0.3, 0.8)); hk.position.set(0.2, -0.27, 0); g.add(hk);
        maxDim = 0.7;
      } else {
        K.cyl(g, 0.2, 0.16, 0.36, M(d.color, 0.7), 0, 0.18, 0, 12); K.cyl(g, 0.19, 0.19, 0.02, M(0x7f1d1d, 0.9), 0, 0.35, 0, 12);
        for (let i = 0; i < 6; i++) K.sph(g, 0.04, M([0xfca5a5, 0x94a3b8, 0xfde68a][i % 3], 0.8), Math.cos(i) * 0.1, 0.37, Math.sin(i) * 0.1, 6, 5);
        const h = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.01, 4, 12, Math.PI), M(0x334155, 0.4, 0.6)); h.position.y = 0.36; g.add(h);
        maxDim = 0.8;
      }
    } else if (key === 'fish') {
      const m = this.buildSculptedFishMesh(d.item, textures);
      m.scale.setScalar(THREE.MathUtils.clamp(0.4 + 0.1 * Math.cbrt(d.weight), 0.4, 1.0));
      m.rotation.y = 0.3; g.add(m);
      K.box(g, 0.9, 0.05, 0.5, M(0xe0f2fe, 0.2, 0.1), 0, -0.06, 0);
      maxDim = 0.9;
    }
    return this.fitShopModel(g, maxDim);
  },
};
