/* The Seagull's secret menu: money, teleport and the other cheat actions. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { AnglerFactory } from '../angler/angler-factory.js';
import { cleanName } from '../data/recipes.js';
import { applyAnglerGender } from '../save/defaults.js';
import { CUST_TABS, custModal, custResize } from './customise-preview.js';
import { custRefresh, custTabsEl, openCustomize } from './customise.js';
import { saveGame } from '../save/save-game.js';
import { showToast } from './toasts.js';
import { refreshShopBrowse } from '../shop/shop-browse.js';
import { updateHUD } from './hud.js';

export let cheatModal;

export const cheatDone = msg => { saveGame(); updateHUD(); if (typeof refreshShopBrowse === 'function') refreshShopBrowse(); if (msg) showToast(msg); };
export const cheatMoney = n => () => { shared.state.cash = +(shared.state.cash + n).toFixed(2); cheatDone(`💰 +$${n.toLocaleString()}`); };
export const cheatTeleport = (x, z, label) => () => {
  if (shared.onBoat || shared.mode !== 'PIER_IDLE') { showToast('Stand on the pier first.'); return; }
  shared.playerX = x; shared.playerZ = z; cheatDone(`🧭 ${label}`);
};

export function init() {
  CUST_TABS.forEach(t => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pixel-btn tab-btn'; b.dataset.tab = t.id; b.textContent = t.label;
    b.onclick = () => { shared.custTab = t.id; custRefresh(); };
    custTabsEl.appendChild(b);
  });
  document.getElementById('cust-gender-male').addEventListener('click', () => { applyAnglerGender('male', false); custRefresh(); });
  document.getElementById('cust-gender-female').addEventListener('click', () => { applyAnglerGender('female', false); custRefresh(); });
  document.getElementById('cust-random').addEventListener('click', () => {
    shared.state.look = AnglerFactory.randomLook(shared.state.look.gender);
    saveGame(); sfx.playCoin(); custRefresh();
  });
  {   // the name box: typing never reaches the game's keys; saved as you type
    const ni = document.getElementById('cust-name');
    ['keydown', 'keyup', 'keypress'].forEach(t => ni.addEventListener(t, e => { e.stopPropagation(); if (t === 'keydown' && e.key === 'Enter') ni.blur(); }));
    ni.addEventListener('input', () => { shared.state.playerName = cleanName(ni.value); saveGame(); });
    ni.addEventListener('blur', () => { ni.value = shared.state.playerName || ''; });
  }
  document.getElementById('cust-spin').addEventListener('click', e => {
    shared.custSpin = !shared.custSpin; e.currentTarget.textContent = shared.custSpin ? '⏸ Stop' : '▶ Rotate';
  });
  document.getElementById('cust-reset').addEventListener('click', () => {
    shared.state.look = AnglerFactory.defaultLook(shared.state.look.gender);
    saveGame(); custRefresh();
  });
  document.getElementById('cust-close').addEventListener('click', () => { custModal.classList.remove('open'); updateHUD(); });
  [['btn-start-customize', true], ['btn-drawer-customize', false], ['set-customize', false]].forEach(([id, stop]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', e => {
      if (stop) e.stopPropagation();
      document.getElementById('modal-settings').classList.remove('open');
      sfx.init(); openCustomize();
    });
  });
  window.addEventListener('resize', () => { if (custModal.classList.contains('open')) custResize(); });

  /* =========================================================================
     SECRET CHEAT MENU (unlocked by pressing WALK EDGE 31 times beside the seagull on the west corner of the boardwalk)
     ========================================================================= */
  cheatModal = document.getElementById('modal-cheats');
}
