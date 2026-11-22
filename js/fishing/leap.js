/* Game feel: fight taps, the leap prompt and the landing moment. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { WorldBuilder } from '../world/world-builder.js';
import { spawnWorldCallout } from '../ui/world-callout.js';
import { scene } from '../render/renderer.js';
import { textures, world } from '../render/lights.js';
import { vfx } from '../render/previews.js';
import { boatCastYaw } from '../boat/stations.js';
import { bobberPos } from '../sim/controls-state.js';
import { releaseAllInputs } from '../sim/joystick.js';
import { updatePrimaryActionButton } from '../ui/install.js';
import { fight, fightCallout, leapBanner } from './fight.js';
import { _camV3, endFightFx, hitStop, slowMo, triggerCamShake } from '../ui/pause.js';

/* a fresh press of the action button during the fight */
export function fightTap() {
  if (fight.qte && !fight.qteHit) {
    fight.qteHit = true; fight.qte = false; fight.dip = 1;
    leapBanner.classList.remove('show');
    shared.reelProgress = Math.min(0.97, shared.reelProgress + 0.07);
    shared.tension = Math.max(0.12, shared.tension - 0.18);
    fightCallout('✓ BOWED TO THE JUMP! +7%', '#4ade80');
    sfx.playFightCue('good');
    vfx.spawnSparkles(bobberPos.clone().add(new THREE.Vector3(0, 0.8, 0)), 12, 0x7dd3fc);
  }
}

/* the fish leaping clear of the water during a jumper's fight */
export const leap = { active: false, t: 0, dur: 0.9, mesh: null, from: new THREE.Vector3(), side: new THREE.Vector3(), h: 1.4 };
function catchMesh(c) {
  const m = WorldBuilder.buildSculptedFishMesh(c.item, textures);
  m.scale.setScalar(THREE.MathUtils.clamp(0.32 + 0.12 * Math.cbrt(c.weight), 0.32, 1.1));
  m.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return m;
}
export function disposeCatchMesh(m) {
  if (!m) return;
  if (m.parent) m.parent.remove(m);
  m.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(x => x.dispose()); });
}
export function startLeap() {
  if (!shared.activeCatch) return;
  leap.mesh = catchMesh(shared.activeCatch);
  leap.from.copy(bobberPos);
  const a = Math.random() * Math.PI * 2;
  leap.side.set(Math.cos(a) * 1.6, 0, Math.sin(a) * 1.6);
  leap.h = 1.1 + 0.6 * Math.min(1, shared.activeCatch.weight / 40);
  leap.mesh.position.copy(leap.from);
  scene.add(leap.mesh);
  leap.t = 0; leap.active = true;
  world.fishShadow.visible = false;
  vfx.spawnSplash(bobberPos, 18, 0xe0f2fe, 3.4); sfx.playSplash();
}
export function endLeap() {
  if (!leap.active) return;
  disposeCatchMesh(leap.mesh); leap.mesh = null; leap.active = false;
  if (shared.mode === 'REELING') world.fishShadow.visible = true;
}
export function updateLeap(dt) {
  if (!leap.active) return;
  leap.t = Math.min(1, leap.t + dt / leap.dur);
  const t = leap.t, m = leap.mesh;
  m.position.copy(leap.from).addScaledVector(leap.side, t);
  m.position.y = leap.from.y + Math.sin(Math.PI * t) * leap.h;
  m.rotation.set(0, Math.atan2(-leap.side.z, leap.side.x), (0.5 - t) * 2.2);   // nose up on the way out, down on the way back
  if (t >= 1) {
    vfx.spawnSplash(m.position, 20, 0xe0f2fe, 3.6); sfx.playSplash();
    endLeap();
  }
}

/* the landing moment: freeze frame, slow motion and the catch leaping out of the water to the angler */
const RARITY_FX = {
  Common:    { col: 0xe0f2fe, shake: 0.10, notes: [523] },
  Uncommon:  { col: 0x86efac, shake: 0.14, notes: [523, 659] },
  Rare:      { col: 0x60a5fa, shake: 0.22, notes: [523, 659, 784] },
  Epic:      { col: 0xc084fc, shake: 0.30, notes: [523, 659, 784, 1047] },
  Legendary: { col: 0xfde047, shake: 0.42, notes: [523, 659, 784, 1047, 1319] }
};
export const landing = { active: false, t: 0, mesh: null, from: new THREE.Vector3(), to: new THREE.Vector3(), mouth: new THREE.Vector3() };
export function beginLanding() {
  const c = shared.activeCatch;
  if (!c) return;
  const fx = RARITY_FX[c.item.rarity] || { col: 0xd6d3d1, shake: 0.08, notes: [392] };
  endFightFx();
  shared.mode = 'LANDING';
  releaseAllInputs();
  document.getElementById('reel-meter-box').style.display = 'none';
  document.getElementById('live-bait-pip').classList.remove('active');
  world.fishShadow.visible = false; world.bobberGroup.visible = false;
  landing.mesh = catchMesh(c);
  landing.from.copy(bobberPos);
  const yaw = shared.onBoat ? boatCastYaw() : shared.playerYaw;
  landing.to.copy(world.anglerGroup.position).add(_camV3.set(-Math.sin(yaw) * 0.9, 1.25, -Math.cos(yaw) * 0.9));
  landing.mesh.position.copy(landing.from);
  scene.add(landing.mesh);
  landing.t = 0; landing.active = true;
  hitStop(0.07); slowMo(0.45, 0.35);
  triggerCamShake(c.isBoss ? 0.5 : fx.shake);
  vfx.spawnSplash(bobberPos, c.item.category === 'Fish' ? 26 : 14, fx.col, 4.2);
  sfx.playSplash();
  sfx.playLandingSting(fx.notes);
  const tag = c.isCOD ? '⭐ ' : '';
  spawnWorldCallout(landing.to.clone().add(_camV3.set(0, 0.6, 0)), `${tag}${c.item.name} · ${c.weight.toFixed(2)} kg · +$${c.value}`, '#' + fx.col.toString(16).padStart(6, '0'));
  updatePrimaryActionButton();
}
