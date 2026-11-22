/* The quest pill and log, and the restaurant: kitchen state, recipes, buffs, prices and batches. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { PixelTextureFactory } from '../render/texture-factory.js';
import { FRIEND_PERK, FRIEND_PERKS, NPCS, friendPerk, friendPts, rarityAtLeast } from '../data/townsfolk.js';
import { QUESTS, QUEST_BY_ID } from '../data/quests.js';
import { BUFFS, DISH_MAX, ESPRESSO, PANTRY, RECIPE_BY_ID, RESTO_UP, restoName } from '../data/recipes.js';
import { world } from '../render/lights.js';
import { sellValue } from '../fishing/market.js';
import { saveGame } from '../save/save-game.js';
import { rebuildPierBucketVisual } from '../boat/terminal.js';
import { showToast } from '../ui/toasts.js';
import { questAvailable, questEvent, questReady, questStepText, story } from './story.js';
import { friendHearts } from './talk.js';
import { isAnyModalOpen } from '../utils.js';
import { refreshShopBrowse } from '../shop/shop-browse.js';
import { updateHUD } from '../ui/hud.js';

/* ---- the quest log and the HUD pill ---- */
export function updateQuestPill() {
  const pill = document.getElementById('hud-quest-pill'); if (!pill) return;
  const S = story(), ids = Object.keys(S.active);
  if (!ids.length || isAnyModalOpen()) { pill.style.display = 'none'; return; }
  const id = ids.find(questReady) || ids[0], ready = questReady(id);
  pill.classList.toggle('ready', ready);
  pill.textContent = `${ready ? '✅' : '📜'} ${QUEST_BY_ID[id].title}: ${questStepText(id)}`;
  pill.style.display = 'flex';
}
export function openQuestLog() {
  const S = story(), host = document.getElementById('quest-list'), row = (icon, title, sub, cls) => `<div class="map-row ${cls || ''}"><span class="mi">${icon}</span><span><b>${title}</b><small>${sub}</small></span></div>`;
  const act = Object.keys(S.active).map(id => { const q = QUEST_BY_ID[id]; return row(questReady(id) ? '✅' : '📜', q.title, `${NPCS[q.giver].icon} ${NPCS[q.giver].name} • ${questStepText(id)}`); });
  const avail = QUESTS.filter(questAvailable).map(q => row('❗', q.title, `Talk to ${NPCS[q.giver].name} (${NPCS[q.giver].role}) in Harbour Town or the harbour.`));
  const done = S.done.map(id => row('🏅', QUEST_BY_ID[id].title, 'Complete'));
  const friends = Object.keys(NPCS).map(id => row(NPCS[id].icon, `${NPCS[id].name} ${friendHearts(id)}`, friendPerk(id) ? `Friends: ${FRIEND_PERKS[id]}` : `Friendship ${Math.min(FRIEND_PERK, friendPts(id))} / ${FRIEND_PERK} • at ${FRIEND_PERK}: ${FRIEND_PERKS[id]}`));
  host.innerHTML = `<h4 class="ql-h">Friends</h4>${friends.join('')}<h4 class="ql-h">In progress</h4>${act.join('') || '<p class="sl-empty">Nothing yet. Look for people with a ! above their heads.</p>'}`
    + (avail.length ? `<h4 class="ql-h">Waiting for you</h4>${avail.join('')}` : '')
    + `<h4 class="ql-h">Completed (${S.done.length} / ${QUESTS.length})</h4>${done.join('') || '<p class="sl-empty">None yet.</p>'}`;
  document.getElementById('modal-quests').classList.add('open');
}

/* =========================================================================
   LORENZO'S RESTAURANT (v6.1): cook catches into dishes (a three-step timing mini-game), keep them in the fridge,
   and guests buy them at lunch and dinner (in-game time). Everything lives in state.kitchen (sanitizeKitchen).
   ========================================================================= */
