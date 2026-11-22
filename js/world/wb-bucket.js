/* WorldBuilder method: buildPierBucketMesh, the bucket stand on the pier. */
import { THREE } from '../engine/three.js';

export const wbBucketStatics = {
  buildPierBucketMesh(tier, itemCount, textures) {
    const goldVault = tier >= 5;
    if (tier > 4) tier = 4;
    const group = new THREE.Group();
    const K = this.propKit(textures);
    const fishColors = [[0x38bdf8, 0xf97316], [0xf97316, 0xfacc15], [0x4ade80, 0x38bdf8], [0xe879f9, 0xfacc15]];
    const addFish = (topY, spreadX, spreadZ) => {
      // one mini fish for every fish in the bucket (up to 24), laid out in a grid over the opening, two layers when it fills
      const rc = { Common: [0x38bdf8, 0xf97316], Uncommon: [0x4ade80, 0x38bdf8], Rare: [0xe879f9, 0xfacc15], Epic: [0xa78bfa, 0xf472b6], Legendary: [0xfacc15, 0xef4444] };
      const list = Array.isArray(itemCount) ? itemCount.filter(e => !e.category || e.category === 'Fish') : Array.from({ length: itemCount || 0 }, () => ({}));
      const n = Math.min(24, list.length), cols = tier === 1 ? 3 : Math.max(3, Math.round(spreadX * 2 * 3.2 / 0.34)), rows = Math.ceil(Math.min(n, cols * 2) / cols) || 1;
      const cw = tier === 1 ? 0.2 : spreadX * 1.05, cd = tier === 1 ? 0.2 : Math.max(0.22, spreadZ * 1.5);
      for (let i = 0; i < n; i++) {
        const e = list[i], c = rc[e.rarity] || fishColors[i % 4], layer = Math.floor(i / (cols * 2)), k = i % (cols * 2), col = k % cols, row = Math.floor(k / cols), rn = Math.min(2, Math.ceil((n - layer * cols * 2) / cols));
        const f = this.miniFish(c[0], c[1], K);
        f.position.set((col - (cols - 1) / 2) * cw + Math.sin(i * 12.9) * 0.03, topY + 0.02 + layer * 0.06 + (k % 2) * 0.02, (row - (rn - 1) / 2) * cd + Math.cos(i * 7.3) * 0.03);
        f.rotation.set(0.12 * Math.sin(i * 3.1), (i % 2 ? 0.15 : Math.PI - 0.15) + Math.sin(i * 5.7) * 0.5, 0.18 * Math.cos(i * 2.3));
        f.scale.setScalar((tier === 1 ? 0.42 : 0.5) * (0.85 + Math.min(1, Math.cbrt((e.weight || 1) / 8)) * 0.5));
        group.add(f);
      }
    };

    if (tier === 1) { // galvanised tin pail with rope handle
      const tin = K.M(0x64748b, 0.4, 0.7);
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.28, 0.78, 20, 1, true), new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.7, side: THREE.DoubleSide }));
      body.position.y = 0.41; group.add(body);
      K.cyl(group, 0.28, 0.28, 0.03, tin, 0, 0.03, 0, 20);
      [0.18, 0.62].forEach(y => { const r = new THREE.Mesh(new THREE.TorusGeometry(y < 0.3 ? 0.3 : 0.365, 0.025, 6, 20), K.M(0x475569, 0.4, 0.7)); r.rotation.x = Math.PI / 2; r.position.y = y; group.add(r); });
      const water = new THREE.Mesh(new THREE.CircleGeometry(0.34, 20), K.M(0x38bdf8, 0.15, 0.1, { transparent: true, opacity: 0.8 }));
      water.rotation.x = -Math.PI / 2; water.position.y = 0.66; group.add(water);
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.022, 6, 18, Math.PI), K.rope);
      handle.position.y = 0.78; handle.rotation.z = 0; group.add(handle);
      addFish(0.8, 0.18, 0.12);
    } else {
      // Open-top containers (cooler, fish box, freezer): lined walls, ice, and a lid hinged open at the back.
      const spec = tier === 2
        ? { w: 1.3, h: 0.66, d: 0.76, shell: 0x0284c7, rim: 0xf8fafc, lining: 0xe0f2fe, lidTop: 0xf8fafc, lidIn: 0xbae6fd, hinge: 0xf1f5f9, glow: 0x7dd3fc }
        : tier === 3
          ? { w: 1.55, h: 0.78, d: 0.8, shell: 0xe2e8f0, rim: 0x5b3a1a, lining: 0xcbd5e1, lidTop: 0x5b3a1a, lidIn: 0xe2e8f0, hinge: 0xd9a21b, glow: 0x93c5fd }
          : { w: 1.7, h: 0.92, d: 0.9, shell: 0x0f172a, rim: 0x1e293b, lining: 0xa5f3fc, lidTop: 0x1e293b, lidIn: 0x67e8f9, hinge: 0x94a3b8, glow: 0x22d3ee };
      const { w, h, d } = spec, t = 0.07;
      const shell = K.M(spec.shell, tier === 4 ? 0.35 : 0.5, tier === 4 ? 0.4 : 0.05, tier === 3 ? { map: textures.wood } : {});
      const lining = K.M(spec.lining, 0.5);
      // floor, four walls, and an inner lining so the inside reads as hollow
      K.box(group, w, 0.06, d, shell, 0, 0.03, 0);
      K.box(group, w, h, t, shell, 0, h / 2, d / 2 - t / 2);
      K.box(group, w, h, t, shell, 0, h / 2, -d / 2 + t / 2);
      [-1, 1].forEach(sx => K.box(group, t, h, d, shell, sx * (w / 2 - t / 2), h / 2, 0));
      K.box(group, w - 2 * t, 0.03, d - 2 * t, lining, 0, 0.09, 0);
      [-1, 1].forEach(sz => K.box(group, w - 2 * t, h - 0.1, 0.02, lining, 0, 0.1 + (h - 0.1) / 2, sz * (d / 2 - t - 0.01)));
      [-1, 1].forEach(sx => K.box(group, 0.02, h - 0.1, d - 2 * t, lining, sx * (w / 2 - t - 0.01), 0.1 + (h - 0.1) / 2, 0));
      // rim around the opening
      const rim = K.M(spec.rim, 0.5, tier === 4 ? 0.3 : 0);
      K.box(group, w + 0.05, 0.05, 0.09, rim, 0, h + 0.02, d / 2);
      K.box(group, w + 0.05, 0.05, 0.09, rim, 0, h + 0.02, -d / 2);
      [-1, 1].forEach(sx => K.box(group, 0.09, 0.05, d, rim, sx * (w / 2), h + 0.02, 0));
      // crushed ice (or cold water) the catch lies in
      const iceLevel = h - 0.2;
      const ice = K.M(0xe0f2fe, 0.25, 0.1, { transparent: true, opacity: 0.82 });
      K.box(group, w - 0.18, 0.05, d - 0.18, K.M(spec.glow, 0.2, 0.1, { transparent: true, opacity: 0.55 }), 0, iceLevel, 0);
      for (let i = 0; i < 16; i++) {
        const sz = 0.07 + (i % 3) * 0.025;
        const cube = K.box(group, sz, sz, sz, ice, -w / 2 + 0.16 + ((i * 0.37) % 1) * (w - 0.32), iceLevel + 0.03 + (i % 4) * 0.018, -d / 2 + 0.14 + ((i * 0.61) % 1) * (d - 0.28));
        cube.rotation.set(i * 0.7, i * 1.1, i * 0.4);
      }
      // lid hinged at the back edge, swung open and leaning back
      const lid = new THREE.Group();
      lid.position.set(0, h + 0.03, -d / 2);
      K.box(lid, w + 0.06, 0.07, d + 0.05, K.M(spec.lidTop, 0.5, tier === 4 ? 0.3 : 0), 0, 0.035, (d + 0.05) / 2);
      K.box(lid, w - 0.1, 0.03, d - 0.1, K.M(spec.lidIn, 0.5), 0, -0.01, (d + 0.05) / 2);
      if (tier === 3) [-0.5, 0, 0.5].forEach(x => K.box(lid, 0.08, 0.075, d + 0.07, K.M(0x7c4a1e, 0.85, 0, { map: textures.wood }), x, 0.037, (d + 0.05) / 2));
      lid.rotation.x = -2.05; // opened past vertical, resting back
      group.add(lid);
      [-w * 0.32, w * 0.32].forEach(x => K.box(group, 0.12, 0.07, 0.08, K.M(spec.hinge, 0.4, 0.6), x, h + 0.02, -d / 2));
      // front latches / handles / gauges per tier
      if (tier === 2) {
        [-0.45, 0.45].forEach(x => { K.box(group, 0.15, 0.18, 0.05, K.M(0x0f172a, 0.5), x, h - 0.1, d / 2 + 0.03); K.box(group, 0.1, 0.05, 0.06, K.steel, x, h, d / 2 + 0.03); });
        [-1, 1].forEach(sx => K.box(group, 0.1, 0.1, 0.3, K.M(0xf8fafc, 0.5), sx * (w / 2 + 0.04), h * 0.7, 0));
      } else if (tier === 3) {
        [-1, 1].forEach(sx => { const hd = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 5, 10, Math.PI), K.M(0x78350f, 0.9)); hd.position.set(sx * (w / 2 + 0.01), h * 0.65, 0); hd.rotation.y = Math.PI / 2; group.add(hd); });
        [-0.52, 0, 0.52].forEach(x => K.box(group, 0.07, h, 0.01, K.M(0x7c4a1e, 0.85, 0, { map: textures.wood }), x, h / 2, d / 2 + 0.01));
        K.box(group, 0.26, 0.1, 0.03, K.brass, 0, h - 0.18, d / 2 + 0.03);
      } else {
        const cyan = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
        K.box(group, w - 0.1, 0.035, 0.03, cyan, 0, h * 0.82, d / 2 + 0.03);
        K.box(group, w - 0.1, 0.035, 0.03, cyan, 0, h * 0.18, d / 2 + 0.03);
        K.cyl(group, 0.1, 0.1, 0.04, K.steel, -0.55, h * 0.5, d / 2 + 0.03, 14).rotation.x = Math.PI / 2;
        K.box(group, 0.3, 0.12, 0.03, K.M(0x052e16, 0.3, 0, { emissive: new THREE.Color(0x4ade80), emissiveIntensity: 0.6 }), 0.1, h * 0.5, d / 2 + 0.03);
        K.sph(group, 0.04, new THREE.MeshBasicMaterial({ color: 0x4ade80 }), 0.6, h * 0.5, d / 2 + 0.03);
        [-1, 1].forEach(sx => K.box(group, 0.12, 0.5, 0.5, K.M(0x1e293b, 0.4, 0.5), sx * (w / 2 + 0.06), h * 0.55, 0));
        // cold mist rolling over the rim
        for (let i = 0; i < 5; i++) K.sph(group, 0.09 + (i % 2) * 0.04, new THREE.MeshBasicMaterial({ color: 0xcffafe, transparent: true, opacity: 0.18, depthWrite: false }), -0.55 + i * 0.28, h + 0.1 + (i % 3) * 0.05, 0.1 - (i % 2) * 0.2, 8, 6);
      }
      addFish(h - 0.03, Math.min(0.34, (w - 0.4) / 3.5), d * 0.22);   // heaped up to the rim so every fish shows
    }
    if (goldVault) { // the Deep-Freeze Vault: the freezer in bronze and gold
      group.traverse(o => {
        if (!o.material || !o.material.color) return;
        const hex = o.material.color.getHex();
        if (hex === 0x0f172a) o.material.color.setHex(0x92400e);
        else if (hex === 0x1e293b) o.material.color.setHex(0xfacc15);
        else if (hex === 0x22d3ee) o.material.color.setHex(0xfbbf24);
      });
    }
    return group;
  },
};
