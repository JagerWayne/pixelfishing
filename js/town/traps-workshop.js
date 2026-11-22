/* Crab traps, the boat workshop and the greenhouse. */
import { shared } from '../state.js';
import { BAIT_TIERS, BOAT_TIERS, sfx } from '../data/equipment.js';
import { BOAT_PAINTS } from '../world/layout.js';
import { friendPerk } from '../data/townsfolk.js';
import { sellValue } from '../fishing/market.js';
import { saveGame } from '../save/save-game.js';
import { BOAT_ICONS } from '../boat/terminal.js';
import { rebuildPlayerBoatVisual, showToast } from '../ui/toasts.js';
import { questEvent } from './story.js';
import { kitchen } from './restaurant.js';
import { PAINT_COST, town } from './town-state.js';
import { openTownSheet, townPay, townRefresh } from './town-nav.js';
import { shopMoney } from '../shop/shop-kinds.js';
import { updateHUD } from '../ui/hud.js';

/* ---- crab traps in the tide pool: bait one, come back the next day ---- */
const TRAP_BAIT = 8;
const TRAP_LOOT = [{ id: 'crab', name: 'shore crabs', icon: '🦀', w: 46, shell: [1, 3] }, { id: 'blue', name: 'a blue crab', icon: '🦀', w: 18, shell: [2, 2] }, { id: 'lobster', name: 'a spiny lobster', icon: '🦞', w: 15, shell: [3, 3] },
  { id: 'pearl', name: 'a pearl', icon: '🦪', w: 9, cash: [80, 160] }, { id: 'weed', name: 'only seaweed', icon: '🌿', w: 12 }];
function haulTrap(i) {
  const T = town(), t = T.traps[i]; if (!t || (shared.state.dayCount || 0) <= t.day) return;
  let r = Math.random() * TRAP_LOOT.reduce((s, x) => s + x.w, 0), L = TRAP_LOOT[0];
  for (const x of TRAP_LOOT) { r -= x.w; if (r <= 0) { L = x; break; } }
  T.traps[i] = null; questEvent('trap', {});
  if (L.shell) { const n = L.shell[0] + Math.floor(Math.random() * (L.shell[1] - L.shell[0] + 1)); const k = kitchen(); k.pantry.shellfish = Math.min(999, (k.pantry.shellfish || 0) + n); townPay(0, 6, `${L.icon} Trap ${i + 1}: ${L.name}! +${n} shellfish for the restaurant pantry.`); }
  else if (L.cash) { const c = L.cash[0] + Math.round(Math.random() * (L.cash[1] - L.cash[0])); townPay(c, 10, `${L.icon} Trap ${i + 1}: ${L.name}! Sold for ${shopMoney(c)}.`); }
  else { saveGame(); showToast(`${L.icon} Trap ${i + 1}: ${L.name}.`); }
}
export function openTraps() {
  openTownSheet('🦀 TIDE POOL: CRAB TRAPS', ({ row, note }) => {
    const T = town(), day = shared.state.dayCount || 0;
    note(`Bait a trap (${shopMoney(TRAP_BAIT)}), drop it in the pool and haul it up from the next day on. Crabs and lobsters go to your restaurant's pantry as shellfish (for the bisque); pearls sell straight away.`);
    T.traps.forEach((t, i) => {
      if (!t) row(`<span class="sl-n">🪤 Trap ${i + 1}<small>Empty</small></span>`, [['Bait & drop', '', () => { if (shared.state.cash < TRAP_BAIT) return; shared.state.cash = +(shared.state.cash - TRAP_BAIT).toFixed(2); T.traps[i] = { day }; sfx.playTick(); saveGame(); updateHUD(); townRefresh(); }, shared.state.cash < TRAP_BAIT]]);
      else if (day > t.day) row(`<span class="sl-n">🪤 Trap ${i + 1}<small>Ready: something is moving in there!</small></span>`, [['Haul up', '', () => { haulTrap(i); townRefresh(); }]]);
      else row(`<span class="sl-n">🪤 Trap ${i + 1}<small>Soaking. Check it tomorrow.</small></span>`, []);
    });
  });
}

