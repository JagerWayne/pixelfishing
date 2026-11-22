/* Career: stats, ranks, rewards, medals, achievements and XP. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { CATCH_CATALOG } from '../data/catalog.js';
import { BOTTLE_MESSAGES } from '../data/bottles-bounties.js';
import { aquaTankOf, aquaUsed } from '../town/aquarium.js';
import { showToast } from '../ui/toasts.js';

export let FISH_TOTAL, ACHIEVEMENTS;

/* =========================================================================
   CAREER (XP, ranks, achievements) AND THE DAILY FISH MARKET
   ========================================================================= */
export const STAT_KEYS = ['catches', 'fish', 'junk', 'legendary', 'nightCatches', 'stormCatches', 'frenzyCatches', 'treasures', 'bossCatches',
  'earned', 'metersSailed', 'bountiesClaimed', 'maxZone', 'dives', 'speared', 'maxDive', 'diveSeconds', 'diveChests'];
export const CATALOG_INDEX = {};
export const RANKS = [
  { xp: 0, name: 'Deckhand' }, { xp: 60, name: 'Angler' }, { xp: 160, name: 'Harbor Regular' }, { xp: 320, name: 'Reef Runner' },
  { xp: 560, name: 'Shelf Skipper' }, { xp: 900, name: 'Deep Hand' }, { xp: 1400, name: 'Trench Hunter' }, { xp: 2100, name: 'Captain' },
  { xp: 3000, name: 'Commodore' }, { xp: 4200, name: 'Admiral' }, { xp: 5800, name: 'Sea Master' }, { xp: 8000, name: 'Sea Legend' }
];
export const RARITY_XP = { Common: 4, Uncommon: 8, Rare: 18, Epic: 40, Legendary: 100 };
export function rankIndexFor(xp) { let r = 0; RANKS.forEach((k, i) => { if (xp >= k.xp) r = i; }); return r; }
export function rankReward(idx) { return { cash: 50 * idx, baitTier: Math.min(4, 1 + Math.ceil(idx / 3)), baitQty: 5 }; }

/* Medal for a species record: gold at 90% of the species' top weight, silver at 70%, bronze otherwise */
export function medalFor(id) {
  const it = CATALOG_INDEX[id], st = shared.state.speciesStats && shared.state.speciesStats[id];
  if (!it || it.category !== 'Fish' || !st || !st.count) return null;
  const r = st.maxWeight / it.maxW;
  return r >= 0.9 ? 'gold' : r >= 0.7 ? 'silver' : 'bronze';
}
const fishDiscovered = () => shared.state.discovered.filter(id => CATALOG_INDEX[id] && CATALOG_INDEX[id].category === 'Fish').length;
const medalCount = min => Object.keys(shared.state.speciesStats || {}).filter(id => { const m = medalFor(id); return m === 'gold' || (min === 'silver' && m === 'silver'); }).length;
export const stat = k => (shared.state.stats && shared.state.stats[k]) || 0;

export function bumpStat(key, n = 1) {
  if (!shared.state.stats) shared.state.stats = {};
  shared.state.stats[key] = (shared.state.stats[key] || 0) + n;
}
export function addXp(n) {
  n = Math.round(n);
  if (!(n > 0)) return;
  shared.state.xp = (shared.state.xp || 0) + n;
  const idx = rankIndexFor(shared.state.xp);
  let delay = 500;
  while ((shared.state.rankClaimed || 0) < idx) {
    shared.state.rankClaimed = (shared.state.rankClaimed || 0) + 1;
    const r = rankReward(shared.state.rankClaimed), name = RANKS[shared.state.rankClaimed].name;
    shared.state.cash = +(shared.state.cash + r.cash).toFixed(2);
    shared.state.baitStock[r.baitTier] = (shared.state.baitStock[r.baitTier] || 0) + r.baitQty;
    if (shared.state.baitTier === r.baitTier) shared.state.baitCount = shared.state.baitStock[r.baitTier];
    setTimeout(() => { showToast(`🎖️ RANK UP: ${name}! +$${r.cash} and ${r.baitQty} bait`); sfx.playCatchFanfare(false); }, delay);
    delay += 700;
  }
}
shared.achDelay = 0;

