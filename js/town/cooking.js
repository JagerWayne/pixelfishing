/* Restaurant service and cravings, and the three-step cooking mini-game. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { NPCS } from '../data/townsfolk.js';
import { RECIPES, RECIPE_BY_ID } from '../data/recipes.js';
import { showToast } from '../ui/toasts.js';
import { questEvent } from './story.js';
import { addFriend } from './talk.js';
import { dishPrice, kitchen, recipeFish, recipePantryOk, recipeUnlocked, restoOpen, restoRating, restoTables,
  updateBuffPill } from './restaurant.js';
import { cookNext } from './resto-sheet.js';
import { dayRng, town } from './town-state.js';
import { shopMoney } from '../shop/shop-kinds.js';

/* service: lunch 11:00 to 14:00 and dinner 17:30 to 21:00; guests arrive with the in-game clock */
export const inService = t => (t >= 0.458 && t < 0.583) || (t >= 0.729 && t < 0.875);
export function updateRestaurant(dMin) {
  const k = shared.state.kitchen; if (!k || dMin <= 0) return;
  if (k.espresso > 0) { const h = Math.ceil(k.espresso / 60); k.espresso = Math.max(0, k.espresso - dMin); if (Math.ceil(k.espresso / 60) !== h) { updateBuffPill(); if (k.espresso <= 0) showToast('☕ The espresso has worn off.'); } }
  if (!restoOpen() || !inService(shared.state.timeOfDay) || !k.dishes.length) { restoView.busy = Math.max(0, restoView.busy - dMin / 30); return; }
  const rating = restoRating();
  serveCravings(rating);
  k.acc += dMin * restoTables() * (0.006 + rating * 0.004);   // guests per in-game minute
  while (k.acc >= 1 && k.dishes.length) {
    k.acc -= 1;
    k.dishes.sort((a, b) => b.stars - a.stars);
    const d = k.dishes.splice(Math.floor(Math.random() * Math.min(3, k.dishes.length)), 1)[0];
    k.bank = +(k.bank + dishPrice(d, rating)).toFixed(2); k.served++;
    restoView.busy = Math.min(1, restoView.busy + 0.35);
    questEvent('serve', {});
  }
  if (k.acc > 3) k.acc = 3;
}
export const restoView = { busy: 0 };
/* VIP cravings (v6.4.0): each day two townsfolk crave a dish, one at lunch and one at dinner; with it in the fridge
   during that service they come in, pay double and like you more. Chosen from the day number (nothing to save but done flags). */
function todaysCravings() {
  const T = town(), day = shared.state.dayCount || 0;
  craveDone();
  if (!T.crave.ids || T.crave.ids.length !== 2) {   // chosen once a day from the recipes you know, then kept (saved)
    const r = dayRng(day * 11 + 5), ids = Object.keys(NPCS), pool = RECIPES.filter(recipeUnlocked);
    const a = ids[Math.floor(r() * ids.length)]; let b = ids[Math.floor(r() * ids.length)]; if (b === a) b = ids[(ids.indexOf(a) + 3) % ids.length];
    const pick = () => (pool.length ? pool[Math.floor(r() * pool.length)] : RECIPES[0]).id;
    T.crave.ids = [[a, pick()], [b, pick()]];
  }
  return T.crave.ids.map(([npc, rid], i) => ({ npc, recipe: RECIPE_BY_ID[rid] || RECIPES[0], meal: i ? 'dinner' : 'lunch' }));
}
const mealNow = t => (t >= 0.458 && t < 0.583 ? 'lunch' : t >= 0.729 && t < 0.875 ? 'dinner' : null);
function craveDone() { const T = town(), day = shared.state.dayCount || 0; if (T.crave.day !== day) T.crave = { day, done: [] }; return T.crave.done; }
function serveCravings(rating) {
  const k = kitchen(), meal = mealNow(shared.state.timeOfDay); if (!meal) return;
  const done = craveDone();
  todaysCravings().forEach((c, i) => {
    if (c.meal !== meal || done.includes(i)) return;
    const j = k.dishes.findIndex(d => d.id === c.recipe.id); if (j < 0) return;
    const d = k.dishes.splice(j, 1)[0], pay = dishPrice(d, rating) * 2;
    k.bank = +(k.bank + pay).toFixed(2); k.served++; done.push(i); questEvent('serve', {});
    addFriend(c.npc, 2);
    showToast(`${NPCS[c.npc].icon} ${NPCS[c.npc].name} came for the ${c.recipe.name}: paid double (${shopMoney(pay)})!`);
  });
}
export function cravingLines() {
  const done = craveDone();
  return todaysCravings().map((c, i) => `${NPCS[c.npc].icon} ${NPCS[c.npc].name} craves <b>${c.recipe.icon} ${c.recipe.name}</b> at ${c.meal} (${c.meal === 'lunch' ? '11:00 to 14:00' : '17:30 to 21:00'})${done.includes(i) ? ' ✅ served' : recipeUnlocked(c.recipe) ? '' : ' (not on your menu yet)'}`);
}

