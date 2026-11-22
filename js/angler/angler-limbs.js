/* AnglerFactory methods: skinned geometry helpers, the limbs and the bust mounds. */
import { THREE } from '../engine/three.js';

export const anglerLimbsStatics = {
  /* ---------- skinned geometry builders (all in the skeleton's rest space, metres) ---------- */
  skinGeo(pos, idx, si, sw, col, uv) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    if (col) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    if (uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
    g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  },
  /* concatenate skinned geometries that share a material into one */
  mergeSkin(geos) {
    const out = { pos: [], idx: [], si: [], sw: [], col: [] };
    let base = 0, anyCol = geos.some(g => g.attributes.color);
    geos.forEach(g => {
      const p = g.attributes.position, n = p.count;
      for (let i = 0; i < n; i++) {
        out.pos.push(p.getX(i), p.getY(i), p.getZ(i));
        const a = g.attributes.skinIndex, w = g.attributes.skinWeight;
        out.si.push(a.getX(i), a.getY(i), a.getZ(i), a.getW(i));
        out.sw.push(w.getX(i), w.getY(i), w.getZ(i), w.getW(i));
        if (anyCol) { const c = g.attributes.color; if (c) out.col.push(c.getX(i), c.getY(i), c.getZ(i)); else out.col.push(1, 1, 1); }
      }
      const ix = g.index.array;
      for (let k = 0; k < ix.length; k++) out.idx.push(ix[k] + base);
      base += n;
      g.dispose();
    });
    return this.skinGeo(out.pos, out.idx, out.si, out.sw, anyCol ? out.col : null);
  },

  restPos(rig, bone) { const v = new THREE.Vector3(); bone.getWorldPosition(v); rig.root.worldToLocal(v); return v.divideScalar(rig.dims.hScale); },

  /* Lofted limb: rings down a two-segment chain (top joint P0 -> P1 -> P2), elliptical sections from the radius
     profile rFn(s) (s in metres from P0), skin weights blending across the middle joint and into the end bone.
     opt: { s0, s1 (cut range), off (push out, for clothes), seg, colFn, capTop, ez (depth/width), bulge } */
  limbGeo(P0, P1, P2, bones, rFn, opt = {}) {
    const L1 = P0.distanceTo(P1), L2 = P1.distanceTo(P2), L = L1 + L2;
    const s0 = opt.s0 || 0, s1 = Math.min(L, opt.s1 == null ? L : opt.s1), seg = opt.seg || 14, off = opt.off || 0, ez = opt.ez || 0.92;
    const pos = [], idx = [], si = [], sw = [], col = [];
    const rings = Math.max(2, Math.ceil((s1 - s0) / 0.03));
    const c = new THREE.Color();
    const at = s => (s <= L1 ? P0.clone().lerp(P1, s / L1) : P1.clone().lerp(P2, (s - L1) / L2));
    for (let i = 0; i <= rings; i++) {
      const s = s0 + (s1 - s0) * (i / rings);
      const ctr = at(s), r = rFn(s / L, s) + off;
      // weights: upper bone -> lower bone across the joint, a little of the end bone at the very end
      const jb = 0.07;
      let wLow = THREE.MathUtils.smoothstep(s, L1 - jb, L1 + jb);
      let wEnd = bones[2] != null ? THREE.MathUtils.smoothstep(s, L - 0.05, L + 0.02) * 0.5 : 0;
      const wUp = 1 - wLow;
      wLow *= 1 - wEnd;
      const wTop = opt.topBone != null ? (1 - THREE.MathUtils.smoothstep(s, 0, 0.08)) * 0.45 : 0;
      for (let j = 0; j <= seg; j++) {
        const a = (j / seg) * Math.PI * 2;
        const bul = opt.bulge ? opt.bulge(s / L, a) : 0;
        pos.push(ctr.x + Math.cos(a) * (r + bul), ctr.y, ctr.z + Math.sin(a) * (r + bul) * ez);
        const wu = wUp * (1 - wTop), wl = wLow * (1 - wTop), we = wEnd * (1 - wTop), tot = wu + wl + we + wTop || 1;
        si.push(bones[0], bones[1], bones[2] != null ? bones[2] : 0, opt.topBone != null ? opt.topBone : 0);
        sw.push(wu / tot, wl / tot, we / tot, wTop / tot);
        if (opt.colFn) { opt.colFn(s / L, a, c); col.push(c.r, c.g, c.b); }
      }
    }
    for (let i = 0; i < rings; i++) for (let j = 0; j < seg; j++) {
      const a = i * (seg + 1) + j, b = a + seg + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
    if (opt.capTop) { // dome over the top joint (shoulder / hip), weighted like the first ring
      const r0 = rFn(s0 / L, s0) + off, n0 = pos.length / 3;
      for (let k = 1; k <= 3; k++) {
        const ph = (k / 3) * Math.PI / 2, rr = r0 * Math.cos(ph), yy = P0.y + r0 * Math.sin(ph) * 0.8;
        for (let j = 0; j <= seg; j++) {
          const a = (j / seg) * Math.PI * 2;
          pos.push(P0.x + Math.cos(a) * rr, yy, P0.z + Math.sin(a) * rr * ez);
          si.push(bones[0], 0, 0, opt.topBone != null ? opt.topBone : 0); sw.push(0.55, 0, 0, 0.45);
          if (opt.colFn) { opt.colFn(0, a, c); col.push(c.r, c.g, c.b); }
        }
      }
      for (let k = 0; k < 3; k++) for (let j = 0; j < seg; j++) {
        const a = (k === 0 ? 0 : n0 + (k - 1) * (seg + 1)) + j, b = n0 + k * (seg + 1) + j;
        idx.push(a + 1, a, b, a + 1, b, b + 1);
      }
    }
    return this.skinGeo(pos, idx, si, sw, opt.colFn ? col : null);
  },

  /* Teardrop bust profile (0..1) for one side at rest-space (x, y): a long, gentle upper slope from the chest,
     a fuller rounded lower pole that ends in a soft underbust crease, a little wider and further out at the bottom. */
  bustMound(d, x, y, sx) {
    const T = d.torso || 1, yb = d.hipY + d.spine + d.chest + 0.035 * T, dy = y - yb;
    const low = THREE.MathUtils.clamp(-dy / (0.055 * T), 0, 1);
    const cx = sx * (d.bustX + 0.008 * low), wx = 0.047 + 0.012 * low, dx = x - cx;
    const vert = dy >= 0 ? Math.pow(Math.max(0, 1 - dy / (0.13 * T)), 1.7) : Math.exp(-Math.pow(-dy / (0.052 * T), 4));
    return vert * Math.exp(-(dx * dx) / (wx * wx));
  },
};