export function init() {
  CATCH_CATALOG.forEach(c => { CATALOG_INDEX[c.id] = c; });
  FISH_TOTAL = CATCH_CATALOG.filter(c => c.category === 'Fish').length;
  ACHIEVEMENTS = [
    { id: 'first_catch', icon: '🎣', name: 'First Catch', desc: 'Land your first catch.', goal: 1, prog: () => stat('catches'), cash: 10 },
    { id: 'catches_10', icon: '🪝', name: 'Dock Regular', desc: 'Make 10 catches.', goal: 10, prog: () => stat('catches'), cash: 25 },
    { id: 'catches_100', icon: '🐟', name: 'Century Angler', desc: 'Make 100 catches.', goal: 100, prog: () => stat('catches'), cash: 150 },
    { id: 'catches_500', icon: '🏆', name: 'Net Result', desc: 'Make 500 catches.', goal: 500, prog: () => stat('catches'), cash: 800 },
    { id: 'species_5', icon: '📗', name: 'Naturalist', desc: 'Discover 5 fish species.', goal: 5, prog: fishDiscovered, cash: 50 },
    { id: 'species_25', icon: '📘', name: 'Field Guide', desc: 'Discover 25 fish species.', goal: 25, prog: fishDiscovered, cash: 300 },
    { id: 'species_all', icon: '📕', name: 'Completionist', desc: 'Discover every fish species.', goal: FISH_TOTAL, prog: fishDiscovered, cash: 2000 },
    { id: 'legend_1', icon: '🐉', name: 'Legend of the Deep', desc: 'Land a Legendary fish.', goal: 1, prog: () => stat('legendary'), cash: 200 },
    { id: 'legend_5', icon: '🌊', name: 'Myth Hunter', desc: 'Land 5 Legendary fish.', goal: 5, prog: () => stat('legendary'), cash: 1000 },
    { id: 'night_20', icon: '🦉', name: 'Night Owl', desc: 'Make 20 catches at night.', goal: 20, prog: () => stat('nightCatches'), cash: 150 },
    { id: 'storm_10', icon: '⛈️', name: 'Storm Chaser', desc: 'Make 10 catches in a storm.', goal: 10, prog: () => stat('stormCatches'), cash: 200 },
    { id: 'frenzy_10', icon: '🔥', name: 'Frenzy Fisher', desc: 'Make 10 catches inside a feeding frenzy.', goal: 10, prog: () => stat('frenzyCatches'), cash: 200 },
    { id: 'recycle_100', icon: '♻️', name: 'Recycler', desc: 'Recycle 100 kg of junk.', goal: 100, prog: () => Math.floor(shared.state.junkRecycledKg || 0), cash: 200 },
    { id: 'bottles_10', icon: '📜', name: 'Message Reader', desc: 'Collect 10 message bottles.', goal: 10, prog: () => (shared.state.foundMessages || []).length, cash: 150 },
    { id: 'bottles_all', icon: '🍾', name: 'Archivist', desc: 'Collect every message bottle.', goal: BOTTLE_MESSAGES.length, prog: () => (shared.state.foundMessages || []).length, cash: 500 },
    { id: 'bounty_5', icon: '📋', name: 'Contractor', desc: 'Claim 5 bounties.', goal: 5, prog: () => stat('bountiesClaimed'), cash: 100 },
    { id: 'bounty_25', icon: '🎯', name: 'Bounty Hunter', desc: 'Claim 25 bounties.', goal: 25, prog: () => stat('bountiesClaimed'), cash: 600 },
    { id: 'earn_1k', icon: '💵', name: 'Pocket Money', desc: 'Earn $1,000 in total.', goal: 1000, prog: () => stat('earned'), cash: 50 },
    { id: 'earn_10k', icon: '💰', name: 'Small Business', desc: 'Earn $10,000 in total.', goal: 10000, prog: () => stat('earned'), cash: 300 },
    { id: 'earn_50k', icon: '🏦', name: 'Fish Tycoon', desc: 'Earn $50,000 in total.', goal: 50000, prog: () => stat('earned'), cash: 2000 },
    { id: 'sail_5k', icon: '⛵', name: 'Sailor', desc: 'Sail 5 km.', goal: 5000, prog: () => stat('metersSailed'), cash: 100 },
    { id: 'sail_20k', icon: '🧭', name: 'Navigator', desc: 'Sail 20 km.', goal: 20000, prog: () => stat('metersSailed'), cash: 400 },
    { id: 'zone_2', icon: '🪸', name: 'Reef Explorer', desc: 'Sail into the Coastal Reef.', goal: 2, prog: () => stat('maxZone'), cash: 60 },
    { id: 'zone_3', icon: '🌅', name: 'Shelf Explorer', desc: 'Sail into the Open Shelf.', goal: 3, prog: () => stat('maxZone'), cash: 150 },
    { id: 'zone_4', icon: '🕳️', name: 'Trench Explorer', desc: 'Sail into the Abyssal Trench.', goal: 4, prog: () => stat('maxZone'), cash: 400 },
    { id: 'zone_5', icon: '🌌', name: 'Rift Pioneer', desc: 'Sail into the Mariana Rift.', goal: 5, prog: () => stat('maxZone'), cash: 1500 },
    { id: 'treasure_1', icon: '🪙', name: 'Treasure Hunter', desc: 'Find a floating treasure chest.', goal: 1, prog: () => stat('treasures'), cash: 100 },
    { id: 'treasure_10', icon: '🏴‍☠️', name: 'Pirate King', desc: 'Find 10 treasure chests.', goal: 10, prog: () => stat('treasures'), cash: 800 },
    { id: 'boss_1', icon: '🦑', name: 'Boss Slayer', desc: 'Land a boss fish.', goal: 1, prog: () => stat('bossCatches'), cash: 1000 },
    { id: 'trophy_10', icon: '🥇', name: 'Trophy Collector', desc: 'Hold silver or gold records for 10 species.', goal: 10, prog: () => medalCount('silver'), cash: 400 },
    { id: 'aqua_1', icon: '🐠', name: 'Fish Keeper', desc: 'Put a fish in your aquarium.', goal: 1, prog: () => (shared.state.aquarium ? shared.state.aquarium.kept.length : 0), cash: 60 },
    { id: 'aqua_5', icon: '🪸', name: 'Reef Keeper', desc: 'Keep 5 different species in your aquarium.', goal: 5, prog: () => (shared.state.aquarium ? shared.state.aquarium.kept.length : 0), cash: 250 },
    { id: 'aqua_10', icon: '🐡', name: 'Aquarist', desc: 'Keep 10 different species in your aquarium.', goal: 10, prog: () => (shared.state.aquarium ? shared.state.aquarium.kept.length : 0), cash: 900 },
    { id: 'aqua_full', icon: '🫧', name: 'Full House', desc: 'Fill your aquarium to 90% of its room.', goal: 1, prog: () => (shared.state.aquarium && aquaUsed(shared.state.aquarium) >= aquaTankOf(shared.state.aquarium).cap * 0.9 ? 1 : 0), cash: 300 },
    { id: 'aqua_fry', icon: '🐣', name: 'Fish Breeder', desc: 'Have fry hatch in your aquarium.', goal: 1, prog: () => (shared.state.aquarium ? Math.min(1, shared.state.aquarium.bred) : 0), cash: 200 },
    { id: 'aqua_form', icon: '🌟', name: 'Rare Colour', desc: 'Breed a golden, albino or midnight fish.', goal: 1, prog: () => (shared.state.aquarium ? Math.min(1, shared.state.aquarium.forms.length) : 0), cash: 500 },
    { id: 'rank_6', icon: '🎖️', name: 'Seasoned', desc: 'Reach the rank of Trench Hunter.', goal: 6, prog: () => rankIndexFor(shared.state.xp), cash: 250 },
    { id: 'rank_12', icon: '👑', name: 'Sea Legend', desc: 'Reach the top rank.', goal: 11, prog: () => rankIndexFor(shared.state.xp), cash: 1500 },
    { id: 'dive_1', icon: '🤿', name: 'First Plunge', desc: 'Make your first dive.', goal: 1, prog: () => stat('dives'), cash: 40 },
    { id: 'dive_25', icon: '🫧', name: 'Regular Diver', desc: 'Make 25 dives.', goal: 25, prog: () => stat('dives'), cash: 300 },
    { id: 'spear_10', icon: '🔱', name: 'Spearfisher', desc: 'Spear 10 fish.', goal: 10, prog: () => stat('speared'), cash: 80 },
    { id: 'spear_100', icon: '🦈', name: 'Harpoon Hunter', desc: 'Spear 100 fish.', goal: 100, prog: () => stat('speared'), cash: 700 },
    { id: 'depth_30', icon: '🌊', name: 'Deep Diver', desc: 'Dive to 30 m.', goal: 30, prog: () => Math.floor(stat('maxDive')), cash: 300 },
    { id: 'depth_100', icon: '🕳️', name: 'Abyss Walker', desc: 'Dive to 100 m.', goal: 100, prog: () => Math.floor(stat('maxDive')), cash: 1500 },
    { id: 'seabed_chest', icon: '🧰', name: 'Wreck Raider', desc: 'Open 5 sunken chests.', goal: 5, prog: () => stat('diveChests'), cash: 400 }
  ];
}
