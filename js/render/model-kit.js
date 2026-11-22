/* Light tuning and ModelKit: rounded boxes, static mesh merging (mergeStatic, mergeSafe) and colour baking. */
import { THREE } from '../engine/three.js';

export let ModelKit;

/* Night lighting: colours are warm whites (not saturated amber), intensities are modest. Adjust here. */
export const LIGHT_TUNING = {
  nightGlow: 2.4,          // shared strength of every lamp at night
  poolOpacity: 0.28,       // additive glow laid on the deck under each light
  lamp:    { color: 0xffe3b8, pool: 0xffdcae, k: 1.2 },
  shop:    { color: 0xffe3b8, pool: 0xffdcae, k: 1.15 },
  bounty:  { color: 0xffe0b0, pool: 0xffdcae, k: 1.0 },
  gallery: { color: 0xc9f5ee, pool: 0xbfeee6, k: 1.0 },
  mooring: { color: 0xffd9a8, pool: 0xffd9a8, k: 1.0 },
  bulbs:   [0xffeec8, 0xffe0a0],
  trophy:  { color: 0xfff0d0, pool: 0xffe9c4, k: 1.0 },
  lampGlass: 0xfff1c8, lampCore: 0xffe6a8
};

export function init() {
  /* =========================================================================
     MODEL KIT: rounded (bevelled) boxes, static mesh merging, and the collider registry.
     ========================================================================= */
  ModelKit = (() => {
    const geoCache = new Map();
    /* A box with chamfered edges: a 3x3x3-segment box whose inner grid lines are moved to r from each face, then
       every vertex outside the inner box is pulled onto a sphere of radius r around it. Cached by size. */
    function roundedBox(w, h, d, r) {
      r = Math.max(0, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4));
      const key = [w, h, d, r].map(v => v.toFixed(3)).join('|');
      let g = geoCache.get(key);
      if (g) return g;
      if (r < 0.004) { g = new THREE.BoxGeometry(w, h, d); geoCache.set(key, g); return g; }
      g = new THREE.BoxGeometry(1, 1, 1, 3, 3, 3);
      const pos = g.attributes.position, half = [w / 2, h / 2, d / 2], v = new THREE.Vector3(), inner = new THREE.Vector3();
      const remap = (t, hf) => (Math.abs(t) > 0.4 ? Math.sign(t) * hf : Math.sign(t) * (hf - r));
      for (let i = 0; i < pos.count; i++) {
        v.set(remap(pos.getX(i), half[0]), remap(pos.getY(i), half[1]), remap(pos.getZ(i), half[2]));
        inner.set(THREE.MathUtils.clamp(v.x, -half[0] + r, half[0] - r), THREE.MathUtils.clamp(v.y, -half[1] + r, half[1] - r), THREE.MathUtils.clamp(v.z, -half[2] + r, half[2] - r));
        const dx = v.x - inner.x, dy = v.y - inner.y, dz = v.z - inner.z, l = Math.hypot(dx, dy, dz);
        if (l > 1e-6) v.set(inner.x + dx / l * r, inner.y + dy / l * r, inner.z + dz / l * r);
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      // keep textures (signs, wood) undistorted: the inner grid lines of each face sit r from its edges, so move the
      // matching UV lines there too (the face is known from the box's original normal)
      const uv = g.attributes.uv, nrm = g.attributes.normal, size = [w, h, d];
      const fixUV = (t, len) => (Math.abs(t - 1 / 3) < 0.01 ? r / len : Math.abs(t - 2 / 3) < 0.01 ? 1 - r / len : t);
      for (let i = 0; i < uv.count; i++) {
        const ax = Math.abs(nrm.getX(i)) > 0.5 ? 0 : Math.abs(nrm.getY(i)) > 0.5 ? 1 : 2;
        const uAxis = ax === 0 ? 2 : 0, vAxis = ax === 1 ? 2 : 1;
        uv.setXY(i, fixUV(uv.getX(i), size[uAxis]), fixUV(uv.getY(i), size[vAxis]));
      }
      g.computeVertexNormals();
      geoCache.set(key, g);
      return g;
    }
    /* default bevel for a box of this size: about a fifth of its thinnest side, never more than 3 cm */
    const bevelFor = (w, h, d) => Math.min(0.03, Math.min(w, h, d) * 0.2);

    const hex = c => (c && c.getHexString ? c.getHexString() : '');
    function matKey(m, noColor) {
      return [m.type, noColor ? '' : hex(m.color), m.map ? m.map.uuid : '', m.roughness, m.metalness, hex(m.emissive), m.emissiveIntensity,
        m.transparent, m.opacity, m.side, m.flatShading, m.wireframe, m.vertexColors, m.depthWrite, m.blending, m.fog].join('|');
    }
    /* Bake the static meshes under `root` into one mesh per material look (same colour, map, roughness and so on).
       Subtrees in `keep` (animated or rebuilt parts) and meshes with userData.noMerge stay as they are. Draw calls
       drop from hundreds to a few dozen; the result also casts and receives shadows. */
    function mergeStatic(root, keep = [], opts = {}) {
      const keepSet = new Set(keep.filter(Boolean));
      root.updateMatrixWorld(true);
      const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
      const buckets = new Map();
      const victims = [];
      const visit = o => {
        if (keepSet.has(o)) return;
        if (o.isMesh && !o.isInstancedMesh && !o.userData.noMerge && !Array.isArray(o.material) && o.visible && o.geometry && o.geometry.attributes.position) {
          // opts.bakeColor (v8.0.0): opaque, untextured, non-glowing materials that differ only in colour share one
          // draw call, with each part's colour written into the vertex colours
          const m = o.material, bake = !!opts.bakeColor && m.isMeshStandardMaterial && !m.map && !m.vertexColors && !m.transparent && (!m.emissive || m.emissive.getHex() === 0);
          const k = bake ? 'bake|' + matKey(m, true) : matKey(m);
          if (!buckets.has(k)) buckets.set(k, { mat: m, items: [], bake });
          buckets.get(k).items.push(o);
          victims.push(o);
        }
        if (!o.isMesh || true) o.children.forEach(visit);
      };
      root.children.forEach(visit);
      const m4 = new THREE.Matrix4(), nm = new THREE.Matrix3();
      const merged = [];
      buckets.forEach(({ mat, items, bake }) => {
        if (items.length < 2) return;
        if (bake && items.every(o => o.material.color.equals(mat.color))) bake = false;   // one colour only: nothing to bake
        const wantUV = items.every(o => o.geometry.attributes.uv), wantCol = !!mat.vertexColors || bake;
        let total = 0;
        const parts = items.map(o => { const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry; total += g.attributes.position.count; return g; });
        const P = new Float32Array(total * 3), N = new Float32Array(total * 3), U = wantUV ? new Float32Array(total * 2) : null, C = wantCol ? new Float32Array(total * 3) : null;
        let off = 0;
        const tv = new THREE.Vector3();
        items.forEach((o, idx) => {
          const g = parts[idx];
          m4.multiplyMatrices(inv, o.matrixWorld);
          nm.getNormalMatrix(m4);
          const det = m4.determinant();
          const pa = g.attributes.position, na = g.attributes.normal, ua = g.attributes.uv, ca = g.attributes.color, n = pa.count;
          for (let i = 0; i < n; i++) {
            // mirrored transforms flip the winding: swap the 2nd and 3rd vertex of each triangle
            const src = det < 0 ? (i % 3 === 1 ? i + 1 : i % 3 === 2 ? i - 1 : i) : i;
            tv.fromBufferAttribute(pa, src).applyMatrix4(m4); P.set([tv.x, tv.y, tv.z], (off + i) * 3);
            if (na) { tv.fromBufferAttribute(na, src).applyMatrix3(nm).normalize(); N.set([tv.x, tv.y, tv.z], (off + i) * 3); }
            if (U) U.set([ua.getX(src), ua.getY(src)], (off + i) * 2);
            if (C) { if (bake) { const c = o.material.color; C.set([c.r, c.g, c.b], (off + i) * 3); } else if (ca) C.set([ca.getX(src), ca.getY(src), ca.getZ(src)], (off + i) * 3); else C.set([1, 1, 1], (off + i) * 3); }
          }
          off += n;
          if (g !== o.geometry) g.dispose();
        });
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(P, 3));
        geo.setAttribute('normal', new THREE.BufferAttribute(N, 3));
        if (U) geo.setAttribute('uv', new THREE.BufferAttribute(U, 2));
        if (C) geo.setAttribute('color', new THREE.BufferAttribute(C, 3));
        geo.computeBoundingSphere();
        let useMat = mat;
        if (bake) { useMat = mat.clone(); useMat.color.setRGB(1, 1, 1); useMat.vertexColors = true; }
        const mesh = new THREE.Mesh(geo, useMat);
        mesh.userData.merged = true;
        if (opts.keepShadow) { mesh.castShadow = items.some(o => o.castShadow); mesh.receiveShadow = items.some(o => o.receiveShadow); }
        else { mesh.castShadow = !useMat.transparent; mesh.receiveShadow = true; }
        merged.push(mesh);
        items.forEach(o => { o.parent.remove(o); });
      });
      merged.forEach(m => root.add(m));
      return merged.length;
    }
    /* v8.0.0: merge a prop group by material but leave apart anything that can light up or fade (unlit, transparent
       or emissive materials) plus `keep`; shadow flags stay as they were */
    function mergeSafe(root, keep = []) {
      const k = keep.slice();
      root.traverse(o => { if (o.isMesh && (o.material.type === 'MeshBasicMaterial' || o.material.transparent || (o.material.emissive && o.material.emissive.getHex() !== 0))) k.push(o); });
      return mergeStatic(root, k, { keepShadow: true, bakeColor: true });
    }
    return { roundedBox, bevelFor, mergeStatic, mergeSafe };
  })();
}
