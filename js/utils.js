/* Helpers: chancePerSec, pause and modal checks, closing modals and bearings, and addMethods, which joins
   a class's method groups to it. */
import { shared } from './state.js';
import { updateHUD } from './ui/hud.js';
import { gamePause } from './ui/pause.js';

/* =========================================================================
   SECTION K: UI MODALS (SHOP, BUCKET, TOOLBOX, CATCH REVEAL, LOG, GALLERY, CAMERA, BOUNTY)
   ========================================================================= */

/* Frame-rate independent random event: on average `perSec` times per second, whatever the frame rate (0 when paused). */
export function chancePerSec(perSec, dt) { return dt > 0 && Math.random() < 1 - Math.exp(-perSec * dt); }

/* The world clock stops while a menu sheet or the pause screen is open (the start screen, the rescue cut-scene
   and the camera's live viewfinder keep it running). */
export function isGamePaused() {
  return gamePause.on || !!document.querySelector('.modal-backdrop.open:not(#modal-camera)');
}
const FIGHT_MODES = ['CASTING', 'WAITING_BITE', 'BITE_WINDOW', 'REELING', 'LANDING'];
export const inFight = () => FIGHT_MODES.includes(shared.mode);

export function isAnyModalOpen() {
  return document.querySelectorAll('.modal-backdrop.open, #rescue-overlay.open, #start-overlay.open, #pause-overlay.open').length > 0;
}

export function closeAllModals() {
  if (document.getElementById('modal-catch').classList.contains('open')) return;
  document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
}

/* =========================================================================
   SEA EVENTS: floating treasure chests and the boss shadow (session only, never saved)
   ========================================================================= */
// bearing of a target relative to the boat's heading, as an arrow word
export function relativeBearing(dx, dz) {
  const a = Math.atan2(-dx, -dz) - shared.boatYaw;
  const d = Math.atan2(Math.sin(a), Math.cos(a)) * 180 / Math.PI; // 0 ahead, + to port, - to starboard
  if (Math.abs(d) <= 30) return 'AHEAD ▲';
  if (Math.abs(d) >= 150) return 'ASTERN ▼';
  return d > 0 ? 'PORT ◀' : 'STARBOARD ▶';
}

/* Joins a class's method groups (objects of whole methods kept in other files) to the class itself:
   instance methods onto its prototype and static methods onto the class, non-enumerable like class methods. */
export function addMethods(cls, proto, statics) {
  const put = (target, group) => {
    if (!group) return;
    const desc = Object.getOwnPropertyDescriptors(group);
    for (const k of Object.keys(desc)) desc[k].enumerable = false;
    Object.defineProperties(target, desc);
  };
  put(cls.prototype, proto);
  put(cls, statics);
}

export function init() {
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById(btn.dataset.close).classList.remove('open');
      updateHUD();
    });
  });
}
