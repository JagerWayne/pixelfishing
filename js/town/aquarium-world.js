/* The career sheet, trophy rankings and the aquarium in the world (tank, swimming fish, decor). */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { WorldBuilder } from '../world/world-builder.js';
import { textures, world } from '../render/lights.js';
import { AQUARIUM_FORMS, AQUARIUM_MAX_W, aquaTankOf } from './aquarium.js';
import { ACHIEVEMENTS, CATALOG_INDEX, RANKS, medalFor, rankIndexFor, rankReward, stat } from '../save/career.js';
import { openCareerModal } from '../ui/career-modal.js';

export function renderCareer() {
  const idx = rankIndexFor(shared.state.xp || 0), cur = RANKS[idx], next = RANKS[idx + 1];
  document.getElementById('career-rank').textContent = `${idx + 1}. ${cur.name}`;
  document.getElementById('career-xp').textContent = `${Math.floor(shared.state.xp || 0).toLocaleString()} XP`;
  const pct = next ? Math.min(100, ((shared.state.xp - cur.xp) / (next.xp - cur.xp)) * 100) : 100;
  document.getElementById('career-xp-bar').style.width = `${pct}%`;
  const rw = next ? rankReward(idx + 1) : null;
  document.getElementById('career-next').textContent = next
    ? `${Math.ceil(next.xp - shared.state.xp)} XP to ${next.name}: +$${rw.cash} and ${rw.baitQty} bait`
    : 'Top rank reached. You are a Sea Legend!';
  const stats = [['Catches', stat('catches')], ['Fish', stat('fish')], ['Junk and flora', stat('junk')], ['Legendary', stat('legendary')],
    ['Night catches', stat('nightCatches')], ['Storm catches', stat('stormCatches')], ['Frenzy catches', stat('frenzyCatches')],
    ['Sailed', `${(stat('metersSailed') / 1000).toFixed(1)} km`], ['Earned', `$${Math.floor(stat('earned')).toLocaleString()}`],
    ['Bounties', stat('bountiesClaimed')], ['Treasures', stat('treasures')], ['Boss fish', stat('bossCatches')]];
  document.getElementById('career-stats').innerHTML = stats.map(([k, v]) =>
    `<div class="drawer-item"><span class="drawer-label">${k}:</span><span class="drawer-val">${typeof v === 'number' ? Math.floor(v).toLocaleString() : v}</span></div>`).join('');
  const done = ACHIEVEMENTS.filter(a => shared.state.achievements.includes(a.id)).length;
  document.getElementById('career-ach-count').textContent = `${done} / ${ACHIEVEMENTS.length}`;
  const host = document.getElementById('career-achievements');
  host.innerHTML = '';
  [...ACHIEVEMENTS].sort((a, b) => (shared.state.achievements.includes(b.id) ? 1 : 0) - (shared.state.achievements.includes(a.id) ? 1 : 0)).forEach(a => {
    const has = shared.state.achievements.includes(a.id), p = Math.min(a.goal, a.prog());
    const row = document.createElement('div');
    row.className = 'item-row';
    row.style.opacity = has ? '1' : '0.78';
    row.innerHTML = `<div style="display:flex; align-items:center; gap:10px; min-width:0; flex:1;">
              <div style="font-size:24px; width:32px; text-align:center; filter:${has ? 'none' : 'grayscale(1)'};">${a.icon}</div>
              <div style="min-width:0; flex:1;">
                <div style="font-weight:bold; font-size:13px; color:${has ? 'var(--gold)' : 'var(--text)'};">${a.name}</div>
                <div style="font-size:12px; color:var(--text-2);">${a.desc}</div>
                ${has ? '' : `<div class="bar-wrap" style="height:6px; margin:4px 0 0;"><div class="bar-fill" style="width:${(p / a.goal) * 100}%; background:var(--info);"></div></div>`}
              </div></div>
            <div style="font-size:12px; font-weight:bold; color:${has ? 'var(--ok)' : 'var(--text-2)'}; white-space:nowrap;">${has ? '✔ $' + a.cash : '$' + a.cash}</div>`;
    host.appendChild(row);
  });
}

