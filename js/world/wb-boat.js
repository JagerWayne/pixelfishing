/* WorldBuilder methods: the hull loft base and buildBoatMesh (paint bands and pennant). */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { BOAT_PAINTS } from './layout.js';

export const wbBoatStatics = {
  loftHullBase(o) {
    // o: L, beam, draft, depth (keel->sheer at midship), bowRise, sternRise, sternW, bands:[{y0,y1,color}], planks
    const NZ = 52, NP = 20;   // finer loft: smoother hull and crisp paint bands
    const pos = [], col = [], idx = [];
    const c = new THREE.Color();
    const sheerY = t => o.depth - o.draft + o.depth * (0.45 * (t < 0.4 ? Math.pow((0.4 - t) / 0.4, 1.7) * o.bowRise : 0) + (t > 0.8 ? (t - 0.8) * o.sternRise : 0));
    const keelY = t => -o.draft * (0.25 + 0.75 * THREE.MathUtils.smoothstep(t, 0.0, 0.42)) + (t > 0.85 ? (t - 0.85) * 0.9 : 0);
    const halfW = t => {
      const base = o.beam / 2;
      if (t < 0.5) return base * Math.pow(Math.max(0.02, t / 0.5), 0.62);
      const k = Math.max(0, (t - 0.86) / 0.14); // rounded quarters only in the last stretch
      return base * (1 - 0.05 * (t - 0.5) / 0.5) * (1 - (1 - o.sternW) * k * k);
    };
    const loops = [];
    for (let i = 0; i <= NZ; i++) {
      const t = i / NZ, z = -o.L / 2 + t * o.L;
      const w = halfW(t), ky = keelY(t), sy = sheerY(t);
      const right = [];
      // rows at every paint-band edge (twice, a hair apart), so each stripe is a clean straight line, not a zigzag
      const us = [];
      for (let k = 0; k < NP; k++) us.push(k / (NP - 1));
      o.bands.forEach(bd => [bd.y0, bd.y1].forEach(yb => { if (Math.abs(yb) > 8) return; const ub = (yb - ky) / Math.max(1e-4, sy - ky); us.push(THREE.MathUtils.clamp(ub - 2e-4, 0, 1), THREE.MathUtils.clamp(ub + 2e-4, 0, 1)); }));
      us.sort((p, q) => p - q);
      for (let k = 0; k < us.length; k++) {
        const u = us[k];
        const x = w * (1 - Math.pow(1 - u, 2.1)) * (1 + (o.planks ? Math.sin(u * o.planks * Math.PI * 2) * 0.012 : 0));
        right.push([x, ky + (sy - ky) * u, z]);
      }
      const left = right.slice(0, right.length - 1).reverse().map(p => [-p[0], p[1], p[2]]);
      loops.push(right.concat(left));
    }
    const NL = loops[0].length;
    loops.forEach(loop => loop.forEach(p => {
      pos.push(p[0], p[1], p[2]);
      c.set(o.bands[o.bands.length - 1].color);
      for (const b of o.bands) { if (p[1] >= b.y0 && p[1] < b.y1) { c.set(b.color); break; } }
      if (o.planks) { const pl = Math.floor((p[1] + o.draft) * o.planks * 2.2); if (pl % 2) c.multiplyScalar(0.88); }
      col.push(c.r, c.g, c.b);
    }));
    for (let i = 0; i < NZ; i++) for (let j = 0; j < NL - 1; j++) {
      const a = i * NL + j, b = a + NL;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx); g.computeVertexNormals();
    // flat transom board closing the stern, with its own flat normals
    const last = loops[NZ];
    const tp = [], tc = [], ti = [], tn = [];
    const zT = last[0][2];
    const top = last[(last.length - 1) / 2];
    tp.push(0, top[1], zT); c.set(o.bands[o.bands.length - 1].color); tc.push(c.r, c.g, c.b); tn.push(0, 0, 1);
    // one flat colour for the whole transom (the topside band just under the sheer): a fan of triangles from the centre
    // cannot show horizontal stripes without streaks
    const tY = last[(last.length - 1) / 2][1] - 0.3;
    c.set(o.bands[o.bands.length - 1].color);
    for (const bnd of o.bands) { if (tY >= bnd.y0 && tY < bnd.y1) { c.set(bnd.color); break; } }
    tc[0] = c.r; tc[1] = c.g; tc[2] = c.b;
    last.forEach(p => {
      tp.push(p[0], p[1], zT);
      tc.push(c.r, c.g, c.b); tn.push(0, 0, 1);
    });
    for (let j = 1; j < NL; j++) ti.push(0, j, j + 1);
    const tg = new THREE.BufferGeometry();
    tg.setAttribute('position', new THREE.Float32BufferAttribute(tp, 3));
    tg.setAttribute('color', new THREE.Float32BufferAttribute(tc, 3));
    tg.setAttribute('normal', new THREE.Float32BufferAttribute(tn, 3));
    tg.setIndex(ti);
    const topY = top[1], topX = top[0];
    return { geo: g, transom: tg, halfW, sheerY, keelY, sternTop: { y: topY, x: topX, z: zT } };
  },

  /* paint: undefined = the saved paint for this tier, null = factory colours */
  buildBoatMesh(tier, textures, paint) {
    let P = paint === undefined ? null : paint;
    if (paint === undefined) { try { P = (shared.state.town && shared.state.town.paint && shared.state.town.paint[tier]) || null; } catch (e) { P = null; } }
    this._paint = P; this._lastHull = null;
    const g = this.buildBoatMeshBase(tier, textures), H = this._lastHull;
    this._paint = null;
    if (P && P.flag >= 0 && H && H.sternTop) {   // a pennant on a short pole at the stern, flying aft
      const st = H.sternTop, px = Math.max(0.15, Math.abs(st.x) * 0.75);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 1.1, 6), new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.6, roughness: 0.4 }));
      pole.position.set(px, st.y + 0.55, st.z - 0.08); g.add(pole);
      const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0.55, -0.11); sh.lineTo(0, -0.24); sh.lineTo(0, 0);
      const flag = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color: BOAT_PAINTS[P.flag][1], side: THREE.DoubleSide, roughness: 0.8 }));
      flag.rotation.y = -Math.PI / 2; flag.position.set(px, st.y + 1.08, st.z - 0.08); g.add(flag);
    }
    return g;
  },
};
