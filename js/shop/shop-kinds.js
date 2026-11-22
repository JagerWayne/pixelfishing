/* The shop kinds, money checks, and selling from the bucket. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { restoName } from '../data/recipes.js';
import { bumpStat } from '../save/career.js';
import { checkAchievements, sellValue } from '../fishing/market.js';
import { getCurrentBoat, saveGame } from '../save/save-game.js';
import { buyFuel } from '../sim/spots.js';
import { rebuildPierBucketVisual } from '../boat/terminal.js';
import { showToast } from '../ui/toasts.js';
import { processEcoCleanupReward } from '../ui/start-screen.js';
import { updateHUD } from '../ui/hud.js';

/* =========================================================================
   SHOPS (v4.9.0): no menus. The Tackle Shop, Boatyard and Dive Shop hand you a paper CATALOGUE: a page-flip brochure
   with one item per page (picture, title, stats, description, price, state), arrows or a swipe to turn pages, category
   chips on top, tap to buy and then confirm. The Fish Market and the Recycling stand show your bucket as a list with a
   sell-all button. The goods come from shopItems(); their pictures are WorldBuilder.buildShopItem() models rendered
   once to small images. To add a good, add it to shopItems() and give buildShopItem() a model.
   ========================================================================= */
export const SHOP_KINDS = {
  tackle:   { title: '🎣 TACKLE SHOP', stand: 'shop', tabs: [['rods', '🎣 Rods'], ['baits', '🪱 Bait'], ['rigs', '🪝 Rigs'], ['buckets', '🪣 Buckets'], ['books', '📚 Book']] },
  boatyard: { title: '⚓ BOATYARD', stand: 'boatyard', tabs: [['boats', '⛵ Boats'], ['modules', '📡 Modules'], ['fuel', '⛽ Fuel'], ['books', '📚 Book']] },
  dive:     { title: '🤿 DIVE SHOP', stand: 'dive', tabs: [['dive', '🤿 Dive gear'], ['spear', '🔱 Spear guns'], ['books', '📚 Book']] },
  fish:     { title: '🐟 FISH MARKET', stand: 'fish', list: 'fish', tabs: [['sell', '🐟 Sell'], ['books', '📚 Book']] },
  recycle:  { title: '♻️ RECYCLING', stand: 'recycle', list: 'junk', tabs: [['sell', '♻️ Recycle'], ['books', '📚 Book']] },
  aqua:     { title: '🐠 AQUARIUM', stand: 'aquarium', list: 'aqua', tabs: [['fish', '🐠 Fish'], ['add', '➕ Add'], ['care', '🧽 Care'], ['decor', '🪸 Decor']] },
  resto:    { get title() { return '🍝 ' + restoName().toUpperCase(); }, stand: 'resto', list: 'resto', tabs: [['cook', '🍳 Cook'], ['fridge', '🧊 Fridge'], ['pantry', '🧺 Pantry'], ['upgrades', '⭐ Upgrades']] },
  aquashop: { title: '🐠 AQUARIUM SHOP', stand: 'aquashop', tabs: [['tanks', '🐠 Tanks'], ['adecor', '🪸 Decor'], ['acare', '🍤 Care'], ['books', '📚 Book']] }
};
export const shopBrowse = { active: false, kind: 'tackle', tab: 'rods', idx: 0, items: [], pending: null, armedAt: 0, viewOff: false, dir: 0 };
export const shopMoney = v => '$' + (+v).toLocaleString(undefined, { maximumFractionDigits: 2 });
export const shopNeed = c => `Need ${shopMoney(Math.ceil(c - shared.state.cash))} more`;
/* which skip a piece of junk goes in */
export const SKIP_OF = e => e.category === 'Flora' ? 'flora' : ['jk_can', 'jk_anchor', 'jk_box'].includes(e.id) ? 'metal' : 'other';
export const SKIPS = { flora: ['FLORA', '🌿', '#16a34a'], metal: ['METAL', '🥫', '#2563eb'], other: ['OTHER', '👢', '#eab308'] };
export const isFishEntry = e => e.category === 'Fish';
export const isJunkEntry = e => e.category === 'Junk' || e.category === 'Flora';

export function sellBucketEntry(idx) {
  const [soldItem] = shared.state.bucket.splice(idx, 1);
  if (!soldItem) return;
  const got = sellValue(soldItem);
  shared.state.cash = +(shared.state.cash + got).toFixed(2);
  bumpStat('earned', got);
  sfx.playCoin();
  processEcoCleanupReward([soldItem]);
  checkAchievements();
  saveGame();
  rebuildPierBucketVisual();
  updateHUD();
}
/* sell every entry that matches (all the fish, or all the junk) */
export function sellBucketWhere(pred, verb) {
  const sold = shared.state.bucket.filter(pred);
  if (!sold.length) return;
  const total = sold.reduce((s, i) => s + sellValue(i), 0);
  shared.state.bucket = shared.state.bucket.filter(e => !pred(e));
  shared.state.cash = +(shared.state.cash + total).toFixed(2);
  bumpStat('earned', total);
  sfx.playCoin();
  processEcoCleanupReward(sold);
  checkAchievements();
  saveGame();
  rebuildPierBucketVisual();
  updateHUD();
  showToast(`${verb} ${sold.length} item(s) for $${total.toFixed(2)}!`);
}
export function refuelBoat() {
  const boat = getCurrentBoat();
  if (shared.state.boatTier === 0) return;
  const missing = Math.max(0, boat.maxFuel - shared.state.fuel);
  if (missing <= 0.1) return;
  const bought = buyFuel(missing);
  if (!bought) { showToast('Not enough cash to buy fuel!'); return; }
  sfx.playCoin(); saveGame(); updateHUD();
  showToast(`Refueled +${bought.units.toFixed(1)}u ($${bought.cost.toFixed(2)}).`);
}
