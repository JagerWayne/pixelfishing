/* WorldBuilder methods: low-poly rocks and palms. */
import { THREE } from '../engine/three.js';

export const wbNatureStatics = {
  buildRock(radius, seed, baseHex, detail = 1) {
    const g = new THREE.IcosahedronGeometry(radius, detail);
    const pos = g.attributes.position, col = new Float32Array(pos.count * 3), v = new THREE.Vector3(), c = new THREE.Color(), base = new THREE.Color(baseHex);
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).normalize();
      const n = this.noise2(v.x * 2.3 + seed, v.z * 2.3 + v.y * 1.7 - seed) * 0.55 + this.noise2(v.x * 5.1 - seed, v.y * 5.1 + seed) * 0.25;
      const k = 0.72 + n * 0.55;
      pos.setXYZ(i, v.x * radius * k, v.y * radius * k * 0.82, v.z * radius * k);
      c.copy(base).multiplyScalar(0.7 + n * 0.45 + Math.max(0, v.y) * 0.18);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true }));
  },
  /* a palm: a curved, ringed trunk built from short segments, drooping fronds with leaflets, and coconuts */
  buildPalm(height, lean, seed, mats) {
    const palm = new THREE.Group();
    const N = 9, top = new THREE.Vector3();
    let prev = new THREE.Vector3(0, 0, 0);
    for (let i = 1; i <= N; i++) {
      const t = i / N;
      const p = new THREE.Vector3(Math.sin(t * 1.4) * lean, t * height, Math.sin(t * 1.1 + seed) * lean * 0.3);
      const len = p.distanceTo(prev), r0 = 0.3 - (i - 1) / N * 0.14, r1 = 0.3 - i / N * 0.14;
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0 * 1.08, len * 1.04, 7), i % 2 ? mats.trunk : mats.trunk2);
      seg.position.copy(prev).add(p).multiplyScalar(0.5);
      seg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p.clone().sub(prev).normalize());
      palm.add(seg);
      prev = p;
    }
    top.copy(prev);
    // fronds: a drooping spine with leaflet triangles on both sides, one geometry per frond
    const nF = 8;
    for (let f = 0; f < nF; f++) {
      const ang = (f / nF) * Math.PI * 2 + seed, L = 2.6 + ((f * 37) % 5) * 0.12;
      const pts = [], tri = [];
      const dir = new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang)), side = new THREE.Vector3(-dir.z, 0, dir.x);
      for (let k = 0; k <= 10; k++) {
        const u = k / 10;
        const sp = top.clone().addScaledVector(dir, u * L); sp.y += 0.35 * u - 1.5 * u * u;
        const w = Math.sin(u * Math.PI) * 0.55 + 0.05;
        const droop = 0.25 * w;
        pts.push([sp, sp.clone().addScaledVector(side, w).setY(sp.y - droop), sp.clone().addScaledVector(side, -w).setY(sp.y - droop)]);
      }
      for (let k = 0; k < 10; k++) {
        const [a0, l0, r0] = pts[k], [a1, l1, r1] = pts[k + 1];
        // leaflets: saw-toothed so the frond reads as many leaves
        tri.push(a0, l0, a1, a0, a1, r0, a1, l1, l0, a1, r0, r1);
      }
      const g = new THREE.BufferGeometry().setFromPoints(tri);
      g.computeVertexNormals();
      palm.add(new THREE.Mesh(g, f % 2 ? mats.frond : mats.frond2));
    }
    [[0.18, 0.1], [-0.12, 0.16], [0.02, -0.2]].forEach(([dx, dz]) => {
      const c = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), mats.coconut);
      c.position.set(top.x + dx, top.y - 0.25, top.z + dz); palm.add(c);
    });
    return palm;
  },
};
