/* sanitizeSave: validates and clamps every field of a loaded save. Kept whole (one long function). */
import { BAIT_TIERS, BOAT_MODULES, BOAT_TIERS, BUCKET_TIERS, ROD_TIERS } from '../data/equipment.js';
import { CATCH_CATALOG, DIVE_GEAR, SPEAR_GUNS, WEATHER_TYPES } from '../data/catalog.js';
import { BOTTLE_MESSAGES } from '../data/bottles-bounties.js';
import { AnglerFactory } from '../angler/angler-factory.js';
import { BUOY_KINDS, BUOY_MAX } from '../data/townsfolk.js';
import { cleanName } from '../data/recipes.js';
import { bountyEligible, bountyReach, pickBounties } from '../fishing/bounties.js';
import { sanitizeAquarium } from '../town/aquarium-care.js';
import { BOOKS, BOOKS_V, sanitizeBooks } from '../town/books.js';
import { ACHIEVEMENTS, CATALOG_INDEX, RANKS, RARITY_XP, STAT_KEYS, rankIndexFor } from './career.js';
import { defaultSaveState } from './defaults.js';
import { SAVE_VERSION } from './queries.js';
import { sanitizeStory } from '../town/story.js';
import { sanitizeKitchen } from '../town/restaurant.js';
import { sanitizeTown } from '../town/town-state.js';

