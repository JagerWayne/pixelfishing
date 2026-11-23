/* Town fades, dragging the camera and tap-to-walk (route planning). */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { settings } from '../core/settings.js';
import { sfx } from '../data/equipment.js';
import { BW_HALF, CABIN, ISLAND, PIER_WALK, PLATFORM, townGround } from '../world/layout.js';
import { camera, renderer, scene } from '../render/renderer.js';
import { walkColliders, world } from '../render/lights.js';
import { standFocus } from './runtime.js';
import { townPath } from '../town/town-nav.js';
import { scope } from '../town/telescope-dice.js';
import { MAP_PLACES } from '../ui/map.js';
import { isAnyModalOpen } from '../utils.js';
import { shopBrowse } from '../shop/shop-kinds.js';
import { dive } from '../dive/dive-state.js';

export let tapMarker;

/* ---- Harbour Town fades: a building or palm between the camera and the angler turns see-through ---- */
export const townFadeState = { list: null, ver: 0 };
const _fadeRay = new THREE.Ray(), _fadeV = new THREE.Vector3(), _fadeHead = new THREE.Vector3();
export function updateTownFade(dt) {
  if (!world || !world.townFade) return;
  if (!townFadeState.list) {
    townFadeState.list = world.townFade.map(g => {
      const mats = [];
      g.traverse(o => { if (o.isMesh && o.material) { o.material = o.material.clone(); o.material.userData.baseT = o.material.transparent; o.material.userData.baseO = o.material.opacity; mats.push(o.material); } });
      g.updateMatrixWorld(true);
      return { g, mats, box: new THREE.Box3().setFromObject(g).expandByScalar(0.15), t: 1 };
    });
    townFadeState.ver++;   // the building materials are copies now (the night glow looks them up again)
  }
  const fp = !!settings.firstPerson && !shopBrowse.active;
  _fadeHead.copy(world.anglerGroup.position); _fadeHead.y += 1.2;
  const len = camera.position.distanceTo(_fadeHead);
  _fadeRay.origin.copy(camera.position); _fadeRay.direction.copy(_fadeHead).sub(camera.position).normalize();
  townFadeState.list.forEach(f => {
    let block = false;
    if (!fp && !shared.onBoat && !dive.active) {
      if (f.box.containsPoint(camera.position)) block = true;
      else { const hit = _fadeRay.intersectBox(f.box, _fadeV); block = !!hit && camera.position.distanceTo(_fadeV) < len - 0.3; }
    }
    const goal = block ? 0.2 : 1, prev = f.t;
    f.t += (goal - f.t) * (dt > 0 ? 1 - Math.exp(-8 * dt) : 1);
    if (Math.abs(f.t - goal) < 0.01) f.t = goal;
    if (f.t === prev) return;
    f.mats.forEach(m => { const o = f.t >= 1 ? m.userData.baseO : Math.min(m.userData.baseO, f.t); m.transparent = f.t < 1 || m.userData.baseT; m.opacity = o; m.depthWrite = f.t >= 1; m.needsUpdate = true; });
  });
}

