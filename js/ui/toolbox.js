/* The tackle toolbox sheet (bait and rigs). */
import { shared } from '../state.js';
import { BAIT_TIERS, sfx } from '../data/equipment.js';
import { RIGS } from '../data/townsfolk.js';
import { saveGame } from '../save/save-game.js';
import { showToast } from './toasts.js';
import { rigState } from '../fishing/rigs.js';
import { updateHUD } from './hud.js';

export function renderToolbox() {
  const list = document.getElementById('toolbox-bait-list');
  list.innerHTML = '';
  BAIT_TIERS.forEach(bt => {
    const isEquipped = shared.state.baitTier === bt.tier;
    const stock = bt.infinite ? Infinity : (shared.state.baitStock[bt.tier] || 0);
    const hasAny = bt.infinite || stock > 0;

    const card = document.createElement('div');
    card.className = `shop-card ${isEquipped ? 'equipped' : ''}`;
    card.style.opacity = hasAny ? '1' : '0.55';
    card.innerHTML = `
            <div>
              <div class="card-title">
                <span>${bt.name}</span>
                <span style="color: ${bt.infinite ? 'var(--ok)' : (stock > 0 ? 'var(--gold)' : 'var(--text-2)')};">
                  ${bt.infinite ? '∞' : `${stock}x`}
                </span>
              </div>
              <div class="card-stats">
                Weight: <b>${bt.weightMin}x–${bt.weightMax}x</b><br/>
                ${bt.desc}
              </div>
            </div>
          `;
    const btn = document.createElement('button');
    btn.className = isEquipped ? 'pixel-btn green' : 'pixel-btn gold';
    if (isEquipped) {
      btn.textContent = 'Currently Equipped';
      btn.disabled = true;
    } else if (hasAny) {
      btn.textContent = `Equip ${bt.name}`;
      btn.onclick = () => {
        shared.state.baitTier = bt.tier;
        shared.state.baitCount = bt.infinite ? 0 : stock;
        sfx.playCoin();
        saveGame();
        renderToolbox();
        updateHUD();
        showToast(`🪝 Hooked ${bt.name}!`);
      };
    } else {
      btn.textContent = 'Out of Stock (Buy at Shop)';
      btn.disabled = true;
    }
    card.appendChild(btn);
    list.appendChild(card);
  });
  // rigs (v6.5.0)
  const rg = rigState();
  if (rg.owned.length || rg.chum) {
    const h = document.createElement('h4'); h.className = 'ql-h'; h.textContent = '🪝 Rigs'; list.appendChild(h);
    rg.owned.forEach(id => {
      const r = RIGS[id], eq = rg.eq === id, card = document.createElement('div');
      card.className = `shop-card ${eq ? 'equipped' : ''}`;
      card.innerHTML = `<div><div class="card-title"><span>${r.icon} ${r.name}</span></div><div class="card-stats">${r.desc}</div></div>`;
      const b = document.createElement('button'); b.className = eq ? 'pixel-btn green' : 'pixel-btn gold'; b.textContent = eq ? 'Take off' : 'Equip';
      b.onclick = () => { rg.eq = eq ? null : id; sfx.playCoin(); saveGame(); renderToolbox(); updateHUD(); showToast(eq ? `🪝 ${r.name} taken off.` : `🪝 ${r.name} on your line.`); };
      card.appendChild(b); list.appendChild(card);
    });
    if (rg.chum) { const n = document.createElement('p'); n.className = 'town-note'; n.textContent = `🪣 ${rg.chum} chum bucket${rg.chum > 1 ? 's' : ''}: use them from a stopped boat (🪣 CHUM button or C).`; list.appendChild(n); }
  }
}
