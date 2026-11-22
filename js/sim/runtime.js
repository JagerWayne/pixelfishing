/* Runtime state: mode, position and heading, the stand and camera look, the umbrella, and the boat's motion. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { world } from '../render/lights.js';

/* =========================================================================
   SECTION G: RUNTIME SIMULATION VARIABLES & MULTI-TOUCH CONTROLS
   ========================================================================= */
shared.mode = 'PIER_IDLE';
shared.onBoat = false;
shared.playerX = 0;
shared.playerZ = 3.6;
shared.playerYaw = 0;
/* Camera views: stand auto-zoom (idle 0.5 s in front of a stand) + first-person (from the player's head) */
export const STAND_IDLE_DELAY = 0.5;
export const standFocus = { idle: 0, stand: null };
shared.pierMoveInput = 0;
export const camLookCur = new THREE.Vector3(0, 1.35, -6);
shared.reelLookW = 0;
shared.camLookInit = false;
shared.rodVisProgress = 1.0;
/* v6.8.0: an umbrella opens over the angler in the rain (on foot, hands free) */
export const umbrella = { w: 0, g: null, canopy: null, v: null };
/* an umbrella model (canopy colour + stripe colour), closed or open by scaling its canopy (see placeUmbrella) */
export function makeUmbrella(main = 0xdc2626, stripe = 0xf8fafc) {
  const g = new THREE.Group(), M = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, flatShading: true, side: THREE.DoubleSide });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.95, 6), M(0x1f2937)); shaft.position.y = 0.42; g.add(shaft);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 5, 10, Math.PI), M(0x7c2d12)); hook.position.set(0.04, -0.04, 0); hook.rotation.z = Math.PI; g.add(hook);
  const canopy = new THREE.Group(); canopy.position.y = 0.96; canopy.rotation.set(-0.21, 0, 0.18); g.add(canopy);   // kept level
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.3, 8, 1, true), M(main)); canopy.add(cone);
  for (let i = 0; i < 4; i++) { const w = new THREE.Mesh(new THREE.ConeGeometry(0.625, 0.302, 8, 1, true, i * Math.PI / 2, Math.PI / 8), M(stripe)); canopy.add(w); }
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 4), M(0x1f2937)); tip.position.y = 0.17; canopy.add(tip);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.visible = false;
  return { w: 0, g, canopy, v: new THREE.Vector3() };
}
/* open it (k 0..1) in the left hand of a figure of height scale hs; returns the hand's world target */
export function placeUmbrella(u, owner, hs) {
  u.g.visible = true; u.g.position.set(-0.17 * hs, 0.9 * hs, -0.2 * hs);   // v9.0.0: a little lower for the shorter chibi arms u.g.rotation.set(0.21, 0, -0.18);   // the shaft leans in so the canopy is over the head
  const k = u.w; u.canopy.scale.set(0.12 + 0.88 * k, 0.55 + 0.45 * k, 0.12 + 0.88 * k);
  return owner.localToWorld(u.v.copy(u.g.position));
}
export const isRaining = () => shared.state.weather === 'RAIN' || shared.state.weather === 'STORM';
export function ensureUmbrella() {
  if (umbrella.g) return;
  Object.assign(umbrella, makeUmbrella(), { w: umbrella.w }); world.anglerGroup.add(umbrella.g);
}
shared.chairOpenProgress = 0.0;
export let boatPos = new THREE.Vector3(-4.8, 0, -7.5);
shared.boatYaw = 0;
shared.boatVel = 0;
shared.lastBumpAt = -10;
shared.boatHalfLen = 2.4;
      shared.boatHalfWid = 1.0;
      shared.boatTurnRate = 0;
      shared.boatCamYaw = 0;
      shared.boatSaveT = 0;
      shared.boatCamReverse = false;
      shared.fpBack = 0;
shared.boatPowered = false;
/* Where the angler rides on each boat (boat-local metres; the bow points to -Z) and how he holds on while steering.
   y is the height of his feet (or of his seat when `sit`). hands: arm raise (radians) for the left / right arm. */
// Where the angler rides each boat (boat-local). y is the floor under the feet; sit / seatH (hip height above the
// floor) for seated helms; helm says what the hands hold while driving ('tiller' or 'wheel', found on the boat's
// userData.helm). fish is the standing spot used while fishing from the boat.
export const BOAT_RIDE = {
  1: { x: 0, y: 0.05, z: 1.47, sit: true, seatH: 0.58, helm: 'tiller', fish: { x: 0, y: 0.05, z: 1.47, sit: true, seatH: 0.58 } },        // rowboat: stern thwart, hand on the tiller
  2: { x: 0, y: 0.13, z: 0.25, sit: false, post: true, helm: 'wheel', fish: { x: 0, y: 0.13, z: 1.1, sit: false } },                       // skiff: leaning post behind the console
  3: { x: 0, y: 1.04, z: -1.95, sit: true, seatH: 0.45, helm: 'wheel', fish: { x: 0, y: 0.53, z: 0.7, sit: false } },                      // trawler: helm chair in the open wheelhouse
  4: { x: 0, y: 0.82, z: 0.3, sit: true, seatH: 0.47, helm: 'wheel', fish: { x: 0, y: 0.55, z: 1.7, sit: false } }                         // yacht: helm seat at the aft helm
};
