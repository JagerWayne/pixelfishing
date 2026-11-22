/* Cancelling, snapping the line, bounty progress and completing a catch. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { world } from '../render/lights.js';
import { vfx } from '../render/previews.js';
import { releaseAllInputs } from '../sim/joystick.js';
import { addXp } from '../save/career.js';
import { recordCatchProgress, todayNum } from './market.js';
import { saveGame } from '../save/save-game.js';
import { showToast } from '../ui/toasts.js';
import { questEvent } from '../town/story.js';
import { town } from '../town/town-state.js';
import { shareCatchCheck } from '../town/trophy-wall.js';
import { startFightEnd } from './hook.js';
import { openCatchModal } from '../ui/bucket-modal.js';
import { updateHUD } from '../ui/hud.js';
import { endFightFx } from '../ui/pause.js';

export function cancelFishing(reasonMsg, endKind) {
  endFightFx();
  shared.mode = shared.onBoat ? 'BOAT_DRIVING' : 'PIER_IDLE';
  if (!(endKind && startFightEnd(endKind))) {
    world.bobberGroup.visible = false;
    world.fishingLine.visible = false;
    world.fishShadow.visible = false;
  }
  document.getElementById('live-bait-pip').classList.remove('active');
  document.getElementById('bite-banner').style.display = 'none';
  document.getElementById('reel-meter-box').style.display = 'none';
  document.getElementById('cast-meter-box').style.display = 'none';
  if (reasonMsg) showToast(reasonMsg);
  updateHUD();
}

export function snapLine() {
  sfx.playLineSnap();
  cancelFishing('💥 LINE SNAPPED! Upgrade your rod at the Shop!', 'snap');
}

export function advanceBountiesOnCatch(c) {
  if (!Array.isArray(shared.state.bounties)) return;
  let newlyCompleted = false;
  shared.state.bounties.forEach(b => {
    if (b.claimed || b.progress >= b.target) return;
    let match = false;
    if (b.type === 'zone_fish' && c.item.category === 'Fish' && c.zoneObj.id === b.zone) match = true;
    if (b.type === 'junk' && (c.item.category === 'Junk' || c.item.category === 'Flora')) match = true;
    if (b.type === 'min_weight' && c.item.category === 'Fish' && c.weight >= b.minW) match = true;
    if (b.type === 'rare_plus' && ['Rare', 'Epic', 'Legendary'].includes(c.item.rarity)) match = true;

    if (match) {
      b.progress = Math.min(b.target, b.progress + 1);
      if (b.progress >= b.target) newlyCompleted = true;
    }
  });
  if (newlyCompleted) {
    setTimeout(() => showToast('📋 Bounty Contract Complete! Claim reward at the Pier Board!'), 650);
  }
}

export function completeCatch() {
  document.getElementById('reel-meter-box').style.display = 'none';
  document.getElementById('live-bait-pip').classList.remove('active');
  world.bobberGroup.visible = false;
  world.fishingLine.visible = false;
  world.fishShadow.visible = false;
  shared.mode = 'CATCH_MODAL';
  releaseAllInputs();

  const c = shared.activeCatch;
  sfx.playCatchFanfare(c.item.category === 'Junk' || c.item.category === 'Flora');
  questEvent('catch', { item: c.item, weight: c.weight, zoneObj: c.zoneObj, onBoat: shared.onBoat });
  shareCatchCheck(c);

  const isNewSpecies = !shared.state.discovered.includes(c.item.id);
  if (isNewSpecies) {
    shared.state.discovered.push(c.item.id);
  }
  if (!shared.state.speciesStats) shared.state.speciesStats = {};
  const prevStat = shared.state.speciesStats[c.item.id] || { count: 0, maxWeight: 0 };
  const isNewRecord = c.item.category === 'Fish' && c.weight > prevStat.maxWeight;
  if (isNewRecord) town().recs[c.item.id] = { w: +c.weight.toFixed(2), zone: c.zoneObj.id, day: shared.state.dayCount || 0 };   // for the Trophy Wall
  shared.state.speciesStats[c.item.id] = {
    count: prevStat.count + 1,
    maxWeight: Math.max(prevStat.maxWeight, c.weight)
  };
  c.isNewRecord = isNewRecord;

  advanceBountiesOnCatch(c);
  recordCatchProgress(c, isNewSpecies, isNewRecord);
  if (c.isCOD) {
    const today = todayNum();
    if (shared.state.daily.codDay !== today) { shared.state.daily.codDay = today; addXp(25); setTimeout(() => showToast('⭐ Catch of the Day landed! x3 value and +25 XP'), 700); }
    shared.state.daily.codCount++;
  }
  saveGame();

  vfx.spawnSparkles(world.anglerGroup.position.clone().add(new THREE.Vector3(0, 1.5, -0.6)), 20, 0xfef08a);
  openCatchModal(c);
}
