/* handleActionPress: what the action button does in each situation. Kept whole (one long function). */
import { shared } from '../state.js';
import { canDockAtLighthouse, dockLighthouse, updateStationPicker } from '../boat/stations.js';
import { CHEAT_TAPS, cheats, primaryBtn } from '../sim/controls-state.js';
import { BOOKS, benchSeated, bookOwned, reading } from '../town/books.js';
import { unlockCheatMenu } from '../save/queries.js';
import { getCurrentBait } from '../save/save-game.js';
import { isNearAquarium, isNearBoatTerminal, isNearDockPump, isNearMooredBoat, isNearPierBounty, isNearPierBucket,
  isNearPierGallery, isNearPierShop, isNearPierToolbox, isNearRecycle, shoreShopHere, spotNear } from '../sim/spots.js';
import { canDockAtPier, isAtPierWaterEdge, openBoatTerminal, refuelAtPump } from '../boat/terminal.js';
import { showToast } from '../ui/toasts.js';
import { handleBoardOrDockToggle } from '../boat/hull.js';
import { isNearCheatGull } from '../town/story.js';
import { npcNear } from '../town/npcs.js';
import { openTalk } from '../town/talk.js';
import { restoOpen } from '../town/restaurant.js';
import { isNearResto } from '../town/resto-sheet.js';
import { openMapModal } from '../ui/map.js';
import { hookFish } from './hook.js';
import { cancelFishing } from './catch.js';
import { openToolboxModal } from '../ui/trophies.js';
import { claimFirstReadyBounty } from './bounty-board.js';
import { openBooksModal } from '../shop/books-aquarium.js';
import { enterShopBrowse } from '../shop/shop-browse.js';
import { openBucketModal } from '../ui/bucket-modal.js';
import { openGalleryModal } from '../ui/log-modal.js';
import { actionIsMap } from '../ui/install.js';
import { updateHUD } from '../ui/hud.js';
import { diveAction } from '../dive/dive-controls.js';
import { fightTap } from './leap.js';
import { gamePause } from '../ui/pause.js';

