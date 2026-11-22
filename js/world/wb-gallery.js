/* WorldBuilder method: buildBottleGalleryStand, the bottle gallery in the cabin. */
import { THREE } from '../engine/three.js';

export const wbGalleryStatics = {
  buildBottleGalleryStand(textures) {
    const g = new THREE.Group();
    const K = this.propKit(textures);
    const signMat = new THREE.MeshBasicMaterial({ map: textures.gallerySign });
    const cloth = K.M(0x0f766e, 0.9);
    // table with runner and front panels
    K.box(g, 2.45, 0.84, 0.78, K.wood, 0, 0.42, 0.05);
    K.box(g, 2.52, 0.07, 0.86, K.darkWood, 0, 0.87, 0.05);
    K.box(g, 2.0, 0.025, 0.5, cloth, 0, 0.915, 0.08);
    [-0.8, 0, 0.8].forEach(x => K.box(g, 0.7, 0.55, 0.03, K.M(0x3b2310, 0.9), x, 0.4, 0.45));
    // posts, upper shelf, header sign with hanging lights
    [-1.1, 1.1].forEach(x => K.cyl(g, 0.06, 0.07, 2.6, K.darkWood, x, 1.3, -0.25, 7));
    K.box(g, 2.3, 0.08, 0.34, K.wood, 0, 1.38, -0.16);
    K.box(g, 2.4, 0.6, 0.12, signMat, 0, 2.3, -0.22);
    const glassM = (c) => new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: 0.7, roughness: 0.12, metalness: 0.1, emissive: new THREE.Color(0x0f766e), emissiveIntensity: 0.22 });
    const profile = [[0.001, 0], [0.085, 0.01], [0.105, 0.06], [0.105, 0.2], [0.07, 0.29], [0.04, 0.36], [0.042, 0.42], [0.052, 0.45], [0.04, 0.45]].map(p => new THREE.Vector2(p[0], p[1] * 0.75));
    const bottleGeo = new THREE.LatheGeometry(profile, 12);
    const spots = [[-0.9, 0.93, 0.12], [-0.45, 0.93, 0.18], [0.0, 0.93, 0.08], [0.45, 0.93, 0.16], [0.9, 0.93, 0.1],
      [-0.8, 1.42, -0.14], [-0.27, 1.42, -0.14], [0.27, 1.42, -0.14], [0.8, 1.42, -0.14]];
    const tints = [0x2dd4bf, 0x38bdf8, 0x4ade80, 0x2dd4bf, 0xa7f3d0];
    spots.forEach(([bx, by, bz], i) => {
      const b = new THREE.Group();
      b.add(new THREE.Mesh(bottleGeo, glassM(tints[i % tints.length])));
      K.cyl(b, 0.03, 0.026, 0.06, K.M(0xb45309, 0.95), 0, 0.37, 0, 7);
      const sc = K.cyl(b, 0.026, 0.026, 0.2, K.M(0xfef3c7, 0.9, 0, { emissive: new THREE.Color(0xfde047), emissiveIntensity: 0.3 }), 0, 0.14, 0, 6); sc.rotation.z = 0.15;
      b.position.set(bx, by, bz); b.rotation.y = i * 0.9; g.add(b);
    });
    // warm lamp on the table and string lights under the sign
    K.cyl(g, 0.06, 0.06, 0.1, K.brass, 1.0, 0.97, 0.2, 8);
    K.sph(g, 0.07, new THREE.MeshBasicMaterial({ color: 0xfde68a }), 1.0, 1.07, 0.2, 8, 6);
    const wire = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-1.15, 2.0, -0.1), new THREE.Vector3(-0.4, 1.9, -0.05), new THREE.Vector3(0.4, 1.9, -0.05), new THREE.Vector3(1.15, 2.0, -0.1)]), 20, 0.008, 4, false), K.M(0x111827, 0.8));
    g.add(wire);
    for (let i = 0; i < 7; i++) {
      const t = i / 6, x = -1.1 + t * 2.2;
      K.sph(g, 0.03, new THREE.MeshBasicMaterial({ color: i % 2 ? 0xfde68a : 0x5eead4 }), x, 1.93 + Math.sin(t * Math.PI) * -0.06, -0.06, 6, 5);
    }
    // ---- v3.6 detail pass ----
    // rope trim along the table edge, a cloth fringe, driftwood frame on the sign and a ship in a bottle
    { const ropeEdge = K.cyl(g, 0.025, 0.025, 2.5, K.rope, 0, 0.84, 0.49, 6); ropeEdge.rotation.z = Math.PI / 2; }
    for (let i = 0; i < 16; i++) K.box(g, 0.05, 0.1, 0.01, K.M(0x115e59, 0.9), -0.94 + i * 0.125, 0.86, 0.335);
    [[0, 2.62, 2.5, 0.07], [0, 1.98, 2.5, 0.07]].forEach(([x, y, w, h]) => K.box(g, w, h, 0.14, K.M(0x8b7355, 0.95), x, y, -0.21));
    [-1.22, 1.22].forEach(x => K.box(g, 0.07, 0.7, 0.14, K.M(0x8b7355, 0.95), x, 2.3, -0.21));
    {
      const sb = new THREE.Group();
      const big = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.5, 14), new THREE.MeshStandardMaterial({ color: 0xccfbf1, transparent: true, opacity: 0.35, roughness: 0.05 }));
      big.rotation.z = Math.PI / 2; sb.add(big);
      const neck = K.cyl(sb, 0.05, 0.07, 0.12, K.M(0xccfbf1, 0.1), 0.3, 0, 0, 10); neck.rotation.z = Math.PI / 2;
      K.box(sb, 0.26, 0.05, 0.08, K.M(0x7c2d12, 0.8), 0, -0.06, 0);
      K.cyl(sb, 0.006, 0.006, 0.16, K.darkWood, 0, 0.03, 0, 4);
      const sail = K.box(sb, 0.005, 0.11, 0.08, K.M(0xf8fafc, 0.9), 0.01, 0.04, 0); sail.rotation.y = 0;
      [-0.18, 0.18].forEach(x => K.box(sb, 0.04, 0.05, 0.16, K.darkWood, x, -0.14, 0));
      sb.position.set(0, 1.08, 0.12); g.add(sb);
    }
    // table legs showing under the front panels
    [-1.15, 1.15].forEach(x => K.box(g, 0.1, 0.06, 0.7, K.darkWood, x, 0.03, 0.05));
    return g;
  },
};
