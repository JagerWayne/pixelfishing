/* Diving: the action button and the per-frame dive update. */
import { sfx } from '../data/equipment.js';
import { isAnyModalOpen } from '../utils.js';
import { dive, diveInput } from './dive-state.js';
import { diveFire } from './dive-harpoon.js';
import { diveOpenChest } from './dive-chest.js';
import { toggleDive } from './dive-start.js';
import { updateDiveAvailability } from './dive-env.js';
import { updateDiveSim } from './dive-sim.js';

export function diveAction() {
  if (dive.emergency) return;
  if (dive.nearChest) { diveOpenChest(dive.nearChest); return; }
  diveFire();
}

export function updateDive(dt) {
  updateDiveAvailability();
  if (dive.active) updateDiveSim(dt);
}

export function init() {
  /* ---- controls ---- */
  (function wireDiveControls() {
    const hold = (id, key) => {
      const b = document.getElementById(id);
      if (!b) return;
      const on = e => { e.preventDefault(); e.stopPropagation(); sfx.init(); diveInput[key] = true; b.classList.add('held'); if (dive.surfacing) dive.surfacing = false; };
      const off = e => { diveInput[key] = false; b.classList.remove('held'); };
      b.addEventListener('pointerdown', on);
      b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('pointerleave', off);
    };
    hold('btn-dive-up', 'up'); hold('btn-dive-down', 'down');
    const t = document.getElementById('btn-dive-toggle');
    if (t) {
      t.addEventListener('pointerdown', e => { e.stopPropagation(); });
      t.addEventListener('click', e => { e.preventDefault(); toggleDive(); });
    }
    window.addEventListener('keydown', e => {
      if (e.code === 'KeyX' && !e.repeat && !isAnyModalOpen()) toggleDive();
    });
    window.addEventListener('blur', () => { diveInput.up = diveInput.down = false; });
  })();
}
