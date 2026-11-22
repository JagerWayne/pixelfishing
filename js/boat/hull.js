/* Hull motion on the swell (heave, pitch, roll, chop, slams), and boarding and docking. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { MOOR } from '../world/layout.js';
import { vfx } from '../render/previews.js';
import { boatPos } from '../sim/runtime.js';
import { lhDock, rideX } from './stations.js';
import { getWeatherObj } from '../save/queries.js';
import { getCurrentBoat, getDistanceMeters, saveGame } from '../save/save-game.js';
import { showToast } from '../ui/toasts.js';
import { BOAT_DEFAULT_HANDLING, resolveBoatCollisions } from './handling.js';
import { chancePerSec } from '../utils.js';
import { updateHUD } from '../ui/hud.js';
import { getWaveHeight } from '../sim/sky.js';
import { triggerCamShake } from '../ui/pause.js';

/* ---- Hull motion: the hull floats on the swell plus a short boat-scale chop, sampled at the bow, stern and both
   sides. Heave, pitch and roll are springs (lighter hulls are quicker), so the boat bobs, rises onto the plane, banks
   into turns and, at speed, slams into the chop: a kick to the bow, spray, a thud and a camera jolt. ---- */
export const hullMo = { init: false, heave: 0, hv: 0, pitch: 0, pv: 0, roll: 0, rv: 0, gap: 0, slamCd: 0 };
const _hF = new THREE.Vector3(), _hR = new THREE.Vector3(), _hP = new THREE.Vector3();
function chopHeight(x, z, t, zone) {
  const amp = (0.06 + 0.3 * zone.waveAmp) * getWeatherObj().waveMult;
  return amp * (Math.sin(x * 0.85 + t * 2.3) * Math.sin(z * 0.72 - t * 1.9) + 0.45 * Math.sin((x + z) * 1.55 + t * 3.1));
}
function seaSurface(x, z, t, zone, chopK) { return getWaveHeight(x, z, t, zone) + chopK * chopHeight(x, z, t, zone); }
function resetHullMotion() { hullMo.init = false; shared.boatSide = 0; }
export function updateHullMotion(dt, boat, zone) {
  const hd = boat.handling || BOAT_DEFAULT_HANDLING, V = Math.max(1, boat.speed);
  const L = shared.boatHalfLen * 0.82, W = shared.boatHalfWid * 0.95, t = shared.elapsed, ck = hd.chop;
  _hF.set(-Math.sin(shared.boatYaw), 0, -Math.cos(shared.boatYaw)); _hR.set(Math.cos(shared.boatYaw), 0, -Math.sin(shared.boatYaw));
  const S = (f, r) => { _hP.copy(boatPos).addScaledVector(_hF, f).addScaledVector(_hR, r); return seaSurface(_hP.x, _hP.z, t, zone, ck); };
  const hb = S(L, 0), hs = S(-L, 0), hp = S(0, -W), hr = S(0, W);
  const r = Math.min(1.05, Math.abs(shared.boatVel) / V), fwd = shared.boatVel > 0 ? r : 0;
  // targets: float on the surface, the bow rises as the hull climbs onto the plane, bank into turns
  const planeLift = hd.plane * (Math.sin(Math.min(1, fwd / 0.55) * Math.PI / 2) - 0.35 * Math.max(0, fwd - 0.55));
  const heaveT = (hb + hs + hp + hr) * 0.25 + fwd * hd.plane * 0.8;
  const pitchT = Math.atan2(hb - hs, 2 * L) + planeLift;
  const rollT = Math.atan2(hr - hp, 2 * W) * 0.8 + shared.boatTurnRate * fwd * hd.bank * 3;
  if (!hullMo.init || dt <= 0) {
    if (!hullMo.init) Object.assign(hullMo, { init: true, heave: heaveT, hv: 0, pitch: pitchT, pv: 0, roll: rollT, rv: 0, gap: 0, slamCd: 0 });
    return;
  }
  const w0 = 2 * Math.PI * hd.hz, k = w0 * w0, c = 2 * hd.damp * w0;
  const h = Math.min(dt, 0.05) / 2;
  for (let i = 0; i < 2; i++) {                                  // two semi-implicit sub-steps
    hullMo.hv += (k * (heaveT - hullMo.heave) - c * hullMo.hv) * h; hullMo.heave += hullMo.hv * h;
    hullMo.pv += (k * 1.3 * (pitchT - hullMo.pitch) - c * 1.1 * hullMo.pv) * h; hullMo.pitch += hullMo.pv * h;
    hullMo.rv += (k * 0.8 * (rollT - hullMo.roll) - c * 0.9 * hullMo.rv) * h; hullMo.roll += hullMo.rv * h;
  }
  hullMo.pitch = THREE.MathUtils.clamp(hullMo.pitch, -0.32, 0.38);
  hullMo.roll = THREE.MathUtils.clamp(hullMo.roll, -0.3, 0.3);
  // slamming: the water at the bow rising past the hull, fast, at speed
  const bowY = hullMo.heave + Math.sin(hullMo.pitch) * L;
  const gap = hb - bowY, closing = (gap - hullMo.gap) / dt;
  hullMo.gap = gap;
  hullMo.slamCd -= dt;
  if (fwd > 0.4 && gap > 0.04 && closing > 0.5 && hullMo.slamCd <= 0) {
    const I = THREE.MathUtils.clamp((closing - 0.5) * 0.55 * fwd + gap * 1.5, 0.15, 1.4) * (0.6 + 0.4 * ck);
    hullMo.pv += 1.1 * I; hullMo.hv += 0.9 * I;
    hullMo.slamCd = 0.32;
    shared.boatVel *= 1 - 0.035 * I;                                    // each slam costs a little way
    triggerCamShake(0.04 + 0.13 * I);
    _hP.copy(boatPos).addScaledVector(_hF, L * 0.85);
    [-1, 1].forEach(sd => vfx.spawnSplash(_hP.clone().addScaledVector(_hR, sd * W * 0.9).setY(hb + 0.2), Math.round(6 + 10 * I), 0xf0f9ff, 2.2 + 2.2 * I));
    sfx.playHullSlam(I);
  }
  // spray peeling off the bow at speed
  if (fwd > 0.3 && chancePerSec(14 * fwd, dt)) {
    _hP.copy(boatPos).addScaledVector(_hF, L * 0.8).addScaledVector(_hR, (Math.random() < 0.5 ? -1 : 1) * W * 0.85);
    _hP.y = hb + 0.15;
    vfx.spawnSplash(_hP, 3, 0xf0f9ff, 1.2 + 1.6 * fwd);
  }
}

