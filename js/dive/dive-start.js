/* Diving: starting and ending a dive and unloading the bag. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { PIER_WALK } from '../world/layout.js';
import { scene } from '../render/renderer.js';
import { sunLight, world } from '../render/lights.js';
import { vfx } from '../render/previews.js';
import { boatPos } from '../sim/runtime.js';
import { cheats } from '../sim/controls-state.js';
import { releaseAllInputs } from '../sim/joystick.js';
import { bookBonus } from '../town/books.js';
import { bumpStat } from '../save/career.js';
import { checkAchievements } from '../fishing/market.js';
import { getWeatherObj } from '../save/queries.js';
import { getBucketCapacity, getBucketWeight, saveGame } from '../save/save-game.js';
import { rebuildPierBucketVisual } from '../boat/terminal.js';
import { showToast } from '../ui/toasts.js';
import { questEvent } from '../town/story.js';
import { useBuff } from '../town/restaurant.js';
import { isAnyModalOpen } from '../utils.js';
import { updatePrimaryActionButton } from '../ui/install.js';
import { updateHUD } from '../ui/hud.js';
import { DIVE_FISH_TARGET, bagWeight, dive, diveFish, diveGear, diveZoneAt, harpoon, spearGun } from './dive-state.js';
import { diveRoot, updateSeabedMesh } from './dive-seabed.js';
import { buildDiveStatic } from './dive-props.js';
import { clearProps, populateDiveFish, removeDiveFish, updateProps, whale } from './dive-fish.js';
import { GUN_COLORS, diveLamp, gunBody, gunGroup, gunSpearTip, spearMesh, tether } from './dive-gear.js';

/* ---- start / end ---- */
function canStartDive() {
  if (isAnyModalOpen()) return false;
  if (shared.mode === 'BOAT_DRIVING') return Math.abs(shared.boatVel) < 1.5;   // boats and the lighthouse jetty only, never the pier
  return false;
}
function startDive() {
  if (dive.active) return;
  if (!canStartDive()) { if (!isAnyModalOpen() && !shared.onBoat) showToast('🤿 Dive from a boat.'); return; }
  const gear = diveGear();
  if (gear.tier === 0) { showToast('🤿 You need dive gear! Buy it at the Tackle Shop (Dive tab).'); return; }
  releaseAllInputs();
  dive.active = true; dive.fromBoat = shared.onBoat; dive.t = 0; dive.surfacing = false; dive.emergency = false;
  dive.bag = []; dive.maxDepth = 0; dive.hudT = 0; dive.lock = null; dive.nearChest = null;
  dive.airMax = gear.air * (1 + bookBonus('breath')) * (useBuff('breath') ? 1.2 : 1); dive.air = dive.airMax; dive.warned25 = dive.warned10 = false; dive.airBeep = 0;
  dive.bubbleT = 2; dive.whaleT = 40 + Math.random() * 60; dive.depthWarnT = 0; dive.leashWarnT = 0;
  if (shared.onBoat) { dive.startX = boatPos.x; dive.startZ = boatPos.z; dive.pos.set(boatPos.x, 0.25, boatPos.z); dive.yaw = shared.boatYaw; shared.boatVel = 0; shared.boatSide = 0; }
  else { dive.startX = shared.playerX; dive.startZ = shared.playerZ; dive.pos.set(THREE.MathUtils.clamp(shared.playerX, -PIER_WALK + 0.05, PIER_WALK - 0.05), 0.25, shared.playerZ - 1.2); dive.yaw = 0; }
  dive.pitch = -0.1; dive.vy = -2.2; dive.vf = 0;
  dive.zone = diveZoneAt(dive.pos.z);
  shared.mode = 'DIVING';
  buildDiveStatic();
  document.body.dataset.diving = '1';
  diveRoot.visible = true; gunGroup.visible = spearGun().tier > 0;
  gunBody.material.color.setHex(GUN_COLORS[shared.state.spearTier] || GUN_COLORS[0]);
  gunSpearTip.visible = true;
  harpoon.state = 'ready'; harpoon.reloadT = 0; harpoon.hit = null;
  world.anglerGroup.visible = false; world.skyGroup.visible = false;
  sfx.underwater = true; sfx.uwDepth = 0;
  sfx.playDiveSplash();
  vfx.spawnSplash(dive.pos.clone(), 18, 0xe0f2fe, 2.6);
  updateSeabedMesh(dive.pos.x, dive.pos.z, true);
  updateProps(dive.pos.x, dive.pos.z, true);
  const n = DIVE_FISH_TARGET();
  for (let i = 0; i < n; i++) populateDiveFish(dive.pos, true);
  bumpStat('dives');
  document.getElementById('dive-toggle-icon').textContent = '🫧';
  document.getElementById('dive-toggle-label').textContent = 'SURFACE';
  showToast(`🤿 Diving in the ${dive.zone.name}! Swim ◀▶ turn, ▲▼ move, buttons for up / down.`);
  updatePrimaryActionButton(); updateHUD();
  checkAchievements();
}
function unloadDiveBag() {
  let kept = 0, sold = 0, cash = 0;
  dive.bag.forEach(e => {
    if (getBucketWeight() + e.weight <= getBucketCapacity() + 0.001) {
      shared.state.bucket.push({ uid: Date.now() + Math.random(), id: e.item.id, name: e.item.name, category: 'Fish', rarity: e.item.rarity, zoneName: e.zoneObj.name, weight: e.weight, value: e.value, bottleMessageId: null });
      kept++;
    } else {
      shared.state.cash = +(shared.state.cash + e.value).toFixed(2); bumpStat('earned', e.value); cash += e.value; sold++;
    }
  });
  return { kept, sold, cash };
}
export function endDive(reason) {
  if (!dive.active) return;
  questEvent('dive', { depth: dive.maxDepth });
  if (reason === 'air' && !cheats.infAir && dive.bag.length) {
    dive.bag.sort((a, b) => b.weight - a.weight);
    const half = bagWeight() / 2;
    while (dive.bag.length && bagWeight() > half) dive.bag.shift();
  }
  const total = dive.bag.length;
  const res = unloadDiveBag();
  const secs = Math.round(dive.t);
  dive.active = false;
  bumpStat('diveSeconds', secs);
  shared.state.stats.maxDive = Math.max(shared.state.stats.maxDive || 0, +dive.maxDepth.toFixed(1));
  diveFish.slice().forEach(removeDiveFish);
  clearProps();
  diveRoot.visible = false; gunGroup.visible = false; spearMesh.visible = false; tether.visible = false; whale.visible = false;
  harpoon.state = 'ready'; harpoon.hit = null;
  diveLamp.intensity = 0;
  world.anglerGroup.visible = true; world.skyGroup.visible = true;
  world.oceanMat.emissive.setHex(0x000000);
  sunLight.intensity = Math.max(sunLight.intensity, 0);
  scene.fog.density = getWeatherObj().fogDensity;
  sfx.underwater = false;
  shared.mode = dive.fromBoat ? 'BOAT_DRIVING' : 'PIER_IDLE';
  shared.onBoat = dive.fromBoat;
  delete document.body.dataset.diving;
  document.getElementById('dive-flash').classList.remove('on');
  document.getElementById('dive-lock').style.display = 'none';
  document.getElementById('dive-toggle-icon').textContent = '🤿';
  document.getElementById('dive-toggle-label').textContent = 'DIVE';
  vfx.spawnSplash(new THREE.Vector3(dive.startX, 0, dive.startZ - (dive.fromBoat ? 0 : 1.2)), 16, 0xe0f2fe, 2.4);
  sfx.playDiveSplash();
  rebuildPierBucketVisual();
  saveGame();
  const parts = [`🤿 Dive over • ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')} • deepest ${dive.maxDepth.toFixed(1)} m`];
  if (total) parts.push(`${total} fish: ${res.kept} to your bucket${res.sold ? `, ${res.sold} sold for $${res.cash.toLocaleString()} (bucket full)` : ''}`);
  else parts.push('no fish this time');
  showToast(reason === 'air' ? `🆘 Out of air! Emergency ascent — you dropped part of your catch. ${parts.join(' • ')}` : parts.join(' • '));
  updatePrimaryActionButton(); updateHUD(); checkAchievements();
}
export function toggleDive() {
  sfx.init();
  if (!dive.active) { startDive(); return; }
  if (dive.emergency) return;
  if (-dive.pos.y < 0.7) { endDive('surface'); return; }
  dive.surfacing = !dive.surfacing;
  showToast(dive.surfacing ? '⬆️ Auto-ascent: heading for the surface (press again to cancel)' : 'Auto-ascent cancelled');
}
