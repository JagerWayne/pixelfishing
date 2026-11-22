/* The save key, moon phases, and bounty contracts chosen for what the player can reach. */
import { BOAT_TIERS, ROD_TIERS } from '../data/equipment.js';
import { CATCH_CATALOG } from '../data/catalog.js';
import { BOUNTY_POOL } from '../data/bottles-bounties.js';

/* =========================================================================
   SECTION H: PERSISTENT SAVE STATE & HELPER QUERIES
   ========================================================================= */
export const SAVE_KEY = 'pixel_fishing_save_v1';

export const MOON_PHASES = [
  { name: 'New Moon', icon: '🌑', shadowOffset: 1.5, isFull: false },
  { name: 'Waxing Crescent', icon: '🌒', shadowOffset: 5.5, isFull: false },
  { name: 'First Quarter', icon: '🌓', shadowOffset: 9.0, isFull: false },
  { name: 'Waxing Gibbous', icon: '🌔', shadowOffset: 13.0, isFull: false },
  { name: 'Full Moon', icon: '🌕', shadowOffset: 30.0, isFull: true },
  { name: 'Waning Gibbous', icon: '🌖', shadowOffset: -13.0, isFull: false },
  { name: 'Last Quarter', icon: '🌗', shadowOffset: -9.0, isFull: false },
  { name: 'Waning Crescent', icon: '🌘', shadowOffset: -5.5, isFull: false }
];

/* ---- Bounties are chosen for what the player can do right now (v4.10.0) ----
   reach: the farthest zone (the pier is zone 1, a boat adds its own maxZone) and the heaviest fish the rod is rated for. */
export function bountyReach(src) {
  const bt = Math.max(0, Math.min(BOAT_TIERS.length - 1, Math.floor(Number(src && src.boatTier)) || 0));
  const rt = Math.max(1, Math.min(ROD_TIERS.length, Math.floor(Number(src && src.rodTier)) || 1));
  return { zone: bt > 0 ? BOAT_TIERS[bt].maxZone : 1, rodW: ROD_TIERS[rt - 1].maxWeight };
}
export function bountyEligible(b, r) {
  if (!b || b.type === 'junk') return true;
  const fish = CATCH_CATALOG.filter(c => c.category === 'Fish' && !c.fullMoonOnly && !c.stormOnly && c.zones.some(z => z <= r.zone));
  if (b.type === 'zone_fish') return Number(b.zone) <= r.zone;
  if (b.type === 'min_weight') return Number(b.minW) <= r.rodW && fish.some(c => c.maxW >= Number(b.minW));
  if (b.type === 'rare_plus') return fish.filter(c => ['Rare', 'Epic', 'Legendary'].includes(c.rarity)).length >= (Number(b.target) >= 4 ? 8 : 3);   // enough rare species in reach to make the count fair
  return true;
}
/* how hard a contract is: the zone it needs (heavy fish: the shallowest zone that has one that big) */
function bountyLevel(b) {
  if (b.type === 'zone_fish') return Number(b.zone) || 1;
  if (b.type === 'rare_plus') return Number(b.target) >= 4 ? 3 : 2;
  if (b.type === 'min_weight') {
    const zs = CATCH_CATALOG.filter(c => c.category === 'Fish' && c.maxW >= Number(b.minW)).map(c => Math.min(...c.zones));
    return zs.length ? Math.min(...zs) : 1;
  }
  return 1;
}
/* pick `count` new contracts that fit the player and balance the board: a mix of types and of easy, medium and
   stretch contracts, never one that is already on it */
export function pickBounties(src, count, existing = []) {
  const r = bountyReach(src), pool = BOUNTY_POOL.filter(b => bountyEligible(b, r));
  const top = Math.max(1, ...pool.map(bountyLevel));
  const klass = b => { const l = bountyLevel(b); return l >= top ? 2 : l <= Math.ceil(top / 2) ? 0 : 1; };
  const have = existing.slice(), out = [];
  for (let i = 0; i < count; i++) {
    const cands = pool.filter(b => !have.some(h => h.id === b.id));
    if (!cands.length) break;
    let best = null, bs = -1;
    cands.forEach(b => {
      const sc = (have.some(h => h.type === b.type) ? 0 : 3) + (have.some(h => klass(h) === klass(b)) ? 0 : 2) + Math.random();
      if (sc > bs) { bs = sc; best = b; }
    });
    have.push(best); out.push({ ...best, progress: 0, claimed: false });
  }
  return out;
}
export function generateBountyContracts(src) { return pickBounties(src, 3, []); }