/* ---- touch / mouse on the 3D view: drag to orbit the camera (or look around in first person), tap to walk there ---- */
export const camDrag = { on: false, id: null, x: 0, y: 0, sx: 0, sy: 0, t: 0, moved: false };
const _tapRay = new THREE.Raycaster(), _tapNdc = new THREE.Vector2(), _tapPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.5), _tapHit = new THREE.Vector3();
const zoneOf = (x, z) => z < 0.45 ? (x < -PIER_WALK - 0.02 ? 'dock' : 'pier') : z > ISLAND.zGate ? 'town' : 'board';
function clampWalkable(x, z) {
  if (z < 0.45 && x >= -PIER_WALK - 0.02) return { x: THREE.MathUtils.clamp(x, -PIER_WALK + 0.1, PIER_WALK - 0.1), z: THREE.MathUtils.clamp(z, -10.5, 0.4) };
  if (z < 0.45) return { x: THREE.MathUtils.clamp(x, PLATFORM.xOut + 0.2, PLATFORM.xIn - 0.1), z: THREE.MathUtils.clamp(z, PLATFORM.zMin + 0.2, PLATFORM.zMax) };
  if (z > ISLAND.zIn) return { x: THREE.MathUtils.clamp(x, -ISLAND.xMax + 0.2, ISLAND.xMax - 0.2), z: Math.min(z, ISLAND.zMax - 0.1) };
  if (z > ISLAND.zGate - 0.2) return { x: THREE.MathUtils.clamp(x, -(BW_HALF - 0.8), BW_HALF - 0.8), z };   // the open front between boardwalk and town
  return { x: THREE.MathUtils.clamp(x, -(BW_HALF - 0.8), BW_HALF - 0.8), z: THREE.MathUtils.clamp(z, 0.5, 5.7) };
}
/* where a tap leads: a shop or stand tapped on its building leads to the spot in front of it */
function tapDestination(x, z) {
  for (const p of MAP_PLACES()) {
    if (p.far || !p.w || ['Cabin', 'Pier end', 'Mooring platform', 'Benches', 'Town Square', 'Market stall', 'Herb garden', 'Your plot'].includes(p.name)) continue;
    if (Math.abs(x - p.x) <= p.w / 2 + 0.3 && Math.abs(z - p.z) <= p.d / 2 + 0.3)
      return p.door ? { x: p.door.x, z: p.door.z } : { x: p.x, z: p.z + p.d / 2 + 0.85 };   // town buildings: their door (v12.0.0)
  }
  return clampWalkable(x, z);
}
/* a clear x to cross between the boardwalk and the town (nothing solid in the strip z 4.7 to 7.4) */
function frontCrossX(want) {
  const lim = BW_HALF - 1.5, ok = x => !walkColliders.some(c => (c.kind === 'box' ? Math.abs(x - c.x) < c.hx + 0.45 && c.z + c.hz > 4.7 && c.z - c.hz < 7.4 : Math.abs(x - c.x) < c.r + 0.45 && c.z + c.r > 4.7 && c.z - c.r < 7.4));
  const w = THREE.MathUtils.clamp(want, -lim, lim);
  for (let k = 0; k <= 32; k++) for (const sgn of [1, -1]) { const x = w + sgn * k * 0.5; if (Math.abs(x) <= lim && ok(x)) return x; }
  return 0;
}
export function planRoute(to, fromPt) {
  const pts = [], from = fromPt ? { x: fromPt.x, z: fromPt.z } : { x: shared.playerX, z: shared.playerZ }, a0 = zoneOf(from.x, from.z), b0 = zoneOf(to.x, to.z);
  // v6.6.1: the town front is open, so cross it near where you are going (clear of benches, posts and the gate pillars)
  const cx = frontCrossX(b0 === 'town' ? to.x : a0 === 'town' && b0 === 'board' ? to.x : a0 === 'town' ? 0 : to.x);
  const gateOut = { x: cx, z: ISLAND.zGate - 0.4 }, gateIn = { x: cx, z: ISLAND.zIn + 0.4 };
  let a = a0, b = b0;
  // v12.0.0: standing on the open strip between the boardwalk and the town, step onto the town edge first (the
  // town's waypoint graph starts at zIn)
  if (a0 === 'town' && from.z < ISLAND.zIn + 0.3) { const edge = { x: from.x, z: ISLAND.zIn + 0.4 }; if (b0 === 'town') pts.push(edge); from.z = edge.z; }
  // v12.0.0: on the boardwalk, walk along the clear lane in front of the benches (z BW_LANE), never through the bench row
  const BW_LANE = 4.3, lane = x => ({ x, z: BW_LANE });
  if (a0 === 'town' && b0 !== 'town') { pts.push(...townPath(from, gateIn), gateOut, lane(cx)); a = 'board'; from.x = cx; from.z = BW_LANE; }
  if (b0 === 'town' && a0 !== 'town') b = 'board';
  const pierMouth = x => ({ x: THREE.MathUtils.clamp(x, -PIER_WALK + 0.4, PIER_WALK - 0.4), z: 0.9 });
  const stairTop = { x: -PIER_WALK + 0.2, z: -5.6 }, stairFoot = { x: PLATFORM.xIn - 0.3, z: -5.6 };
  if (a === 'board' && b !== 'board') pts.push(pierMouth(from.x), { x: pierMouth(from.x).x, z: 0.2 });
  if (a !== 'board' && b === 'board') pts.push({ x: THREE.MathUtils.clamp(from.x, -PIER_WALK + 0.4, PIER_WALK - 0.4), z: 0.2 }, pierMouth(to.x));
  if (b === 'dock' && a !== 'dock') pts.push(stairTop, stairFoot);
  if (a === 'dock' && b !== 'dock') pts.unshift(stairFoot, stairTop);
  if (CABIN && Math.abs(to.x - CABIN.x) < CABIN.w / 2 && to.z < CABIN.d + 0.2 && !(Math.abs(from.x - CABIN.x) < CABIN.w / 2 && from.z < CABIN.d + 0.2)) pts.push({ x: CABIN.x, z: CABIN.d + 0.9 }, { x: CABIN.x, z: CABIN.d - 0.6 });
  if (b0 === 'town' && a0 !== 'town') { if (a0 === 'board' && Math.abs(from.x - cx) > 0.8) pts.push(lane(from.x), lane(cx)); pts.push(gateOut, gateIn, ...townPath(gateIn, to)); }   // around the buildings (townPath)
  else if (a0 === 'town' && b0 === 'town') pts.push(...townPath(from, to));
  else { if (b === 'board' && to.z > BW_LANE - 0.2 && Math.abs(to.x - from.x) > 0.8) pts.push(lane(to.x)); pts.push(to); }
  return pts;
}
export function tapToWalk(clientX, clientY) {
  if (shared.mode !== 'PIER_IDLE' || shared.onBoat || isAnyModalOpen() || shopBrowse.active || standFocus.stand || settings.firstPerson || scope.on) return;
  const r = renderer.domElement.getBoundingClientRect();
  _tapNdc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
  _tapRay.setFromCamera(_tapNdc, camera);
  _tapPlane.constant = -1.5;
  if (!_tapRay.ray.intersectPlane(_tapPlane, _tapHit)) return;
  for (let k = 0; k < 2 && _tapHit.z > ISLAND.rampZ0; k++) { _tapPlane.constant = -townGround(_tapHit.z); _tapRay.ray.intersectPlane(_tapPlane, _tapHit); }   // the upper terrace is higher
  _tapPlane.constant = -1.5;
  const to = tapDestination(_tapHit.x, _tapHit.z);
  if (Math.hypot(to.x - shared.playerX, to.z - shared.playerZ) < 0.3) return;
  shared.autoWalk = { pts: planRoute(to), stuck: 0, lastD: 1e9 };
  tapMarker.position.set(to.x, to.z > ISLAND.zIn ? townGround(to.z) + 0.03 : 1.52, to.z); tapMarker.visible = true; tapMarker.material.opacity = 0.85;
  sfx.playTick();
}

export function init() {
  tapMarker = (() => {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.32, 24), new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.85, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.visible = false; m.renderOrder = 8; scene.add(m); return m;
  })();
}