/* ---- the cooking mini-game: chop (tap in the green), sear (hold, release in the green), plate (stop the arrow at the top) ---- */
export const cook = { r: null, fish: null, step: 0, scores: [], raf: 0, t0: 0, holding: false, heat: 0, taps: 0 };
const COOK_STEPS = ['chop', 'sear', 'plate'];
export function startCooking(r) {
  const fish = recipeFish(r); if (!fish || !recipePantryOk(r)) return;
  cook.r = r; cook.fish = fish; cook.step = 0; cook.scores = [];
  document.getElementById('modal-cook').classList.add('open');
  document.getElementById('cook-title').textContent = `${r.icon} ${r.name}`;
  cookStep();
}
export function cookStep() {
  cancelAnimationFrame(cook.raf);
  const kind = COOK_STEPS[cook.step], area = document.getElementById('cook-area'), btn = document.getElementById('cook-btn'), hint = document.getElementById('cook-hint');
  const easy = kitchen().stove ? 1.35 : 1;
  cook.t0 = cook.last = performance.now(); cook.taps = 0; cook.heat = 0; cook.holding = false; cook.tapScores = [];
  document.getElementById('cook-step').textContent = `Step ${cook.step + 1} / 3`;
  if (kind === 'chop') {
    hint.textContent = 'CHOP: tap when the knife is over a green mark (3 cuts)';
    area.innerHTML = '<div class="ck-bar"><i class="ck-zone" style="left:18%;width:' + (10 * easy) + '%"></i><i class="ck-zone" style="left:46%;width:' + (10 * easy) + '%"></i><i class="ck-zone" style="left:74%;width:' + (10 * easy) + '%"></i><b class="ck-mark">🔪</b></div>';
    btn.textContent = 'CHOP';
  } else if (kind === 'sear') {
    hint.textContent = 'SEAR: hold the button, let go when the heat is in the green';
    area.innerHTML = '<div class="ck-bar ck-v"><i class="ck-zone" style="left:62%;width:' + (14 * easy) + '%"></i><b class="ck-fill"></b></div>';
    btn.textContent = 'HOLD TO SEAR';
  } else {
    hint.textContent = 'PLATE: tap when the arrow points straight up';
    area.innerHTML = '<div class="ck-plate"><b class="ck-arrow">⬆</b></div>';
    btn.textContent = 'PLATE';
  }
  const loop = now => {
    const t = (now - cook.t0) / 1000, fdt = Math.min(0.05, (now - cook.last) / 1000); cook.last = now;
    if (kind === 'chop') { const x = (Math.sin(t * 2.6 - Math.PI / 2) + 1) / 2 * 96; const m = area.querySelector('.ck-mark'); if (m) m.style.left = x + '%'; cook.pos = x; }
    else if (kind === 'sear') { if (cook.holding) cook.heat = Math.min(100, cook.heat + fdt * 62); const f = area.querySelector('.ck-fill'); if (f) { f.style.width = cook.heat + '%'; f.style.background = cook.heat > 62 + 14 * easy ? '#ef4444' : cook.heat >= 62 ? '#4ade80' : '#f59e0b'; } if (cook.heat >= 100) cookRelease(); }
    else { const a = (t * 260) % 360; const ar = area.querySelector('.ck-arrow'); if (ar) ar.style.transform = `rotate(${a}deg)`; cook.angle = a; }
    cook.raf = requestAnimationFrame(loop);
  };
  cook.raf = requestAnimationFrame(loop);
}
export function cookPress() {
  const kind = COOK_STEPS[cook.step], easy = kitchen().stove ? 1.35 : 1;
  if (kind === 'chop') {
    const zones = [18, 46, 74].map(z => [z, z + 10 * easy]), x = cook.pos + 2;
    const best = Math.min(...zones.map(([a, b]) => x >= a && x <= b ? 0 : Math.min(Math.abs(x - a), Math.abs(x - b))));
    cook.tapScores.push(Math.max(0, 1 - best / 12)); sfx.playTick();
    if (++cook.taps >= 3) cookNext(cook.tapScores.reduce((s, v) => s + v, 0) / 3);
  } else if (kind === 'sear') { cook.holding = true; }
  else { const off = Math.min(cook.angle, 360 - cook.angle); cookNext(Math.max(0, 1 - off / (40 * easy))); }
}
export function cookRelease() {
  if (COOK_STEPS[cook.step] !== 'sear' || !cook.holding) return;
  cook.holding = false; const easy = kitchen().stove ? 1.35 : 1, lo = 62, hi = 62 + 14 * easy, h = cook.heat;
  cookNext(h >= lo && h <= hi ? 1 : Math.max(0, 1 - (h < lo ? lo - h : h - hi) / 25));
}
