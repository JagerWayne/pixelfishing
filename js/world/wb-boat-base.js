/* WorldBuilder method: buildBoatMeshBase, the four detailed boats on the lofted hull. Kept whole. */
import { THREE } from '../engine/three.js';
import { ModelKit } from '../render/model-kit.js';

export const wbBoatBaseStatics = {
  buildBoatMeshBase(tier, textures) {
    const group = new THREE.Group();
    if (tier === 0) return group;
    const M = (color, rough = 0.6, metal = 0, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal }, extra));
    const box = (w, h, d, mat, x, y, z, parent = group) => { const m = new THREE.Mesh(ModelKit.roundedBox(w, h, d, ModelKit.bevelFor(w, h, d)), mat); m.position.set(x, y, z); parent.add(m); return m; };
    const torus = (r, tube, mat, x, y, z, rotY = 0, parent = group) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 6, 16), mat); m.position.set(x, y, z); m.rotation.y = rotY; parent.add(m); return m; };
    const cyl = (rt, rb, h, mat, x, y, z, seg = 10, parent = group) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); parent.add(m); return m; };
    const hullMat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.55, metalness: 0.05 });
    const addRails = (hull, mat, radius, lift = 0.0, from = 0.04, to = 0.98) => {
      { // rail across the top of the transom so the stern reads as a finished edge
        const st = hull.sternTop;
        const cap = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(st.x) * 2 + radius * 2, radius * 2, radius * 2.4), mat);
        cap.position.set(0, st.y + lift, st.z); group.add(cap);
      }
      [-1, 1].forEach(side => {
        const pts = [];
        for (let i = 0; i <= 24; i++) { const t = from + (to - from) * (i / 24); pts.push(new THREE.Vector3(side * hull.halfW(t) * 1.01, hull.sheerY(t) + lift, -hull.L / 2 + t * hull.L)); }
        group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, radius, 6, false), mat));
      });
    };
    // Helm wheel: a tilted pivot facing aft (toward the driver) with a spinning rim, spokes and hub.
    // userData.helm.spin turns with steering; the hands are put on its rim every frame.
    const makeWheel = (x, y, z, r, tilt) => {
      const piv = new THREE.Group(); piv.position.set(x, y, z); piv.rotation.x = tilt; group.add(piv);
      const spin = new THREE.Group(); piv.add(spin);
      const rimM = M(0x111827, 0.5), hubM = M(0xcbd5e1, 0.3, 0.8);
      spin.add(new THREE.Mesh(new THREE.TorusGeometry(r, 0.018, 6, 22), rimM));
      for (let k = 0; k < 3; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(r * 2, 0.018, 0.012), hubM); sp.rotation.z = k * Math.PI / 3; spin.add(sp); }
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 10), hubM); hub.rotation.x = Math.PI / 2; spin.add(hub);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.03, 0.18, 8), M(0x334155, 0.5, 0.3)); col.rotation.x = Math.PI / 2; col.position.z = -0.1; piv.add(col);
      group.userData.helm = { kind: 'wheel', spin, r };
      return piv;
    };
    const outboard = (x, y, z, cowl, leg) => {
      const o = new THREE.Group();
      const cow = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.5, 0.58), M(cowl, 0.4, 0.2)); cow.position.y = 0.55;
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.1, 10), M(0x111827, 0.5)); top.position.y = 0.84;
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.9, 0.22), M(leg, 0.5, 0.3)); shaft.position.y = -0.15;
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8), M(leg, 0.4, 0.4)); foot.rotation.x = Math.PI / 2; foot.position.set(0, -0.62, 0.08);
      const prop = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.03), M(0xcbd5e1, 0.3, 0.8)); prop.position.set(0, -0.62, 0.34);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.47, 0.06, 0.59), M(0xdc2626, 0.5)); stripe.position.y = 0.45;
      o.add(cow, top, shaft, foot, prop, stripe); o.position.set(x, y, z); group.add(o);
    };

    if (tier === 1) {
      // ---- Wooden clinker rowboat ----
      const hull = this.loftHull({ L: 4.6, beam: 2.3, draft: 0.34, depth: 1.0, bowRise: 0.55, sternRise: 0.4, sternW: 0.72, planks: 4,
        bands: [{ y0: -9, y1: 0.0, color: '#7a4a24' }, { y0: 0.0, y1: 0.08, color: '#d6c8a0' }, { y0: 0.08, y1: 9, color: '#b97a3e' }] });
      hull.L = 4.6; group.add(new THREE.Mesh(hull.geo, hullMat), new THREE.Mesh(hull.transom, hullMat));
      const trim = M(0x3b1f0d, 0.7), wood = M(0xc98a4a, 0.75), dark = M(0x2b180b, 0.8);
      addRails(hull, trim, 0.06, 0.02);
      // floor boards, thwarts, stem post
      for (let i = 0; i < 5; i++) box(0.3, 0.03, 2.6, wood, -0.6 + i * 0.3, 0.02, 0.3);
      [-1.2, 0.55, 1.45].forEach((z, i) => { const w = hull.halfW((z + 2.3) / 4.6) * 1.82; box(w, 0.07, 0.34, trim, 0, 0.5, z); box(w * 0.92, 0.05, 0.3, wood, 0, 0.55, z); });
      const stem = box(0.1, 1.0, 0.1, trim, 0, 0.35, -2.25); stem.rotation.x = -0.6;
      // oars resting across the gunwales
      [[-0.35, 0.2], [0.4, -0.15]].forEach(([z, rot], i) => {
        const oar = new THREE.Group();
        const shaft = cyl(0.03, 0.03, 3.3, wood, 0, 0, 0, 6, oar); shaft.rotation.z = Math.PI / 2;
        const blade = box(0.5, 0.03, 0.2, wood, -1.55, 0, 0, oar);
        oar.position.set(0, 0.62, z); oar.rotation.y = rot; group.add(oar);
      });
      // rope coil, lantern, fender
      const rope = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 6, 14), M(0xa8845a, 0.95)); rope.rotation.x = Math.PI / 2; rope.position.set(0.4, 0.07, -1.6); group.add(rope);
      cyl(0.07, 0.07, 0.16, M(0xfacc15, 0.4, 0.5, { emissive: new THREE.Color(0xf59e0b), emissiveIntensity: 0.5 }), -0.5, 0.52, -1.35, 8);
      outboard(0, 0.52, 2.45, 0x64748b, 0x475569);
      {
        const piv = new THREE.Group(); piv.position.set(0, 0.9, 2.3); group.add(piv);
        const dir = new THREE.Vector3(0.36, -0.12, -0.92).normalize(), len = 0.72;
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, len, 6), trim);
        arm.position.copy(dir).multiplyScalar(len / 2); arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); piv.add(arm);
        const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.13, 8), M(0x111827, 0.7));
        grip.position.copy(dir).multiplyScalar(len + 0.04); grip.quaternion.copy(arm.quaternion); piv.add(grip);
        group.userData.helm = { kind: 'tiller', pivot: piv, grip: dir.clone().multiplyScalar(len + 0.02) };
      }
      // ---- v3.8 detail pass: steamed ribs inside the hull, oarlocks, a bow painter and a bailer ----
      for (let i = 0; i < 9; i++) {
        const t = 0.14 + i * 0.085, z = -2.3 + t * 4.6, hw = hull.halfW(t), top = hull.sheerY(t), bot = hull.keelY(t) + 0.08;
        const pts = [];
        for (let k = 0; k <= 8; k++) { const u = k / 8 * 2 - 1; pts.push(new THREE.Vector3(u * hw * 0.93 * (1 - 0.15 * (1 - Math.abs(u))), bot + (top - bot) * Math.pow(Math.abs(u), 1.6), z)); }
        group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.025, 4, false), dark));
      }
      [-1, 1].forEach(sd => [-0.1].forEach(z => { const t = (z + 2.3) / 4.6; const x = sd * hull.halfW(t); cyl(0.02, 0.02, 0.14, M(0x94a3b8, 0.3, 0.8), x, hull.sheerY(t) + 0.12, z, 6); torus(0.05, 0.012, M(0x94a3b8, 0.3, 0.8), x, hull.sheerY(t) + 0.2, z, Math.PI / 2); }));
      { const painter = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.95, -2.3), new THREE.Vector3(0.15, 0.7, -2.1), new THREE.Vector3(0.3, 0.12, -1.9)]), 12, 0.018, 4, false), M(0xa8845a, 0.95)); group.add(painter); }
      cyl(0.1, 0.08, 0.12, M(0x0e7490, 0.6), -0.45, 0.1, 0.7, 10);
    }

    if (tier === 2) {
      // ---- Fiberglass centre-console skiff ----
      const hull = this.loftHull({ L: 6.0, beam: 2.7, draft: 0.62, depth: 1.5, bowRise: 0.42, sternRise: 0.1, sternW: 0.88, planks: 0,
        bands: [{ y0: -9, y1: -0.2, color: '#b91c1c' }, { y0: -0.2, y1: -0.1, color: '#f8fafc' }, { y0: -0.1, y1: 0.55, color: '#f8fafc' }, { y0: 0.55, y1: 0.72, color: '#1d4ed8' }, { y0: 0.72, y1: 9, color: '#f8fafc' }] });
      hull.L = 6.0; group.add(new THREE.Mesh(hull.geo, hullMat), new THREE.Mesh(hull.transom, hullMat));
      const white = M(0xf8fafc, 0.4), grey = M(0x94a3b8, 0.5, 0.2), blue = M(0x1d4ed8, 0.45), steel = M(0xcbd5e1, 0.3, 0.8), glass = M(0x7dd3fc, 0.1, 0.1, { transparent: true, opacity: 0.45 });
      addRails(hull, steel, 0.045, 0.02);
      // deck & coaming
      box(1.7, 0.05, 4.2, M(0xe2e8f0, 0.9), 0, 0.1, 0.3);
      for (let i = -3; i <= 3; i++) box(0.012, 0.055, 4.1, M(0x94a3b8, 0.9), i * 0.22, 0.105, 0.3);
      // console with sloped front, windshield and wheel
      box(0.86, 1.0, 0.8, white, 0, 0.65, -0.55);
      box(0.9, 0.06, 0.84, blue, 0, 1.17, -0.55);
      const screen = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.5, 0.03), glass); screen.position.set(0, 1.5, -0.9); screen.rotation.x = -0.3; group.add(screen);
      [-0.43, 0.43].forEach(x => box(0.03, 0.5, 0.03, steel, x, 1.5, -0.9).rotation.x = -0.3);
      makeWheel(0, 1.04, -0.06, 0.15, -0.5);                                   // wheel on the aft face, toward the driver
      box(0.34, 0.12, 0.03, M(0x0f172a, 0.3, 0.3, { emissive: new THREE.Color(0x0ea5e9), emissiveIntensity: 0.35 }), -0.2, 1.08, -0.14);   // chart plotter
      { const th = box(0.04, 0.18, 0.04, steel, 0.32, 1.22, -0.12); th.rotation.x = -0.4; cyl(0.03, 0.03, 0.05, M(0x111827, 0.6), 0.32, 1.31, -0.08, 8); }   // throttle
      // leaning post: frame, padded bolster and a footrest
      [-0.3, 0.3].forEach(x => box(0.05, 0.85, 0.05, steel, x, 0.55, 0.66));
      box(0.75, 0.24, 0.18, M(0x1d4ed8, 0.75), 0, 1.02, 0.66);
      box(0.66, 0.04, 0.05, steel, 0, 0.3, 0.6);
      // bow rail & cleat, cooler seat, rod holders, light
      box(1.24, 0.05, 0.05, steel, 0, 0.98, -2.1);
      [-0.62, 0.62].forEach(x => cyl(0.025, 0.025, 0.45, steel, x, 0.78, -2.1, 6));
      box(0.9, 0.42, 0.5, blue, 0, 0.3, 1.55); box(0.92, 0.05, 0.52, white, 0, 0.55, 1.55);
      [-1, 1].forEach(s => [-0.2, 1.0].forEach(z => { const h = cyl(0.05, 0.05, 0.3, steel, s * hull.halfW((z + 3) / 6) * 0.98, 0.95, z, 8); h.rotation.z = -s * 0.4; }));
      [-1, 1].forEach(s => cyl(0.045, 0.045, 0.1, M(s > 0 ? 0x16a34a : 0xdc2626, 0.4, 0, { emissive: new THREE.Color(s > 0 ? 0x16a34a : 0xdc2626), emissiveIntensity: 0.6 }), s * 0.45, 1.0, -2.2, 8));
      outboard(0, 0.9, 3.15, 0x111827, 0x94a3b8);
      box(0.18, 0.05, 0.1, steel, 0, 0.6, 3.0);
      // ---- v3.8 detail pass: T-top canopy, grab rails, bow cushions, livewell lid, cleats and a VHF whip ----
      [[-0.55, -0.95], [0.55, -0.95], [-0.55, -0.05], [0.55, -0.05]].forEach(([x, z]) => cyl(0.025, 0.025, 1.45, steel, x, 1.55, z, 6));
      box(1.5, 0.06, 1.25, M(0x1e3a8a, 0.8), 0, 2.28, -0.5);
      box(1.56, 0.04, 1.31, steel, 0, 2.24, -0.5);
      cyl(0.012, 0.016, 1.6, M(0xf8fafc, 0.4), 0.6, 3.05, -0.9, 5);
      [-1, 1].forEach(sd => { const gr = cyl(0.02, 0.02, 0.7, steel, sd * 0.47, 1.25, -0.55, 6); gr.rotation.x = Math.PI / 2; });
      box(1.2, 0.12, 0.9, M(0xe2e8f0, 0.7), 0, 0.2, -1.65);
      [-0.3, 0.3].forEach(x => box(0.55, 0.1, 0.8, M(0x1d4ed8, 0.75), x, 0.31, -1.65));
      box(0.6, 0.04, 0.4, M(0xcbd5e1, 0.5), 0.55, 0.14, 1.9);
      [-1, 1].forEach(sd => [-1.5, 2.2].forEach(z => box(0.06, 0.04, 0.22, steel, sd * hull.halfW((z + 3) / 6) * 0.9, 0.86, z)));
    }

    if (tier === 3) {
      // ---- Deep-sea steel trawler ----
      const hull = this.loftHull({ L: 9.4, beam: 3.7, draft: 1.0, depth: 2.05,   // sheer ~0.55 m above the deck, so the wheelhouse stands clear of the bulwark
        bowRise: 0.5, sternRise: 0.2, sternW: 0.86, planks: 0,
        bands: [{ y0: -9, y1: -0.15, color: '#7f1d1d' }, { y0: -0.15, y1: 0.0, color: '#f8fafc' }, { y0: 0.0, y1: 0.7, color: '#1e3a8a' }, { y0: 0.7, y1: 0.85, color: '#facc15' }, { y0: 0.85, y1: 9, color: '#1e3a8a' }] });
      hull.L = 9.4; group.add(new THREE.Mesh(hull.geo, hullMat), new THREE.Mesh(hull.transom, hullMat));
      const white = M(0xf1f5f9, 0.45), steel = M(0x94a3b8, 0.4, 0.6), darkM = M(0x1e293b, 0.6, 0.3), orange = M(0xf97316, 0.5), red = M(0xb91c1c, 0.5), yellow = M(0xfacc15, 0.5);
      const glassM = M(0x0b1220, 0.15, 0.3, { emissive: new THREE.Color(0x0ea5e9), emissiveIntensity: 0.28 });
      addRails(hull, steel, 0.05, 0.1, 0.1, 0.96);
      // deck
      box(2.5, 0.06, 6.6, M(0x78716c, 0.9), 0, 0.5, 0.8);
      box(2.3, 0.5, 1.6, M(0x1e3a8a, 0.5), 0, 0.75, -2.0); // forecastle
      // wheelhouse + windows + roof + radar
      // open-backed wheelhouse: front wall with window openings, two side walls and a floor (the back is open)
      box(2.0, 0.98, 0.06, white, 0, 1.29, -2.87);
      box(2.0, 0.06, 0.06, white, 0, 2.27, -2.87);
      [-0.97, -0.3, 0.3, 0.97].forEach(x => box(0.06, 0.47, 0.06, white, x, 2.015, -2.87));
      [-1, 1].forEach(sd => box(0.06, 1.5, 2.0, white, sd * 0.97, 1.55, -1.9));
      box(1.9, 0.05, 1.9, M(0x78716c, 0.9), 0, 1.02, -1.9);
      // helm console, wheel and a helm chair
      box(1.5, 0.8, 0.36, darkM, 0, 1.42, -2.62);
      box(1.5, 0.05, 0.4, M(0x111827, 0.5), 0, 1.84, -2.6);
      box(0.5, 0.16, 0.03, M(0x0b1220, 0.2, 0.3, { emissive: new THREE.Color(0x22c55e), emissiveIntensity: 0.4 }), 0.42, 1.7, -2.44);
      makeWheel(0, 1.72, -2.36, 0.17, -0.45);
      cyl(0.05, 0.08, 0.4, steel, 0, 1.22, -1.92, 10);
      box(0.52, 0.1, 0.5, M(0x1e3a8a, 0.7), 0, 1.43, -1.94);
      box(0.52, 0.55, 0.08, M(0x1e3a8a, 0.7), 0, 1.76, -1.68);
      [-1, 1].forEach(sd => box(0.06, 0.05, 0.36, steel, sd * 0.27, 1.6, -1.9));
      box(2.2, 0.12, 2.2, red, 0, 2.35, -1.9);
      { const glassT = M(0x9bd8f5, 0.05, 0.2, { transparent: true, opacity: 0.22, depthWrite: false }); [-0.635, 0, 0.635].forEach(x => box(0.6, 0.47, 0.02, glassT, x, 2.015, -2.88)); }
      [-1, 1].forEach(s => [-2.3, -1.6].forEach(z => box(0.04, 0.4, 0.4, glassM, s * 1.01, 1.8, z)));
      cyl(0.05, 0.05, 0.3, steel, 0.5, 2.55, -1.9, 6);
      box(0.9, 0.06, 0.12, steel, 0.5, 2.75, -1.9);
      // funnel, mast with crow's nest and rigging
      cyl(0.32, 0.38, 1.0, red, 0, 2.95, -1.0, 12);
      cyl(0.33, 0.33, 0.18, M(0x111827, 0.7), 0, 3.5, -1.0, 12);
      cyl(0.06, 0.08, 4.2, steel, 0.75, 3.4, -3.3, 8);
      cyl(0.22, 0.22, 0.28, yellow, 0.75, 4.6, -3.3, 8);
      [-1, 1].forEach(s => { const stay = cyl(0.012, 0.012, 4.4, darkM, s * 0.8, 2.9, -1.5, 4); stay.rotation.z = s * 0.3; stay.rotation.x = 0.25; });
      // nav lights
      [[-1, 0xdc2626], [1, 0x16a34a]].forEach(([s, c]) => { const l = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: c })); l.position.set(s * 1.05, 2.1, -2.7); group.add(l); });
      // winch drum, A-frame gantry and trawl block at the stern
      const drum = cyl(0.45, 0.45, 1.4, orange, 0, 0.95, 1.9, 14); drum.rotation.z = Math.PI / 2;
      [-0.78, 0.78].forEach(x => cyl(0.55, 0.55, 0.06, steel, x, 0.95, 1.9, 14).rotation.z = Math.PI / 2);
      [-1, 1].forEach(s => { const leg = box(0.12, 3.2, 0.12, yellow, s * 1.25, 2.0, 3.6); leg.rotation.x = 0.28; });
      box(2.7, 0.14, 0.14, yellow, 0, 3.55, 3.15);
      const block = cyl(0.12, 0.12, 0.2, steel, 0, 3.35, 3.15, 10); block.rotation.z = Math.PI / 2;
      cyl(0.012, 0.012, 3.3, darkM, 0, 1.9, 2.5, 4).rotation.x = -0.55;
      // trawl doors (otter boards) hung on the quarters
      [-1, 1].forEach(s => { const d = box(0.08, 1.0, 0.8, M(0x7f1d1d, 0.6, 0.3), s * 1.93, 0.6, 1.6); d.rotation.z = s * 0.1; box(0.1, 0.1, 0.9, steel, s * 1.93, 1.12, 1.6); });
      // crates, barrels, life ring
      [[-1.0, 1.0], [-0.55, 1.4], [0.9, 0.2]].forEach(([x, z], i) => box(0.6, 0.45, 0.6, M(i % 2 ? 0x0e7490 : 0xea580c, 0.7), x, 0.78, z));
      [[1.1, -0.9], [1.2, -0.3]].forEach(([x, z]) => cyl(0.26, 0.26, 0.6, M(0x1d4ed8, 0.6), x, 0.83, z, 12));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.07, 8, 16), M(0xf97316, 0.5)); ring.position.set(1.04, 1.5, -1.9); ring.rotation.y = Math.PI / 2; group.add(ring);
      // anchor and bow bollard
      box(0.18, 0.18, 0.3, steel, 0, 1.08, -3.8);
      // ---- v3.8 detail pass: hull portholes, window frames, wheelhouse door, a life-raft canister, a net on the drum,
      // a ladder to the wheelhouse roof, floats along the rail and an exhaust cap ----
      [-1, 1].forEach(sd => [-3.0, -2.2, -1.4].forEach(z => {
        const t = (z + 4.7) / 9.4, x = sd * hull.halfW(t) * 1.0;
        const ph = torus(0.11, 0.025, steel, x, 0.45, z, Math.PI / 2);
        const gl = cyl(0.09, 0.09, 0.02, glassM, x, 0.45, z, 10); gl.rotation.z = Math.PI / 2;
      }));
      { const raft = cyl(0.25, 0.25, 0.8, white, 0.75, 2.6, -2.2, 12); raft.rotation.x = Math.PI / 2; [0.25, -0.25].forEach(dz => torus(0.255, 0.02, M(0x1e293b, 0.6), 0.75, 2.6, -2.2 + dz)); }
      { const netM = M(0x15803d, 0.95); const n = cyl(0.5, 0.5, 1.2, netM, 0, 0.95, 1.9, 14); n.rotation.z = Math.PI / 2; for (let k = 0; k < 6; k++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), orange); f.position.set(-0.5 + k * 0.2, 1.47, 1.9); group.add(f); } }
      for (let k = 0; k < 5; k++) box(0.04, 0.03, 0.4, steel, 1.02, 0.95 + k * 0.3, -1.3);   // ladder to the roof on the starboard wall
      [-1, 1].forEach(sd => [0.6, 1.4, 2.4].forEach(z => { const f = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), z === 1.4 ? yellow : orange); f.position.set(sd * hull.halfW((z + 4.7) / 9.4) * 1.02, 0.86, z); group.add(f); }));
      cyl(0.18, 0.2, 0.25, M(0x111827, 0.7), 0, 3.65, -1.0, 10);
      group.userData.helm.roof = group.children.filter(m => m.isMesh && m.position.y >= 2.3 && m.position.y < 2.9 && m.position.z < -0.7 && m.position.z > -3.1);
      group.userData.helm.roof.forEach(m => { m.material = m.material.clone(); m.material.transparent = true; });
    }
    if (tier === 4) {
      // ---- Expedition yacht: twin outboards, flybridge and an aft helm ----
      const hull = this.loftHull({ L: 11.0, beam: 4.0, draft: 0.9, depth: 1.9,    // low freeboard: the cabin and its windows sit above the sheer
        bowRise: 0.6, sternRise: 0.15, sternW: 0.9, planks: 0,
        bands: [{ y0: -9, y1: -0.2, color: '#1e3a8a' }, { y0: -0.2, y1: -0.05, color: '#f8fafc' }, { y0: -0.05, y1: 0.55, color: '#f8fafc' }, { y0: 0.55, y1: 0.72, color: '#facc15' }, { y0: 0.72, y1: 9, color: '#f8fafc' }] });
      hull.L = 11.0; group.add(new THREE.Mesh(hull.geo, hullMat), new THREE.Mesh(hull.transom, hullMat));
      const white = M(0xf8fafc, 0.35), navy = M(0x1e3a8a, 0.45), steel = M(0xcbd5e1, 0.3, 0.8), teak = M(0xb9854a, 0.8);
      const glassM = M(0x0b1220, 0.12, 0.3, { emissive: new THREE.Color(0x0ea5e9), emissiveIntensity: 0.3 });
      addRails(hull, steel, 0.05, 0.12, 0.08, 0.97);
      box(3.2, 0.06, 8.6, teak, 0, 0.52, 0.25);                       // teak aft deck
      box(3.0, 1.0, 3.6, white, 0, 1.05, -2.5);                       // low main cabin (the helm sees over it)
      box(3.1, 0.1, 3.7, navy, 0, 1.6, -2.5);
      [-0.9, 0, 0.9].forEach(x => box(0.7, 0.42, 0.04, glassM, x, 1.15, -4.32));
      [-1, 1].forEach(sd => [-3.4, -2.5, -1.6].forEach(z => box(0.04, 0.38, 0.6, glassM, sd * 1.51, 1.15, z)));
      [-1, 1].forEach(sd => box(0.08, 1.4, 0.08, steel, sd * 1.25, 1.95, -0.95));   // radar arch over the cabin's aft end
      box(2.6, 0.1, 0.12, steel, 0, 2.65, -0.95);
      cyl(0.05, 0.05, 0.3, steel, 0, 2.85, -0.95, 6);
      box(1.0, 0.06, 0.14, steel, 0, 3.02, -0.95);
      cyl(0.04, 0.06, 1.6, steel, 0.9, 3.4, -0.95, 6);
      // raised helm platform: console with the wheel on its aft face, a seat with a backrest, a step
      box(2.0, 0.3, 1.7, teak, 0, 0.67, -0.05);
      box(1.1, 0.8, 0.5, white, 0, 1.22, -0.45);
      box(1.14, 0.06, 0.55, navy, 0, 1.64, -0.45);
      makeWheel(0, 1.52, -0.17, 0.16, -0.5);
      box(0.34, 0.12, 0.03, M(0x0b1220, 0.2, 0.3, { emissive: new THREE.Color(0x0ea5e9), emissiveIntensity: 0.35 }), -0.32, 1.56, -0.19);
      box(0.92, 0.37, 0.5, white, 0, 1.005, 0.32);
      box(0.94, 0.08, 0.52, navy, 0, 1.23, 0.32);
      box(0.94, 0.55, 0.1, white, 0, 1.55, 0.58); box(0.86, 0.45, 0.04, navy, 0, 1.57, 0.52);
      box(0.8, 0.12, 0.3, teak, 0, 0.58, 0.95);
      { const glassT = M(0x9bd8f5, 0.05, 0.2, { transparent: true, opacity: 0.22, depthWrite: false }); const screen = box(1.1, 0.4, 0.03, glassT, 0, 1.86, -0.72); screen.rotation.x = -0.3; }
      box(2.4, 0.4, 0.5, white, 0, 0.78, 3.0); box(2.4, 0.08, 0.55, navy, 0, 1.02, 3.0);   // aft bench
      // ---- v3.8 detail pass: hull portholes, a window band around the cabin, flybridge rails, a radome, bow sun
      // pads, an anchor on the stem, cushions on the bench and a tender on the cabin roof ----
      [-1, 1].forEach(sd => [-3.8, -3.1, -2.4, -1.7].forEach(z => {
        const t = (z + 5.5) / 11, x = sd * hull.halfW(t) * 1.0;
        torus(0.1, 0.022, steel, x, 0.3, z, Math.PI / 2);
        const gl = cyl(0.085, 0.085, 0.02, glassM, x, 0.3, z, 10); gl.rotation.z = Math.PI / 2;
      }));
      [-1, 1].forEach(sd => box(0.02, 0.1, 3.5, navy, sd * 1.51, 1.45, -2.5));
      { const dome = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), white); dome.position.set(-0.45, 1.65, -3.2); group.add(dome); }
      [-0.55, 0.55].forEach(x => { const pad = box(0.95, 0.12, 1.3, M(0xe2e8f0, 0.8), x, 0.62 + 0.2, -4.0); pad.rotation.x = -0.08; });
      { const anc = box(0.1, 0.4, 0.06, steel, 0, 0.9, -5.35); anc.rotation.x = 0.3; box(0.34, 0.08, 0.06, steel, 0, 0.72, -5.38); }
      [-0.8, 0, 0.8].forEach(x => box(0.7, 0.1, 0.42, M(0x0ea5e9, 0.8), x, 1.11, 3.0));
      { const tender = new THREE.Group(); const tb = cyl(0.3, 0.3, 1.8, M(0xf97316, 0.6), 0, 0, 0, 10, tender); tb.rotation.x = Math.PI / 2; tb.scale.set(1.2, 1, 0.55);
        box(0.5, 0.06, 0.5, M(0x1e293b, 0.6), 0, 0.12, 0.6, tender); tender.position.set(1.0, 1.84, -3.1); group.add(tender); }
      outboard(-0.95, 0.95, 5.55, 0x111827, 0x94a3b8); outboard(0.95, 0.95, 5.55, 0x111827, 0x94a3b8);
      [[-1, 0xdc2626], [1, 0x16a34a]].forEach(([sd, c]) => { const l = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: c })); l.position.set(sd * 1.0, 1.4, -4.2); group.add(l); });
    }
    return group;
  },
};
