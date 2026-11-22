/* Diving: fish waypoints and steering, the aim lock and spear hit tests. */
import { THREE } from '../engine/three.js';
import { dive, seabedY, waypointY, wrapAngle } from './dive-state.js';
import { resolveDiveSolids } from './dive-props.js';

function pickWaypoint(f, diver) {
  let cx = f.pos.x, cz = f.pos.z, r = 6 + Math.random() * 12;
  if (f.curious && diver && Math.random() < 0.7) { cx = diver.x; cz = diver.z; r = 5 + Math.random() * 4; }
  const a = Math.random() * Math.PI * 2;
  const x = THREE.MathUtils.clamp(cx + Math.cos(a) * r, -220, 220);
  const z = Math.min(-3.2, cz + Math.sin(a) * r);
  f.tgt.set(x, waypointY(f, x, z), z);
  f.wait = 3 + Math.random() * 5;
}
/* one step of fish behaviour: wander, school, flee from the diver or a flying spear, stay between sea floor and surface */
export function stepDiveFish(f, dt, diver, spearPos) {
  let mul = 1;
  const dd = f.pos.distanceTo(diver);
  if (f.skit > 0 && dd < f.skit && f.fleeT <= 0) { f.fleeT = 1.6 + Math.random(); f.threat.copy(diver); }
  if (f.lurk && dd < 5.5 && Math.abs(dive.vf) > 1.1 && f.fleeT <= 0) { f.fleeT = 2.8; f.threat.copy(diver); }   // a lurker bolts if you rush in
  if (spearPos && f.pos.distanceTo(spearPos) < 3.2 && f.fleeT <= 0) { f.fleeT = 2.2; f.threat.copy(spearPos); }
  if (f.fleeT > 0) {
    f.fleeT -= dt; mul = 2.7;
    f.tgt.set(f.pos.x - (f.threat.x - f.pos.x), f.pos.y, f.pos.z - (f.threat.z - f.pos.z));
    f.tgt.y = THREE.MathUtils.clamp(f.pos.y + (Math.random() - 0.5) * 2, seabedY(f.tgt.x, f.tgt.z) + f.radius + 0.5, -(f.radius + 1));
  } else if (f.leader && f.leader.state === 'swim') {
    const lh = f.leader.h;
    f.tgt.set(f.leader.pos.x + Math.cos(lh + f.off.x) * f.off.z, f.leader.pos.y + f.off.y, f.leader.pos.z + Math.sin(lh + f.off.x) * f.off.z);
    mul = f.pos.distanceTo(f.leader.pos) > 3 ? 1.5 : 1.0;
  } else {
    f.leader = null;
    f.wait -= dt;
    if (f.wait <= 0 || f.pos.distanceTo(f.tgt) < 1.2) pickWaypoint(f, diver);
  }
  const dx = f.tgt.x - f.pos.x, dz = f.tgt.z - f.pos.z, dy = f.tgt.y - f.pos.y;
  const turnRate = f.fleeT > 0 ? 4.2 : 1.5;
  const dH = wrapAngle(Math.atan2(dz, dx) - f.h);
  f.h += THREE.MathUtils.clamp(dH, -turnRate * dt, turnRate * dt);
  const wantP = THREE.MathUtils.clamp(Math.atan2(dy, Math.hypot(dx, dz)), -0.55, 0.55);
  f.p += (wantP - f.p) * Math.min(1, dt * 2.5);
  const wantV = f.speed * mul * (Math.abs(dH) > 1.6 ? 0.45 : 1);
  f.v += (wantV - f.v) * Math.min(1, dt * 2.2);
  const cp = Math.cos(f.p);
  f.pos.x += Math.cos(f.h) * cp * f.v * dt;
  f.pos.y += Math.sin(f.p) * f.v * dt;
  f.pos.z += Math.sin(f.h) * cp * f.v * dt;
  if (resolveDiveSolids(f.pos, f.radius * 0.8, f.radius * 0.6)) { f.h += 1.2; f.v *= 0.6; }
  const fy = seabedY(f.pos.x, f.pos.z) + f.radius + 0.25;
  if (f.pos.y < fy) { f.pos.y = fy; f.p = Math.max(f.p, 0.15); }
  const top = -(f.radius + 0.9);
  if (f.pos.y > top) { f.pos.y = top; f.p = Math.min(f.p, -0.1); }
  if (f.pos.z > -3.2) { f.pos.z = -3.2; f.h = Math.atan2(-Math.abs(Math.sin(f.h)) - 0.3, Math.cos(f.h)); }
}
/* the best fish to lock onto: closest to the crosshair, inside a cone and within reach */
export function pickLockTarget(camPos, camFwd, fishList, maxDist, coneCos) {
  let best = null, bestScore = -1;
  for (const f of fishList) {
    if (f.state !== 'swim') continue;
    const dx = f.pos.x - camPos.x, dy = f.pos.y - camPos.y, dz = f.pos.z - camPos.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist > maxDist || dist < 0.8) continue;
    const dot = (dx * camFwd.x + dy * camFwd.y + dz * camFwd.z) / dist;
    if (dot < coneCos) continue;
    const score = dot * 2 - dist / maxDist * 0.6;
    if (score > bestScore) { bestScore = score; best = f; }
  }
  return best;
}
/* does the segment a->b pass within r of centre c? (spear against a fish) */
export function segmentHitsSphere(a, b, c, r) {
  const abx = b.x - a.x, aby = b.y - a.y, abz = b.z - a.z;
  const len2 = abx * abx + aby * aby + abz * abz;
  let t = len2 > 1e-9 ? ((c.x - a.x) * abx + (c.y - a.y) * aby + (c.z - a.z) * abz) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  const px = a.x + abx * t - c.x, py = a.y + aby * t - c.y, pz = a.z + abz * t - c.z;
  return px * px + py * py + pz * pz <= r * r;
}
