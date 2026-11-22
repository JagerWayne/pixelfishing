/* WorldBuilder method: buildTackleShop, the Tackle Shop on the pier. */
import { THREE } from '../engine/three.js';

export const wbTackleShopStatics = {
  buildTackleShop(textures) {
    const g = new THREE.Group();
    const K = this.propKit(textures);
    const signMat = new THREE.MeshBasicMaterial({ map: textures.shopSign });
    const awningMat = new THREE.MeshStandardMaterial({ map: textures.awning, roughness: 0.6, side: THREE.DoubleSide });
    const skin = K.M(0xfdba74, 0.75);
    // counter with plank front, top slab and trim
    K.box(g, 2.3, 1.0, 1.0, K.wood, 0, 0.5, 0.35);
    for (let i = 0; i < 7; i++) K.box(g, 0.02, 0.9, 0.02, K.M(0x2b180b, 0.9), -1.0 + i * 0.33, 0.5, 0.86);
    K.box(g, 2.45, 0.08, 1.12, K.darkWood, 0, 1.04, 0.35);
    K.box(g, 2.3, 0.06, 0.05, K.brass, 0, 0.14, 0.87);
    // back wall with shelves, jars, lures and rope
    K.box(g, 2.4, 2.2, 0.22, K.wood, 0, 1.1, -0.78);
    for (let i = 0; i < 9; i++) K.box(g, 2.4, 0.015, 0.23, K.M(0x2b180b, 0.9), 0, 0.2 + i * 0.25, -0.77);
    [1.35, 1.8].forEach((y, row) => {
      K.box(g, 2.2, 0.05, 0.28, K.darkWood, 0, y, -0.58);
      for (let i = 0; i < 6; i++) {
        const x = -0.95 + i * 0.38;
        if ((i + row) % 2) K.cyl(g, 0.07, 0.07, 0.2, K.M([0x38bdf8, 0xfacc15, 0xf472b6][i % 3], 0.2, 0.1, { transparent: true, opacity: 0.8 }), x, y + 0.13, -0.58, 10);
        else { const lure = K.cyl(g, 0.0, 0.05, 0.16, K.M([0xf97316, 0xef4444, 0x22c55e][i % 3], 0.35, 0.4), x, y + 0.11, -0.58, 6); lure.rotation.z = 0.3; }
      }
    });
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 6, 14), K.rope); coil.position.set(-0.8, 0.95 + 0.4, -0.6); coil.rotation.x = 0.1; g.add(coil);
    // posts and cross beam
    [[-1.08, -0.7], [1.08, -0.7], [-1.08, 0.86], [1.08, 0.86]].forEach(([x, z]) => K.cyl(g, 0.08, 0.09, 2.45, K.darkWood, x, 1.22, z, 8));
    K.box(g, 2.4, 0.1, 0.1, K.darkWood, 0, 2.38, 0.86);
    // striped awning with scalloped valance
    const awning = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.1, 2.05), awningMat); awning.position.set(0, 2.42, 0.08); awning.rotation.x = 0.22; g.add(awning);
    for (let i = 0; i < 9; i++) {
      const x = -1.2 + i * 0.3;
      const scallop = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 10, 1, false, 0, Math.PI), K.M(i % 2 ? 0xf8fafc : 0xdc2626, 0.65));
      scallop.rotation.set(0, 0, Math.PI / 2); scallop.rotation.x = 0; scallop.rotation.z = 0;
      scallop.rotation.set(Math.PI / 2, 0, Math.PI / 2); scallop.position.set(x, 2.28, 1.07); scallop.scale.set(1, 1, 1); g.add(scallop);
    }
    // hanging sign on chains
    K.box(g, 2.1, 0.52, 0.1, signMat, 0, 2.86, 0.9);
    [-0.95, 0.95].forEach(x => K.cyl(g, 0.01, 0.01, 0.4, K.iron, x, 2.58, 0.9, 4));
    // buoys, lantern, rods on the left, barrel + crates on the right
    [[0xdc2626, 0], [0xf8fafc, 0.2], [0xdc2626, 0.4]].forEach(([c, dx], i) => K.sph(g, 0.11, K.M(c, 0.5), -1.12, 2.12 - i * 0.24, 0.9 + dx * 0, 10, 8));
    K.cyl(g, 0.012, 0.012, 0.6, K.rope, -1.12, 2.0, 0.9, 4);
    K.cyl(g, 0.07, 0.07, 0.17, K.M(0xfacc15, 0.3, 0.4, { emissive: new THREE.Color(0xf59e0b), emissiveIntensity: 0.7 }), 1.12, 2.15, 0.9, 8);
    K.cyl(g, 0.01, 0.01, 0.25, K.iron, 1.12, 2.3, 0.9, 4);
    [0xd97706, 0x0284c7, 0xe2e8f0, 0x16a34a].forEach((c, i) => {
      const rod = K.cyl(g, 0.012, 0.02, 2.1, K.M(c, 0.4, 0.2), -1.42 + i * 0.07, 1.05, 0.2 + i * 0.03, 5); rod.rotation.z = 0.12 + i * 0.015;
    });
    K.cyl(g, 0.28, 0.25, 0.62, K.M(0x7c4a1e, 0.85, 0, { map: textures.wood }), 1.55, 0.31, 0.6, 12);
    [0.12, 0.5].forEach(y => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.014, 5, 14), K.iron); r.rotation.x = Math.PI / 2; r.position.set(1.55, y, 0.6); g.add(r); });
    K.box(g, 0.5, 0.36, 0.46, K.lightWood, 1.5, 0.18, 1.1);
    // a coiled fishing net with cork floats on the barrel
    for (let k = 0; k < 3; k++) { const coilN = new THREE.Mesh(new THREE.TorusGeometry(0.17 - k * 0.04, 0.045, 6, 14), K.M(0x4d7c0f, 0.95)); coilN.rotation.x = Math.PI / 2; coilN.position.set(1.55, 0.66 + k * 0.06, 0.6); g.add(coilN); }
    [0, 1.6, 3.4, 4.8].forEach((a, k) => K.sph(g, 0.045, K.M(k % 2 ? 0xf97316 : 0xfacc15, 0.6), 1.55 + Math.cos(a) * 0.2, 0.7, 0.6 + Math.sin(a) * 0.2, 8, 6));
    // counter goods: scales, fish on a tray, bait bucket
    K.cyl(g, 0.1, 0.12, 0.04, K.brass, -0.7, 1.1, 0.55, 12);
    K.box(g, 0.04, 0.22, 0.04, K.brass, -0.7, 1.22, 0.55);
    K.box(g, 0.5, 0.03, 0.3, K.steel, 0.55, 1.1, 0.6);
    const fish = this.miniFish(0x38bdf8, 0xf97316, K); fish.scale.setScalar(0.7); fish.position.set(0.55, 1.18, 0.6); fish.rotation.y = 0.4; g.add(fish);
    K.cyl(g, 0.09, 0.07, 0.16, K.M(0x1d4ed8, 0.6), 0.1, 1.16, 0.7, 10);
    // shopkeeper: striped sweater, beard, cap, arms on the counter
    const keeper = new THREE.Group();
    K.cyl(keeper, 0.26, 0.3, 0.5, K.M(0xf8fafc, 0.85), 0, 0.25, 0, 10);
    K.cyl(keeper, 0.265, 0.265, 0.1, K.M(0x1e3a8a, 0.85), 0, 0.3, 0, 10);
    K.sph(keeper, 0.2, skin, 0, 0.7, 0.02, 12, 10);
    const beard = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 8, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55), K.M(0x9ca3af, 0.9)); beard.position.set(0, 0.67, 0.04); beard.scale.set(1.05, 1.1, 1.05); keeper.add(beard);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.21, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), K.M(0x1e3a8a, 0.8)); cap.position.set(0, 0.76, 0.02); keeper.add(cap);
    K.cyl(keeper, 0.215, 0.215, 0.05, K.M(0x1d4ed8, 0.8), 0, 0.77, 0.02, 12);
    [-0.07, 0.07].forEach(x => K.sph(keeper, 0.025, new THREE.MeshBasicMaterial({ color: 0x0f172a }), x, 0.73, 0.2, 6, 5));
    [-0.28, 0.28].forEach(x => { const arm = K.cyl(keeper, 0.07, 0.065, 0.4, K.M(0xf8fafc, 0.85), x, 0.2, 0.2, 8); arm.rotation.x = 1.1; K.sph(keeper, 0.065, skin, x, 0.08, 0.38, 8, 6); });
    // keeper face and apron details
    K.sph(keeper, 0.045, skin, 0, 0.69, 0.2, 8, 6);
    [-1, 1].forEach(sx => K.sph(keeper, 0.045, skin, sx * 0.19, 0.7, 0.0, 6, 5));
    K.box(keeper, 0.3, 0.36, 0.02, K.M(0x0f766e, 0.85), 0, 0.2, 0.28);
    K.box(keeper, 0.06, 0.06, 0.02, K.brass, 0, 0.36, 0.295);
    keeper.position.set(0, 1.08, -0.05); g.add(keeper);

    // ---- v3.6 detail pass ----
    // shingled roof over the back wall
    for (let i = 0; i < 5; i++) {
      const sh = K.box(g, 2.6, 0.04, 0.24, K.M(i % 2 ? 0x5b3a1a : 0x4a2c16, 0.9), 0, 2.36 - i * 0.05, -0.98 + i * 0.16);
      sh.rotation.x = -0.32;
    }
    // chalk price board (A-frame) on the deck at the left front corner
    {
      const af = new THREE.Group();
      const board = K.M(0x1f2937, 0.95);
      [[-1, 0.18], [1, -0.18]].forEach(([s2, tilt]) => {
        const leaf = new THREE.Group();
        K.box(leaf, 0.5, 0.7, 0.03, board, 0, 0.36, 0);
        K.box(leaf, 0.56, 0.05, 0.05, K.lightWood, 0, 0.73, 0);
        K.box(leaf, 0.56, 0.05, 0.05, K.lightWood, 0, 0.0, 0);
        [-0.27, 0.27].forEach(x => K.box(leaf, 0.04, 0.76, 0.05, K.lightWood, x, 0.37, 0));
        for (let k = 0; k < 4; k++) K.box(leaf, 0.3 - (k % 2) * 0.08, 0.025, 0.005, K.M(0xf8fafc, 0.9), -0.04, 0.58 - k * 0.12, 0.02 * s2);
        K.box(leaf, 0.1, 0.03, 0.005, K.M(0xfacc15, 0.9), 0.15, 0.58, 0.02 * s2);
        leaf.rotation.x = tilt; leaf.position.z = s2 * 0.07;
        af.add(leaf);
      });
      af.position.set(-1.35, 0, 1.3); af.rotation.y = 0.35; g.add(af);
    }
    // a stack of fish crates with rope handles, and an old wooden oar against the back wall
    [[0, 0], [0.04, 0.37]].forEach(([dx, y], i) => {
      const cr = K.box(g, 0.55, 0.34, 0.4, K.lightWood, -1.48 + dx, 0.17 + y, -0.35);
      cr.rotation.y = i * 0.12;
      for (let k = 0; k < 3; k++) K.box(g, 0.56, 0.02, 0.41, K.M(0x7c4a1e, 0.9), -1.48 + dx, 0.06 + y + k * 0.11, -0.35);
    });
    { const oar = K.cyl(g, 0.025, 0.025, 2.0, K.lightWood, 1.32, 1.05, -0.62, 6); oar.rotation.z = -0.18;
      const blade = K.box(g, 0.18, 0.5, 0.03, K.lightWood, 1.5, 0.22, -0.62); blade.rotation.z = -0.18; }
    // a mounted trophy fish on the back wall above the shelves
    { const tf = this.miniFish(0x1d4ed8, 0xfacc15, K); tf.scale.setScalar(1.6); tf.position.set(0, 2.08, -0.62); g.add(tf);
      K.box(g, 0.75, 0.32, 0.04, K.darkWood, 0, 2.08, -0.66); }
    return g;
  },
};
