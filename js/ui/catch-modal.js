/* The bucket overflow swap, the gallery reward and keeping a catch. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { BOTTLE_MESSAGES } from '../data/bottles-bounties.js';
import { SMOKE_MAX } from '../data/townsfolk.js';
import { world } from '../render/lights.js';
import { vfx } from '../render/previews.js';
import { addXp } from '../save/career.js';
import { getBucketCapacity, getBucketWeight, saveGame } from '../save/save-game.js';
import { rebuildPierBucketVisual } from '../boat/terminal.js';
import { showToast } from './toasts.js';
import { questEvent } from '../town/story.js';
import { town } from '../town/town-state.js';
import { smokeFits } from '../fishing/rigs.js';
import { closeCatchModal } from './log-modal.js';
import { updateHUD } from './hud.js';

export function refreshCatchOverflowUI() {
  if (!shared.activeCatch) return;
  const cap = getBucketCapacity();
  const curW = getBucketWeight();
  const fits = curW + shared.activeCatch.weight <= cap + 0.001;

  const keepBtn = document.getElementById('btn-keep-catch');
  const overflowPanel = document.getElementById('catch-overflow-panel');

  if (fits) {
    keepBtn.disabled = false;
    keepBtn.textContent = 'Keep in Bucket';
    overflowPanel.style.display = 'none';
  } else if (smokeFits(shared.activeCatch)) {   // the Pier Smokehouse takes what the bucket cannot (v6.6.0)
    keepBtn.disabled = false;
    keepBtn.textContent = `🔥 To the Smokehouse (${town().smoke.kg.toFixed(1)}/${SMOKE_MAX} kg)`;
    overflowPanel.style.display = 'none';
  } else {
    keepBtn.disabled = true;
    keepBtn.textContent = 'Bucket Full!';
    overflowPanel.style.display = 'block';
    document.getElementById('catch-overflow-msg').textContent =
      `Bucket Full (${curW.toFixed(1)}/${cap.toFixed(1)} kg)! Release catch or discard an item below:`;

    const swapList = document.getElementById('catch-swap-list');
    swapList.innerHTML = '';
    shared.state.bucket.forEach((entry, idx) => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.style.padding = '6px 8px';
      row.innerHTML = `
              <span style="font-size:12px;">${entry.name} (${entry.weight.toFixed(2)}kg • $${entry.value})</span>
            `;
      const discBtn = document.createElement('button');
      discBtn.className = 'pixel-btn red';
      discBtn.style.padding = '6px 10px';
      discBtn.style.fontSize = '11px';
      discBtn.textContent = 'Discard';
      discBtn.onclick = () => {
        shared.state.bucket.splice(idx, 1);
        saveGame();
        rebuildPierBucketVisual();
        updateHUD();
        refreshCatchOverflowUI();
      };
      row.appendChild(discBtn);
      swapList.appendChild(row);
    });
  }
}

export function checkGalleryCompletionReward() {
  if (!shared.state.foundMessages) shared.state.foundMessages = [];
  if (shared.state.foundMessages.length >= BOTTLE_MESSAGES.length && !shared.state.galleryRewardClaimed) {
    shared.state.galleryRewardClaimed = true;
    shared.state.cash = +(shared.state.cash + 2500).toFixed(2);
    sfx.playCatchFanfare(false);
    vfx.spawnSparkles(world.anglerGroup.position.clone().add(new THREE.Vector3(0, 1.8, -0.5)), 32, 0x2dd4bf);
    setTimeout(() => {
      showToast(`🏆 MASTER ARCHIVIST! All ${BOTTLE_MESSAGES.length} Bottle Messages collected! +$2,500.00!`);
    }, 450);
  }
}

export function attemptKeepPendingCatch() {
  if (!shared.activeCatch) return;
  const cap = getBucketCapacity();
  const curW = getBucketWeight();
  if (curW + shared.activeCatch.weight > cap + 0.001) {
    if (smokeFits(shared.activeCatch)) { const S = town().smoke, w = shared.activeCatch.weight; S.kg = +(S.kg + w).toFixed(2); S.value = +(S.value + shared.activeCatch.value * 0.9).toFixed(2); saveGame(); closeCatchModal(`🔥 ${shared.activeCatch.item.name} (${w.toFixed(2)} kg) went to the Smokehouse: ${S.kg.toFixed(1)} / ${SMOKE_MAX} kg of smoked fillets.`); return; }
    showToast('Not enough space in your bucket!');
    return;
  }
  const entryName = shared.activeCatch.bottleMessage
    ? `Bottle #${shared.activeCatch.bottleMessage.id}: ${shared.activeCatch.bottleMessage.title}`
    : shared.activeCatch.item.name;

  shared.state.bucket.push({
    uid: Date.now() + Math.random(),
    id: shared.activeCatch.item.id,
    name: entryName,
    category: shared.activeCatch.item.category,
    rarity: shared.activeCatch.item.rarity,
    zoneName: shared.activeCatch.zoneObj.name,
    weight: shared.activeCatch.weight,
    value: shared.activeCatch.value,
    bottleMessageId: shared.activeCatch.bottleMessage ? shared.activeCatch.bottleMessage.id : null
  });

  let extraMsg = '';
  if (shared.activeCatch.bottleMessage) {
    if (!shared.state.foundMessages) shared.state.foundMessages = [];
    if (!shared.state.foundMessages.includes(shared.activeCatch.bottleMessage.id)) {
      shared.state.foundMessages.push(shared.activeCatch.bottleMessage.id); questEvent('bottle');
      addXp(15);
      extraMsg = ` (Archived ${shared.state.foundMessages.length}/${BOTTLE_MESSAGES.length} in Gallery!)`;
      checkGalleryCompletionReward();
    }
  }

  saveGame();
  rebuildPierBucketVisual();
  closeCatchModal(`Kept ${entryName} (${shared.activeCatch.weight.toFixed(2)} kg)!${extraMsg}`);
}