export function handleBoardOrDockToggle() {
  if (shared.mode !== 'PIER_IDLE' && shared.mode !== 'BOAT_DRIVING') {
    showToast('Finish your current cast first!');
    return;
  }
  if (!shared.onBoat) {
    if (shared.state.boatTier === 0) {
      showToast('Buy a boat at the Tackle Shop first!');
      return;
    }
    if (shared.state.fuel <= 0.5) {
      showToast('Out of fuel! Refill at the Tackle Shop before sailing.');
      return;
    }
    shared.onBoat = true;
    shared.mode = 'BOAT_DRIVING';
    shared.boatStationActive = false; lhDock.on = false; rideX.to = null;
    boatPos.set(MOOR.startX, 0, -9.0);
    shared.boatYaw = 0;
    shared.boatVel = 0;
    shared.boatTurnRate = 0;
    shared.boatCamYaw = 0;
    resetHullMotion();
    resolveBoatCollisions();
    sfx.vibrate(25);
    showToast(`Sailing ${getCurrentBoat().name}! Up to sail, left or right to turn, down to reverse.`);
  } else {
    const dist = getDistanceMeters();
    if (dist > 15) {
      showToast('Drive within 15m of the Pier to dock!');
      return;
    }
    shared.onBoat = false;
    shared.boatStationActive = false;
    shared.mode = 'PIER_IDLE';
    shared.playerX = MOOR.boardX;
    shared.playerZ = -5.6;
    shared.boatVel = 0; shared.boatSide = 0;
    saveGame();
    sfx.vibrate(25);
    showToast('Docked at Mooring Platform.');
  }
  updateHUD();
}