/* ---- Barnaby's Workshop: hull, trim and pennant colours for every boat you own ---- */
export function openWorkshop() {
  openTownSheet("🔨 BARNABY'S WORKSHOP: BOAT PAINT", ({ row, head, note }) => {
    const T = town(), boats = (shared.state.ownedBoats || []).slice();
    note(`Pick a colour for each part of a boat (${shopMoney(PAINT_COST)} a coat). The hull and trim follow the boat's own stripes; the pennant flies from the stern.`);
    if (!boats.length) { note('You have no boat yet. Captain Rook sells them at the Boatyard.'); return; }
    boats.forEach(tier => {
      const p = T.paint[tier] || { hull: -1, trim: -1, flag: -1 };
      head(`${BOAT_ICONS[tier]} ${BOAT_TIERS[tier].name}`);
      [['hull', 'Hull'], ['trim', 'Trim'], ['flag', 'Pennant']].forEach(([part, label]) => {
        const sw = BOAT_PAINTS.map(([nm, hex], ci) => [ci === p[part] ? '✓' : ' ', 'swatch', () => paintBoat(tier, part, ci), false, `background:#${hex.toString(16).padStart(6, '0')};`, `${label} colour ${nm}${ci === p[part] ? ' (current)' : ''}`]);
        const r = row(`<span class="sl-n">${label}<small>${p[part] >= 0 ? BOAT_PAINTS[p[part]][0] : part === 'flag' ? 'none' : 'factory colour'}</small></span>`, sw.concat([['Reset', 'red', () => paintBoat(tier, part, -1), p[part] < 0]]), 'paint-row');
        r.title = label;
      });
    });
  });
}
function paintBoat(tier, part, ci) {
  const T = town(), p = T.paint[tier] || (T.paint[tier] = { hull: -1, trim: -1, flag: -1 });
  if (p[part] === ci) return;
  if (ci >= 0) { if (shared.state.cash < PAINT_COST * paintDiscount()) { showToast('🎨 Not enough cash.'); return; } shared.state.cash = +(shared.state.cash - PAINT_COST * paintDiscount()).toFixed(2); }
  p[part] = ci; questEvent('paint', {}); sfx.playCoin(); saveGame(); updateHUD();
  if (tier === shared.state.boatTier) rebuildPlayerBoatVisual();
  townRefresh();
}
const paintDiscount = () => (friendPerk('barnaby') ? 0.85 : 1);

/* ---- Talia's greenhouse: sells herbal lures, buys your seaweed ---- */
export function openGreenhouse() {
  openTownSheet("🌿 TALIA'S GREENHOUSE", ({ row, note }) => {
    const T = town(), flora = shared.state.bucket.filter(e => e.category === 'Flora'), pay = Math.round(flora.reduce((s, e) => s + sellValue(e) * 1.25, 0) * floraBonus());
    note('Talia brews lures from hillside herbs (the foraging job brings them) and pays a quarter more than Recycling for seaweed and sea plants.');
    row(`<span class="sl-n">🧪 Herbal lure<small>3 herbs → 5 × ${BAIT_TIERS[1].name} • you have ${T.herbs} herbs</small></span>`, [['Brew', '', () => {
      if (T.herbs < 3) return; T.herbs -= 3; shared.state.baitStock[2] = (shared.state.baitStock[2] || 0) + 5; if (shared.state.baitTier === 2) shared.state.baitCount = shared.state.baitStock[2];
      townPay(0, 3, `🧪 Brewed 5 ${BAIT_TIERS[1].name}.`); townRefresh(); }, T.herbs < 3]]);
    row(`<span class="sl-n">🌱 Sell your sea plants<small>${flora.length} in your bucket${flora.length ? ` • ${shopMoney(pay)}` : ''}</small></span>`, [['Sell', '', () => {
      if (!flora.length) return; shared.state.bucket = shared.state.bucket.filter(e => e.category !== 'Flora'); townPay(pay, 0, `🌱 Talia paid ${shopMoney(pay)} for your sea plants.`); townRefresh(); }, !flora.length]]);
  });
}
const floraBonus = () => 1;
