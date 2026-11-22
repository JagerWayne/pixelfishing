/* The secret menu's sheet and unlock, moon and night queries, weather and modules, and the save keys. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { WEATHER_TYPES } from '../data/catalog.js';
import { cheats, primaryBtn } from '../sim/controls-state.js';
import { MOON_PHASES, SAVE_KEY } from '../fishing/bounties.js';
import { cheatModal } from '../ui/cheats.js';
import { CHEAT_SECTIONS, askCheat } from '../ui/cheat-sections.js';
import { showToast } from '../ui/toasts.js';

export let SAVE_BACKUP_KEY;

export function renderCheatMenu() {
  const host = document.getElementById('cheat-body');
  host.innerHTML = '';
  CHEAT_SECTIONS.forEach(sec => {
    const wrap = document.createElement('div');
    wrap.className = 'cheat-section';
    wrap.innerHTML = `<div class="cheat-title">${sec.title}</div>`;
    const grid = document.createElement('div');
    grid.className = 'cheat-grid';
    (sec.items || []).forEach(([label, fn]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pixel-btn'; b.textContent = label;
      b.onclick = () => askCheat(sec.title, label, fn);
      grid.appendChild(b);
    });
    (sec.toggles || []).forEach(([key, label]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pixel-btn' + (cheats[key] ? ' on' : '');
      b.textContent = `${cheats[key] ? '✅' : '⬜'} ${label}`;
      b.onclick = () => askCheat(sec.title, `Turn ${cheats[key] ? 'OFF' : 'ON'}: ${label}`, () => { cheats[key] = !cheats[key]; renderCheatMenu(); });
      grid.appendChild(b);
    });
    wrap.appendChild(grid);
    host.appendChild(wrap);
  });
}

function openCheatMenu() {
  renderCheatMenu();
  cheatModal.classList.add('open');
}

export function unlockCheatMenu() {
  shared.cheatTaps = 0;
  shared.isHoldingAction = false; shared.actionPointerId = null; primaryBtn.classList.remove('pressed');
  sfx.playSeagull();
  showToast('🕊️ The seagull squawks... secret menu unlocked!');
  openCheatMenu();
}

export function getMoonPhase() {
  const idx = (shared.state.dayCount || 0) % MOON_PHASES.length;
  return MOON_PHASES[idx];
}

export function isNightTime() {
  return shared.state.timeOfDay < 0.23 || shared.state.timeOfDay > 0.77;
}

export function isFullMoonNight() {
  return isNightTime() && getMoonPhase().isFull;
}

export function getWeatherObj() {
  return WEATHER_TYPES.find(w => w.id === (shared.state.weather || 'CLEAR')) || WEATHER_TYPES[0];
}

export function hasModule(modId) {
  return Array.isArray(shared.state.modules) && shared.state.modules.includes(modId);
}

export const SAVE_VERSION = 2;

export function init() {
  // Any other input (another key, or touching anything other than the action button) resets the count.
  window.addEventListener('keydown', e => { if (e.code !== 'Space') shared.cheatTaps = 0; }, true);
  document.addEventListener('pointerdown', e => {
    if (!(e.target && e.target.closest && e.target.closest('#btn-primary-action'))) shared.cheatTaps = 0;
  }, true);
  SAVE_BACKUP_KEY = SAVE_KEY + '_backup';
}
