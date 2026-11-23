/* Street furniture (v12.1.0) from STREET_PROPS and EXTRA_BENCHES: planters, flower beds (flat), a bin beside each town
   bench, bike racks, the gate bollards, the wayfinding signpost on the square, the bunting over Harbour Street and hedges
   beside the terrace homes.
   Everything goes into one group that is merged here; only the signpost's painted arrows stay apart (textures). */
import { THREE } from '../engine/three.js';
import { ModelKit } from '../render/model-kit.js';
import { PixelTextureFactory } from '../render/texture-factory.js';
import { COL, EXTRA_BENCHES, STREET_PROPS, TOWN, TOWN_BUILDINGS, townGround } from './layout.js';
import { Colliders } from '../data/recipes.js';

const FLOWERS = [0xf472b6, 0xfacc15, 0xf8fafc, 0xa78bfa, 0xfb7185];

export function buildStreetProps(K, km, root) {
  const M = K.M, W = COL.WALK, set = new THREE.Group(), P = STREET_PROPS;
  set.name = 'street props'; root.add(set);
  const y = z => townGround(z) + 0.06;
  const flowerM = FLOWERS.map(c => M(c, 0.9)), soil = M(0x4a3426, 0.9), steel = M(0x475569, 0.9);
  P.planters.forEach(([x, z], i) => {                                          // concrete planters with a shrub
    K.sharpBox(set, 0.75, 0.5, 0.75, km.concrete, x, y(z) + 0.25, z);
    K.sph(set, 0.38, i % 2 ? km.leaf : km.leaf2, x, y(z) + 0.72, z, 8, 6);
    for (let k = 0; k < 3; k++) K.sph(set, 0.07, flowerM[(i + k) % 5], x + (k - 1) * 0.22, y(z) + 0.95 - (k % 2) * 0.12, z + 0.25, 6, 4);
    Colliders.box('planter', x, z, 0.4, 0.4, W);
  });
  P.beds.forEach(([x, z, len], i) => {                                         // low flower beds along a wall: flat, no collider
    K.sharpBox(set, len, 0.14, 0.8, km.concrete, x, y(z) + 0.07, z); K.sharpBox(set, len - 0.12, 0.05, 0.68, soil, x, y(z) + 0.13, z);
    for (let k = 0; k < Math.round(len * 4); k++) {
      const fx = x - len / 2 + 0.15 + (k / (len * 4)) * (len - 0.3), fz = z + ((k * 37) % 5 - 2) * 0.12;
      K.sph(set, 0.08, k % 3 ? flowerM[(k + i) % 5] : km.leaf2, fx, y(z) + 0.22, fz, 6, 4);
    }
  });
  EXTRA_BENCHES.filter(b => b.z > 7).forEach(b => {                                         // a bin on the other side of each town bench
    const x = b.x - 1.1, z = b.z + 0.15;
    K.cyl(set, 0.2, 0.17, 0.75, steel, x, y(z) + 0.38, z, 10); K.cyl(set, 0.22, 0.22, 0.06, km.frame, x, y(z) + 0.78, z, 10);
    Colliders.circle('bin', x, z, 0.22, W);
  });
  P.bikeRacks.forEach(([x, z]) => {                                            // three steel hoops
    [-0.45, 0, 0.45].forEach(dx => {
      const h = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.03, 6, 12, Math.PI), steel);
      h.rotation.y = Math.PI / 2; h.position.set(x + dx, y(z) + 0.18, z); set.add(h);
      [-0.32, 0.32].forEach(dz => K.cyl(set, 0.03, 0.03, 0.18, steel, x + dx, y(z) + 0.09, z + dz, 6));
    });
    Colliders.box('bike rack', x, z, 0.55, 0.35, W);
  });
  P.bollards.forEach(([x, z]) => {
    K.cyl(set, 0.1, 0.11, 0.8, km.frame, x, y(z) + 0.4, z, 10); K.cyl(set, 0.112, 0.112, 0.06, km.white, x, y(z) + 0.62, z, 10);
    Colliders.circle('bollard', x, z, 0.13, W);
  });
  { // the wayfinding signpost: four arrows, to the terrace (south), the quarters (west, east) and the harbour (north)
    const S = P.signpost, sy = y(S.z);
    K.cyl(set, 0.06, 0.07, 3.0, km.frame, S.x, sy + 1.5, S.z, 8); K.sph(set, 0.1, km.frame, S.x, sy + 3.05, S.z, 8, 6);
    const arrows = [['⬆ UPPER TERRACE', 0, 1, 2.65], ['⬅ GARDEN QUARTER', -1, 0, 2.3], ['ARTISAN QUARTER ➡', 1, 0, 1.95], ['⬇ HARBOUR', 0, -1, 1.6]];
    const atlas = document.createElement('canvas'); atlas.width = 256; atlas.height = 48 * arrows.length;   // one texture for all four
    arrows.forEach(([text], i) => atlas.getContext('2d').drawImage(PixelTextureFactory.makeSignTexture(text, 256, 48).image, 0, i * 48));
    const tex = new THREE.CanvasTexture(atlas); tex.colorSpace = THREE.SRGBColorSpace;
    const face = new THREE.MeshBasicMaterial({ map: tex });
    arrows.forEach(([, dx, dz, h], i) => {
      const a = new THREE.Group();
      K.sharpBox(a, 1.15, 0.22, 0.04, km.frame, 0, 0, 0);
      [-1, 1].forEach(s => {
        const geo = new THREE.PlaneGeometry(1.1, 0.19), uv = geo.attributes.uv, n = arrows.length;
        for (let k = 0; k < uv.count; k++) uv.setY(k, 1 - (i + 1 - uv.getY(k)) / n);
        const pl = new THREE.Mesh(geo, face); pl.position.z = s * 0.022; if (s < 0) pl.rotation.y = Math.PI; a.add(pl);
      });
      a.position.set(S.x + dx * 0.6, sy + h, S.z + dz * 0.6); a.rotation.y = dx ? 0 : Math.PI / 2; set.add(a);
    });
    Colliders.circle('signpost', S.x, S.z, 0.12, W);
  }
  for (let i = 0; i + 1 < P.bunting.length; i += 2) {                          // bunting between two poles across the street
    const [ax, az] = P.bunting[i], [bx, bz] = P.bunting[i + 1], ya = y(az);
    [[ax, az], [bx, bz]].forEach(([x, z]) => { K.cyl(set, 0.04, 0.05, 3.6, km.frame, x, ya + 1.8, z, 6); Colliders.circle('bunting pole', x, z, 0.08, W); });
    const n = 12;
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n, fy = ya + 3.45 - Math.sin(t * Math.PI) * 0.5;
      const flag = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.26, 3), flowerM[k % 5]);
      flag.rotation.x = Math.PI; flag.scale.z = 0.15; flag.position.set(ax + (bx - ax) * t, fy - 0.14, az + (bz - az) * t); set.add(flag);
    }
  }
  TOWN_BUILDINGS.map(id => TOWN[id]).filter(b => b.owner).forEach(b => {     // low hedges along both sides of each home
    [-1, 1].forEach(sd => {
      const x = b.x + sd * (b.w / 2 + 0.7), z = b.z + 0.3;
      K.sharpBox(set, 0.55, 0.6, b.d + 0.6, km.leaf, x, y(z) + 0.3, z);
      Colliders.box('hedge', x, z, 0.3, b.d / 2 + 0.3, W);
    });
  });
  ModelKit.mergeStatic(set, [], { bakeColor: true });
  set.children.forEach(m => { if (m.isMesh) m.castShadow = false; });
  return set;
}
