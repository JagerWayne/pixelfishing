/* The Seagull's secret menu: money, teleport and the other cheat actions. */
import { shared } from '../state.js';
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
  /* =========================================================================
     SECRET CHEAT MENU (unlocked by pressing WALK EDGE 31 times beside the seagull on the west corner of the boardwalk)
     ========================================================================= */
  cheatModal = document.getElementById('modal-cheats');
}
