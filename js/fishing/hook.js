/* Hooking a fish and the fight's end. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { world } from '../render/lights.js';
import { vfx } from '../render/previews.js';
import { setupLiveBaitPip } from '../render/live-bait.js';
import { boatCastYaw } from '../boat/stations.js';
import { bobberPos } from '../sim/controls-state.js';
import { catchOfDay } from './market.js';
import { getCurrentRod, getCurrentZone } from '../save/save-game.js';
import { useBuff } from '../town/restaurant.js';
import { rigState } from './rigs.js';
import { selectCatchForCurrentZone } from './select-catch.js';
import { chancePerSec } from '../utils.js';
import { updateHUD } from '../ui/hud.js';
import { getWaveHeight } from '../sim/sky.js';
import { fight, startFight } from './fight.js';

export function hookFish() {
  document.getElementById('bite-banner').style.display = 'none';
  shared.activeCatch = selectCatchForCurrentZone();
  if (shared.activeCatch.item.category === 'Fish' && shared.activeCatch.item.id === catchOfDay().id) {
    shared.activeCatch.value = Math.round(shared.activeCatch.value * 3);
    shared.activeCatch.isCOD = true;
  }
  startFight(shared.activeCatch);
  shared.fightFed = useBuff('line');   // a meal from the restaurant: one charge per fight
  shared.fightJig = rigState().eq === 'jig' && fight.style === 'diver' && getCurrentZone().id >= 3;   // the deep jig tames divers out deep
  shared.mode = 'REELING';
  shared.tension = 0.28;
  shared.reelProgress = 0.05;
  shared.initialLineDist = Math.max(8, world.anglerGroup.position.distanceTo(bobberPos));
  shared.underpoweredTimer = 0;
  shared.fishPullPhase = 0;
  const isPassiveItem = shared.activeCatch.item.category === 'Junk' || shared.activeCatch.item.category === 'Flora';
  shared.fishSwimDir = isPassiveItem ? 0 : (Math.random() < 0.5 ? -1 : 1);
  shared.fishDirTimer = 1.4 + Math.random() * 1.4;
  shared.fishLateralPos = isPassiveItem ? 0 : shared.fishSwimDir * 0.35;
  shared.rodPullAngle = 0;

  if (shared.state.hasLiveBaitCam) {
    setupLiveBaitPip(shared.activeCatch, shared.state.baitTier);
    document.getElementById('live-bait-pip').classList.add('active');
  } else {
    document.getElementById('live-bait-pip').classList.remove('active');
  }

  const rod = getCurrentRod();
  const safeThreshold = Math.min(0.92, 0.62 + rod.forgiveness * 0.45);
  const safeEl = document.getElementById('reel-safe-zone');
  safeEl.style.left = `0%`;
  safeEl.style.width = `${Math.round(safeThreshold * 100)}%`;

  const warnEl = document.getElementById('rod-warning-text');
  warnEl.style.display = shared.activeCatch.isUnderpowered ? 'block' : 'none';

  document.getElementById('reel-meter-box').style.display = 'block';
  sfx.playSplash();
  vfx.spawnSplash(bobberPos, 16, 0x38bdf8, 3.4);
  updateHUD();
}

/* the end of a lost fight plays out for a moment instead of vanishing: 'snap' (the line breaks, the loose end falls
   and the rod kicks back) or 'escape' (the fish darts off and the empty line is wound in) */
export let fightEnd = null;
const FIGHT_END_T = 0.9;
export function clearFightEnd() {
  if (!fightEnd) return;
  fightEnd = null;
  world.fishingLine.material.opacity = 1; world.fishShadow.material.opacity = 0.62;
  world.bobberGroup.visible = false; world.fishingLine.visible = false; world.fishShadow.visible = false;
}
export function startFightEnd(kind) {
  clearFightEnd();
  const inWater = world.bobberGroup.visible && shared.bobberInWater;
  if (!inWater) return false;
  const yaw = shared.onBoat ? boatCastYaw() : shared.playerYaw;
  fightEnd = { t: 0, kind, from: bobberPos.clone(), loose: bobberPos.clone(), away: new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)), shadow: world.fishShadow.visible };
  world.fishingLine.material.transparent = true;
  if (kind === 'snap') { world.rodPivot.rotation.x -= 0.7; vfx.spawnSplash(bobberPos, 10, 0xe0f2fe, 2.2); }
  return true;
}
export function updateFightEnd(dt, zone) {
  if (!fightEnd) return;
  if (shared.mode !== 'PIER_IDLE' && shared.mode !== 'BOAT_DRIVING') { fightEnd = null; world.fishingLine.material.opacity = 1; world.fishShadow.material.opacity = 0.62; return; }
  const F = fightEnd; F.t += dt;
  const k = Math.min(1, F.t / FIGHT_END_T), e = k * k * (3 - 2 * k);
  const tip = _feTip; world.anglerGroup.updateMatrixWorld(true); world.rodTipAnchor.getWorldPosition(tip);
  const waterAt = (x, z) => getWaveHeight(x, z, shared.elapsed, zone);
  // the bobber: after a snap it drifts and sinks where it was; after an escape it is wound back to the rod tip
  if (F.kind === 'snap') { bobberPos.copy(F.from); bobberPos.y = waterAt(F.from.x, F.from.z) - e * 0.35; }
  else { bobberPos.lerpVectors(F.from, tip, e); bobberPos.y = Math.max(bobberPos.y, waterAt(bobberPos.x, bobberPos.z)) + Math.sin(k * Math.PI) * 0.4; }
  world.bobberGroup.position.copy(bobberPos);
  // the line: a snapped line hangs from the tip and its loose end falls and curls back; an intact line stays slack to the bobber
  const pos = world.fishingLine.geometry.attributes.position;
  if (F.kind === 'snap') {
    F.loose.lerp(tip, Math.min(1, dt * 2.2)); F.loose.y = Math.max(waterAt(F.loose.x, F.loose.z), F.loose.y - dt * 6);
    for (let i = 0; i < 16; i++) { const t = i / 15; pos.setXYZ(i, THREE.MathUtils.lerp(tip.x, F.loose.x, t) + Math.sin(t * 9 + F.t * 6) * 0.05 * t, THREE.MathUtils.lerp(tip.y, F.loose.y, t) - Math.sin(t * Math.PI) * 0.5, THREE.MathUtils.lerp(tip.z, F.loose.z, t)); }
  } else {
    for (let i = 0; i < 16; i++) { const t = i / 15; pos.setXYZ(i, THREE.MathUtils.lerp(tip.x, bobberPos.x, t), THREE.MathUtils.lerp(tip.y, bobberPos.y, t) - Math.sin(t * Math.PI) * 0.6 * (1 - e), THREE.MathUtils.lerp(tip.z, bobberPos.z, t)); }
  }
  pos.needsUpdate = true;
  world.fishingLine.material.opacity = F.kind === 'snap' ? 1 - e : 1;
  // the fish darts away from the angler and fades into the deep
  if (F.shadow) {
    world.fishShadow.position.addScaledVector(F.away, dt * 7);
    world.fishShadow.position.y -= dt * 0.5;
    world.fishShadow.material.opacity = 0.62 * (1 - e);
  }
  if (chancePerSec(6, dt)) vfx.spawnRipple(F.kind === 'snap' ? bobberPos : world.fishShadow.position, 0xe0f2fe, 1.4);
  if (k >= 1) clearFightEnd();
}
const _feTip = new THREE.Vector3();
