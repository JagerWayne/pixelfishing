/* WorldBuilder methods: the sculpted fish mesh, the bait mesh and the lofted hull. */
import { THREE } from '../engine/three.js';
import { BOAT_PAINTS } from './layout.js';

export const wbHullStatics = {
  buildSculptedFishMesh(item, textures) {
    if (['seaweed', 'boot', 'can', 'bottle', 'anchor', 'hat', 'box'].includes(item.shape)) {
      return this.buildJunkModel(item, textures);
    }
    return this.buildFishModel(item, textures);
  },

  buildBaitMesh(baitTier) {
    const g = new THREE.Group();
    if (baitTier === 1) {
      const breadMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.9, flatShading: true });
      const crustMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9, flatShading: true });
      const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11, 0), breadMat);
      const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08, 0), crustMat);
      c2.position.set(0.07, -0.05, 0.04);
      const c3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.07, 0), breadMat);
      c3.position.set(-0.06, 0.06, -0.04);
      g.add(c1, c2, c3);
    } else if (baitTier === 2) {
      const wormMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.4, flatShading: true });
      const pts = [
        new THREE.Vector3(-0.14, 0.08, 0),
        new THREE.Vector3(-0.04, -0.06, 0.05),
        new THREE.Vector3(0.06, 0.05, -0.05),
        new THREE.Vector3(0.14, -0.08, 0.02)
      ];
      const wormGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.042, 6, false);
      g.add(new THREE.Mesh(wormGeo, wormMat));
    } else if (baitTier === 3) {
      const shrimpMat = new THREE.MeshStandardMaterial({ color: 0xfb923c, roughness: 0.35, flatShading: true });
      const pts = [
        new THREE.Vector3(-0.08, 0.10, 0),
        new THREE.Vector3(0.06, 0.04, 0),
        new THREE.Vector3(0.08, -0.06, 0),
        new THREE.Vector3(-0.04, -0.12, 0)
      ];
      const body = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, 0.055, 6, false), shrimpMat);
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.1, 4), shrimpMat);
      tail.position.set(-0.08, -0.13, 0);
      tail.rotation.z = 0.8;
      g.add(body, tail);
    } else {
      const lureMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.9,
        roughness: 0.2,
        flatShading: true
      });
      const pod = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), lureMat);
      pod.scale.set(1.2, 0.85, 0.85);
      const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.16, 6), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      skirt.position.y = -0.11;
      g.add(pod, skirt);
    }
    return g;
  },

  /* ------------------------------------------------------------------
     BOATS: shared lofted hull + three detailed vessels.
     Bow points toward -Z, up is +Y, origin near the waterline centre.
     ------------------------------------------------------------------ */
  /* boat paint (v6.3.0, Barnaby's Workshop): the hull and trim bands take the chosen colours while a boat is built */
  loftHull(o) {
    const P = this._paint;
    if (P && Array.isArray(o.bands) && o.bands.length >= 3) {
      const five = o.bands.length >= 5;
      o = Object.assign({}, o, { bands: o.bands.map((b, i) => {
        const ci = (i === 2 || (five && i === 4)) ? P.hull : (five ? i === 3 : i === 1) ? P.trim : -1;
        return ci >= 0 ? Object.assign({}, b, { color: '#' + BOAT_PAINTS[ci][1].toString(16).padStart(6, '0') }) : b;
      }) });
    }
    const h = this.loftHullBase(o); this._lastHull = h; return h;
  },
};
