/* updatePrimaryActionButtonInner: the action button's label, icon and state. Kept whole. */
import { shared } from '../state.js';
import { BUCKET_TIERS } from '../data/equipment.js';
import { BOTTLE_MESSAGES } from '../data/bottles-bounties.js';
import { SHORE_SHOPS } from '../world/layout.js';
import { restoName } from '../data/recipes.js';
import { canDockAtLighthouse } from '../boat/stations.js';
import { primaryBtn } from '../sim/controls-state.js';
import { BOOKS, benchSeated, bookOwned, reading } from '../town/books.js';
import { getCurrentBoat } from '../save/save-game.js';
import { isNearAquarium, isNearBoatTerminal, isNearDockPump, isNearMooredBoat, isNearPierBounty, isNearPierBucket,
  isNearPierGallery, isNearPierShop, isNearPierToolbox, isNearRecycle, shoreShopHere, spotLabel, spotNear } from '../sim/spots.js';
import { canDockAtPier, isAtPierWaterEdge } from '../boat/terminal.js';
import { isNearCheatGull } from '../town/story.js';
import { npcNear } from '../town/npcs.js';
import { kitchen, restoOpen } from '../town/restaurant.js';
import { isNearResto } from '../town/resto-sheet.js';
import { shopMoney } from '../shop/shop-kinds.js';
import { dive, harpoon, spearGun } from '../dive/dive-state.js';

