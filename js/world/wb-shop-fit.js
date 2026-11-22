/* WorldBuilder methods: a value-noise helper and fitShopModel, which scales a good's model into its picture. */
import { THREE } from '../engine/three.js';

export const wbShopFitStatics = {
  /* deterministic 2D value noise (0..1), used by the terrain, rocks and palms */
  noise2(x, z) {
    const h = (a, b) => { const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return n - Math.floor(n); };
    const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
    const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
    return THREE.MathUtils.lerp(THREE.MathUtils.lerp(h(xi, zi), h(xi + 1, zi), u), THREE.MathUtils.lerp(h(xi, zi + 1), h(xi + 1, zi + 1), u), v);
  },
  /* a lumpy low-poly rock: an icosahedron pushed in and out by noise of its direction (no cracks between faces),
     with darker crevices and lighter tops in its vertex colours */
  /* ------------------------------------------------------------------
     SHOP GOODS (v4.8.0): the things on the display counter. Each is a small low-poly model standing on y = 0,
     fitted to `maxDim` metres. key: rod, cam, bait, bucket, boat, module, dive, spear, fuel, crate, fish.
     ------------------------------------------------------------------ */
  fitShopModel(g, maxDim) {
    const wrap = new THREE.Group(); wrap.add(g); wrap.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(wrap), s = b.getSize(new THREE.Vector3());
    g.scale.multiplyScalar(maxDim / Math.max(s.x, s.y, s.z, 1e-3));
    wrap.updateMatrixWorld(true); b.setFromObject(wrap);
    g.position.x -= (b.min.x + b.max.x) / 2; g.position.z -= (b.min.z + b.max.z) / 2; g.position.y -= b.min.y;
    wrap.userData.h = b.max.y - b.min.y;
    return wrap;
  },
};
