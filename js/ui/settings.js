/* The bottle gallery and the settings sheet (sound, haptics, quality, text size, controls). */
import { shared } from '../state.js';
import { saveSettings, settings } from '../core/settings.js';
import { exitFullscreen, sfx } from '../data/equipment.js';
import { ZONES } from '../data/catalog.js';
import { BOTTLE_MESSAGES } from '../data/bottles-bounties.js';
import { saveGame } from '../save/save-game.js';
import { showToast } from './toasts.js';
import { openMapModal } from './map.js';
import { openCameraModal } from './camera-modal.js';
import { openBucketModal } from './bucket-modal.js';
import { openLogModal } from './log-modal.js';

export let audioBtn, setSoundBtn, setHapticsBtn, setQualityBtn;

export function renderGallery() {
  const foundList = shared.state.foundMessages || [];
  const totalMsgs = BOTTLE_MESSAGES.length;
  const pct = Math.min(100, (foundList.length / totalMsgs) * 100);

  document.getElementById('gallery-modal-title').textContent =
    `📜 MESSAGE IN A BOTTLE GALLERY (${foundList.length} / ${totalMsgs})`;
  document.getElementById('gallery-progress-bar').style.width = `${pct}%`;
  document.getElementById('gallery-reward-status').textContent = shared.state.galleryRewardClaimed
    ? '✅ $2,500.00 CLAIMED!'
    : `${foundList.length}/${totalMsgs} — Reward: $2,500.00`;

  const grid = document.getElementById('gallery-grid-container');
  grid.innerHTML = '';

  BOTTLE_MESSAGES.forEach(msg => {
    const unlocked = foundList.includes(msg.id);
    const card = document.createElement('div');
    card.className = `scroll-card ${unlocked ? '' : 'locked'}`;
    if (unlocked) {
      card.innerHTML = `
              <div style="display:flex; justify-content:space-between; align-items:center; font-size: 12px; font-weight:900; border-bottom:1px solid rgba(180,83,9,0.35); padding-bottom:4px;">
                <span>📜 #${msg.id} • ${msg.title}</span>
              </div>
              <div style="font-size:12px; font-style:italic; line-height:1.4;">"${msg.text}"</div>
            `;
    } else {
      card.innerHTML = `
              <div style="display:flex; justify-content:space-between; align-items:center; font-size: 12px; font-weight:bold; border-bottom:1px solid #334155; padding-bottom:4px;">
                <span>🔒 Scroll #${msg.id} • Undiscovered</span>
              </div>
              <div style="font-size: 12px; line-height:1.4;">Fish up corked bottles in <b>${ZONES[msg.zones[0] - 1].name}</b> and keep them in your bucket to unlock this scroll.</div>
            `;
    }
    grid.appendChild(card);
  });
}

export function renderSettings() {
  audioBtn.textContent = sfx.enabled ? '🔊' : '🔇';
  const paint = (btn, on, onText, offText) => {
    btn.textContent = on ? onText : offText;
    btn.classList.toggle('green', on);
  };
  paint(setSoundBtn, sfx.enabled, 'ON', 'OFF');
  paint(setHapticsBtn, sfx.hapticsEnabled, 'ON', 'OFF');
  document.getElementById('set-hand').textContent = settings.hand === 'left' ? 'Left' : 'Right';
  document.getElementById('set-joy').textContent = settings.joyMode === 'floating' ? 'Floating' : 'Fixed';
  document.getElementById('set-btn').textContent = settings.btnSize;
  paint(document.getElementById('set-autohide'), settings.autoHideHud, 'ON', 'OFF');
  paint(document.getElementById('set-fullscreen'), settings.fullscreen, 'ON', 'OFF');
  paint(document.getElementById('set-solid'), settings.solidUi, 'ON', 'OFF');
  document.querySelectorAll('#set-text button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === settings.textSize)));
  document.querySelectorAll('#set-alpha button').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.v) === settings.hudAlpha)));
  applyControlSettings();
  setQualityBtn.textContent = settings.quality === 'low' ? 'Battery saver' : 'High';
  setQualityBtn.classList.toggle('gold', settings.quality === 'low');
}

const TEXT_SCALE = { S: 0.9, M: 1, L: 1.15, XL: 1.3 };
function applyControlSettings() {
  const ctl = document.getElementById('mobile-controls');
  ctl.dataset.hand = settings.hand;
  document.body.dataset.hand = settings.hand;
  document.body.dataset.joy = settings.joyMode;
  document.body.dataset.btn = settings.btnSize;
  document.body.dataset.autohide = settings.autoHideHud ? '1' : '0';
  // Tide Glass display options (v7.0.0): text size, how see-through the HUD is, and solid panels (always on in Battery saver)
  const rs = document.documentElement.style;
  rs.setProperty('--text-scale', String(TEXT_SCALE[settings.textSize] || 1));
  rs.setProperty('--glass-a', String(settings.hudAlpha / 100));
  document.body.dataset.solid = (settings.solidUi || settings.quality === 'low') ? '1' : '0';
  if (settings.joyMode !== 'floating') document.getElementById('virtual-joystick').classList.remove('live');
}

export function init() {
  document.getElementById('btn-toggle-drawer').addEventListener('click', () => {
    document.getElementById('modal-menu').classList.add('open');
  });
  // menu tiles that open another screen close the sheet first
  document.getElementById('modal-menu').addEventListener('click', e => {
    if (e.target.closest && e.target.closest('[data-closes-menu]')) {
      document.getElementById('modal-menu').classList.remove('open');
    }
  });
  document.getElementById('menu-bag').addEventListener('click', () => openBucketModal());
  document.getElementById('menu-map').addEventListener('click', () => openMapModal());
  document.getElementById('menu-filter').addEventListener('click', () => openCameraModal());
  document.getElementById('menu-log').addEventListener('click', () => openLogModal());
  audioBtn = document.getElementById('btn-toggle-audio');
  setSoundBtn = document.getElementById('set-sound');
  setHapticsBtn = document.getElementById('set-haptics');
  setQualityBtn = document.getElementById('set-quality');
  document.getElementById('set-hand').addEventListener('click', () => {
    settings.hand = settings.hand === 'left' ? 'right' : 'left'; saveSettings(); renderSettings();
  });
  document.getElementById('set-joy').addEventListener('click', () => {
    settings.joyMode = settings.joyMode === 'floating' ? 'fixed' : 'floating'; saveSettings(); renderSettings();
  });
  document.getElementById('set-btn').addEventListener('click', () => {
    settings.btnSize = { S: 'M', M: 'L', L: 'S' }[settings.btnSize]; saveSettings(); renderSettings();
  });
  document.getElementById('menu-exit').addEventListener('click', () => {
    saveGame(); exitFullscreen();
    try { window.close(); } catch {}
    setTimeout(() => showToast('🚪 Progress saved. Close the app with your back or home gesture.'), 400);
  });
}
