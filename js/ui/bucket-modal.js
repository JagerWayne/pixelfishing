/* The bucket modal and the catch reveal. */
import { shared } from '../state.js';
import { saveSettings, settings } from '../core/settings.js';
import { BUCKET_TIERS } from '../data/equipment.js';
import { BOTTLE_MESSAGES } from '../data/bottles-bounties.js';
import { SHORE_SHOPS } from '../world/layout.js';
import { WorldBuilder } from '../world/world-builder.js';
import { textures } from '../render/lights.js';
import { previewScene } from '../render/previews.js';
import { aquariumCanHold } from '../town/aquarium.js';
import { marketMult, sellValue } from '../fishing/market.js';
import { ITEM_ICONS, getBucketCapacity, getBucketWeight, saveGame } from '../save/save-game.js';
import { isNearRecycle, nearShoreShop } from '../sim/spots.js';
import { rebuildPierBucketVisual } from '../boat/terminal.js';
import { isFishEntry, isJunkEntry, sellBucketEntry } from '../shop/shop-kinds.js';
import { refreshCatchOverflowUI } from './catch-modal.js';
import { updateHUD } from './hud.js';

export function openBucketModal() {
  const cap = getBucketCapacity();
  const curW = getBucketWeight();
  document.getElementById('bucket-modal-title').textContent =
    `🪣 ${BUCKET_TIERS[shared.state.bucketTier - 1].name.toUpperCase()} (${shared.state.bucket.length} • ${curW.toFixed(1)} / ${cap.toFixed(1)} kg)`;

  const container = document.getElementById('bucket-list-container');
  container.innerHTML = '';

  if (shared.state.bucket.length === 0) {
    container.innerHTML = '<p style="color:var(--text-2); text-align:center;">Your bucket is empty. Cast a line to catch fish!</p>';
  } else {
    const atFish = nearShoreShop(SHORE_SHOPS.fish), atRecycle = isNearRecycle();
    const sortBar = document.createElement('div');
    sortBar.className = 'chip-row';
    sortBar.innerHTML = '<span style="font-size: 12px; color:var(--text-2); align-self:center;">Sort:</span>';
    [['newest', 'Newest'], ['value', '$ Value'], ['weight', 'Weight'], ['name', 'Name']].forEach(([key, label]) => {
      const b = document.createElement('button');
      b.className = `pixel-btn ${settings.bucketSort === key ? 'active gold' : ''}`;
      b.textContent = label;
      b.onclick = () => { settings.bucketSort = key; saveSettings(); openBucketModal(); };
      sortBar.appendChild(b);
    });
    container.appendChild(sortBar);

    const sorters = {
      newest: (a, b) => b.idx - a.idx,
      value: (a, b) => sellValue(b.entry) - sellValue(a.entry),
      weight: (a, b) => b.entry.weight - a.entry.weight,
      name: (a, b) => a.entry.name.localeCompare(b.entry.name)
    };
    const ordered = shared.state.bucket.map((entry, idx) => ({ entry, idx })).sort(sorters[settings.bucketSort] || sorters.newest);
    ordered.forEach(({ entry, idx }) => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
              <div style="display:flex; align-items:center; gap:10px;">
                <img class="item-icon" src="${ITEM_ICONS[entry.id]}" alt="" />
                <div>
                  <div style="font-weight:bold; font-size:13px;">${entry.name}</div>
                  <div style="font-size: 12px; color:var(--text-2);">${entry.weight.toFixed(2)} kg • <span style="color:var(--gold);">$${sellValue(entry)}</span>${marketMult(entry.id) > 1.1 ? ' <span style="color:var(--ok);">▲</span>' : marketMult(entry.id) < 0.9 ? ' <span style="color:var(--danger);">▼</span>' : ''}</div>
                </div>
              </div>
            `;
      const btnGroup = document.createElement('div');
      btnGroup.style.display = 'flex';
      btnGroup.style.gap = '6px';

      if (isFishEntry(entry) ? atFish : isJunkEntry(entry) && atRecycle) {
        const sellBtn = document.createElement('button');
        sellBtn.className = 'pixel-btn green';
        sellBtn.textContent = `Sell $${sellValue(entry)}`;
        sellBtn.onclick = () => { sellBucketEntry(idx); openBucketModal(); };
        btnGroup.appendChild(sellBtn);
      }

      const dropBtn = document.createElement('button');
      dropBtn.className = 'pixel-btn red';
      dropBtn.textContent = 'Drop';
      dropBtn.onclick = () => {
        shared.state.bucket.splice(idx, 1);
        saveGame();
        rebuildPierBucketVisual();
        openBucketModal();
        updateHUD();
      };
      btnGroup.appendChild(dropBtn);
      row.appendChild(btnGroup);
      container.appendChild(row);
    });
  }
  document.getElementById('modal-bucket').classList.add('open');
}

export function openCatchModal(c) {
  if (shared.previewFishObj) {
    previewScene.remove(shared.previewFishObj);
    shared.previewFishObj = null;
  }
  shared.previewFishObj = WorldBuilder.buildSculptedFishMesh(c.item, textures);
  previewScene.add(shared.previewFishObj);

  const rarEl = document.getElementById('catch-rarity');
  rarEl.textContent = c.item.rarity;
  rarEl.className = `rarity-badge rar-${c.item.rarity}`;

  const recBadge = document.getElementById('catch-record-badge');
  recBadge.style.display = c.isNewRecord ? 'inline-block' : 'none';
  document.getElementById('catch-cod-badge').style.display = c.isCOD ? 'inline-block' : 'none';

  document.getElementById('catch-name').textContent = c.bottleMessage
    ? `📜 Bottle #${c.bottleMessage.id}: "${c.bottleMessage.title}"`
    : c.item.name;
  document.getElementById('catch-zone').textContent = `Zone ${c.zoneObj.id}: ${c.zoneObj.name}` + (c.item.category === 'Fish' && shared.state.aquarium && aquariumCanHold({ category: 'Fish', weight: c.weight }).ok ? ' • 🐠 fits your aquarium' : '');
  document.getElementById('catch-weight').textContent = `${c.weight.toFixed(2)} kg`;
  document.getElementById('catch-value').textContent = `$${c.value}`;
  document.getElementById('catch-desc').innerHTML = c.bottleMessage
    ? `<div style="background:#fef3c7; color:#451a03; border:2px solid #b45309; padding:8px 10px; border-radius:3px; font-style:italic; text-align:left; margin-top:4px;"><b>Message #${c.bottleMessage.id}/${BOTTLE_MESSAGES.length} — ${c.bottleMessage.title}:</b><br/>"${c.bottleMessage.text}"<div style="font-style:normal; font-size: 12px; color:#92400e; margin-top:4px;">Keep in bucket to archive in your Gallery (discarding tosses it back to sea).</div></div>`
    : c.item.desc;

  refreshCatchOverflowUI();
  document.getElementById('modal-catch').classList.add('open');
}
