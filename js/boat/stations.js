/* Fishing stations: where the angler stands on each boat and the lighthouse jetty, and which way they cast. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { LH_J, lhBerthPose } from '../world/layout.js';
import { BOAT_RIDE, boatPos } from '../sim/runtime.js';
import { showToast } from '../ui/toasts.js';
import { isAnyModalOpen } from '../utils.js';
import { updateHUD } from '../ui/hud.js';
import { dive } from '../dive/dive-state.js';

let BOAT_STATIONS, LH_STATIONS;

/* ---- Fishing stations: where the angler stands, and which way he casts, once the boat is stopped. Small boats let you
   fish from anywhere on board; the big ones only from where there is working deck. x/y/z are boat-local (the bow points
   to -Z, port is -X, y is the floor under the feet); yaw is the casting direction relative to the bow (0 bow, +90deg port,
   -90deg starboard, 180deg stern). A spot with world: true (the lighthouse jetty) uses world coordinates and yaw. ---- */
const HP = Math.PI / 2;
const mkSt = (id, label, icon, x, y, z, yaw, extra) => Object.assign({ id, label, icon, x, y, z, yaw, sit: false }, extra);
const BOAT_STATION_DEFAULT = { 1: 'bow', 2: 'bow', 3: 'port', 4: 'stern' };
export const lhDock = { on: false };
shared.boatStationActive = false;
const boatStationPick = {};
const stationKey = () => lhDock.on ? 'lh' : shared.state.boatTier;
export function stationList() { return lhDock.on ? LH_STATIONS : (BOAT_STATIONS[shared.state.boatTier] || []); }
function currentStation() {
  const l = stationList(), want = boatStationPick[stationKey()] || (lhDock.on ? 'tip' : BOAT_STATION_DEFAULT[shared.state.boatTier]);
  return l.find(x => x.id === want) || l[0] || null;
}
export function castOffLighthouse() { lhDock.on = false; shared.boatStationActive = false; showToast('⚓ Cast off!'); updateStationPicker(true); }
export function canDockAtLighthouse() {
  if (!shared.onBoat || shared.mode !== 'BOAT_DRIVING' || lhDock.on || shared.boatStationActive || Math.abs(shared.boatVel) > 3) return false;
  const b = lhBerthPose();
  return Math.hypot(boatPos.x - b.x, boatPos.z - b.z) <= LH_J.reach;
}
export function dockLighthouse() {
  lhDock.on = true; shared.boatStationActive = true; shared.boatVel = 0; shared.boatSide = 0; shared.boatTurnRate = 0;
  boatStationPick.lh = 'tip';
  sfx.vibrate(25);
  showToast('🗼 Moored at the Lighthouse Pier. Fish from the tip or the rail; throttle to cast off.');
  updateStationPicker(true); updateHUD();
}
export function setStation(id) {
  if (!shared.onBoat || shared.mode !== 'BOAT_DRIVING') return;
  if (id === 'castoff') { castOffLighthouse(); sfx.playTick(); return; }
  if (id === 'helm') shared.boatStationActive = false;
  else { shared.boatStationActive = true; boatStationPick[stationKey()] = id; }
  sfx.playTick(); updateStationPicker(true);
}
/* the spot in use right now: the helm while driving, the chosen fishing station otherwise */
export function currentRideSpot() {
  const r = BOAT_RIDE[shared.state.boatTier] || BOAT_RIDE[1];
  if (shared.mode === 'BOAT_DRIVING' && !shared.boatStationActive && !lhDock.on) return r;
  return currentStation() || r;
}
/* world position and facing of a ride spot (boat spots follow the hull) */
const _spQ = new THREE.Quaternion(), _spUp = new THREE.Vector3(0, 1, 0);
export function spotWorld(sp, out) { out.set(sp.x, sp.y, sp.z); if (!sp.world) shared.playerBoatMesh.localToWorld(out); return out; }
export function spotYaw(sp) { return sp.world ? sp.yaw : shared.boatYaw + (sp.yaw || 0); }
export function spotQuat(sp, out) {
  if (sp.world) return out.setFromAxisAngle(_spUp, sp.yaw);
  return out.copy(shared.playerBoatMesh.quaternion).multiply(_spQ.setFromAxisAngle(_spUp, sp.yaw || 0));
}
export const rideX = { from: null, to: null, t: 1 }, _rwA = new THREE.Vector3(), _rwB = new THREE.Vector3(), _rqA = new THREE.Quaternion(), _rqB = new THREE.Quaternion();
shared.rideYawAbs = 0;
/* the direction a cast goes: where the angler stands facing */
export function boatCastYaw() { return spotYaw(currentRideSpot()); }
/* the picker above the action button: one chip per station plus the helm */
let stationPickerSig = '';
export function updateStationPicker(force) {
  const el = document.getElementById('station-picker'); if (!el) return;
  const show = shared.onBoat && shared.state.boatTier > 0 && shared.mode === 'BOAT_DRIVING' && Math.abs(shared.boatVel) < 1.5 && !isAnyModalOpen() && !dive.active;
  const list = stationList();
  const activeId = shared.boatStationActive ? (currentStation() || {}).id : 'helm';
  const sig = show ? stationKey() + '|' + activeId : 'hide';
  if (!force && sig === stationPickerSig) return;
  stationPickerSig = sig;
  if (!show) { el.style.display = 'none'; return; }
  el.style.display = 'flex'; el.innerHTML = '';
  const title = document.createElement('div'); title.className = 'st-title'; title.textContent = 'FISH FROM'; el.appendChild(title);
  list.concat([lhDock.on ? { id: 'castoff', label: 'Cast off', icon: '⚓' } : { id: 'helm', label: 'Helm', icon: '🧭' }]).forEach((st, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = `${st.icon} ${st.label}`;
    b.title = `${i + 1}`; if (st.id === activeId) b.classList.add('on');
    b.addEventListener('pointerdown', e => { e.stopPropagation(); }); b.addEventListener('click', () => setStation(st.id));
    el.appendChild(b);
  });
}
shared.boatSitProgress = 0;
      shared.boatHandsProgress = 0;

