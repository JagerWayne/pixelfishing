/* The aquarium: releasing, feeding, cleaning, decorations, collecting, and save validation. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { ZONES } from '../data/catalog.js';
import { AQUARIUM_TANKS } from '../world/layout.js';
import { RELEASE_MAX_SAVE } from '../data/townsfolk.js';
import { AQUARIUM_DECOR, AQUARIUM_FORMS, RELEASE_MAX, RELEASE_STEP, aquaLoad, aquaTankOf, defaultAquarium } from './aquarium.js';
import { CATALOG_INDEX, bumpStat } from '../save/career.js';
import { saveGame } from '../save/save-game.js';
import { showToast } from '../ui/toasts.js';
import { shopMoney } from '../shop/shop-kinds.js';
import { updateHUD } from '../ui/hud.js';

export const releaseBonus = zid => Math.min(RELEASE_MAX, (shared.state.aquarium && shared.state.aquarium.released && shared.state.aquarium.released[zid]) || 0) * RELEASE_STEP;
export function aquariumRelease(i) {
  const aq = shared.state.aquarium, f = aq.fish[i]; if (!f) return false;
  aq.fish.splice(i, 1);
  if (f.form && f.form !== 'normal' && !f.g) {
    const z = (CATALOG_INDEX[f.id].zones || [1])[0];
    aq.released[z] = Math.min(RELEASE_MAX, (aq.released[z] || 0) + 1);
    showToast(`🌊 ${AQUARIUM_FORMS[f.form].name} ${CATALOG_INDEX[f.id].name} released: rare fish odds in ${ZONES[z - 1].name} now +${(releaseBonus(z) * 100).toFixed(1)}%.`);
  }
  saveGame(); return true;
}
export function aquariumFeed(premium) {
  const aq = shared.state.aquarium;
  if (premium) { if (aq.pellets < 1) return false; aq.pellets--; aq.food = 100; }
  else aq.food = Math.min(100, aq.food + 35);
  sfx.playTick(); saveGame(); updateHUD(); return true;
}
export function aquariumClean(deep) {
  const aq = shared.state.aquarium;
  if (deep) { if (aq.kits < 1) return false; aq.kits--; aq.cleanBoost = 3; }
  aq.clean = 100; sfx.playTick(); saveGame(); return true;
}
export const aquaDecorOwned = id => shared.state.aquarium.decor.includes(id) || shared.state.aquarium.stored.includes(id);
export function aquariumPlaceDecor(id) {
  const aq = shared.state.aquarium, d = AQUARIUM_DECOR.find(x => x.id === id), i = aq.stored.indexOf(id);
  if (!d || i < 0 || aq.decor.length >= aquaTankOf(aq).decor) return false;
  aq.stored.splice(i, 1); aq.decor.push(id); sfx.playTick(); saveGame();
  showToast(`${d.icon} ${d.name} placed in the tank.`); return true;
}
export function aquariumCollect() {
  const aq = shared.state.aquarium, got = Math.floor(aq.tickets * 100) / 100; if (got < 1) return false;
  shared.state.cash = +(shared.state.cash + got).toFixed(2); aq.tickets = 0; bumpStat('earned', got);
  sfx.playCoin(); saveGame(); updateHUD(); showToast(`🎟️ Collected ${shopMoney(got)} in visitor tickets.`);
  return true;
}
export function aquariumBuyDecor(id) {
  const aq = shared.state.aquarium, d = AQUARIUM_DECOR.find(x => x.id === id);
  if (!d || aquaDecorOwned(id) || shared.state.cash < d.cost) return false;
  shared.state.cash = +(shared.state.cash - d.cost).toFixed(2); sfx.playCoin();
  const room = aq.decor.length < aquaTankOf(aq).decor;
  (room ? aq.decor : aq.stored).push(id); saveGame(); updateHUD();
  showToast(room ? `${d.icon} ${d.name} placed in your tank.` : `${d.icon} ${d.name} bought. No free slot, so it is stored; place it from the tank's Decor tab.`); return true;
}
export function aquariumRemoveDecor(id) {
  const aq = shared.state.aquarium, d = AQUARIUM_DECOR.find(x => x.id === id), i = aq.decor.indexOf(id);
  if (!d || i < 0) return false;
  aq.decor.splice(i, 1); if (!aq.stored.includes(id)) aq.stored.push(id); sfx.playTick(); saveGame();
  showToast(`${d.icon} ${d.name} stored. You can place it again any time.`); return true;
}
export function sanitizeAquarium(src) {
  const aq = defaultAquarium();
  if (!src || typeof src !== 'object') return aq;
  const num = (v, d, lo, hi) => { v = Number(v); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
  aq.tier = Math.floor(num(src.tier, 1, 1, AQUARIUM_TANKS.length));
  const tank = AQUARIUM_TANKS[aq.tier - 1];
  let load = 0;
  (Array.isArray(src.fish) ? src.fish : []).forEach(f => {
    if (!f || typeof f !== 'object') return;
    const it = CATALOG_INDEX[f.id]; if (!it || it.category !== 'Fish') return;
    const w = num(f.w, 0, 0, 1e4);
    if (w < 0.02 || w > tank.maxW + 1e-6 || load + aquaLoad(w) > tank.cap + 1e-6) return;   // too big or too many: dropped
    load += aquaLoad(w);
    aq.fish.push({ id: f.id, w: +w.toFixed(3), v: Math.floor(num(f.v, it.value, 0, 1e6)), form: AQUARIUM_FORMS[f.form] ? f.form : 'normal', born: Math.floor(num(f.born, 0, 0, 1e6)), g: f.g ? 1 : 0 });
  });
  aq.food = num(src.food, 80, 0, 100); aq.clean = num(src.clean, 80, 0, 100);
  const okDecor = id => AQUARIUM_DECOR.some(d => d.id === id);
  const placed = [...new Set((Array.isArray(src.decor) ? src.decor : []).filter(okDecor))];
  aq.decor = placed.slice(0, tank.decor);
  aq.stored = [...new Set([...placed.slice(tank.decor), ...(Array.isArray(src.stored) ? src.stored : []).filter(okDecor)])].filter(id => !aq.decor.includes(id));
  aq.pellets = Math.floor(num(src.pellets, 0, 0, 999)); aq.kits = Math.floor(num(src.kits, 0, 0, 999)); aq.cleanBoost = Math.floor(num(src.cleanBoost, 0, 0, 30));
  aq.tickets = num(src.tickets, 0, 0, 1e6); aq.lastDay = Math.floor(num(src.lastDay, 0, 0, 1e6));
  aq.kept = [...new Set((Array.isArray(src.kept) ? src.kept : []).filter(id => CATALOG_INDEX[id] && CATALOG_INDEX[id].category === 'Fish'))];
  aq.bred = Math.floor(num(src.bred, 0, 0, 1e6));
  aq.forms = [...new Set((Array.isArray(src.forms) ? src.forms : []).filter(f => AQUARIUM_FORMS[f] && f !== 'normal'))];
  if (src.released && typeof src.released === 'object') ZONES.forEach(z => { const v = Math.floor(Number(src.released[z.id])); if (Number.isFinite(v) && v > 0) aq.released[z.id] = Math.min(RELEASE_MAX_SAVE, v); });
  return aq;
}
