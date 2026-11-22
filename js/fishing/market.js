/* Achievements, catch progress, the daily market prices, Catch of the Day and the daily streak. */
import { shared } from '../state.js';
import { BAIT_TIERS, sfx } from '../data/equipment.js';
import { CATCH_CATALOG } from '../data/catalog.js';
import { friendPerk } from '../data/townsfolk.js';
import { bookBonus } from '../town/books.js';
import { ACHIEVEMENTS, CATALOG_INDEX, RARITY_XP, addXp, bumpStat } from '../save/career.js';
import { isNightTime } from '../save/queries.js';
import { saveGame } from '../save/save-game.js';
import { showToast } from '../ui/toasts.js';
import { town } from '../town/town-state.js';
import { seaEvents } from './sea-events.js';
import { updateHUD } from '../ui/hud.js';

let MARKET_FISH;

export function checkAchievements() {
  if (!Array.isArray(shared.state.achievements)) shared.state.achievements = [];
  let got = 0;
  ACHIEVEMENTS.forEach(a => {
    if (shared.state.achievements.includes(a.id) || a.prog() < a.goal) return;
    shared.state.achievements.push(a.id);
    shared.state.cash = +(shared.state.cash + a.cash).toFixed(2);
    got++;
    setTimeout(() => { showToast(`🏅 Achievement: ${a.name}! +$${a.cash}`); sfx.playCoin(); }, 600 + (shared.achDelay += 650));
    setTimeout(() => { shared.achDelay = Math.max(0, shared.achDelay - 650); }, 8000);
  });
  if (got) { saveGame(); updateHUD(); }
}
export function recordCatchProgress(c, isNewSpecies, isNewRecord) {
  const cat = c.item.category, isFish = cat === 'Fish';
  if (c.isBoss) {
    const bonus = 500 * c.zoneObj.id;
    shared.state.cash = +(shared.state.cash + bonus).toFixed(2);
    bumpStat('bossCatches'); bumpStat('earned', bonus); addXp(150);
    { const T = town(); T.bosses.push({ id: c.item.id, w: +c.weight.toFixed(2), zone: c.zoneObj.id, day: shared.state.dayCount || 0, boss: true }); if (T.bosses.length > 10) T.bosses.shift(); }
    seaEvents.clearBoss();
    setTimeout(() => showToast(`👑 BOSS DEFEATED! +$${bonus.toLocaleString()} bonus`), 900);
  }
  bumpStat('catches'); bumpStat(isFish ? 'fish' : 'junk');
  if (isFish && c.item.rarity === 'Legendary') bumpStat('legendary');
  if (isNightTime()) bumpStat('nightCatches');
  if (shared.state.weather === 'STORM') bumpStat('stormCatches');
  if (c.inFrenzy) bumpStat('frenzyCatches');
  let xp = isFish ? (RARITY_XP[c.item.rarity] || 4) : (cat === 'Flora' ? 2 : 1);
  if (isFish) xp += Math.min(40, Math.floor(c.weight * 0.4));
  if (isNewSpecies) xp += 30;
  if (isNewRecord) xp += 10;
  addXp(xp);
  checkAchievements();
}
let marketCache = { day: -1, mult: {}, hot: [], glut: [] };
/* a seeded random sequence: the same seed always gives the same numbers (market, Catch of the Day) */
function mulberry32(a) { return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function marketFor(day) {
  if (marketCache.day === day) return marketCache;
  const rnd = mulberry32((Math.imul(day + 1, 2654435761) ^ 0x9e3779b9) >>> 0);
  const mult = {};
  CATCH_CATALOG.forEach(c => { mult[c.id] = c.category === 'Fish' ? 0.75 + rnd() * 0.6 : 1; });
  const pool = [...MARKET_FISH], hot = [], glut = [];
  for (let i = 0; i < 3; i++) hot.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  for (let i = 0; i < 3; i++) glut.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  hot.forEach(id => { mult[id] = 1.9; });
  glut.forEach(id => { mult[id] = 0.6; });
  marketCache = { day, mult, hot, glut };
  return marketCache;
}
export const marketMult = id => marketFor(shared.state.dayCount || 0).mult[id] || 1;
export const sellValue = entry => Math.max(1, Math.round(entry.value * marketMult(entry.id) * (1 + (entry.category === 'Fish' ? bookBonus('fishPrice') : (entry.category === 'Junk' || entry.category === 'Flora') ? bookBonus('junkPrice') : 0)) * (entry.category === 'Flora' && friendPerk('talia') ? 1.2 : 1)));

/* ---- Catch of the Day and the daily streak: both keyed on the real calendar date (local time) ---- */
export function todayNum() { const d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
const COD_WEIGHT = { Common: 3, Uncommon: 3, Rare: 2, Epic: 1, Legendary: 0.4 };
let codCache = { day: -1, item: null };
export function catchOfDay(day = todayNum()) {
  if (codCache.day === day) return codCache.item;
  const rnd = mulberry32((Math.imul(day + 7, 2246822519) ^ 0x85ebca6b) >>> 0);
  const pool = MARKET_FISH.map(id => CATALOG_INDEX[id]).filter(Boolean);
  const tot = pool.reduce((t, c) => t + (COD_WEIGHT[c.rarity] || 1), 0);
  let r = rnd() * tot, item = pool[0];
  for (const c of pool) { r -= COD_WEIGHT[c.rarity] || 1; if (r <= 0) { item = c; break; } }
  codCache = { day, item };
  return item;
}
function streakReward(n) {
  const r = { cash: 10 + 10 * Math.min(n, 7), bait: null };
  const k = n % 7;
  if (k === 3) r.bait = { tier: 2, qty: 5 };
  else if (k === 5) r.bait = { tier: 3, qty: 5 };
  else if (k === 0) { r.bait = { tier: 4, qty: 3 }; r.cash += 50; }
  return r;
}
/* Called when the game starts and when the tab comes back: a new calendar day pays the streak reward once. */
export function checkDailyStreak() {
  if (!shared.state.daily) shared.state.daily = { day: 0, streak: 0, best: 0, codDay: 0, codCount: 0 };
  const dl = shared.state.daily, today = todayNum();
  if (dl.day === today) return;
  if (dl.day > today) { dl.day = today; return; }               // clock went backwards: no reward, no reset
  dl.streak = (dl.day > 0 && today - dl.day === 1) ? dl.streak + 1 : 1;
  dl.best = Math.max(dl.best, dl.streak);
  dl.day = today;
  const r = streakReward(dl.streak);
  shared.state.cash = +(shared.state.cash + r.cash).toFixed(2);
  if (r.bait) shared.state.baitStock[r.bait.tier] = (shared.state.baitStock[r.bait.tier] || 0) + r.bait.qty;
  saveGame();
  updateHUD();
  const baitTxt = r.bait ? ` and ${r.bait.qty}x ${BAIT_TIERS[r.bait.tier - 1].name}` : '';
  setTimeout(() => showToast(`🔥 Day ${dl.streak} fishing streak! +$${r.cash}${baitTxt}`), 900);
  setTimeout(() => showToast(`⭐ Catch of the Day: ${catchOfDay().name} pays x3 today`), 2400);
}
export function dailyLine(onStart) {
  const cod = catchOfDay(), dl = shared.state.daily || {};
  const streak = dl.streak > 0 ? ` &middot; 🔥 Streak: <b>${dl.streak}</b> day${dl.streak === 1 ? '' : 's'}${dl.best > dl.streak ? ` (best ${dl.best})` : ''}` : '';
  const zones = cod.zones && cod.zones.length ? ` <span style="color:var(--text-2);">(zone ${cod.zones.join('/')})</span>` : '';
  return `⭐ Catch of the Day: <b>${cod.name}</b>${zones} pays <b>x3</b>${onStart && !shared.hadSavedGame ? '' : streak}`;
}

export function init() {
  /* ---- Daily market: prices come from the day number, so every player sees the same board and nothing is saved ---- */
  MARKET_FISH = CATCH_CATALOG.filter(c => c.category === 'Fish' && !c.fullMoonOnly && !c.stormOnly).map(c => c.id);
}
