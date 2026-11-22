/* WorldBuilder method: buildCottage, a town cottage. */
import { THREE } from '../engine/three.js';
import { ModelKit } from '../render/model-kit.js';

export const wbCottageStatics = {
  buildCottage(w, d, wallHex, roofHex, seed) {
    const g = new THREE.Group();
    const M = (c, r = 0.85, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r, flatShading: true }, extra));
    const RB = (ww, hh, dd, mat, x, y, z) => { const m = new THREE.Mesh(ModelKit.roundedBox(ww, hh, dd, ModelKit.bevelFor(ww, hh, dd)), mat); m.position.set(x, y, z); g.add(m); return m; };
    const wallH = 2.2, wall = M(wallHex), roof = M(roofHex, 0.8), trim = M(0x334155), wood = M(0x7c4a1e), glass = M(0x1e3a5f, 0.3, { emissive: new THREE.Color(0xfbbf24), emissiveIntensity: 0.12 });
    RB(w + 0.2, 0.3, d + 0.2, M(0x78716c, 0.95), 0, 0.15, 0);                 // stone plinth
    RB(w, wallH, d, wall, 0, 0.3 + wallH / 2, 0);
    // gabled roof: an extruded triangle along X
    const sh = new THREE.Shape(); const rh = 1.25;
    sh.moveTo(-d / 2 - 0.3, 0); sh.lineTo(d / 2 + 0.3, 0); sh.lineTo(0, rh); sh.lineTo(-d / 2 - 0.3, 0);
    const rg = new THREE.ExtrudeGeometry(sh, { depth: w + 0.5, bevelEnabled: false });
    rg.translate(0, 0, -(w + 0.5) / 2); rg.rotateY(Math.PI / 2);
    const rm = new THREE.Mesh(rg, roof); rm.position.y = 0.3 + wallH; g.add(rm);
    // roof tiles: thin ridges down each slope
    for (let k = 0; k < 4; k++) [-1, 1].forEach(sd => {
      const ridge = RB(w + 0.52, 0.05, 0.08, M(roofHex === 0x1e3a8a ? 0x172554 : 0x7f1d1d, 0.8), 0, 0.3 + wallH + 0.15 + k * 0.28, sd * (d / 2 + 0.2 - k * 0.3));
      ridge.rotation.x = sd * -0.88;
    });
    RB(0.42, 1.0, 0.42, M(0x9ca3af, 0.95), w * 0.28, 0.3 + wallH + 1.0, -d * 0.12);   // chimney
    RB(0.5, 0.08, 0.5, trim, w * 0.28, 0.3 + wallH + 1.52, -d * 0.12);
    // door, step, windows with shutters and sills, a lamp and a flower box
    RB(0.7, 1.35, 0.06, wood, -w * 0.22, 0.3 + 0.68, d / 2 + 0.02);
    RB(0.9, 0.12, 0.35, M(0x78716c, 0.95), -w * 0.22, 0.36, d / 2 + 0.17);
    [w * 0.22].forEach(x => {
      RB(0.6, 0.55, 0.05, glass, x, 1.55, d / 2 + 0.02);
      RB(0.66, 0.05, 0.05, trim, x, 1.55, d / 2 + 0.05); RB(0.05, 0.6, 0.05, trim, x, 1.55, d / 2 + 0.05);
      [-1, 1].forEach(sd => RB(0.22, 0.6, 0.04, M(seed % 2 ? 0x0e7490 : 0x166534, 0.8), x + sd * 0.43, 1.55, d / 2 + 0.03));
      RB(0.72, 0.18, 0.2, wood, x, 1.18, d / 2 + 0.1);
      [-0.22, 0, 0.22].forEach((fx, k) => { const fl = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), M([0xf472b6, 0xfacc15, 0xf87171][k])); fl.position.set(x + fx, 1.32, d / 2 + 0.12); g.add(fl); });
    });
    [-1, 1].forEach(sd => RB(0.05, 0.55, 0.5, glass, sd * (w / 2 + 0.02), 1.55, 0));
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfde68a })); lamp.position.set(-w * 0.22 + 0.55, 1.8, d / 2 + 0.12); g.add(lamp);
    return g;
  },
};
