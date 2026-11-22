/* WorldBuilder methods: the tackle toolbox and the bounty board. */
import { THREE } from '../engine/three.js';

export const wbPierPropsStatics = {
  buildTackleToolbox() {
    const g = new THREE.Group();
    const M = (c, r = 0.6, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
    const red = M(0xdc2626, 0.45), dark = M(0x7f1d1d, 0.5), steel = M(0xcbd5e1, 0.3, 0.8), black = M(0x111827, 0.5);
    const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); g.add(m); return m; };
    add(new THREE.BoxGeometry(0.78, 0.3, 0.46), red, 0, 0.15, 0);
    add(new THREE.BoxGeometry(0.8, 0.06, 0.48), dark, 0, 0.31, 0);
    const lid = add(new THREE.CylinderGeometry(0.23, 0.23, 0.78, 12, 1, false, 0, Math.PI), red, 0, 0.34, 0);
    lid.rotation.z = Math.PI / 2; lid.rotation.y = Math.PI / 2; lid.scale.set(1, 1, 0.6);
    lid.geometry.rotateY(0); lid.rotation.set(0, 0, Math.PI / 2);
    // handle
    const h = add(new THREE.TorusGeometry(0.17, 0.025, 6, 12, Math.PI), black, 0, 0.5, 0);
    // latches & hinges
    [-0.26, 0.26].forEach(x => { add(new THREE.BoxGeometry(0.1, 0.13, 0.03), steel, x, 0.26, 0.245); add(new THREE.BoxGeometry(0.06, 0.05, 0.045), M(0x475569, 0.4, 0.6), x, 0.31, 0.25); add(new THREE.BoxGeometry(0.1, 0.05, 0.03), steel, x, 0.3, -0.245); });
    // corner guards
    [[-0.39, 0.23], [0.39, 0.23], [-0.39, -0.23], [0.39, -0.23]].forEach(([x, z]) => add(new THREE.BoxGeometry(0.05, 0.3, 0.05), dark, x, 0.15, z));
    // stickers & label plate
    add(new THREE.BoxGeometry(0.2, 0.08, 0.01), M(0xfacc15, 0.5), 0, 0.12, 0.236);
    add(new THREE.BoxGeometry(0.08, 0.08, 0.01), M(0x38bdf8, 0.5), -0.28, 0.1, 0.236);
    // spilled lures: bobber, hook and a coloured spinner
    const bob = add(new THREE.SphereGeometry(0.05, 8, 6), M(0xf8fafc, 0.4), 0.46, 0.05, 0.22);
    add(new THREE.SphereGeometry(0.03, 8, 6), M(0xef4444, 0.4), 0.46, 0.09, 0.22);
    const hook = add(new THREE.TorusGeometry(0.035, 0.007, 4, 10, Math.PI * 1.4), steel, 0.52, 0.01, 0.12); hook.rotation.x = Math.PI / 2;
    add(new THREE.ConeGeometry(0.025, 0.1, 6), M(0xf97316, 0.35, 0.4), 0.4, 0.03, 0.3).rotation.z = Math.PI / 2;
    return g;
  },

  buildBountyBoard(textures) {
    const g = new THREE.Group();
    const K = this.propKit(textures);
    const signMat = new THREE.MeshBasicMaterial({ map: textures.bountySign });
    // posts, board with frame, small shingled roof
    [-0.68, 0.68].forEach(x => K.cyl(g, 0.065, 0.075, 2.1, K.darkWood, x, 1.05, -0.02, 7));
    K.box(g, 1.34, 1.05, 0.07, K.lightWood, 0, 1.22, 0);
    [[0, 1.76, 1.42, 0.09], [0, 0.68, 1.42, 0.09]].forEach(([x, y, w, h]) => K.box(g, w, h, 0.1, K.darkWood, x, y, 0.01));
    [-0.69, 0.69].forEach(x => K.box(g, 0.09, 1.2, 0.1, K.darkWood, x, 1.22, 0.01));
    const roof = K.box(g, 1.6, 0.06, 0.34, K.M(0x7f1d1d, 0.85), 0, 1.98, 0.08); roof.rotation.x = 0.35;
    for (let i = 0; i < 6; i++) { const s = K.box(g, 1.58, 0.03, 0.07, K.M(i % 2 ? 0x991b1b : 0x7f1d1d, 0.85), 0, 1.94 + i * 0.012, -0.04 + i * 0.05); s.rotation.x = 0.35; }
    const header = K.box(g, 1.5, 0.3, 0.08, signMat, 0, 2.2, 0.02);
    // the real contracts, written on three papers (drawn by drawBountyPaper, tapped to claim; see refreshBountyPapers)
    const papers = new THREE.Group(); g.add(papers); g.userData.papers = papers;
    [[-0.45, 0.03], [0, -0.02], [0.45, 0.035]].forEach(([x, rot], i) => {
      const cv = document.createElement('canvas'); cv.width = 420; cv.height = 630;
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.63), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, side: THREE.DoubleSide }));
      p.position.set(x, 1.22, 0.05 + i * 0.002); p.rotation.z = rot;
      p.userData = { bountyIdx: i, canvas: cv, tex, pin: 1, sig: '' };
      const pin = K.sph(p, 0.022, new THREE.MeshBasicMaterial({ color: 0xdc2626 }), 0, 0.28, 0.02, 6, 5);
      papers.add(p);
    });
    // lantern hook and lantern
    const arm = K.box(g, 0.3, 0.04, 0.04, K.iron, 0.9, 1.9, 0.02);
    K.cyl(g, 0.07, 0.07, 0.16, K.M(0xfacc15, 0.3, 0.4, { emissive: new THREE.Color(0xf59e0b), emissiveIntensity: 0.7 }), 1.0, 1.78, 0.02, 8);
    // ---- v3.6 detail pass ----
    // stone footings, a cross brace behind the board, crossed oars over the header and a ship's bell
    [-0.68, 0.68].forEach(x => { K.box(g, 0.3, 0.16, 0.3, K.M(0x78716c, 0.95), x, 0.08, -0.02); K.box(g, 0.24, 0.06, 0.24, K.M(0x57534e, 0.95), x, 0.18, -0.02); });
    [-1, 1].forEach(sd => { const br = K.box(g, 0.05, 1.5, 0.05, K.darkWood, 0, 1.2, -0.08); br.rotation.z = sd * 0.75; });
    [-1, 1].forEach(sd => {
      const th = sd * 1.05, L = 1.05;
      const oar = K.cyl(g, 0.018, 0.018, L, K.lightWood, 0, 2.5, 0.07, 6); oar.rotation.z = th;
      const ex = -Math.sin(th) * (L / 2 + 0.12), ey = Math.cos(th) * (L / 2 + 0.12);
      const bl = K.box(g, 0.1, 0.26, 0.022, K.lightWood, ex, 2.5 + ey, 0.07); bl.rotation.z = th;
    });
    { const bell = new THREE.Mesh(new THREE.LatheGeometry([[0, 0.16], [0.03, 0.155], [0.06, 0.1], [0.075, 0.02], [0.09, 0]].map(p => new THREE.Vector2(p[0], p[1])), 12), K.brass);
      bell.position.set(-0.98, 1.62, 0.02); g.add(bell); K.box(g, 0.32, 0.04, 0.04, K.iron, -0.86, 1.8, 0.02); }
    // two little barrels at its feet
    [[-0.86, 0.36, 0x7c4a1e], [0.86, 0.34, 0x92400e]].forEach(([x, z, c]) => {
      K.cyl(g, 0.17, 0.15, 0.42, K.M(c, 0.85, 0, { map: textures.wood }), x, 0.21, z, 12);
      [0.08, 0.34].forEach(y => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.01, 4, 14), K.iron); r.rotation.x = Math.PI / 2; r.position.set(x, y, z); g.add(r); });
    });
    return g;
  },
};