// Coerce every field of a parsed save to a safe type/range so a corrupted or hand-edited
// save can never crash the game; unknown or invalid fields fall back to defaults.
export function sanitizeSave(raw) {
  const def = defaultSaveState();
  const src = raw && typeof raw === 'object' ? raw : {};
  const num = (v, d, min, max) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d;
  };
  const int = (v, d, min, max) => Math.round(num(v, d, min, max));
  const out = { ...def };

  out.cash = +num(src.cash, def.cash, 0, 1e9).toFixed(2);
  out.anglerGender = src.anglerGender === 'female' ? 'female' : 'male';
  out.boatTier = int(src.boatTier, 0, 0, BOAT_TIERS.length - 1);
  out.rodTier = int(src.rodTier, 1, 1, ROD_TIERS.length);
  out.diveTier = int(src.diveTier, 0, 0, DIVE_GEAR.length - 1);
  out.spearTier = int(src.spearTier, 0, 0, SPEAR_GUNS.length - 1);
  out.bucketTier = int(src.bucketTier, 1, 1, BUCKET_TIERS.length);
  out.baitTier = int(src.baitTier, 1, 1, BAIT_TIERS.length);
  out.baitCount = int(src.baitCount, 0, 0, 9999);
  out.hasLiveBaitCam = !!src.hasLiveBaitCam;
  out.galleryRewardClaimed = !!src.galleryRewardClaimed;
  out.fuel = num(src.fuel, 0, 0, BOAT_TIERS[out.boatTier].maxFuel);
  // the fleet: every boat bought (older saves owned every tier up to the one they sailed, as the shop showed)
  out.ownedBoats = Array.isArray(src.ownedBoats)
    ? [...new Set(src.ownedBoats.map(Number).filter(t => Number.isInteger(t) && t >= 1 && t < BOAT_TIERS.length))].sort((a, b) => a - b)
    : BOAT_TIERS.filter(b => b.tier >= 1 && b.tier <= out.boatTier).map(b => b.tier);
  if (out.boatTier > 0 && !out.ownedBoats.includes(out.boatTier)) { out.ownedBoats.push(out.boatTier); out.ownedBoats.sort((a, b) => a - b); }
  out.boatFuel = {};
  out.ownedBoats.forEach(t => {
    const f = src.boatFuel && typeof src.boatFuel === 'object' ? src.boatFuel[t] : undefined;
    out.boatFuel[t] = t === out.boatTier ? out.fuel : num(f, BOAT_TIERS[t].maxFuel, 0, BOAT_TIERS[t].maxFuel);
  });
  out.dayCount = int(src.dayCount, 0, 0, 1e6);
  out.timeOfDay = num(src.timeOfDay, def.timeOfDay, 0, 1);
  out.weather = WEATHER_TYPES.some(w => w.id === src.weather) ? src.weather : 'CLEAR';
  out.junkRecycledKg = num(src.junkRecycledKg, 0, 0, 1e9);
  out.mayorRewardsClaimed = int(src.mayorRewardsClaimed, 0, 0, 1e6);
  out.vfxShader = typeof src.vfxShader === 'string' ? src.vfxShader : 'none';
  const dl = src.daily && typeof src.daily === 'object' ? src.daily : {};
  out.daily = { day: int(dl.day, 0, 0, 1e7), streak: int(dl.streak, 0, 0, 1e5), best: int(dl.best, 0, 0, 1e5), codDay: int(dl.codDay, 0, 0, 1e7), codCount: int(dl.codCount, 0, 0, 1e7) };
  out.daily.best = Math.max(out.daily.best, out.daily.streak);

  out.baitStock = { 2: 0, 3: 0, 4: 0 };
  if (src.baitStock && typeof src.baitStock === 'object') {
    for (const t of [2, 3, 4]) out.baitStock[t] = int(src.baitStock[t], 0, 0, 9999);
  }
  if (out.baitTier > 1 && out.baitCount > 0 && !out.baitStock[out.baitTier]) {
    out.baitStock[out.baitTier] = out.baitCount;
  }

  const knownIds = new Set(CATCH_CATALOG.map(c => c.id));
  out.discovered = Array.isArray(src.discovered)
    ? [...new Set(src.discovered.filter(id => knownIds.has(id)))] : [];
  out.foundMessages = Array.isArray(src.foundMessages)
    ? [...new Set(src.foundMessages.filter(id => BOTTLE_MESSAGES.some(m => m.id === id)))] : [];
  out.seenSpecies = Array.isArray(src.seenSpecies)
    ? [...new Set(src.seenSpecies.filter(id => knownIds.has(id)))] : [];
  out.modules = Array.isArray(src.modules)
    ? [...new Set(src.modules.filter(id => BOAT_MODULES.some(m => m.id === id)))] : [];

  out.bucket = Array.isArray(src.bucket)
    ? src.bucket.filter(e => e && typeof e === 'object' && knownIds.has(e.id) && Number.isFinite(Number(e.weight)) && Number.isFinite(Number(e.value)))
        .map(e => ({ ...e, weight: Number(e.weight), value: Number(e.value) }))
    : [];

  out.speciesStats = {};
  if (src.speciesStats && typeof src.speciesStats === 'object') {
    for (const id of Object.keys(src.speciesStats)) {
      const st = src.speciesStats[id];
      if (knownIds.has(id) && st && typeof st === 'object') {
        out.speciesStats[id] = { ...st, count: int(st.count, 0, 0, 1e9), maxWeight: num(st.maxWeight, 0, 0, 1e6) };
      }
    }
  }

  // career: xp, counters and achievements (old saves get their counters rebuilt from the species records)
  out.stats = {};
  STAT_KEYS.forEach(k => { out.stats[k] = num(src.stats && src.stats[k], 0, 0, 1e12); });
  if (!src.stats || typeof src.stats !== 'object') {
    let xp0 = 0;
    Object.keys(out.speciesStats).forEach(id => {
      const it = CATALOG_INDEX[id], n = out.speciesStats[id].count;
      if (!it) return;
      out.stats.catches += n;
      if (it.category === 'Fish') { out.stats.fish += n; xp0 += n * (RARITY_XP[it.rarity] || 4); if (it.rarity === 'Legendary') out.stats.legendary += n; } else { out.stats.junk += n; xp0 += n; }
    });
    out.stats.maxZone = Math.max(1, out.boatTier ? Math.min(4, out.boatTier + 1) : 1);
    if (src.xp === undefined) out.xp = Math.min(1e9, xp0);
  }
  out.xp = src.xp === undefined ? out.xp : int(src.xp, 0, 0, 1e9);
  out.achievements = Array.isArray(src.achievements) ? [...new Set(src.achievements.filter(id => ACHIEVEMENTS.some(a => a.id === id)))] : [];
  out.rankClaimed = Math.min(rankIndexFor(out.xp), int(src.rankClaimed, rankIndexFor(out.xp), 0, RANKS.length - 1));
  if (src.rankClaimed === undefined) out.rankClaimed = rankIndexFor(out.xp);

  // Old saves: everything already discovered counts as seen (no flood of NEW badges)
  if (!Array.isArray(src.seenSpecies)) out.seenSpecies = [...out.discovered];

  out.bounties = Array.isArray(src.bounties)
    ? src.bounties.filter(b => b && typeof b === 'object' && Number.isFinite(Number(b.target)) && Number.isFinite(Number(b.rewardCash)))
    : [];
  {
    const reach = bountyReach(out);
    const kept = out.bounties.filter(b => Number(b.progress) > 0 || bountyEligible(b, reach));
    const want = Math.max(3, Math.min(out.bounties.length, 3));
    out.bounties = kept.concat(pickBounties(out, Math.max(0, want - kept.length), kept));
  }

  out.aquarium = sanitizeAquarium(src.aquarium);
  out.books = sanitizeBooks(src.books, src.booksV);
  out.booksV = BOOKS_V;
  out.bookSel = typeof src.bookSel === 'string' && BOOKS[src.bookSel] ? src.bookSel : null;
  out.story = sanitizeStory(src.story);
  out.kitchen = sanitizeKitchen(src.kitchen);
  out.town = sanitizeTown(src.town);
  {   // rigs and buoys (v6.5.0)
    const r = src.rig && typeof src.rig === 'object' ? src.rig : {};
    const owned = [...new Set((Array.isArray(r.owned) ? r.owned : []).filter(id => id === 'popper' || id === 'jig'))];
    out.rig = { owned, eq: owned.includes(r.eq) ? r.eq : null, chum: Math.max(0, Math.min(99, Math.floor(Number(r.chum)) || 0)) };
    out.buoys = (Array.isArray(src.buoys) ? src.buoys : []).filter(b => b && BUOY_KINDS[b.k] && Number.isFinite(+b.x) && Number.isFinite(+b.z))
      .slice(0, BUOY_MAX).map(b => ({ k: b.k, x: Math.max(-400, Math.min(400, +b.x)), z: Math.max(-2500, Math.min(0, +b.z)) }));
  }
  out.playerName = cleanName(src.playerName);

  // appearance: sanitised against the option lists; the look's gender is the source of truth
  out.look = AnglerFactory.sanitizeLook(src.look, out.anglerGender);
  if (!src.look) out.look.gender = out.anglerGender;
  out.anglerGender = out.look.gender;
  out.saveVersion = SAVE_VERSION;
  return out;
}