shared.castCharge = 0;
shared.castDir = 1;

export function init() {
  BOAT_STATIONS = {
    1: [mkSt('bow', 'Bow', '⬆️', 0, -0.05, -1.6, 0), mkSt('port', 'Port', '⬅️', -0.55, -0.05, 0.2, HP), mkSt('starboard', 'Stbd', '➡️', 0.55, -0.05, 0.2, -HP), mkSt('stern', 'Stern', '⬇️', 0, -0.05, 1.7, Math.PI)],
    2: [mkSt('bow', 'Bow', '⬆️', 0, 0.13, -2.1, 0), mkSt('port', 'Port', '⬅️', -0.7, 0.13, 0.9, HP), mkSt('starboard', 'Stbd', '➡️', 0.7, 0.13, 0.9, -HP), mkSt('stern', 'Stern', '⬇️', 0, 0.13, 2.15, Math.PI)],
    3: [mkSt('port', 'Port', '⬅️', -1.3, 0.53, 2.7, HP), mkSt('starboard', 'Stbd', '➡️', 1.3, 0.53, 2.7, -HP)],
    4: [mkSt('stern', 'Stern', '⬇️', 0, 0.55, 4.2, Math.PI), mkSt('port', 'Port', '⬅️', -1.35, 0.55, 1.9, HP), mkSt('starboard', 'Stbd', '➡️', 1.35, 0.55, 1.9, -HP)]
  };
  LH_STATIONS = [
    mkSt('tip', 'Tip', '🎣', LH_J.x - LH_J.len + 1.2, LH_J.y, LH_J.z, Math.PI / 2, { world: true }),
    mkSt('rail', 'Rail', '⬆️', LH_J.x - LH_J.len / 2 + 1.0, LH_J.y, LH_J.z - 0.28, 0, { world: true })
  ];
}
