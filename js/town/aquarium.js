/* The aquarium: forms, decor, what fits, charm and income, and the daily upkeep. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { AQUARIUM_TANKS } from '../world/layout.js';
import { bookBonus } from './books.js';
import { CATALOG_INDEX } from '../save/career.js';
import { checkAchievements } from '../fishing/market.js';
import { getBucketCapacity, getBucketWeight, saveGame } from '../save/save-game.js';
import { rebuildPierBucketVisual } from '../boat/terminal.js';
import { showToast } from '../ui/toasts.js';
import { updateHUD } from '../ui/hud.js';

export let AQUARIUM_MAX_W;

export const AQUARIUM_FORMS = {
  normal: { name: '', mult: 1 }, golden: { name: 'Golden', mult: 2, tint: 0xffd24c },
  albino: { name: 'Albino', mult: 2, tint: 0xfff3f0 }, midnight: { name: 'Midnight', mult: 3, tint: 0x3b4a8f }
};
export const AQUARIUM_DECOR = [
  { id: 'plants', name: 'Water Plants', icon: '🌿', cost: 60, charm: 4, desc: 'Swaying green plants.' },
  { id: 'rocks', name: 'Rock Pile', icon: '🪨', cost: 80, charm: 3, desc: 'A pile of smooth rocks to hide behind.' },
  { id: 'driftwood', name: 'Driftwood', icon: '🪵', cost: 120, charm: 4, desc: 'A bleached branch.' },
  { id: 'coral', name: 'Coral Garden', icon: '🪸', cost: 260, charm: 8, desc: 'Branching pink coral.' },
  { id: 'castle', name: 'Sand Castle', icon: '🏰', cost: 340, charm: 9, desc: 'A tiny castle with a flag.' },
  { id: 'chest', name: 'Treasure Chest', icon: '🧰', cost: 420, charm: 10, desc: 'A chest that opens now and then.' },
  { id: 'wreck', name: 'Mini Shipwreck', icon: '🚢', cost: 700, charm: 14, desc: 'A little wreck on its side.' },
  { id: 'lights', name: 'Light Show', icon: '✨', cost: 900, charm: 12, desc: 'Colour-changing glow ring.' }
];
export const aquaLoad = w => Math.max(1, Math.pow(w, 0.8));
export function defaultAquarium() { return { tier: 1, fish: [], food: 80, clean: 80, decor: [], stored: [], pellets: 0, kits: 0, cleanBoost: 0, tickets: 0, lastDay: 0, kept: [], bred: 0, forms: [], released: {} }; }
export const aquaTankOf = aq => AQUARIUM_TANKS[Math.max(1, Math.min(AQUARIUM_TANKS.length, aq.tier || 1)) - 1];
export const aquaUsed = aq => aq.fish.reduce((s, f) => s + aquaLoad(f.w), 0);
/* can this bucket fish (or { category, weight }) go into the tank? -> { ok, reason } */
export function aquariumCanHold(entry, aq) {
  aq = aq || shared.state.aquarium;
  if (!entry || entry.category !== 'Fish') return { ok: false, reason: 'Only fish go in an aquarium.' };
  const w = Number(entry.weight !== undefined ? entry.weight : entry.w);
  if (!(w > 0)) return { ok: false, reason: 'No weight.' };
  if (w > AQUARIUM_MAX_W) return { ok: false, reason: `Too big for any tank (max ${AQUARIUM_MAX_W} kg).` };
  const t = aquaTankOf(aq);
  if (w > t.maxW) return { ok: false, reason: `Too big for this tank (max ${t.maxW} kg).` };
  if (aquaUsed(aq) + aquaLoad(w) > t.cap + 1e-6) return { ok: false, reason: 'Tank full.' };
  return { ok: true, reason: '' };
}
const aquaCharm = aq => Math.min(25, aq.decor.reduce((s, id) => s + ((AQUARIUM_DECOR.find(d => d.id === id) || {}).charm || 0), 0));
export function aquaHappy(aq) {
  const species = new Set(aq.fish.map(f => f.id)).size;
  return Math.round(Math.max(0, Math.min(100, aq.food * 0.4 + aq.clean * 0.4 + aquaCharm(aq) * 0.6 + Math.min(10, species * 2))));
}
/* money earned per in-game day: the fishes' values x form x mood x a small collection bonus (0 while unhappy) */
export function aquaIncome(aq) {
  const h = aquaHappy(aq);
  if (h < 35) return 0;
  const base = aq.fish.reduce((s, f) => s + (f.v || 1) * 0.12 * (AQUARIUM_FORMS[f.form] || AQUARIUM_FORMS.normal).mult, 0);
  return +(base * (h / 100) * (1 + 0.03 * aq.kept.length) * (1 + bookBonus('aquaTickets'))).toFixed(2);
}
export const aquaBankCap = aq => Math.max(30, aquaIncome(aq) * 8);
/* once per in-game day (from the day-night cycle): income, hunger and dirt, fry growing, breeding */
export function aquariumDay() {
  const aq = shared.state.aquarium; if (!aq) return;
  const tank = aquaTankOf(aq);
  aq.tickets = +Math.min(aquaBankCap(aq), aq.tickets + aquaIncome(aq)).toFixed(2);
  const load = aquaUsed(aq);
  aq.food = Math.max(0, aq.food - (10 + load * 0.5));
  aq.clean = Math.max(0, aq.clean - (7 + load * 0.45) * (aq.cleanBoost > 0 ? 0.5 : 1));
  if (aq.cleanBoost > 0) aq.cleanBoost--;
  aq.fish.forEach(f => {   // fry grow up, never past what the tank can hold
    if (!f.g) return;
    const it = CATALOG_INDEX[f.id]; if (!it) { f.g = 0; return; }
    const avg = (it.minW + it.maxW) / 2, tw = Math.min(avg, tank.maxW);
    f.w = Math.min(tw, +(f.w * 1.3).toFixed(3));
    f.v = Math.max(1, Math.round(it.value * Math.min(1, f.w / avg)));
    if (f.w >= tw - 1e-6) f.g = 0;
  });
  if (aquaHappy(aq) >= 60) {   // two or more grown fish of a species, kept happy, may have fry
    const groups = {};
    aq.fish.forEach(f => { if (!f.g) (groups[f.id] = groups[f.id] || []).push(f); });
    Object.keys(groups).forEach(id => {
      const g = groups[id]; if (g.length < 2 || Math.random() > 0.4) return;
      const it = CATALOG_INDEX[id], w = Math.max(0.05, +Math.min(0.1, it.minW * 0.2).toFixed(3));
      if (aquaUsed(aq) + aquaLoad(w) > tank.cap + 1e-6) return;
      const par = g[Math.floor(Math.random() * g.length)];
      let form = 'normal';
      if (par.form !== 'normal' && Math.random() < 0.5) form = par.form;
      else if (Math.random() < 0.12) form = ['golden', 'albino', 'midnight'][Math.floor(Math.random() * 3)];
      aq.fish.push({ id, w, v: Math.max(1, Math.round(it.value * 0.3)), form, born: shared.state.dayCount || 0, g: 1 });
      aq.bred++;
      if (form !== 'normal' && !aq.forms.includes(form)) aq.forms.push(form);
      showToast(`🐟 ${AQUARIUM_FORMS[form].name ? AQUARIUM_FORMS[form].name + ' ' : ''}${it.name} fry hatched in your aquarium!`);
    });
  }
  aq.lastDay = shared.state.dayCount || 0;
  checkAchievements();
}
export function aquariumAdd(entry) {
  const aq = shared.state.aquarium, i = shared.state.bucket.indexOf(entry), c = aquariumCanHold(entry, aq);
  if (i < 0 || !c.ok) return false;
  shared.state.bucket.splice(i, 1);
  aq.fish.push({ id: entry.id, w: +Number(entry.weight).toFixed(3), v: Math.max(1, Math.floor(Number(entry.value) || 1)), form: 'normal', born: shared.state.dayCount || 0, g: 0 });
  if (!aq.kept.includes(entry.id)) aq.kept.push(entry.id);
  sfx.playTick(); saveGame(); rebuildPierBucketVisual(); checkAchievements(); updateHUD();
  showToast(`🐠 ${entry.name} is in your aquarium.`);
  return true;
}
export function aquariumTakeOut(i) {
  const aq = shared.state.aquarium, f = aq.fish[i]; if (!f) return false;
  const it = CATALOG_INDEX[f.id];
  if (getBucketWeight() + f.w > getBucketCapacity() + 0.001) { showToast('Not enough space in your bucket!'); return false; }
  aq.fish.splice(i, 1);
  shared.state.bucket.push({ uid: Date.now() + Math.random(), id: f.id, name: it.name, category: 'Fish', rarity: it.rarity, zoneName: 'Aquarium', weight: f.w, value: f.v, bottleMessageId: null });
  saveGame(); rebuildPierBucketVisual(); updateHUD();
  return true;
}
/* releasing a grown, tank-bred colour morph (golden, albino, midnight) to the sea raises the rare-fish odds in its home zone: +1.5% each, up to +15% (v6.4.0) */
export const RELEASE_STEP = 0.015, RELEASE_MAX = 10;

export function init() {
  /* =========================================================================
     AQUARIUM (v5.0.0): a living tank in the Cabin. Only fish go in, and every tank has a largest fish it can hold
     (AQUARIUM_MAX_W is the top tank's limit, so the big gamefish and deep monsters never fit in any tank) and a room
     limit. Fish eat and foul the water over in-game days, keep visitors happy and pay a ticket income, and can breed.
     ========================================================================= */
  AQUARIUM_MAX_W = AQUARIUM_TANKS[AQUARIUM_TANKS.length - 1].maxW;
}
