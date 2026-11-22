/* Diving: the HUD text, landing speared fish and firing the harpoon. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { camera } from '../render/renderer.js';
import { vfx } from '../render/previews.js';
import { cheats } from '../sim/controls-state.js';
import { diveWeightRange, fmtWeightRange } from '../town/reading.js';
import { bumpStat } from '../save/career.js';
import { recordCatchProgress } from '../fishing/market.js';
import { saveGame } from '../save/save-game.js';
import { showToast } from '../ui/toasts.js';
import { advanceBountiesOnCatch } from '../fishing/catch.js';
import { bagCapacity, bagWeight, dive, harpoon, spearGun } from './dive-state.js';
import { removeDiveFish } from './dive-fish.js';
import { emitBubbles, gunSpearTip, spearMesh, tether } from './dive-gear.js';
import { camJuice } from '../ui/pause.js';

/* ---- N4: the dive itself: start, per-frame simulation, harpoon, HUD, end ---- */
export const _dvFwd = new THREE.Vector3(), _dvAim = new THREE.Vector3(), _dvTmp = new THREE.Vector3(), _dvTmp2 = new THREE.Vector3(), _dvLook = new THREE.Vector3();
export const _dvQuat = new THREE.Quaternion(), _dvNeg = new THREE.Vector3(0, 0, -1);
export const _uwShallow = new THREE.Color(0x2f9fb8), _uwDeep = new THREE.Color(0x030a16), _uwCol = new THREE.Color();
const hudCache = {};
export function diveText(id, text) {
  if (hudCache[id] === text) return;
  hudCache[id] = text;
  const el = document.getElementById(id); if (el) el.textContent = text;
}
export const fmtAir = s => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.floor(Math.max(0, s) % 60)).padStart(2, '0')}`;

/* register a speared fish exactly like a normal catch (encyclopedia, trophies, bounties, XP) */
function registerDiveCatch(f) {
  const c = { item: f.item, weight: f.weight, value: f.value, zoneObj: f.zoneObj, isBoss: false };
  const isNewSpecies = !shared.state.discovered.includes(c.item.id);
  if (isNewSpecies) shared.state.discovered.push(c.item.id);
  if (!shared.state.speciesStats) shared.state.speciesStats = {};
  const prev = shared.state.speciesStats[c.item.id] || { count: 0, maxWeight: 0 };
  const isNewRecord = c.weight > prev.maxWeight;
  shared.state.speciesStats[c.item.id] = { count: prev.count + 1, maxWeight: Math.max(prev.maxWeight, c.weight) };
  bumpStat('speared');
  advanceBountiesOnCatch(c);
  recordCatchProgress(c, isNewSpecies, isNewRecord);
  return { isNewSpecies, isNewRecord };
}

function landSpearedFish(f) {
  removeDiveFish(f);
  dive.bag.push({ item: f.item, weight: f.weight, value: f.value, zoneObj: f.zoneObj });
  const { isNewSpecies, isNewRecord } = registerDiveCatch(f);
  const rare = ['Rare', 'Epic', 'Legendary'].includes(f.item.rarity);
  if (rare) sfx.playCatchFanfare(false); else sfx.playCoin();
  emitBubbles(dive.pos.x, dive.pos.y, dive.pos.z, 8, 0.6);
  showToast(`🔱 ${f.item.name} • ${fmtWeightRange(diveWeightRange(f))} • $${f.value}${isNewSpecies ? ' • 📖 NEW SPECIES!' : (isNewRecord ? ' • 🏆 new record!' : '')}`);
  saveGame();
}

export function startHarpoonReturn() {
  harpoon.state = 'return';
  harpoon.target = null;
}
export function finishHarpoon() {
  if (harpoon.hit) { landSpearedFish(harpoon.hit); harpoon.hit = null; }
  harpoon.state = 'reload';
  harpoon.reloadT = spearGun().reload * (cheats.fastReload ? 0.12 : 1);
  spearMesh.visible = false; tether.visible = false;
  gunSpearTip.visible = true;
  sfx.playSpearReel();
}
export function onSpearHit(f) {
  const gun = spearGun();
  if (f.weight > gun.power && !cheats.autoHit) {
    sfx.playSpearBounce();
    showToast(`💢 ${f.item.name} (${fmtWeightRange(diveWeightRange(f))}) is too big for the ${gun.name} (max ${gun.power} kg)!`);
    f.fleeT = 2.6; f.threat.copy(harpoon.pos);
    startHarpoonReturn();
  } else if (bagWeight() + f.weight > bagCapacity() + 0.001) {
    sfx.playSpearBounce();
    showToast('🎒 Your catch bag is full! Surface to unload it.');
    f.fleeT = 2; f.threat.copy(harpoon.pos);
    startHarpoonReturn();
  } else {
    f.state = 'speared'; harpoon.hit = f;
    sfx.playSpearHit();
    emitBubbles(f.pos.x, f.pos.y, f.pos.z, 7, 0.5);
    vfx.spawnSparkles(f.pos.clone(), 6, 0xfef08a);
    startHarpoonReturn();
  }
}
export function diveMuzzle(out) { return camera.localToWorld(out.set(0.28, -0.2, -1.1)); }
export function diveFire() {
  const gun = spearGun();
  if (gun.tier === 0) { showToast('🔱 No spear gun! Buy one at the Tackle Shop (Spear tab).'); return; }
  if (harpoon.state !== 'ready') return;
  camera.updateMatrixWorld();
  camera.getWorldDirection(_dvAim);
  diveMuzzle(harpoon.muzzle);
  const tgt = dive.lock;
  if (tgt) {
    const dist = harpoon.muzzle.distanceTo(tgt.pos), t = dist / gun.speed;
    const cp = Math.cos(tgt.p);
    _dvTmp.set(Math.cos(tgt.h) * cp, Math.sin(tgt.p), Math.sin(tgt.h) * cp).multiplyScalar(tgt.v * t * 0.9).add(tgt.pos);
    _dvAim.copy(_dvTmp).sub(harpoon.muzzle).normalize();
  }
  harpoon.pos.copy(harpoon.muzzle); harpoon.prev.copy(harpoon.muzzle);
  harpoon.vel.copy(_dvAim).multiplyScalar(gun.speed);
  harpoon.state = 'flying'; harpoon.travelled = 0; harpoon.hit = null; harpoon.target = tgt || null;
  spearMesh.visible = true; tether.visible = true; gunSpearTip.visible = false;
  shared.gunKick = 1;
  sfx.playSpearShot();
  emitBubbles(harpoon.muzzle.x, harpoon.muzzle.y, harpoon.muzzle.z, 6, 0.3);
  camJuice.shake = Math.max(camJuice.shake, 0.05);
}
