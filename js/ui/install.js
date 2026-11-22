/* The sound toggle, the install prompt and the action button's update throttle. */
import { saveSettings, settings } from '../core/settings.js';
import { enterFullscreen, exitFullscreen, sfx } from '../data/equipment.js';
import { applyShadowQuality, resizeViewport } from '../render/lights.js';
import { showToast } from './toasts.js';
import { audioBtn, renderSettings, setHapticsBtn, setQualityBtn, setSoundBtn } from './settings.js';
import { updatePrimaryActionButtonInner } from './action-button.js';
import { toggleFirstPerson, updateViewButton } from '../sim/sky.js';

export function toggleSound() {
  settings.sound = sfx.toggle();
  saveSettings();
  renderSettings();
  return settings.sound;
}

// ---- Installable app: service worker + install prompt ----
let deferredInstallPrompt = null;

/* =========================================================================
   SECTION L: HUD & PRIMARY MOBILE ACTION BUTTON SYNCHRONIZATION
   ========================================================================= */
export let actionIsMap = false;
export function updatePrimaryActionButton() {
  updatePrimaryActionButtonInner();
  actionIsMap = false;   // v6.3.1: the Map lives in the side drawer (and on M); a button with nothing to do simply hides
}

export function init() {
  document.getElementById('set-fullscreen').addEventListener('click', () => {
    settings.fullscreen = !settings.fullscreen; saveSettings(); renderSettings();
    if (settings.fullscreen) enterFullscreen(); else exitFullscreen();
  });
  document.getElementById('set-text').addEventListener('click', e => {
    const b = e.target.closest('button[data-v]'); if (!b) return;
    settings.textSize = b.dataset.v; saveSettings(); renderSettings();
  });
  document.getElementById('set-alpha').addEventListener('click', e => {
    const b = e.target.closest('button[data-v]'); if (!b) return;
    settings.hudAlpha = Number(b.dataset.v); saveSettings(); renderSettings();
  });
  document.getElementById('set-solid').addEventListener('click', () => {
    settings.solidUi = !settings.solidUi; saveSettings(); renderSettings();
  });
  document.getElementById('set-autohide').addEventListener('click', () => {
    settings.autoHideHud = !settings.autoHideHud; saveSettings(); renderSettings();
  });

  document.getElementById('btn-toggle-view').addEventListener('click', () => toggleFirstPerson(true));
  updateViewButton();
  audioBtn.addEventListener('click', () => {
    showToast(toggleSound() ? 'Sound ON' : 'Sound OFF');
  });
  setSoundBtn.addEventListener('click', toggleSound);
  setHapticsBtn.addEventListener('click', () => {
    sfx.hapticsEnabled = !sfx.hapticsEnabled;
    settings.haptics = sfx.hapticsEnabled;
    saveSettings();
    renderSettings();
    if (sfx.hapticsEnabled) sfx.vibrate(30);
  });
  setQualityBtn.addEventListener('click', () => {
    settings.quality = settings.quality === 'low' ? 'high' : 'low';
    saveSettings();
    renderSettings();
    resizeViewport();
    applyShadowQuality();
  });
  document.getElementById('btn-open-settings').addEventListener('click', () => {
    renderSettings();
    document.getElementById('modal-settings').classList.add('open');
  });

  renderSettings();
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstallPrompt = e;
    document.getElementById('row-install').style.display = 'flex';
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    document.getElementById('row-install').style.display = 'none';
    showToast('📲 Installed! Find Pixel Fishing on your home screen.');
  });
  document.getElementById('set-install').addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    try { await deferredInstallPrompt.userChoice; } catch {}
    deferredInstallPrompt = null;
    document.getElementById('row-install').style.display = 'none';
  });
}
