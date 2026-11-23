/* Eco rewards, resetting the save, two-tap buttons and the start screen. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { world } from '../render/lights.js';
import { vfx } from '../render/previews.js';
import { dailyLine } from '../fishing/market.js';
import { applyAnglerGender, defaultSaveState } from '../save/defaults.js';
import { saveGame } from '../save/save-game.js';
import { rebuildPlayerBoatVisual, showToast } from './toasts.js';
import { seaEvents } from '../fishing/sea-events.js';
import { applyVfxShader } from './camera-modal.js';
import { leaveShopBrowse } from '../shop/shop-browse.js';
import { updateHUD } from './hud.js';

export function processEcoCleanupReward(soldItems) {
  const junkItems = soldItems.filter(i => i.category === 'Junk' || i.category === 'Flora');
  if (junkItems.length === 0) return;
  const addedKg = junkItems.reduce((sum, i) => sum + i.weight, 0);
  shared.state.junkRecycledKg = +((shared.state.junkRecycledKg || 0) + addedKg).toFixed(2);
  const totalMilestones = Math.floor(shared.state.junkRecycledKg / 100);
  const prevClaimed = shared.state.mayorRewardsClaimed || 0;
  if (totalMilestones > prevClaimed) {
    const newRewards = totalMilestones - prevClaimed;
    const bonusCash = newRewards * 1000;
    shared.state.mayorRewardsClaimed = totalMilestones;
    shared.state.cash = +(shared.state.cash + bonusCash).toFixed(2);
    sfx.playCatchFanfare(false);
    vfx.spawnSparkles(world.anglerGroup.position.clone().add(new THREE.Vector3(0, 1.8, -0.5)), 28, 0x4ade80);
    setTimeout(() => {
      showToast(`🏛️ MAYOR AWARD! +$${bonusCash.toLocaleString()} for recycling ${totalMilestones * 100}kg of ocean junk!`);
    }, 400);
  } else {
    showToast(`♻️ Eco Cleanup: +${addedKg.toFixed(1)}kg (${(shared.state.junkRecycledKg % 100).toFixed(1)}/100kg to $1,000 Mayor Reward)`);
  }
}

function performSaveReset() {
  const preservedGender = shared.state.anglerGender || 'male';
  shared.state = defaultSaveState();
  shared.state.anglerGender = preservedGender;
  saveGame();
  shared.onBoat = false;
  shared.mode = 'PIER_IDLE';
  shared.playerX = 0;
  shared.playerZ = 3.6;
  seaEvents.reset();
  applyAnglerGender(shared.state.anglerGender, false);
  applyVfxShader('none', false);
  rebuildPlayerBoatVisual();
  leaveShopBrowse();
  updateHUD();
  showToast('Save data reset to starter gear!');
  document.getElementById('modal-settings').classList.remove('open');
}

// Two-tap confirmation so a stray tap can never wipe progress.
function wireTwoTap(btn, idleText, action) {
  let armed = false;
  let timer = null;
  btn.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      btn.textContent = 'Tap again!';
      timer = setTimeout(() => { armed = false; btn.textContent = idleText; }, 4000);
      return;
    }
    clearTimeout(timer);
    armed = false;
    btn.textContent = idleText;
    action();
  });
}
/* Start screen: version, Continue / New game */
function refreshStartScreen() {
  document.getElementById('start-version').textContent = '';   // v2.0: the version is in the title (logo and tab)
  document.getElementById('start-daily').innerHTML = dailyLine(true);
  const startBtn = document.getElementById('btn-start-game');
  const summary = document.getElementById('start-save-summary');
  const newBtn = document.getElementById('btn-new-game');
  if (shared.hadSavedGame) {
    const species = (shared.state.discovered || []).length, bottles = (shared.state.foundMessages || []).length;
    summary.textContent = `Saved game: $${shared.state.cash.toFixed(2)} \u2022 ${species} species \u2022 ${bottles} bottles`;
    summary.style.display = 'block';
    startBtn.textContent = '▶ CONTINUE';
    newBtn.style.display = 'block';
  } else {
    summary.style.display = 'none';
    startBtn.textContent = '🎣 START NEW GAME';
    newBtn.style.display = 'none';
  }
}

export function init() {
  wireTwoTap(document.getElementById('btn-new-game'), '✨ NEW GAME', () => {
    performSaveReset();
    shared.hadSavedGame = false;
    refreshStartScreen();
    showToast('New game ready. Pick your angler and start!');
  });
  refreshStartScreen();
  wireTwoTap(document.getElementById('set-reset'), 'Reset', performSaveReset);
}
