/* Frame timing, sky and fog colours, waves and the first-person camera. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { saveSettings, settings } from '../core/settings.js';
import { ZONES } from '../data/catalog.js';
import { camera } from '../render/renderer.js';
import { world } from '../render/lights.js';
import { camLookCur, standFocus } from './runtime.js';
import { restState } from './controls-state.js';
import { readProp, reading } from '../town/books.js';
import { getWeatherObj } from '../save/queries.js';
import { _standLook } from '../save/save-game.js';
import { standCameraPose } from './spots.js';
import { showToast } from '../ui/toasts.js';
import { shopBrowse } from '../shop/shop-kinds.js';

export let currentWaterColor, currentFogColor;

/* =========================================================================
   SECTION M: MAIN ANIMATION & PHYSICS LOOP
   ========================================================================= */
shared.elapsed = 0;
export const ZONE_SKY_MOOD = [0, 0.06, 0.12, 0.17, 0.21];
export const _skyCol1 = new THREE.Color(), _skyCol2 = new THREE.Color(), _skyCol3 = new THREE.Color();
export const TINT = { fullMoon: new THREE.Color(0x387899), dusk: new THREE.Color(0xd97742), lightning: new THREE.Color(0xdbeafe), trench: new THREE.Color(0x0b1233) };

export function getWaveHeight(x, z, time, zone) {
  const wMult = getWeatherObj().waveMult;
  const amp = zone.waveAmp * wMult;
  const freq = zone.waveFreq;
  return (
    Math.sin(x * 0.14 + time * freq * 1.4) * amp * 0.55 +
    Math.cos(z * 0.11 + time * freq * 1.1) * amp * 0.45
  );
}

/* First person: the camera sits in the player's head (head model hidden so it never blocks the view),
   looks where the player faces, follows the line while fishing, and looks at a stand once you idle in front of it. */
const _fpFwd = new THREE.Vector3(), _fpGoal = new THREE.Vector3(), _fpUp = new THREE.Vector3(0, 1, 0), _fpUp2 = new THREE.Vector3();
let fpBlend = 0, fpEyeY = null, fpReadW = 0;
export function updateFirstPersonCamera(dt) {
  const fp = !!settings.firstPerson && !shopBrowse.active;   // a shop shows the angler from outside, head and all
  if (world.headGroup.visible === fp) {   // v11.0.0: the head is baked into the body mesh, so its bone shrinks away too
    world.headGroup.visible = !fp;
    world.headGroup.parent.scale.setScalar(fp ? 0.001 : 1);
  }
  if (!fp) { fpBlend = 0; fpReadW = 0; return; }
  world.anglerGroup.updateMatrixWorld(true);
  _fpFwd.set(0, 0, -1).applyQuaternion(world.anglerGroup.quaternion);
  _fpFwd.y = 0;
  if (_fpFwd.lengthSq() < 1e-4) _fpFwd.set(0, 0, -1);
  _fpFwd.normalize();
  // Eye position: over the player's feet at a fixed head height, so torso pitch, head sway and boat roll
  // never tilt or bob the horizon.
  // low-pass the eye height: it follows sitting down / standing up but ignores the walking bounce
  world.anglerRig.head.getWorldPosition(_fpGoal);
  const eyeGoal = (_fpGoal.y - world.anglerGroup.position.y) + (world.anglerRig.dims.headLift || 0.1) * world.anglerRig.dims.hScale;   // v9.0.0: the chibi eyes sit higher above the head bone
  fpEyeY = fpEyeY === null ? eyeGoal : fpEyeY + (eyeGoal - fpEyeY) * (1 - Math.exp(-3 * dt));
  const eyeLocalY = fpEyeY;
  camera.position.copy(world.anglerGroup.position).addScaledVector(_fpFwd, 0.14);
  camera.position.y += eyeLocalY + 0.03;
  // reading: the eyes drop and lean in over the book
  fpReadW += (((reading.id && readProp && readProp.visible && restState.w > 0.5) ? 1 : 0) - fpReadW) * (1 - Math.exp(-5 * dt));
  camera.position.y -= 0.2 * fpReadW;
  // going astern on a boat: turn the view round to look where the boat is going
  shared.fpBack += ((shared.onBoat && shared.boatCamReverse ? 1 : 0) - shared.fpBack) * (1 - Math.exp(-4 * dt));
  if (shared.fpBack > 0.001) _fpFwd.applyAxisAngle(_fpUp, Math.PI * shared.fpBack * shared.fpBack * (3 - 2 * shared.fpBack));

  if (standFocus.stand && !shared.onBoat) {
    if (standFocus.stand.pan) { standCameraPose(standFocus.stand); _fpGoal.copy(_standLook); }
    else _fpGoal.set(standFocus.stand.cx, standFocus.stand.cy, standFocus.stand.cz);
    fpBlend = 1;
  } else {
    // dead level: same height as the eye, straight ahead
    _fpGoal.copy(camera.position).addScaledVector(_fpFwd, 10);
    fpBlend = Math.max(0, fpBlend - dt * 2.5);
  }
  if (fpReadW > 0.002 && readProp) {   // eyes on the page
    readProp.getWorldPosition(_fpUp2); _fpGoal.lerp(_fpUp2, fpReadW); camLookCur.copy(_fpGoal); shared.camLookInit = true;
  } else if (!shared.camLookInit) { camLookCur.copy(_fpGoal); shared.camLookInit = true; }
  else if (fpBlend > 0) camLookCur.lerp(_fpGoal, 1 - Math.exp(-8 * dt));
  else camLookCur.copy(_fpGoal);   // no smoothing while turning: the horizon stays put and the view tracks the stick exactly
  camera.up.set(0, 1, 0);
  camera.lookAt(camLookCur);
}

export function updateViewButton() {
  const b = document.getElementById('btn-toggle-view');
  if (!b) return;
  b.textContent = settings.firstPerson ? '👁️' : '🎥';
  b.setAttribute('data-label', settings.firstPerson ? 'View: first person' : 'View: third person');
}
export function toggleFirstPerson(notify = true) {
  settings.firstPerson = !settings.firstPerson;
  saveSettings();
  updateViewButton();
  if (notify) showToast(settings.firstPerson ? '👁️ First-person view' : '🎥 Third-person view');
}

export function init() {
  shared.lastTime = performance.now();
  currentWaterColor = new THREE.Color(ZONES[0].waterColor);
  currentFogColor = new THREE.Color(ZONES[0].fogColor);
}
