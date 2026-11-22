/* The screen shader switch and the camera filter modal. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { SHADER_PRESETS, camera, postUniforms, renderer } from '../render/renderer.js';
import { world } from '../render/lights.js';
import { saveGame } from '../save/save-game.js';
import { isNearPierBounty } from '../sim/spots.js';
import { showToast } from './toasts.js';
import { isAnyModalOpen } from '../utils.js';
import { _bountyNdc, _bountyRay, claimBounty } from '../fishing/bounty-board.js';
import { gamePause } from './pause.js';

export function applyVfxShader(shaderId, notify = false) {
  const preset = SHADER_PRESETS.find(p => p.id === shaderId) || SHADER_PRESETS[0];
  shared.state.vfxShader = preset.id;
  postUniforms.uMode.value = preset.mode;
  saveGame();

  const vfxLabel = document.getElementById('hud-vfx-label');
  if (vfxLabel) {
    vfxLabel.textContent = `${preset.label}`;
  }
  if (notify) {
    showToast(`🎬 Camera Lens: ${preset.label}`);
  }
}

function renderCameraModal() {
  const grid = document.getElementById('camera-shader-grid');
  grid.innerHTML = '';
  const activeId = shared.state.vfxShader || 'none';

  SHADER_PRESETS.forEach(preset => {
    const isEquipped = activeId === preset.id;
    const card = document.createElement('div');
    card.className = `shop-card ${isEquipped ? 'camera-equipped' : ''}`;
    card.innerHTML = `
            <div>
              <div class="card-title">
                <span>🎞️ ${preset.label}</span>
                <span style="color: ${isEquipped ? '#f0abfc' : 'var(--text-2)'}; font-size: 12px;">${isEquipped ? 'ACTIVE' : 'FILTER'}</span>
              </div>
              <div class="card-stats">${preset.desc}</div>
            </div>
          `;
    const btn = document.createElement('button');
    btn.className = isEquipped ? 'pixel-btn green' : 'pixel-btn';
    btn.textContent = isEquipped ? 'Equipped on Camera' : 'Attach Filter';
    btn.disabled = isEquipped;
    btn.onclick = () => {
      sfx.playCoin();
      applyVfxShader(preset.id, true);
      renderCameraModal();
    };
    card.appendChild(btn);
    grid.appendChild(card);
  });
}

export function openCameraModal() {
  renderCameraModal();
  document.getElementById('modal-camera').classList.add('open');
}

export function init() {
  window.addEventListener('pointerdown', e => {
    if (!world || !world.bountyPapers || !isNearPierBounty() || isAnyModalOpen() || gamePause.on) return;
    if (e.target.closest && e.target.closest('button, .modal-backdrop, #menu-drawer')) return;
    const r = renderer.domElement.getBoundingClientRect();
    _bountyNdc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    _bountyRay.setFromCamera(_bountyNdc, camera);
    const hit = _bountyRay.intersectObjects(world.bountyPapers.children, false)[0];
    if (hit) claimBounty(hit.object.userData.bountyIdx);
  }, true);
}