/* Trophy case: ranking, mounted fish and the full list */
const RARITY_RANK = { Common: 1, Uncommon: 2, Rare: 3, Epic: 4, Legendary: 5 };
export const MEDAL_ICON = { gold: '🥇', silver: '🥈', bronze: '🥉' };
export function trophyRanking() {
  return Object.keys(shared.state.speciesStats || {}).filter(id => medalFor(id)).sort((a, b) => {
    const ia = CATALOG_INDEX[a], ib = CATALOG_INDEX[b];
    return (RARITY_RANK[ib.rarity] - RARITY_RANK[ia.rarity]) || (shared.state.speciesStats[b].maxWeight / ib.maxW - shared.state.speciesStats[a].maxWeight / ia.maxW);
  });
}
/* ---- the tank in the world: swimming fish, water that gets murky, bubbles ---- */
export const aquaView = { sig: '', fish: [], tpl: {}, green: new THREE.Color(0x4d7c0f) };
export const AQ_BOUNDS = { x: 0.78, y0: 1.1, y1: 1.6, z: 0.15 };
function aquaSetBounds(t) { AQ_BOUNDS.x = t.w / 2 - 0.12; AQ_BOUNDS.y1 = 0.91 + t.h - 0.3; }
function aquaTemplate(id) {
  if (aquaView.tpl[id]) return aquaView.tpl[id];
  const m = WorldBuilder.buildSculptedFishMesh(CATALOG_INDEX[id], textures);
  const bb = new THREE.Box3().setFromObject(m), len = Math.max(0.01, bb.max.x - bb.min.x), c = bb.getCenter(new THREE.Vector3());
  m.position.sub(c);
  const wrap = new THREE.Group(); wrap.add(m);
  return (aquaView.tpl[id] = { mesh: wrap, len });
}
function aquaMakeFish(f) {
  const t = aquaTemplate(f.id), inst = t.mesh.clone(true), form = AQUARIUM_FORMS[f.form] || AQUARIUM_FORMS.normal;
  if (form.tint) inst.traverse(o => {   // colour forms get their own tinted materials
    if (!o.isMesh || !o.material) return;
    o.material = Array.isArray(o.material) ? o.material.map(m => m.clone()) : o.material.clone();
    (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.color) m.color.lerp(new THREE.Color(form.tint), 0.55); m.userData.own = true; });
  });
  const len = 0.14 + 0.34 * Math.sqrt(Math.min(1, f.w / AQUARIUM_MAX_W));
  inst.scale.setScalar(len / t.len);
  const p = new THREE.Group(); p.add(inst); p.rotation.order = 'YZX';
  const hx = AQ_BOUNDS.x - len * 0.5;
  p.position.set((Math.random() * 2 - 1) * hx, AQ_BOUNDS.y0 + Math.random() * (AQ_BOUNDS.y1 - AQ_BOUNDS.y0), (Math.random() * 2 - 1) * AQ_BOUNDS.z);
  p.userData = { len, vel: new THREE.Vector3(), tgt: new THREE.Vector3().copy(p.position), t: Math.random() * 2, ph: Math.random() * 6.28, inst, form: !!form.tint };
  return p;
}
function aquaDispose(obj) { obj.traverse(o => { if (o.geometry && o.userData.ownGeo) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.userData && m.userData.own) m.dispose(); }); }); }
const AQ_DECOR_SLOTS = [[-0.71, -0.08], [0.71, 0.06], [-0.25, 0.08], [0.29, -0.08], [0.0, 0.0], [-0.5, -0.12]];
/* rebuild the swimmers and the decoration when the tank's contents changed */
/* a new tier gets a new tank model (bigger glass, cabinet and hood), swapped in place */
function aquaRebuildTank() {
  const old = world.aquarium, t = aquaTankOf(shared.state.aquarium), par = old.parent;
  const A = WorldBuilder.buildAquariumTank(textures, t);
  A.position.copy(old.position); A.userData.collider = old.userData.collider;
  if (par) { par.remove(old); par.add(A); }
  old.traverse(o => { if (o.geometry) o.geometry.dispose(); });
  world.aquarium = A; aquaView.fish = []; aquaView.sig = '';
  if (A.userData.collider) A.userData.collider.hx = t.w / 2 + 0.1;
  aquaSetBounds(t);
  return A;
}
export function aquaSync(force) {
  let A = world && world.aquarium; if (!A || !shared.state.aquarium) return;
  if (A.userData.tier !== aquaTankOf(shared.state.aquarium).tier) { A = aquaRebuildTank(); force = true; }
  const aq = shared.state.aquarium, sig = aq.tier + '|' + aq.decor.join() + '|' + aq.fish.map(f => f.id + ':' + f.form + ':' + f.w.toFixed(2)).join(',');
  if (!force && sig === aquaView.sig) return;
  aquaView.sig = sig;
  const fg = A.userData.fishGroup, dg = A.userData.decorGroup;
  aquaView.fish.forEach(p => { fg.remove(p); aquaDispose(p); });
  aquaView.fish = aq.fish.map(f => { const p = aquaMakeFish(f); fg.add(p); return p; });
  while (dg.children.length) { const c = dg.children.pop(); c.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  aq.decor.forEach((id, i) => { const d = WorldBuilder.buildAquariumDecor(id, textures), s = AQ_DECOR_SLOTS[i % AQ_DECOR_SLOTS.length]; d.position.set(s[0] * A.userData.w / 2, 1.03, s[1]); dg.add(d); });
}

export function init() {
  document.getElementById('menu-career').addEventListener('click', () => openCareerModal());
}
