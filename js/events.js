/* Input events: the action button, the keyboard, the canvas and focus or visibility changes. */
import { shared } from './state.js';
import { sfx } from './data/equipment.js';
import { lhDock, setStation, stationList } from './boat/stations.js';
import { keys, primaryBtn } from './sim/controls-state.js';
import { releaseAllInputs } from './sim/joystick.js';
import { checkDailyStreak } from './fishing/market.js';
import { cheatConfirmModal } from './ui/cheat-sections.js';
import { isNearPierBucket, isNearPierToolbox } from './sim/spots.js';
import { showToast } from './ui/toasts.js';
import { useChum } from './fishing/rigs.js';
import { openMapModal } from './ui/map.js';
import { handleActionPress } from './fishing/action-press.js';
import { handleActionRelease } from './fishing/cast.js';
import { closeAllModals, inFight, isAnyModalOpen } from './utils.js';
import { openToolboxModal } from './ui/trophies.js';
import { openBucketModal } from './ui/bucket-modal.js';
import { attemptKeepPendingCatch } from './ui/catch-modal.js';
import { openLogModal } from './ui/log-modal.js';
import { toggleFirstPerson } from './sim/sky.js';
import { gamePause, pauseGame, resumeGame, togglePause } from './ui/pause.js';

const onPrimaryEnd = e => {
  if (e.pointerId === shared.actionPointerId) {
    shared.actionPointerId = null;
    if (shared.isHoldingAction) {
      shared.isHoldingAction = false;
      primaryBtn.classList.remove('pressed');
      handleActionRelease();
    }
  }
};

export function init() {
  primaryBtn.addEventListener('pointerdown', e => {
    e.preventDefault();
    e.stopPropagation();
    sfx.init();
    if (isAnyModalOpen()) return;
    if (shared.actionPointerId !== null) return;
    shared.actionPointerId = e.pointerId;
    primaryBtn.setPointerCapture(e.pointerId);
    shared.isHoldingAction = true;
    primaryBtn.classList.add('pressed');
    handleActionPress();
  });
  primaryBtn.addEventListener('pointerup', onPrimaryEnd);
  primaryBtn.addEventListener('pointercancel', onPrimaryEnd);

  window.addEventListener('pointerup', onPrimaryEnd);
  window.addEventListener('pointercancel', onPrimaryEnd);

  window.addEventListener('blur', releaseAllInputs);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      releaseAllInputs();
      if (sfx.ctx && sfx.ctx.state === 'running') sfx.ctx.suspend().catch(() => {});
      if (!document.getElementById('start-overlay').classList.contains('open') && !document.querySelector('.modal-backdrop.open')) pauseGame(true);
    } else {
      if (sfx.enabled && sfx.ctx) sfx.ctx.resume().catch(() => {});
      if (!document.getElementById('start-overlay').classList.contains('open')) checkDailyStreak();
    }
  });
  // iOS keeps a suspended context silent until a touch: resume on the next press
  window.addEventListener('pointerdown', () => { if (sfx.enabled && sfx.ctx && sfx.ctx.state !== 'running' && !document.hidden) sfx.ctx.resume().catch(() => {}); }, { passive: true, capture: true });

  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'Escape') {
      if (cheatConfirmModal.classList.contains('open')) { shared.pendingCheat = null; cheatConfirmModal.classList.remove('open'); return; }
      if (gamePause.on) { resumeGame(); return; }
      if (document.querySelector('.modal-backdrop.open')) { closeAllModals(); return; }
      if (!document.getElementById('start-overlay').classList.contains('open')) pauseGame();
      return;
    }
    if (gamePause.on) { if (e.code === 'KeyP') resumeGame(); return; }
    if (isAnyModalOpen()) {
      if (e.code === 'Space' && document.getElementById('modal-catch').classList.contains('open')) {
        e.preventDefault();
        attemptKeepPendingCatch();
      }
      return;
    }
    if (e.code === 'KeyP') { togglePause(); return; }
    if (inFight() && (e.code === 'KeyB' || e.code === 'KeyT' || e.code === 'KeyL')) {
      showToast('🎣 Finish the fight first! (P pauses)');
      return;
    }
    if (/^Digit[1-5]$/.test(e.code) && shared.onBoat && shared.mode === 'BOAT_DRIVING' && Math.abs(shared.boatVel) < 1.5) {
      const opts = stationList().concat([{ id: lhDock.on ? 'castoff' : 'helm' }]), o = opts[+e.code.slice(5) - 1];
      if (o) setStation(o.id);
      return;
    }
    if (e.code === 'KeyB') {
      openBucketModal();
    } else if (e.code === 'KeyT') {
      if (isNearPierToolbox()) openToolboxModal();
      else if (isNearPierBucket()) openBucketModal();
      else showToast('Walk near the Toolbox or Bucket on the pier!');
    } else if (e.code === 'KeyV') {
      toggleFirstPerson(true);
    } else if (e.code === 'KeyM') {
      openMapModal();
    } else if (e.code === 'KeyC') {
      useChum();
    } else if (e.code === 'KeyL') {
      openLogModal();
    } else if (e.code === 'Space' || e.code === 'KeyE' || e.code === 'Enter') {
      // Space, E and Enter all are the on-screen action button: the same context action, hold to cast
      e.preventDefault();
      if (!shared.isHoldingAction) {
        shared.actionKey = e.code;
        shared.isHoldingAction = true;
        primaryBtn.classList.add('pressed');
        handleActionPress();
      }
    }
  });

  window.addEventListener('keyup', e => {
    keys[e.code] = false;
    if ((e.code === 'Space' || e.code === 'KeyE' || e.code === 'Enter') && shared.isHoldingAction && e.code === shared.actionKey) {
      shared.isHoldingAction = false;
      primaryBtn.classList.remove('pressed');
      handleActionRelease();
    }
  });
}
