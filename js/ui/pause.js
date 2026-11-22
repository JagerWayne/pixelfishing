/* The landing, the tension vignette, the pause screen with its 3-2-1 resume, and camera juice
   (shake, freeze frame, slow motion). */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { bobberPos } from '../sim/controls-state.js';
import { releaseAllInputs } from '../sim/joystick.js';
import { dailyLine } from '../fishing/market.js';
import { rebuildPlayerBoatVisual } from './toasts.js';
import { completeCatch } from '../fishing/catch.js';
import { inFight } from '../utils.js';
import { aquaSync } from '../town/aquarium-world.js';
import { applyVfxShader } from './camera-modal.js';
import { toggleSound } from './install.js';
import { updateHUD } from './hud.js';
import { animate } from '../sim/animate.js';
import { fight, leapBanner, vignetteEl } from '../fishing/fight.js';
import { disposeCatchMesh, endLeap, landing } from '../fishing/leap.js';

let pauseOverlay, pauseCountEl;

export function updateLanding(dt) {
  if (!landing.active) return;
  landing.t = Math.min(1, landing.t + dt / 0.8);
  const t = landing.t, ease = 1 - Math.pow(1 - t, 2), m = landing.mesh;
  m.position.lerpVectors(landing.from, landing.to, ease);
  m.position.y += Math.sin(Math.PI * t) * 2.2;                   // the arc out of the water
  m.rotation.set(Math.sin(t * 18) * 0.5 * (1 - t), t * 7, Math.cos(t * 14) * 0.3 * (1 - t));   // thrashing in the air
  bobberPos.copy(m.position);                                     // the line follows the catch
  if (t >= 1) {
    disposeCatchMesh(landing.mesh);
    landing.active = false; landing.mesh = null;
    if (shared.mode === 'LANDING') completeCatch();
  }
}

export function setTensionVignette(tns, t) {
  const k = Math.max(0, (tns - 0.55) / 0.45);
  const pulse = tns > 0.8 ? 0.15 * Math.sin(t * (9 + tns * 8)) : 0;
  vignetteEl.style.opacity = Math.min(1, k + pulse * k).toFixed(2);
}
/* everything the fight switched on goes off again (snap, cancel, landing, pause) */
export function endFightFx() {
  shared.moveLatch = true;
  sfx.stopLineStrain();
  vignetteEl.style.opacity = '0';
  leapBanner.classList.remove('show');
  fight.ev = null; fight.qte = false; fight.hint = '';
  endLeap();
}

/* ---- pause screen ---- */
export const gamePause = { on: false, count: 0 };
function renderPauseScreen() {
  document.getElementById('btn-pause-sound').textContent = sfx.enabled ? '🔊 Sound: On' : '🔇 Sound: Off';
  document.getElementById('pause-daily').innerHTML = dailyLine(false);
}
export function pauseGame(auto) {
  if (gamePause.on || document.getElementById('start-overlay').classList.contains('open')) return;
  gamePause.on = true; gamePause.count = 0;
  releaseAllInputs();
  sfx.stopLineStrain();
  vignetteEl.style.opacity = '0';
  renderPauseScreen();
  pauseOverlay.classList.remove('counting');
  pauseOverlay.classList.add('open');
}
export function resumeGame() {
  if (!gamePause.on || gamePause.count > 0) return;
  if (shared.mode === 'REELING' || shared.mode === 'BITE_WINDOW') {          // a fair restart in the middle of a fight
    gamePause.count = 3;
    pauseCountEl.textContent = '3';
    pauseOverlay.classList.add('counting');
    sfx.playTick();
    return;
  }
  finishResume();
}
function finishResume() {
  gamePause.on = false; gamePause.count = 0;
  pauseOverlay.classList.remove('open', 'counting');
  shared.lastTime = performance.now();
  updateHUD();
}
export function updatePauseCountdown(rawDt) {
  if (!gamePause.on || gamePause.count <= 0) return;
  const before = Math.ceil(gamePause.count);
  gamePause.count -= rawDt;
  const now = Math.ceil(gamePause.count);
  if (gamePause.count <= 0) { finishResume(); return; }
  if (now !== before) { pauseCountEl.textContent = String(now); sfx.playTick(); }
}
export function togglePause() { if (gamePause.on) resumeGame(); else pauseGame(); }

export const camJuice = { shake: 0, fovOffset: 0 };
// scratch vectors for the per-frame camera and fight maths (no garbage every frame)
export const _camV1 = new THREE.Vector3(), _camV2 = new THREE.Vector3(), _camV3 = new THREE.Vector3();
export const _fightRight = new THREE.Vector3(), _fightFwd = new THREE.Vector3(), _fightTgt = new THREE.Vector3();
export const _shakeOff = new THREE.Vector3();
export const timeFx = { hitStop: 0, slowT: 0, slow: 1 };
export function hitStop(sec) { timeFx.hitStop = Math.max(timeFx.hitStop, sec); }
export function slowMo(sec, scale = 0.35) { timeFx.slowT = Math.max(timeFx.slowT, sec); timeFx.slow = scale; }
export function triggerCamShake(intensity = 0.25) {
  camJuice.shake = Math.max(camJuice.shake, intensity);
}

export function init() {
  pauseOverlay = document.getElementById('pause-overlay');
  pauseCountEl = document.getElementById('pause-count');
  document.getElementById('btn-pause').addEventListener('click', () => pauseGame());
  document.getElementById('btn-resume').addEventListener('click', () => resumeGame());
  document.getElementById('btn-pause-sound').addEventListener('click', () => { toggleSound(); renderPauseScreen(); });
  document.getElementById('btn-pause-menu').addEventListener('click', () => {
    finishResume();
    document.getElementById('modal-menu').classList.add('open');   // the menu keeps the world paused by itself
  });
  pauseOverlay.addEventListener('click', e => { if (e.target === pauseOverlay && gamePause.count <= 0) resumeGame(); });
  window.addEventListener('blur', () => { if (inFight() && shared.mode !== 'CASTING') pauseGame(true); });

  applyVfxShader(shared.state.vfxShader || 'none', false);
  aquaSync(true);
  rebuildPlayerBoatVisual();
  updateHUD();
  requestAnimationFrame(animate);
}
