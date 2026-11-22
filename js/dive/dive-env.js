/* Diving: availability and the underwater environment. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { camera, scene } from '../render/renderer.js';
import { hemiLight, moonLight, sunLight, world } from '../render/lights.js';
import { getWeatherObj } from '../save/queries.js';
import { isAnyModalOpen } from '../utils.js';
import { TINT } from '../sim/sky.js';
import { dive, diveGear, diveLightAt } from './dive-state.js';
import { diveLamp, shaftMat, shafts } from './dive-gear.js';
import { _uwCol, _uwDeep, _uwShallow } from './dive-harpoon.js';

/* ---- per-frame ---- */
export function updateDiveAvailability() {
  const show = dive.active || (!isAnyModalOpen() && (shared.mode === 'BOAT_DRIVING' && Math.abs(shared.boatVel) < 1.5));
  const v = show ? '1' : '0';
  if ((document.body.dataset.diveBtn || '0') !== v) document.body.dataset.diveBtn = v;
}

export function applyDiveEnvironment(dt, depth) {
  const light = diveLightAt(depth);
  const sh = Math.sin((shared.state.timeOfDay - 0.25) * Math.PI * 2);
  const day = THREE.MathUtils.smoothstep(sh, -0.25, 0.35);
  const dayish = 0.3 + 0.7 * day;
  const weather = getWeatherObj();
  _uwCol.copy(_uwShallow).lerp(_uwDeep, 1 - light);
  if (dive.zone.id >= 4) _uwCol.lerp(TINT.trench, 0.35);
  _uwCol.multiplyScalar(dayish * (0.6 + 0.4 * weather.skyDim));
  scene.background.copy(_uwCol);
  scene.fog.color.copy(_uwCol);
  scene.fog.density = 0.04 + (1 - light) * 0.034 + (dive.zone.id >= 4 ? 0.008 : 0);
  const shimmer = 0.9 + 0.1 * Math.sin(shared.elapsed * 2.3 + camera.position.x * 0.2);
  sunLight.intensity *= light * 0.9 * shimmer;
  moonLight.intensity *= 0.5 * light;
  hemiLight.intensity = Math.max(0.16, hemiLight.intensity * (0.35 + 0.65 * light));
  const gear = diveGear();
  const lampK = gear.light > 0 ? (1.1 + gear.light * 1.1) * (0.2 + 0.8 * (1 - light)) : 0;
  diveLamp.intensity += (lampK - diveLamp.intensity) * Math.min(1, dt * 4);
  diveLamp.distance = 22 + gear.light * 9;
  world.oceanMat.emissive.setHex(0x3fb6cc).multiplyScalar(0.55 * light * dayish);
  shaftMat.opacity = depth < 30 ? 0.085 * light * day * (weather.id === 'CLEAR' ? 1 : 0.4) : 0;
  shafts.position.set(camera.position.x, 0, camera.position.z);
  shafts.children.forEach(s => { s.rotation.y += dt * 0.05; s.rotation.z = 0.14 + Math.sin(shared.elapsed * 0.4 + s.userData.ph) * 0.05; });
}
