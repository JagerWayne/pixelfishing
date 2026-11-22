/* AnglerFactory method: torsoGeo, the lofted skinned torso (heights scaled by the torso factor). */
import { THREE } from '../engine/three.js';

export const anglerTorsoStatics = {
  /* Lofted torso from the crotch to the top of the neck. prof(y) -> { wx, wz, cz }; front is -Z.
     opt: { y0, y1, off, seg, colFn, keep(angle, y) for openings (vest front, armholes), bust } */
  torsoGeo(d, idxOf, prof, opt = {}) {
    const y0 = opt.y0, y1 = opt.y1, off = opt.off || 0, seg = opt.seg || (opt.bust ? 32 : 24);
    const pos = [], idx = [], si = [], sw = [], col = [], TS = d.torso || 1;
    const c = new THREE.Color();
    const ySpine = d.hipY + d.spine, yChest = ySpine + d.chest, yNeck = yChest + d.neck;
    // ring heights: every 2.5 cm, finer (1.4 cm) through the bust so its curve reads smoothly
    const ys = [y0];
    if (!opt.bust) { const nr = Math.max(2, Math.ceil((y1 - y0) / 0.025)); for (let i = 1; i <= nr; i++) ys.push(y0 + (y1 - y0) * (i / nr)); }
    while (ys[ys.length - 1] < y1 - 1e-4) {
      const yy = ys[ys.length - 1], inBust = opt.bust && yy > yChest - 0.06 * TS && yy < yChest + 0.17 * TS;
      ys.push(Math.min(y1, yy + (inBust ? 0.014 : 0.025) * TS));
    }
    if (ys.length < 3) ys.splice(1, 0, (y0 + y1) / 2);
    const rings = ys.length - 1;
    const keepMask = [];
    for (let i = 0; i <= rings; i++) {
      const y = ys[i];
      const p = prof(y);
      // vertical weights: hips -> spine -> chest -> neck
      const wSpine = THREE.MathUtils.smoothstep(y, d.hipY + 0.02 * TS, ySpine + 0.06 * TS);
      const wChest = THREE.MathUtils.smoothstep(y, ySpine + 0.04 * TS, yChest + 0.06 * TS);
      const wNeck = THREE.MathUtils.smoothstep(y, yNeck - 0.05 * TS, yNeck + 0.03 * TS);
      for (let j = 0; j <= seg; j++) {
        const a = (j / seg) * Math.PI * 2;           // a = 3pi/2 is the front (-Z)
        const ca = Math.cos(a), sa = Math.sin(a);
        // superellipse section: boxier at the chest, rounder at the waist
        const e = 2.4;
        const kx = Math.sign(ca) * Math.pow(Math.abs(ca), 2 / e), kz = Math.sign(sa) * Math.pow(Math.abs(sa), 2 / e);
        let x = kx * (p.wx + off), z = kz * (p.wz + off) + p.cz;
        let mL = 0, mR = 0;
        if (opt.bust && sa < 0) { // bust: two teardrop mounds on the front of the chest
          const fr = Math.max(0, -sa);
          mL = this.bustMound(d, x, y, -1) * fr; mR = this.bustMound(d, x, y, 1) * fr;
          z -= opt.bust * (mL + mR);
        }
        if (sa > 0 && y < d.hipY + 0.05 * TS && y > d.hipY - 0.12 * TS) z += 0.025 * Math.exp(-((y - d.hipY + 0.03 * TS) ** 2) / 0.003) * sa; // seat
        pos.push(x, y, z);
        // shoulders: the sides of the upper chest follow the clavicles a little
        const shoulderW = THREE.MathUtils.smoothstep(Math.abs(x), 0.09, 0.17) * THREE.MathUtils.smoothstep(y, yChest + 0.08 * TS, yChest + 0.2 * TS) * (1 - wNeck);
        const clavIdx = x < 0 ? idxOf.clavL : idxOf.clavR;
        let wH = 1 - wSpine, wS = wSpine * (1 - wChest), wC = wChest * (1 - wNeck), wN = wNeck;
        const wCl = wC * shoulderW * 0.6; wC -= wCl;
        // pack the four biggest weights
        // the mounds ride on their own soft-tissue bones (strongest at the lower pole, fading out at the edges)
        let wBL = 0, wBR = 0;
        if (opt.bust && idxOf.bustL != null) {
          wBL = wC * Math.min(1, Math.pow(mL, 0.75) * 1.05); wBR = wC * Math.min(1, Math.pow(mR, 0.75) * 1.05);
          wC -= wBL + wBR;
        }
        const ws = [[idxOf.hips, wH], [idxOf.spine, wS], [idxOf.chest, wC], [idxOf.neck, wN], [clavIdx, wCl], [idxOf.bustL, wBL], [idxOf.bustR, wBR]].filter(q => q[0] != null).sort((m, n) => n[1] - m[1]).slice(0, 4);
        const tot = ws.reduce((t, q) => t + q[1], 0) || 1;
        ws.forEach(q => { si.push(q[0]); sw.push(q[1] / tot); });
        if (opt.colFn) { opt.colFn(y, a, c); col.push(c.r, c.g, c.b); }
        keepMask.push(opt.keep ? opt.keep(a, y, x) : true);
      }
    }
    for (let i = 0; i < rings; i++) for (let j = 0; j < seg; j++) {
      const a = i * (seg + 1) + j, b = a + seg + 1;
      if (!(keepMask[a] && keepMask[a + 1] && keepMask[b] && keepMask[b + 1])) continue;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    if (opt.capBottom) { // close the crotch
      const n0 = pos.length / 3, py = prof(y0);
      pos.push(0, y0 - 0.02, py.cz); si.push(idxOf.hips, 0, 0, 0); sw.push(1, 0, 0, 0); if (opt.colFn) { opt.colFn(y0, 0, c); col.push(c.r, c.g, c.b); }
      for (let j = 0; j < seg; j++) idx.push(n0, j + 1, j);
    }
    return this.skinGeo(pos, idx, si, sw, opt.colFn ? col : null);
  },
};
