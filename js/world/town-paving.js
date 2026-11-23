/* The town's paving (v2.1): streets from STREETS without overlaps, so nothing flickers (z-fighting). The square comes
   first, then the streets in STREETS order; a street is not paved where the square or an earlier street already is.
   Each centre line is split exactly where that changes (bisection), and the pieces of up to a metre abut exactly
   (sloped pieces overlap 2 cm, as they meet at an angle; no piece crosses a bend in the ground), and each later street
   sits 1.5 mm lower, so the corner of a diagonal street that still reaches under another cannot flicker. Kerbs line the stone streets, stop at every street mouth and
   stand 3 cm above the road. */
import { ISLAND, STREETS, TOWN, townGround } from './layout.js';

/* is (x, z) on street st (inside the rectangle of one of its segments, half width st.w / 2 + pad)? */
function onStreet(st, x, z, pad = 0) {
  for (let k = 0; k < st.pts.length - 1; k++) {
    const [ax, az] = st.pts[k], [bx, bz] = st.pts[k + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
    const t = ((x - ax) * dx + (z - az) * dz) / L2;
    if (t < 0 || t > 1) continue;
    if (Math.abs((x - ax) * dz - (z - az) * dx) / Math.sqrt(L2) < st.w / 2 + pad) return true;
  }
  return false;
}
/* paved already: the square with its border, or a street earlier than `before` (or any other street, for kerbs) */
function covered(x, z, test) {
  const S = TOWN.square;
  if (x > S.x0 - 0.15 && x < S.x1 + 0.15 && z > S.z0 - 0.15 && z < S.z1 + 0.15) return true;
  return STREETS.some((st, j) => test(st, j) && onStreet(st, x, z));
}
/* the uncovered stretches [t0, t1] of the segment a -> b */
function freeRuns(ax, az, bx, bz, isCovered) {
  const len = Math.hypot(bx - ax, bz - az), n = Math.max(2, Math.ceil(len / 0.05)), at = t => isCovered(ax + (bx - ax) * t, az + (bz - az) * t);
  const edge = (lo, hi, coveredLo) => { for (let i = 0; i < 14; i++) { const m = (lo + hi) / 2; if (at(m) === coveredLo) lo = m; else hi = m; } return (lo + hi) / 2; };
  const runs = []; let prev = at(0), start = prev ? null : 0;
  for (let i = 1; i <= n; i++) {
    const t = i / n, c = at(t);
    if (c !== prev) { const e = edge((i - 1) / n, t, prev); if (c) runs.push([start, e]); else start = e; prev = c; }
  }
  if (!prev) runs.push([start, 1]);
  return runs.filter(([a, b]) => (b - a) * len > 0.02);
}

export function buildStreets(K, root, mats) {
  const { stone, brick, edge } = mats;
  const piece = (x0, z0, x1, z1, w, h, mat) => {
    const len = Math.hypot(x1 - x0, z1 - z0), y0 = townGround(z0), y1 = townGround(z1), sloped = Math.abs(y1 - y0) > 1e-4;
    const m = K.sharpBox(root, w, h, Math.hypot(len, y1 - y0) + (sloped ? 0.02 : 0), mat, (x0 + x1) / 2, (y0 + y1) / 2 + h / 2, (z0 + z1) / 2);   // tilted: its true length
    m.rotation.order = 'YXZ'; m.rotation.y = Math.atan2(x1 - x0, z1 - z0); m.rotation.x = -Math.atan2(y1 - y0, len); m.receiveShadow = true;
  };
  const pave = (ax, az, bx, bz, w, h, mat, isCovered) => freeRuns(ax, az, bx, bz, isCovered).forEach(([t0, t1]) => {
    const x0 = ax + (bx - ax) * t0, z0 = az + (bz - az) * t0, x1 = ax + (bx - ax) * t1, z1 = az + (bz - az) * t1;
    // split where the slope up to the Upper Terrace starts and ends, so no piece cuts across a bend in the ground
    const cuts = [0, 1];
    [ISLAND.rampZ0, ISLAND.rampZ1].forEach(rz => { const t = (rz - z0) / (z1 - z0); if (t > 0.001 && t < 0.999) cuts.push(t); });
    cuts.sort((a, b) => a - b);
    for (let c = 0; c < cuts.length - 1; c++) {
      const xa = x0 + (x1 - x0) * cuts[c], za = z0 + (z1 - z0) * cuts[c], xb = x0 + (x1 - x0) * cuts[c + 1], zb = z0 + (z1 - z0) * cuts[c + 1];
      const n = Math.max(1, Math.ceil(Math.hypot(xb - xa, zb - za) / 1.0));
      for (let i = 0; i < n; i++) piece(xa + (xb - xa) * i / n, za + (zb - za) * i / n, xa + (xb - xa) * (i + 1) / n, za + (zb - za) * (i + 1) / n, w, h, mat);
    }
  });
  const ramp = (st, x, z) => st.id === 'harbourUp' && z > ISLAND.rampZ0 - 0.2 && z < ISLAND.rampZ1 + 0.2;   // the steps are there
  STREETS.forEach((st, idx) => {
    const mat = st.kind === 'stone' ? stone : brick;
    for (let k = 0; k < st.pts.length - 1; k++) {
      const [ax, az] = st.pts[k], [bx, bz] = st.pts[k + 1];
      pave(ax, az, bx, bz, st.w, 0.06 - 0.0015 * idx, mat, (x, z) => ramp(st, x, z) || covered(x, z, (o, j) => j < idx));   // each later street 1.5 mm lower: a corner that still overlaps cannot flicker
      if (st.kind !== 'stone' || st.id === 'harbourUp') continue;
      const len = Math.hypot(bx - ax, bz - az), nx = (bz - az) / len, nz = -(bx - ax) / len;
      [-1, 1].forEach(s => {
        const ox = nx * s * st.w / 2, oz = nz * s * st.w / 2;
        pave(ax + ox, az + oz, bx + ox, bz + oz, 0.16, 0.09, edge, (x, z) => covered(x, z, o => o !== st));
      });
    }
  });
}