export function handleActionPress() {
  if (gamePause.on || shared.mode === 'LANDING') return;
  if (shared.mode === 'DIVING') { diveAction(); return; }
  if (shared.mode === 'REELING') { fightTap(); return; }
  if (actionIsMap && (shared.mode === 'PIER_IDLE' || shared.mode === 'BOAT_DRIVING')) {
    shared.isHoldingAction = false; shared.actionPointerId = null; primaryBtn.classList.remove('pressed'); shared.cheatTaps = 0;
    openMapModal(); return;
  }
  const prevCheatTaps = shared.cheatTaps;
  shared.cheatTaps = 0; // any action press that is not a counted "WALK EDGE" press beside the gull resets the count
  if (shared.mode === 'PIER_IDLE') {
    { const n = npcNear(); if (n) { shared.isHoldingAction = false; shared.actionPointerId = null; primaryBtn.classList.remove('pressed'); openTalk(n); return; } }
    if (isNearResto() && restoOpen()) { shared.isHoldingAction = false; shared.actionPointerId = null; primaryBtn.classList.remove('pressed'); enterShopBrowse('resto'); return; }
    { const sp = spotNear(); if (sp) { shared.isHoldingAction = false; shared.actionPointerId = null; primaryBtn.classList.remove('pressed'); sp.press(); return; } }
    if (benchSeated()) {   // seated on a bench: the button reads
      shared.isHoldingAction = false;
      shared.actionPointerId = null;
      primaryBtn.classList.remove('pressed');
      if (reading.id) showToast(`📖 Reading ${BOOKS[reading.id].title}`);
      else if (!Object.keys(BOOKS).some(bookOwned)) showToast('📚 No books yet. Every shop sells one.');
      else openBooksModal();
      return;
    }
    if (isNearPierShop()) {
      shared.isHoldingAction = false;
      shared.actionPointerId = null;
      primaryBtn.classList.remove('pressed');
      enterShopBrowse('tackle');
      return;
    }
    const shoreKind = shoreShopHere();
    if (shoreKind) {
      shared.isHoldingAction = false;
      shared.actionPointerId = null;
      primaryBtn.classList.remove('pressed');
      enterShopBrowse(shoreKind);
      return;
    }
    if (isNearRecycle()) {
      shared.isHoldingAction = false;
      shared.actionPointerId = null;
      primaryBtn.classList.remove('pressed');
      enterShopBrowse('recycle');
      return;
    }
    if (isNearPierBounty()) {
      shared.isHoldingAction = false;
      shared.actionPointerId = null;
      primaryBtn.classList.remove('pressed');
      claimFirstReadyBounty();
      return;
    }
    if (isNearPierGallery()) {
      shared.isHoldingAction = false;
      shared.actionPointerId = null;
      primaryBtn.classList.remove('pressed');
      openGalleryModal();
      return;
    }
    if (isNearAquarium()) {
      shared.isHoldingAction = false;
      shared.actionPointerId = null;
      primaryBtn.classList.remove('pressed');
      enterShopBrowse('aqua');
      return;
    }
    if (isNearPierToolbox()) {
      shared.isHoldingAction = false;
      shared.actionPointerId = null;
      primaryBtn.classList.remove('pressed');
      openToolboxModal();
      return;
    }
    if (isNearPierBucket()) {
      shared.isHoldingAction = false;
      shared.actionPointerId = null;
      primaryBtn.classList.remove('pressed');
      openBucketModal();
      return;
    }
    if (isNearBoatTerminal()) {
      shared.isHoldingAction = false;
      shared.actionPointerId = null;
      primaryBtn.classList.remove('pressed');
      openBoatTerminal();
      return;
    }
    if (isNearDockPump()) {
      shared.isHoldingAction = false;
      shared.actionPointerId = null;
      primaryBtn.classList.remove('pressed');
      refuelAtPump();
      return;
    }
    if (isNearMooredBoat()) {
      shared.isHoldingAction = false;
      shared.actionPointerId = null;
      primaryBtn.classList.remove('pressed');
      handleBoardOrDockToggle();
      return;
    }
    if (!isAtPierWaterEdge()) {
      shared.isHoldingAction = false;
      shared.actionPointerId = null;
      primaryBtn.classList.remove('pressed');
      showToast('Walk to the end of the pier to cast, or visit the Shop / Gallery / Boat!');
      if (isNearCheatGull()) {
        shared.cheatTaps = prevCheatTaps + 1;
        if (shared.cheatTaps >= CHEAT_TAPS) unlockCheatMenu();
      }
      return;
    }
  }

  if (shared.mode === 'BOAT_DRIVING' && canDockAtLighthouse()) {
    shared.isHoldingAction = false;
    shared.actionPointerId = null;
    primaryBtn.classList.remove('pressed');
    dockLighthouse();
    return;
  }

  if (shared.mode === 'BOAT_DRIVING' && canDockAtPier()) {
    shared.isHoldingAction = false;
    shared.actionPointerId = null;
    primaryBtn.classList.remove('pressed');
    handleBoardOrDockToggle();
    return;
  }

  if (shared.mode === 'PIER_IDLE' || shared.mode === 'BOAT_DRIVING') {
    if (Math.abs(shared.boatVel) > 1.5) {
      showToast('Slow the boat down before casting!');
      return;
    }
    if (shared.onBoat && shared.mode === 'BOAT_DRIVING' && !shared.boatStationActive) { shared.boatStationActive = true; updateStationPicker(true); }
    const bait = getCurrentBait();
    if (!bait.infinite && !cheats.freeBait && (shared.state.baitStock[shared.state.baitTier] || 0) <= 0) {
      shared.state.baitTier = 1;
      shared.state.baitCount = 0;
      showToast('Out of special bait! Switched to Bread Crumbs.');
    }
    shared.mode = 'CASTING';
    shared.castCharge = 0.05;
    shared.castDir = 1;
    document.getElementById('cast-meter-box').style.display = 'block';
    updateHUD();
  } else if (shared.mode === 'WAITING_BITE') {
    cancelFishing('Reeled in empty hook.');
  } else if (shared.mode === 'BITE_WINDOW') {
    hookFish();
  }
}