export function defaultKitchen() { return { pantry: { bread: 0, lemon: 0, rice: 0, potato: 0, spices: 0, shellfish: 0 }, dishes: [], cooked: 0, served: 0, bank: 0, tables: 0, stove: 0, lights: 0, buff: null, acc: 0, espresso: 0, stats: {} }; }
export function sanitizeKitchen(src) {
  const k = defaultKitchen(); if (!src || typeof src !== 'object') return k;
  const num = (v, lo, hi) => { v = Math.floor(Number(v)); return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : lo; };
  Object.keys(PANTRY).forEach(p => { k.pantry[p] = num(src.pantry && src.pantry[p], 0, 999); });
  k.dishes = (Array.isArray(src.dishes) ? src.dishes : []).filter(d => d && RECIPE_BY_ID[d.id]).slice(0, DISH_MAX).map(d => ({ id: d.id, stars: num(d.stars, 1, 3) }));
  k.cooked = num(src.cooked, 0, 1e6); k.served = num(src.served, 0, 1e6);
  k.bank = Math.max(0, Math.min(1e6, Number(src.bank) || 0));
  k.tables = num(src.tables, 0, 2); k.stove = num(src.stove, 0, 1); k.lights = num(src.lights, 0, 1);
  if (src.buff && BUFFS[src.buff.type]) {   // charges since v6.2.0; an older timed meal still running becomes a full set of charges
    const b = BUFFS[src.buff.type], n = src.buff.n !== undefined ? num(src.buff.n, 0, b.n) : (Number(src.buff.left) > 0 ? b.n : 0);
    if (n > 0) k.buff = { type: src.buff.type, n };
  }
  k.espresso = Math.max(0, Math.min(ESPRESSO.minutes, Number(src.espresso) || 0));
  if (src.stats && typeof src.stats === 'object') Object.keys(src.stats).forEach(id => { const v = src.stats[id]; if (RECIPE_BY_ID[id] && Array.isArray(v)) k.stats[id] = [num(v[0], 0, 1e5), num(v[1], 0, 3e5), num(v[2], 0, 1e5)]; });
  return k;
}
export const kitchen = () => shared.state.kitchen || (shared.state.kitchen = defaultKitchen());
export function updateRestoSign() {
  const R = world && world.resto; if (!R || !R.sign) return;
  const txt = '🍝 ' + restoName().toUpperCase();
  if (R.sign.userData.txt === txt) return;
  if (R.sign.material.map) R.sign.material.map.dispose();
  R.sign.material.map = PixelTextureFactory.makeSignTexture(txt, 384, 64); R.sign.material.needsUpdate = true; R.sign.userData.txt = txt;
}
export const restoOpen = () => !!(story().flags && story().flags.resto);
export const recipeUnlocked = r => kitchen().cooked >= r.at;
/* use one charge of the meal (a cast, a fight, a dive) */
export function useBuff(t) {
  const k = kitchen(), b = k.buff; if (!b || b.type !== t || b.n <= 0) return false;
  b.n--; if (b.n <= 0) { k.buff = null; showToast('🍽️ The meal has worn off.'); }
  updateBuffPill(); return true;
}
export function eatDish(type) {
  const k = kitchen(); k.buff = { type, n: BUFFS[type].n };
  showToast(`${BUFFS[type].icon} ${BUFFS[type].name} (${BUFFS[type].what}) for the next ${BUFFS[type].n === 1 ? BUFFS[type].unit[0] : BUFFS[type].n + ' ' + BUFFS[type].unit[1]}.`);
  updateBuffPill();
}
/* the small pill under the HUD: the meal's charges left and the espresso */
export function updateBuffPill() {
  const el = document.getElementById('hud-zone-buff'); if (!el) return;   // v6.2.1: on the status line, icon + count
  const k = shared.state.kitchen, parts = [];
  if (k && k.buff) parts.push(`${BUFFS[k.buff.type].icon}${k.buff.n}`);
  if (k && k.espresso > 0) parts.push(`☕${Math.ceil(k.espresso / 60)}h`);
  const txt = parts.join(' ');
  if (el.textContent !== txt) el.textContent = txt;
}
/* the restaurant's rating (1 to 5 stars): average quality of what is in the fridge, variety, and the terrace lights */
export function restoRating() {
  const k = kitchen(), d = k.dishes;
  const q = d.length ? d.reduce((s, x) => s + x.stars, 0) / d.length : 1.5;
  const variety = new Set(d.map(x => x.id)).size;
  return Math.max(1, Math.min(5, +(0.6 + q * 0.9 + Math.min(1.2, variety * 0.15) + k.lights * 0.4 + Math.min(0.6, k.served / 200)).toFixed(1)));
}
export const restoTables = () => RESTO_UP[0].levels[kitchen().tables].v;
export const dishPrice = (d, rating) => Math.round(RECIPE_BY_ID[d.id].value * (0.55 + 0.25 * d.stars) * (0.8 + rating * 0.1));
/* fish for a recipe: the cheapest matching fish in the bucket for each requirement (each fish used once) */
export const recipeFish = r => recipeFishN(r, 1);
export const recipePantryOk = (r, times = 1) => Object.entries(r.pantry).every(([p, n]) => kitchen().pantry[p] >= n * times);
/* fish for several batches at once (each fish used once), or null */
export function recipeFishN(r, times) {
  const used = [], pool = shared.state.bucket.slice().sort((a, b) => sellValue(a) - sellValue(b));
  for (let t = 0; t < times; t++) for (const req of r.fish) {
    const f = pool.find(e => !used.includes(e) && e.category === (req.cat || 'Fish') && (!req.minW || e.weight >= req.minW) && (!req.rarityMin || rarityAtLeast(e.rarity, req.rarityMin)));
    if (!f) return null; used.push(f);
  }
  return used;
}
/* COOK x3 (v6.4.0): after three 3-star dishes of a recipe, cook three at once at your average stars, no mini-game */
export const batchStars = r => { const st = kitchen().stats[r.id]; return st && st[2] ? Math.max(1, Math.min(3, Math.round(st[1] / st[2]))) : 2; };
export function cookBatch(r) {
  const k = kitchen(), fish = recipeFishN(r, 3); if (!fish || !recipePantryOk(r, 3)) return;
  const stars = batchStars(r), room = Math.min(3, DISH_MAX - k.dishes.length); if (room <= 0) return;
  fish.forEach(f => { const i = shared.state.bucket.indexOf(f); if (i >= 0) shared.state.bucket.splice(i, 1); });
  Object.entries(r.pantry).forEach(([p, n]) => { k.pantry[p] -= n * 3; });
  for (let i = 0; i < 3; i++) { if (k.dishes.length < DISH_MAX) k.dishes.push({ id: r.id, stars }); k.cooked++; questEvent('cook', { stars, recipe: r }); }
  sfx.playCoin(); rebuildPierBucketVisual(); saveGame(); updateHUD(); refreshShopBrowse();
  showToast(`${r.icon} Cooked 3 × ${r.name} (${'⭐'.repeat(stars)})${room < 3 ? ': the fridge is full, some went to the staff' : ''}.`);
}
export const recipeNeedText = r => r.fish.map(q => `${q.cat === 'Flora' ? 'seaweed' : 'a fish'}${q.minW ? ` over ${q.minW} kg` : ''}${q.rarityMin ? ` (${q.rarityMin}+)` : ''}`).join(', ')
  + ' + ' + Object.entries(r.pantry).map(([p, n]) => `${n > 1 ? n + ' ' : ''}${PANTRY[p].icon}`).join(' ');
