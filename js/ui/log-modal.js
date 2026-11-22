/* Closing the catch reveal, the catch log and opening the bottle gallery. */
import { shared } from '../state.js';
import { CATCH_CATALOG } from '../data/catalog.js';
import { BOTTLE_MESSAGES } from '../data/bottles-bounties.js';
import { catchOfDay } from '../fishing/market.js';
import { ITEM_ICONS, saveGame } from '../save/save-game.js';
import { showToast } from './toasts.js';
import { attemptKeepPendingCatch } from './catch-modal.js';
import { renderGallery } from './settings.js';
import { updateHUD } from './hud.js';

export function closeCatchModal(msg) {
  shared.activeCatch = null;
  document.getElementById('modal-catch').classList.remove('open');
  shared.mode = shared.onBoat ? 'BOAT_DRIVING' : 'PIER_IDLE';
  updateHUD();
  if (msg) showToast(msg);
}

let logFilter = 'All';

export function updateLogNewDot() {
  const hasNew = shared.state.discovered.some(id => !shared.state.seenSpecies.includes(id));
  document.getElementById('btn-toggle-drawer').classList.toggle('has-new', hasNew);
  document.getElementById('menu-log').classList.toggle('has-new', hasNew);
}

function renderLog() {
  const msgFoundCount = (shared.state.foundMessages || []).length;
  document.getElementById('log-modal-title').textContent =
    `📖 ENCYCLOPEDIA (${shared.state.discovered.length} / ${CATCH_CATALOG.length})`;
  const grid = document.getElementById('log-grid-container');
  grid.innerHTML = '';

  const bar = document.createElement('div');
  bar.className = 'chip-row';
  bar.style.gridColumn = '1 / -1';
  ['All', 'Fish', 'Junk', 'Flora', 'Undiscovered'].forEach(f => {
    const b = document.createElement('button');
    b.className = `pixel-btn ${logFilter === f ? 'active gold' : ''}`;
    b.textContent = f;
    b.onclick = () => { logFilter = f; renderLog(); };
    bar.appendChild(b);
  });
  grid.appendChild(bar);

  CATCH_CATALOG.forEach(item => {
    const found = shared.state.discovered.includes(item.id);
    if (logFilter === 'Undiscovered' ? found : (logFilter !== 'All' && item.category !== logFilter)) return;
    const isNew = found && !shared.state.seenSpecies.includes(item.id);
    const stat = (shared.state.speciesStats && shared.state.speciesStats[item.id]) || null;
    const recordTxt = item.isMessageBottle
      ? ` • <b style="color:var(--sea);">${msgFoundCount}/${BOTTLE_MESSAGES.length} Scrolls</b>`
      : (stat && stat.maxWeight > 0
        ? ` • PB: <b style="color:var(--ok);">${stat.maxWeight.toFixed(2)}kg</b> (${stat.count}x)`
        : '');
    const card = document.createElement('div');
    const isCod = item.id === catchOfDay().id;
    card.className = `log-card ${found ? '' : 'undiscovered'} ${isCod ? 'cod' : ''}`;
    card.innerHTML = `
            <img class="item-icon" src="${ITEM_ICONS[item.id]}" style="${found ? '' : 'filter: brightness(0);'}" alt="" />
            <div style="font-size: 12px; line-height: 1.35;">
              <div style="font-weight: bold; font-size: 12px; color: #fff;">${found ? item.name : '???'}${isNew ? '<span class="new-badge">NEW</span>' : ''}${isCod ? '<span class="log-cod">⭐ TODAY x3</span>' : ''}</div>
              <div style="color: var(--text-2);">Zones: ${item.zones.join(', ')} • ${item.rarity}</div>
              <div style="color: var(--gold);">${found ? `~$${item.value}${recordTxt}` : 'Undiscovered'}</div>
            </div>
          `;
    grid.appendChild(card);
  });
}

export function openLogModal() {
  renderLog();
  document.getElementById('modal-log').classList.add('open');
  // Mark everything as seen once shown (badges stay visible for this viewing).
  const unseen = shared.state.discovered.filter(id => !shared.state.seenSpecies.includes(id));
  if (unseen.length) {
    shared.state.seenSpecies.push(...unseen);
    saveGame();
  }
  updateLogNewDot();
}

export function openGalleryModal() {
  renderGallery();
  document.getElementById('modal-gallery').classList.add('open');
}

export function init() {
  document.getElementById('btn-keep-catch').addEventListener('click', attemptKeepPendingCatch);
  document.getElementById('btn-release-catch').addEventListener('click', () => {
    if (shared.activeCatch && shared.activeCatch.bottleMessage) {
      closeCatchModal(`Tossed Bottle #${shared.activeCatch.bottleMessage.id} back into the sea to be refished later.`);
    } else {
      const name = shared.activeCatch ? shared.activeCatch.item.name : 'catch';
      closeCatchModal(`Released ${name} back into the sea.`);
    }
  });
}
