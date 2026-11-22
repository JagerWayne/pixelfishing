/* The cooking mini-game's last step, the restaurant sheet and the restaurant props. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { TOWN } from '../world/layout.js';
import { friendPerk, rarityAtLeast } from '../data/townsfolk.js';
import { BUFFS, DISH_MAX, ESPRESSO, PANTRY, RECIPES, RECIPE_BY_ID, RESTO_UP, buffLabel } from '../data/recipes.js';
import { world } from '../render/lights.js';
import { updateReadPill } from './reading.js';
import { bumpStat } from '../save/career.js';
import { saveGame } from '../save/save-game.js';
import { rebuildPierBucketVisual } from '../boat/terminal.js';
import { showToast } from '../ui/toasts.js';
import { questEvent } from './story.js';
import { batchStars, cookBatch, dishPrice, eatDish, kitchen, recipeFish, recipeFishN, recipeNeedText, recipePantryOk,
  recipeUnlocked, restoOpen, restoRating, restoTables, updateBuffPill } from './restaurant.js';
import { cook, cookPress, cookRelease, cookStep, cravingLines, inService, restoView, startCooking } from './cooking.js';
import { shopBrowse, shopMoney } from '../shop/shop-kinds.js';
import { ShopUI } from '../shop/shop-ui.js';
import { refreshShopBrowse, shopAsk } from '../shop/shop-browse.js';
import { updateHUD } from '../ui/hud.js';

export function cookNext(score) {
  cook.scores.push(score); sfx.playCoin();
  if (++cook.step < 3) { cookStep(); return; }
  cancelAnimationFrame(cook.raf);
  const k = kitchen(), r = cook.r, avg = cook.scores.reduce((s, v) => s + v, 0) / 3;
  const rare = cook.fish.some(f => rarityAtLeast(f.rarity, 'Rare')) ? 0.12 : 0;
  const stars = Math.max(1, Math.min(3, 1 + Math.floor((avg + rare) * 2.2)));
  cook.fish.forEach(f => { const i = shared.state.bucket.indexOf(f); if (i >= 0) shared.state.bucket.splice(i, 1); });
  Object.entries(r.pantry).forEach(([p, n]) => { k.pantry[p] -= n; });
  if (k.dishes.length < DISH_MAX) k.dishes.push({ id: r.id, stars });
  k.cooked++;
  { const st = k.stats[r.id] || (k.stats[r.id] = [0, 0, 0]); if (stars === 3) st[0]++; st[1] += stars; st[2]++; }   // for COOK x3
  const newly = RECIPES.filter(x => x.at === k.cooked);
  rebuildPierBucketVisual(); saveGame(); updateHUD();
  questEvent('cook', { stars, recipe: r });
  document.getElementById('cook-hint').textContent = `${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}  ${r.name} is in the fridge!` + (newly.length ? `  New recipe${newly.length > 1 ? 's' : ''}: ${newly.map(x => x.name).join(', ')}` : '');
  document.getElementById('cook-area').innerHTML = `<div class="ck-done">${r.icon}</div>`;
  const btn = document.getElementById('cook-btn'); btn.textContent = 'Done';
  cook.step = 3;
}

/* ---- the restaurant sheet (shop sheet kind 'resto') ---- */
export function restoRender() {
  const k = kitchen(), tab = shopBrowse.tab, U = ShopUI.begin();
  const rating = restoRating(), t = shared.state.timeOfDay;
  U.summary(`<b>Rating ${'★'.repeat(Math.round(rating))}${'☆'.repeat(5 - Math.round(rating))} ${rating}</b> • ${restoTables()} tables • ${k.dishes.length} / ${DISH_MAX} dishes ready • served ${k.served}<br>${inService(t) ? '🔔 Service is on: guests are eating.' : 'Lunch 11:00 to 14:00, dinner 17:30 to 21:00.'}${k.buff ? ` • ${buffLabel(k.buff.type, k.buff.n)}` : ''}${k.espresso > 0 ? ` • ☕ ${Math.ceil(k.espresso / 60)} h` : ''}`);
  const mk = U.row, msg = U.note;
  if (tab === 'cook') {
    RECIPES.forEach(r => {
      if (!recipeUnlocked(r)) { mk(`<span class="sl-n">🔒 ${r.name}<small>Unlocks after ${r.at} dishes cooked (${k.cooked} so far).</small></span>`); return; }
      const fish = recipeFish(r), pan = recipePantryOk(r);
      const st = k.stats[r.id], batch = st && st[0] >= 3, btns = [['Cook', 'green', () => startCooking(r), !fish || !pan || k.dishes.length >= DISH_MAX]];
      if (batch) btns.push(['Cook ×3', 'green', () => cookBatch(r), !recipeFishN(r, 3) || !recipePantryOk(r, 3) || k.dishes.length >= DISH_MAX]);
      mk(`<span class="sl-n">${r.icon} ${r.name}<small>${recipeNeedText(r)} • sells for about ${shopMoney(dishPrice({ id: r.id, stars: 2 }, rating))}${batch ? ` • ×3 at ${'⭐'.repeat(batchStars(r))}` : st ? ` • 3-star dishes: ${st[0]} / 3 for Cook ×3` : ''}</small></span>`, btns);
    });
  } else if (tab === 'fridge') {
    if (restoOpen()) msg(`⭐ <b>Today's cravings</b> (double pay with the dish in the fridge):<br>${cravingLines().join('<br>')}`);
    if (!k.dishes.length) msg('The fridge is empty. Cook something on the Cook tab.');
    const groups = {}; k.dishes.forEach(d => { const key = d.id + ':' + d.stars; (groups[key] = groups[key] || { d, n: 0 }).n++; });
    Object.values(groups).forEach(({ d, n }) => {
      const r = RECIPE_BY_ID[d.id];
      mk(`<span class="sl-n">${r.icon} ${r.name} ${'⭐'.repeat(d.stars)}<small>x${n} • guests pay about ${shopMoney(dishPrice(d, rating))} • eat it: ${BUFFS[r.buff].what}, ${BUFFS[r.buff].n} ${BUFFS[r.buff].unit[BUFFS[r.buff].n === 1 ? 0 : 1]}</small></span>`,
        [['Eat', 'ghost', () => { const i = k.dishes.findIndex(x => x.id === d.id && x.stars === d.stars); if (i < 0) return; k.dishes.splice(i, 1); eatDish(r.buff); saveGame(); refreshShopBrowse(); }]]);
    });
    U.primary(k.bank >= 1 ? `Collect ${shopMoney(k.bank)}` : 'No takings yet', restoCollect, k.bank < 1);
  } else if (tab === 'pantry') {
    const pm = friendPerk('lorenzo') ? 0.85 : 1;   // Lorenzo's friendship perk
    mk(`<span class="sl-n">☕ Harbour Espresso<small>Read twice as fast on a bench for 12 hours${k.espresso > 0 ? ` • ${Math.ceil(k.espresso / 60)} h left` : ''} • ${shopMoney(ESPRESSO.cost)}</small></span>`,
      [['Drink', '', () => shopAsk({ confirm: `Drink a Harbour Espresso for ${shopMoney(ESPRESSO.cost)}?`, price: ESPRESSO.cost, verb: 'Buy', can: shared.state.cash >= ESPRESSO.cost, act: () => { shared.state.cash = +(shared.state.cash - ESPRESSO.cost).toFixed(2); k.espresso = ESPRESSO.minutes; sfx.playCoin(); saveGame(); updateHUD(); updateBuffPill(); updateReadPill(); showToast('☕ Harbour Espresso: you read twice as fast for 12 hours.'); } }), shared.state.cash < ESPRESSO.cost]]);
    Object.entries(PANTRY).forEach(([id, p]) => p.trap ? mk(`<span class="sl-n">${p.icon} ${p.name}<small>${k.pantry[id] || 0} in stock • from your crab traps in the tide pool</small></span>`) : mk(`<span class="sl-n">${p.icon} ${p.name}<small>${k.pantry[id]} in stock • ${shopMoney(p.cost * pm)} each</small></span>`,
      [['+5', '', () => shopAsk({ confirm: `Buy 5 ${p.name.toLowerCase()} for ${shopMoney(p.cost * 5 * pm)}?`, price: +(p.cost * 5 * pm).toFixed(2), verb: 'Buy', can: shared.state.cash >= p.cost * 5 * pm, act: () => { shared.state.cash = +(shared.state.cash - p.cost * 5 * pm).toFixed(2); k.pantry[id] += 5; sfx.playCoin(); saveGame(); updateHUD(); } }), shared.state.cash < p.cost * 5 * pm]]));
  } else if (tab === 'upgrades') {
    RESTO_UP.forEach(u => {
      const lvl = k[u.id], nxt = u.levels[lvl + 1];
      mk(`<span class="sl-n">${u.icon} ${u.name}<small>${u.desc}${nxt ? ` • ${shopMoney(nxt.cost)}` : ' • fully upgraded'}</small></span>`,
        nxt ? [['Buy', '', () => shopAsk({ confirm: `Buy ${u.name.toLowerCase()} for ${shopMoney(nxt.cost)}?`, price: nxt.cost, verb: 'Buy', can: shared.state.cash >= nxt.cost, act: () => { shared.state.cash = +(shared.state.cash - nxt.cost).toFixed(2); k[u.id]++; sfx.playCoin(); saveGame(); updateHUD(); syncRestoProps(); } }), shared.state.cash < nxt.cost]] : []);
    });
  }
}
function restoCollect() {
  const k = kitchen(), got = Math.floor(k.bank * 100) / 100; if (got < 1) return;
  shopAsk({ confirm: `Collect ${shopMoney(got)} from the restaurant?`, price: got, verb: 'Sell', can: true, act: () => { shared.state.cash = +(shared.state.cash + got).toFixed(2); k.bank = 0; bumpStat('earned', got); sfx.playCoin(); saveGame(); updateHUD(); showToast(`🍝 Collected ${shopMoney(got)}.`); } });
}
const restoFrontZ = () => TOWN.resto.z - TOWN.resto.d / 2;
export function isNearResto() { return !shared.onBoat && shared.mode === 'PIER_IDLE' && Math.abs(shared.playerX - TOWN.resto.x) <= 1.5 && shared.playerZ <= restoFrontZ() - 0.05 && shared.playerZ >= restoFrontZ() - 1.5; }
/* the terrace in front: tables, and guests while service runs */
function syncRestoProps() {
  const R = world && world.resto; if (!R) return;
  const n = restoTables(); R.tables.forEach((t, i) => { t.visible = i < n; });
  R.lights.visible = !!kitchen().lights;
  if (R.soon) R.soon.visible = !restoOpen();
}
export function updateRestoProps() {
  const R = world && world.resto; if (!R) return;
  const n = restoTables(), on = restoOpen() && inService(shared.state.timeOfDay) && kitchen().dishes.length + restoView.busy > 0;
  R.guests.forEach((g, i) => { g.visible = on && i < n * 2 && (i % 3 !== 2 || restoView.busy > 0.3); });
  if (R.soon) R.soon.visible = !restoOpen();
  R.tables.forEach((t, i) => { t.visible = i < n; });
  R.lights.visible = !!kitchen().lights;
}

export function init() {
  (function wireCook() {
    const btn = document.getElementById('cook-btn');
    btn.addEventListener('pointerdown', e => { e.preventDefault(); if (cook.step >= 3) { document.getElementById('modal-cook').classList.remove('open'); refreshShopBrowse(); return; } cookPress(); });
    const rel = () => cookRelease();
    btn.addEventListener('pointerup', rel); btn.addEventListener('pointercancel', rel); btn.addEventListener('pointerleave', rel);
    document.getElementById('cook-quit').addEventListener('click', () => { cancelAnimationFrame(cook.raf); document.getElementById('modal-cook').classList.remove('open'); });
  })();
}