export function updatePrimaryActionButtonInner() {
  const iconEl = document.getElementById('primary-action-icon');
  const labelEl = document.getElementById('primary-action-label');
  const proxEl = document.getElementById('proximity-banner');
  primaryBtn.className = '';
  proxEl.style.display = 'none';
  proxEl.style.borderColor = 'var(--accent-gold)';
  proxEl.style.color = '#fef08a';

  if (shared.mode === 'DIVING') {
    const gun = spearGun();
    primaryBtn.classList.add('spear');
    if (dive.emergency) { primaryBtn.classList.add('useless'); iconEl.textContent = '🆘'; labelEl.textContent = 'ASCENDING'; }
    else if (dive.nearChest) { iconEl.textContent = '🧰'; labelEl.textContent = 'OPEN CHEST'; }
    else if (gun.tier === 0) { primaryBtn.classList.add('useless'); iconEl.textContent = '🚫'; labelEl.textContent = 'NO SPEAR'; }
    else if (harpoon.state === 'ready') { iconEl.textContent = '🔱'; labelEl.textContent = 'SPEAR!'; }
    else { primaryBtn.classList.add('reload', 'useless'); iconEl.textContent = '🔄'; labelEl.textContent = harpoon.state === 'reload' ? 'RELOADING' : 'FIRED'; }
  } else if (shared.mode === 'CASTING') {
    primaryBtn.classList.add('casting');
    iconEl.textContent = '⚡';
    labelEl.textContent = 'RELEASE!';
  } else if (shared.mode === 'WAITING_BITE') {
    primaryBtn.classList.add('reeling');
    iconEl.textContent = '⏳';
    labelEl.textContent = 'CANCEL';
  } else if (shared.mode === 'BITE_WINDOW') {
    primaryBtn.classList.add('bite');
    iconEl.textContent = '❗';
    labelEl.textContent = 'HOOK IT!';
  } else if (shared.mode === 'LANDING') {
    primaryBtn.classList.add('reeling');
    iconEl.textContent = '🎣';
    labelEl.textContent = 'LANDING!';
  } else if (shared.mode === 'REELING') {
    primaryBtn.classList.add('reeling');
    iconEl.textContent = '🔄';
    labelEl.textContent = 'HOLD REEL';
  } else if (npcNear()) {
    const n = npcNear();
    primaryBtn.classList.add('bounty');
    iconEl.textContent = '💬';
    labelEl.textContent = 'TALK';
    proxEl.style.borderColor = '#38bdf8'; proxEl.style.color = '#bae6fd';
    proxEl.textContent = `${n.d.icon} ${n.d.name.toUpperCase()} • ${n.d.role.toUpperCase()}`;
    proxEl.style.display = 'block';
  } else if (isNearResto()) {
    primaryBtn.classList.add('shop');
    iconEl.textContent = '🍝';
    labelEl.textContent = 'KITCHEN';
    if (!restoOpen()) primaryBtn.classList.add('useless');
    proxEl.style.borderColor = '#dc2626'; proxEl.style.color = '#fecaca';
    proxEl.textContent = restoOpen() ? `🍝 ${restoName().toUpperCase()} • ${kitchen().dishes.length} DISHES READY${kitchen().bank >= 1 ? ` • ${shopMoney(kitchen().bank)} TO COLLECT` : ''}` : `🍝 ${restoName().toUpperCase()} • OPENING SOON (TALK TO LORENZO)`;
    proxEl.style.display = 'block';
  } else if (spotNear()) {
    const sp = spotNear();
    primaryBtn.classList.add(sp.cls || 'shop');
    iconEl.textContent = sp.icon;
    labelEl.textContent = spotLabel(sp);
    if (sp.useless && sp.useless()) primaryBtn.classList.add('useless');
    proxEl.style.borderColor = sp.color[0]; proxEl.style.color = sp.color[1];
    proxEl.textContent = sp.prox();
    proxEl.style.display = 'block';
  } else if (benchSeated()) {
    const ownN = Object.keys(BOOKS).filter(bookOwned).length;
    primaryBtn.classList.add('shop');
    iconEl.textContent = reading.id ? '📖' : '📚';
    labelEl.textContent = reading.id ? 'READING' : ownN ? 'READ' : 'NO BOOKS';
    if (reading.id || !ownN) primaryBtn.classList.add('useless');
    proxEl.style.borderColor = '#a78bfa';
    proxEl.style.color = '#ddd6fe';
    proxEl.textContent = reading.id ? '📖 READING' : ownN ? '📚 PRESS READ TO PICK A BOOK' : '📚 NO BOOKS YET';
    proxEl.style.display = reading.id ? 'none' : 'block';
  } else if (isNearPierShop()) {
    primaryBtn.classList.add('shop');
    iconEl.textContent = '🏪';
    labelEl.textContent = 'BROWSE';
    proxEl.textContent = '⚓ TACKLE SHOP — PRESS BUTTON TO BUY / SELL';
    proxEl.style.display = 'block';
  } else if (isNearPierBounty()) {
    const readyN = (shared.state.bounties || []).filter(b => b.progress >= b.target).length;
    primaryBtn.classList.add('bounty');
    iconEl.textContent = '📋';
    labelEl.textContent = readyN ? 'CLAIM' : 'BOUNTIES';
    proxEl.style.borderColor = '#34d399';
    proxEl.style.color = '#a7f3d0';
    proxEl.textContent = readyN ? `📋 ${readyN} CONTRACT${readyN > 1 ? 'S' : ''} READY — TAP A PAPER OR PRESS BUTTON TO CLAIM` : '📋 BOUNTY BOARD — READ THE CONTRACTS ON THE PAPERS';
    proxEl.style.display = 'block';
  } else if (isNearPierGallery()) {
    primaryBtn.classList.add('reeling');
    iconEl.textContent = '📜';
    labelEl.textContent = 'GALLERY';
    proxEl.style.borderColor = '#2dd4bf';
    proxEl.style.color = '#5eead4';
    proxEl.textContent = `📜 BOTTLE GALLERY (${(shared.state.foundMessages || []).length}/${BOTTLE_MESSAGES.length}) — PRESS BUTTON TO VIEW`;
    proxEl.style.display = 'block';
  } else if (isNearAquarium()) {
    const aqs = shared.state.aquarium;
    primaryBtn.classList.add('shop');
    iconEl.textContent = '🐠';
    labelEl.textContent = 'AQUARIUM';
    proxEl.style.borderColor = '#38bdf8';
    proxEl.style.color = '#bae6fd';
    proxEl.textContent = `🐠 AQUARIUM (${aqs.fish.length} FISH, ${shopMoney(aqs.tickets)} TO COLLECT) — FEED, CLEAN, ADD FISH`;
    proxEl.style.display = 'block';
  } else if (isNearPierToolbox()) {
    primaryBtn.classList.add('shop');
    iconEl.textContent = '🧰';
    labelEl.textContent = 'BAIT BOX';
    proxEl.style.borderColor = '#f97316';
    proxEl.style.color = '#fdba74';
    proxEl.textContent = '🧰 PIER TACKLE TOOLBOX — PRESS [T] OR BUTTON TO SELECT BAIT';
    proxEl.style.display = 'block';
  } else if (isNearPierBucket()) {
    primaryBtn.classList.add('reeling');
    iconEl.textContent = '🪣';
    labelEl.textContent = 'OPEN BUCKET';
    proxEl.textContent = `🪣 ${BUCKET_TIERS[shared.state.bucketTier - 1].name.toUpperCase()} — PRESS [T] OR BUTTON TO INSPECT`;
    proxEl.style.display = 'block';
  } else if (isNearRecycle()) {
    primaryBtn.classList.add('shop');
    iconEl.textContent = '♻️';
    labelEl.textContent = 'RECYCLE';
    proxEl.style.borderColor = '#22c55e';
    proxEl.style.color = '#bbf7d0';
    proxEl.textContent = '♻️ RECYCLING — SELL YOUR JUNK AND SEAWEED';
    proxEl.style.display = 'block';
  } else if (shoreShopHere()) {
    const sh = SHORE_SHOPS[shoreShopHere()];
    primaryBtn.classList.add('shop');
    iconEl.textContent = sh.icon;
    labelEl.textContent = sh.name === 'FISH MARKET' ? 'SELL FISH' : 'BROWSE';
    proxEl.style.borderColor = sh.color;
    proxEl.style.color = '#e0f2fe';
    proxEl.textContent = `${sh.title} — PRESS BUTTON`;
    proxEl.style.display = 'block';
  } else if (isNearDockPump()) {
    primaryBtn.classList.add('shop');
    iconEl.textContent = '⛽';
    labelEl.textContent = 'REFUEL';
    if (shared.state.boatTier <= 0) primaryBtn.classList.add('useless');
    proxEl.style.borderColor = '#dc2626';
    proxEl.style.color = '#fecaca';
    proxEl.textContent = shared.state.boatTier > 0
      ? `⛽ DOCK PUMP — ${getCurrentBoat().name.toUpperCase()}: ${shared.state.fuel.toFixed(0)}/${getCurrentBoat().maxFuel} — PRESS TO FILL ($0.50/u)`
      : '⛽ DOCK PUMP — NO BOAT MOORED';
    proxEl.style.display = 'block';
  } else if (isNearBoatTerminal()) {
    primaryBtn.classList.add('shop');
    iconEl.textContent = '🛥️';
    labelEl.textContent = 'BOATS';
    proxEl.style.borderColor = '#38bdf8';
    proxEl.style.color = '#bae6fd';
    proxEl.textContent = `🛥️ BOAT TERMINAL — ${(shared.state.ownedBoats || []).length} BOAT${(shared.state.ownedBoats || []).length === 1 ? '' : 'S'} OWNED — PRESS BUTTON TO CHOOSE`;
    proxEl.style.display = 'block';
  } else if (isNearMooredBoat()) {
    primaryBtn.classList.add('sail');
    iconEl.textContent = '⛵';
    labelEl.textContent = shared.state.boatTier > 0 ? 'SAIL BOAT' : 'NO BOAT';
    if (shared.state.boatTier <= 0) primaryBtn.classList.add('useless');
    proxEl.textContent = shared.state.boatTier > 0
      ? `⛵ ${getCurrentBoat().name.toUpperCase()} — PRESS BUTTON TO SAIL`
      : '⛵ BUY A BOAT AT THE TACKLE SHOP';
    proxEl.style.display = 'block';
  } else if (canDockAtPier()) {
    primaryBtn.classList.add('sail');
    iconEl.textContent = '⚓';
    labelEl.textContent = 'DOCK PIER';
    proxEl.textContent = '⚓ NEAR HARBOR PIER — PRESS BUTTON TO DOCK';
    proxEl.style.display = 'block';
  } else if (canDockAtLighthouse()) {
    primaryBtn.classList.add('sail');
    iconEl.textContent = '⚓';
    labelEl.textContent = 'DOCK JETTY';
    proxEl.textContent = '🗼 LIGHTHOUSE PIER — PRESS BUTTON TO DOCK AND FISH FROM THE JETTY';
    proxEl.style.display = 'block';
  } else if (!shared.onBoat && !isAtPierWaterEdge()) {
    iconEl.textContent = '🚶';
    labelEl.textContent = 'WALK EDGE';
    if (!isNearCheatGull()) primaryBtn.classList.add('useless'); // only the secret-menu gull still uses it
  } else {
    iconEl.textContent = '🎣';
    labelEl.textContent = 'HOLD CAST';
  }
}
