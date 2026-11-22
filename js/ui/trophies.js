/* The aquarium's per-frame update, the trophy case and opening the toolbox. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { CABIN } from '../world/layout.js';
import { world } from '../render/lights.js';
import { aquaHappy } from '../town/aquarium.js';
import { CATALOG_INDEX, FISH_TOTAL, medalFor } from '../save/career.js';
import { ITEM_ICONS } from '../save/save-game.js';
import { openQuestLog } from '../town/restaurant.js';
import { AQ_BOUNDS, MEDAL_ICON, aquaSync, aquaView, trophyRanking } from '../town/aquarium-world.js';
import { renderToolbox } from './toolbox.js';
import { shopBrowse } from '../shop/shop-kinds.js';

export function updateAquarium(dt) {
  const A = world && world.aquarium; if (!A || !shared.state.aquarium) return;
  const watching = shopBrowse.active && shopBrowse.kind === 'aqua';
  const near = !shared.onBoat && Math.abs(shared.playerX - CABIN.aquaX) < 11 && shared.playerZ < 9.5;
  A.userData.live.visible = near || watching;
  if (!(near || watching)) return;
  aquaSync(false);
  const aq = shared.state.aquarium, dirt = Math.pow(1 - aq.clean / 100, 2), wm = A.userData.water.material;
  wm.color.setHex(0x5ec5ee).lerp(aquaView.green, dirt); wm.opacity = 0.2 + 0.36 * dirt;
  if (dt <= 0) return;
  const sad = aquaHappy(aq) < 35, B = AQ_BOUNDS;
  aquaView.fish.forEach(p => {
    const u = p.userData, hx = B.x - u.len * 0.5;
    u.t -= dt;
    if (u.t <= 0) { u.t = 2 + Math.random() * 4; u.tgt.set((Math.random() * 2 - 1) * hx, B.y0 + Math.random() * (B.y1 - B.y0), (Math.random() * 2 - 1) * B.z); }
    const dx = u.tgt.x - p.position.x, dy = u.tgt.y - p.position.y, dz = u.tgt.z - p.position.z, d = Math.hypot(dx, dy, dz) || 1;
    if (d < 0.08) u.t = 0;
    const sp = (0.1 + u.len * 0.9) * (sad ? 0.35 : 1), k = Math.min(1, dt * 1.6);
    u.vel.x += (dx / d * sp - u.vel.x) * k; u.vel.y += (dy / d * sp * 0.6 - u.vel.y) * k; u.vel.z += (dz / d * sp * 0.4 - u.vel.z) * k;
    p.position.x = THREE.MathUtils.clamp(p.position.x + u.vel.x * dt, -hx, hx);
    p.position.y = THREE.MathUtils.clamp(p.position.y + u.vel.y * dt, B.y0, B.y1);
    p.position.z = THREE.MathUtils.clamp(p.position.z + u.vel.z * dt, -B.z, B.z);
    const hs = Math.hypot(u.vel.x, u.vel.z);
    if (hs > 0.02) {
      const ty = Math.atan2(-u.vel.z, u.vel.x), e = Math.atan2(Math.sin(ty - p.rotation.y), Math.cos(ty - p.rotation.y));
      p.rotation.y += e * Math.min(1, dt * 4);
      p.rotation.z += (THREE.MathUtils.clamp(Math.atan2(u.vel.y, hs), -0.4, 0.4) * 0.7 - p.rotation.z) * Math.min(1, dt * 3);
    }
    u.inst.rotation.y = Math.sin(shared.elapsed * (4 + hs * 16) + u.ph) * 0.12;
  });
  A.userData.bubbles.forEach((b, i) => {
    b.position.y += dt * (0.3 + (i % 3) * 0.08);
    if (b.position.y > A.userData.bubbleTop) { b.position.y = 1.08; b.position.x = -A.userData.w / 2 + 0.25 + (Math.random() - 0.5) * 0.05; }
  });
  // plants sway
  A.userData.decorGroup.children.forEach(d => d.traverse(o => { if (o.userData.sway !== undefined) o.rotation.z = Math.sin(shared.elapsed * 1.4 + o.userData.sway) * 0.1 + (o.userData.sway - 3) * 0.06; }));
}

function openTrophiesModal() {
  const ids = trophyRanking();
  const counts = { gold: 0, silver: 0, bronze: 0 };
  ids.forEach(id => { counts[medalFor(id)]++; });
  document.getElementById('trophy-summary').textContent = `${ids.length} / ${FISH_TOTAL} fish species   🥇 ${counts.gold}   🥈 ${counts.silver}   🥉 ${counts.bronze}`;
  const host = document.getElementById('trophy-list');
  host.innerHTML = '';
  if (!ids.length) host.innerHTML = '<div style="color:var(--text-2); font-size:13px; padding:12px 0;">No fish yet. Land one and its record will appear here.</div>';
  ids.forEach((id, i) => {
    const it = CATALOG_INDEX[id], st = shared.state.speciesStats[id], m = medalFor(id);
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `<div style="display:flex; align-items:center; gap:10px; min-width:0; flex:1;">
              <img class="item-icon" src="${ITEM_ICONS[id]}" alt="" />
              <div style="min-width:0;">
                <div style="font-weight:bold; font-size:13px;">${it.name} ${i < 5 ? '<span style="color:var(--gold); font-size:11px;">• ON DISPLAY</span>' : ''}</div>
                <div style="font-size:12px; color:var(--text-2);">${it.rarity} • record ${st.maxWeight.toFixed(2)} / ${it.maxW.toFixed(1)} kg • caught ${st.count}</div>
              </div></div>
            <div style="font-size:24px;">${MEDAL_ICON[m]}</div>`;
    host.appendChild(row);
  });
  document.getElementById('modal-trophies').classList.add('open');
}

export function openToolboxModal() {
  renderToolbox();
  document.getElementById('modal-toolbox').classList.add('open');
}

export function init() {
  document.getElementById('menu-trophies').addEventListener('click', () => openTrophiesModal());
  document.getElementById('menu-quests').addEventListener('click', () => openQuestLog());
}
