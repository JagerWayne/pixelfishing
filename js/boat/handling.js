/* Boat collisions against the collider registry, and boat handling (throttle, helm, slip). */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { world } from '../render/lights.js';
import { boatPos } from '../sim/runtime.js';
import { castOffLighthouse, lhDock, updateStationPicker } from './stations.js';
import { cheats, joyState, keys } from '../sim/controls-state.js';
import { moveLatched } from '../sim/joystick.js';

/* =========================================================================
   SECTION I: BOARDING, DOCKING & RESCUE LOOP
   ========================================================================= */
/* ---- Boat collisions: the hull is a capsule (two circles along its heading) tested against circles, rectangles and the shoreline ---- */
export function resolveBoatCollisions() {
  const hx = -Math.sin(shared.boatYaw), hz = -Math.cos(shared.boatYaw);
  const R = shared.boatHalfWid, off = Math.max(0, shared.boatHalfLen - shared.boatHalfWid);
  const mv = shared.boatVel < 0 ? -1 : 1; // moving backwards: the impact direction is the stern
  let hit = null, worst = 0;
  const push = (nx, nz, depth, name) => {
    boatPos.x += nx * depth; boatPos.z += nz * depth;
    const into = Math.max(0, -(mv * (hx * nx + hz * nz)));
    if (into > worst) { worst = into; hit = name; }
  };
  for (let it = 0; it < 3; it++) {
    for (const sOff of [off, -off]) {
      const cx = boatPos.x + hx * sOff, cz = boatPos.z + hz * sOff;
      const wall = world.shoreZ(cx) - R;
      if (cz > wall) push(0, -1, cz - wall, 'island');
      for (const o of world.boatCircles) {
        const ox = cx - o.x, oz = cz - o.z, d = Math.hypot(ox, oz), m = o.r + R;
        if (d < m) push(d > 1e-3 ? ox / d : 0, d > 1e-3 ? oz / d : -1, m - d, o.name);
      }
      for (const r of world.boatRects) {
        const px = Math.max(r.x1, Math.min(cx, r.x2)), pz = Math.max(r.z1, Math.min(cz, r.z2));
        const ox = cx - px, oz = cz - pz, d = Math.hypot(ox, oz);
        if (d > 1e-4) {
          if (d < R) push(ox / d, oz / d, R - d, r.name);
        } else { // hull centre inside the rectangle: leave through the nearest face
          const dl = cx - r.x1, dr = r.x2 - cx, dt = cz - r.z1, db = r.z2 - cz, mn = Math.min(dl, dr, dt, db);
          if (mn === dl) push(-1, 0, dl + R, r.name);
          else if (mn === dr) push(1, 0, dr + R, r.name);
          else if (mn === dt) push(0, -1, dt + R, r.name);
          else push(0, 1, db + R, r.name);
        }
      }
    }
  }
  boatPos.x = THREE.MathUtils.clamp(boatPos.x, -110, 110);
  return { hit, into: worst };
}

export const BUMP_TEXT = { rocks: '🪨 Watch the rocks!', lighthouse: '🪨 Watch the rocks!', buoy: '🛟 Bumped a buoy!', pier: '⚓ Mind the pier!', island: '🏝️ Shallow water, that is the beach!' };

/* ---- Boat handling, relative to the boat: up = throttle ahead, left / right = helm, down = brake then reverse ----
   A small hull model instead of a car: thrust against water drag (linear + quadratic, so each boat has a natural
   top speed and coasts down slowly), the helm only bites with water flowing past it (no spinning on the spot),
   yaw has inertia, and the hull keeps some sideways momentum in a turn (it skids, more for planing hulls). */
export const BOAT_DEFAULT_HANDLING = { accel: 2, turn: 0.7, yawK: 2, slip: 3, hz: 1.1, damp: 0.35, plane: 0.05, bank: 0.08, chop: 1 };
shared.boatSide = 0;
export function updateBoatControl(dt, boat) {
  let throttle = -joyState.y, steer = joyState.x;
  if (keys['KeyW'] || keys['ArrowUp']) throttle += 1;
  if (keys['KeyS'] || keys['ArrowDown']) throttle -= 1;
  if (keys['KeyA'] || keys['ArrowLeft']) steer -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) steer += 1;
  throttle = THREE.MathUtils.clamp(throttle, -1, 1);
  if (moveLatched()) { throttle = 0; steer = 0; }
  steer = THREE.MathUtils.clamp(steer, -1, 1);
  if (Math.abs(throttle) < 0.1) throttle = 0;
  if (Math.abs(steer) < 0.1) steer = 0;
  if ((shared.boatStationActive || lhDock.on) && (throttle !== 0 || steer !== 0)) {   // back to the helm (and cast off if moored)
    if (lhDock.on) castOffLighthouse(); else { shared.boatStationActive = false; updateStationPicker(true); }
  }
  const hd = boat.handling || BOAT_DEFAULT_HANDLING, V = Math.max(1, boat.speed);
  const hasFuel = cheats.freeFuel || shared.state.fuel > 0;
  if (!hasFuel) throttle = 0;                                   // no engine: inertia and the helm only
  shared.boatPowered = hasFuel && throttle !== 0;
  // thrust (reverse is weaker) against drag; a fixed term so the boat really comes to rest
  const thrust = throttle >= 0 ? throttle * hd.accel : throttle * hd.accel * 0.65;
  const r = shared.boatVel / V;
  const drag = hd.accel * (0.25 * r + 0.75 * r * Math.abs(r)) + Math.sign(shared.boatVel) * (throttle === 0 ? 0.55 : 0.2);
  let nv = shared.boatVel + (thrust - drag) * dt;
  if (Math.sign(nv) !== Math.sign(shared.boatVel) && shared.boatVel !== 0 && throttle === 0) nv = 0;  // drag never pushes it backwards
  shared.boatVel = THREE.MathUtils.clamp(nv, -0.4 * V, V * 1.05);
  if (Math.abs(shared.boatVel) < 0.03 && throttle === 0) shared.boatVel = 0;
  // the helm needs water flowing past it; a little prop wash lets a slow boat creep round when throttled
  const flow = Math.min(1, Math.abs(shared.boatVel) / (0.35 * V));
  const auth = Math.pow(flow, 0.8) + (throttle !== 0 ? 0.12 : 0);
  const dir = shared.boatVel < -0.2 ? -1 : 1;                          // astern the helm works the other way
  const highSpeed = 1 - 0.35 * Math.pow(Math.min(1, Math.abs(shared.boatVel) / V), 2);   // wider turns at full speed
  const want = -steer * hd.turn * Math.min(1, auth) * highSpeed * dir;
  shared.boatTurnRate += (want - shared.boatTurnRate) * (1 - Math.exp(-hd.yawK * dt));
  const dYaw = shared.boatTurnRate * dt;
  shared.boatYaw += dYaw;
  // keep the world momentum through the turn, then let the keel bleed off the sideways part (the skid)
  const cu = Math.cos(dYaw), su = Math.sin(dYaw);
  const u = shared.boatVel * cu - shared.boatSide * su, w = shared.boatSide * cu + shared.boatVel * su;
  shared.boatVel = u;
  shared.boatSide = w * Math.exp(-hd.slip * dt);
  if (Math.abs(shared.boatSide) < 0.01) shared.boatSide = 0;
  if (shared.boatPowered && throttle !== 0) sfx.playEngineChug(0.6 + 1.6 * Math.abs(shared.boatVel) / V);
  return { throttle, steer };
}
