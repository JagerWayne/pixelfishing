/* The Seagull's secret menu: its sections and the confirm dialog. */
import { shared } from '../state.js';
import { BOAT_MODULES, BOAT_TIERS, BUCKET_TIERS, ROD_TIERS, sfx } from '../data/equipment.js';
import { CATCH_CATALOG, DIVE_GEAR, SPEAR_GUNS, ZONES } from '../data/catalog.js';
import { BOTTLE_MESSAGES } from '../data/bottles-bounties.js';
import { CABIN, MOOR, RECYCLE, SHORE_SHOPS } from '../world/layout.js';
import { PHYS } from '../data/recipes.js';
import { Physics } from '../engine/physics.js';
import { toggleColliderView } from '../render/previews.js';
import { cheats } from '../sim/controls-state.js';
import { MOON_PHASES, generateBountyContracts } from '../fishing/bounties.js';
import { cheatDone, cheatMoney, cheatTeleport } from './cheats.js';
import { renderCheatMenu } from '../save/queries.js';
import { getBucketCapacity, getBucketWeight, getCurrentBoat } from '../save/save-game.js';
import { rebuildPierBucketVisual } from '../boat/terminal.js';
import { rebuildPlayerBoatVisual, showToast } from './toasts.js';
import { townNav } from '../town/town-nav.js';
import { seaEvents } from '../fishing/sea-events.js';
import { checkGalleryCompletionReward } from './catch-modal.js';
import { dive, diveGear, diveZoneAt, pickDiveFishItem, seabedY } from '../dive/dive-state.js';
import { diveOpened } from '../dive/dive-seabed.js';
import { spawnDiveFish } from '../dive/dive-fish.js';
import { GUN_COLORS, gunBody } from '../dive/dive-gear.js';

export let CHEAT_SECTIONS, cheatConfirmModal;

// Every cheat asks first: the chosen action waits here until the player taps Apply.
shared.pendingCheat = null;
export function askCheat(sectionTitle, label, fn) {
  shared.pendingCheat = fn;
  document.getElementById('cheat-confirm-section').textContent = sectionTitle;
  document.getElementById('cheat-confirm-name').textContent = label;
  cheatConfirmModal.classList.add('open');
}

export function init() {
  CHEAT_SECTIONS = [
    { title: '💰 Money', items: [
      ['+$100', cheatMoney(100)], ['+$1,000', cheatMoney(1000)], ['+$10,000', cheatMoney(10000)], ['+$100,000', cheatMoney(100000)],
      ['Set to $0', () => { shared.state.cash = 0; cheatDone('Cash set to $0'); }]] },
    { title: '🎣 Gear', items: [
      ['Unlock all gear', () => {
        shared.state.rodTier = ROD_TIERS.length; shared.state.boatTier = BOAT_TIERS.length - 1; shared.state.bucketTier = BUCKET_TIERS.length;
        shared.state.ownedBoats = BOAT_TIERS.filter(b => b.tier > 0).map(b => b.tier); BOAT_TIERS.forEach(b => { if (b.tier) shared.state.boatFuel[b.tier] = b.maxFuel; });
        shared.state.hasLiveBaitCam = true; shared.state.modules = BOAT_MODULES.map(m => m.id); shared.state.fuel = getCurrentBoat().maxFuel;
        shared.state.diveTier = DIVE_GEAR.length - 1; shared.state.spearTier = SPEAR_GUNS.length - 1;
        rebuildPlayerBoatVisual(); cheatDone('🎣 All gear unlocked (incl. best dive gear & rail harpoon)');
      }],
      ['Best rod', () => { shared.state.rodTier = ROD_TIERS.length; rebuildPlayerBoatVisual(); cheatDone('Best rod equipped'); }],
      ['Best boat', () => { shared.state.boatTier = BOAT_TIERS.length - 1; shared.state.ownedBoats = BOAT_TIERS.filter(b => b.tier > 0).map(b => b.tier); shared.state.fuel = getCurrentBoat().maxFuel; BOAT_TIERS.forEach(b => { if (b.tier) shared.state.boatFuel[b.tier] = b.maxFuel; }); rebuildPlayerBoatVisual(); cheatDone('Every boat unlocked'); }],
      ['Biggest bucket', () => { shared.state.bucketTier = BUCKET_TIERS.length; rebuildPierBucketVisual(); cheatDone('Biggest bucket unlocked'); }],
      ['Refill fuel', () => { shared.state.fuel = getCurrentBoat().maxFuel; cheatDone('⛽ Fuel refilled'); }],
      ['99 of every bait', () => { shared.state.baitStock = { 2: 99, 3: 99, 4: 99 }; shared.state.baitCount = shared.state.baitTier > 1 ? 99 : 0; cheatDone('🪱 Bait stocked'); }]] },
    { title: '🐟 Fishing (toggles)', toggles: [
      ['fastBites', 'Instant bites'], ['noSnap', 'Line never snaps'], ['luck', 'Rare fish luck x5'], ['freeBait', 'Infinite bait'], ['freeFuel', 'Infinite fuel']] },
    { title: '🤿 Diving & Harpoon', items: [
      ['Best dive gear', () => { shared.state.diveTier = DIVE_GEAR.length - 1; cheatDone('🤿 Atmospheric Exo-Suit equipped'); }],
      ['Best harpoon', () => { shared.state.spearTier = SPEAR_GUNS.length - 1; if (dive.active) gunBody.material.color.setHex(GUN_COLORS[shared.state.spearTier]); cheatDone('🔱 Rail Harpoon equipped'); }],
      ['Remove dive gear', () => { if (dive.active) { showToast('Surface first!'); return; } shared.state.diveTier = 0; shared.state.spearTier = 0; cheatDone('Dive gear removed'); }],
      ['Refill air', () => { if (dive.active) { dive.air = dive.airMax; dive.emergency = false; dive.warned25 = dive.warned10 = false; } cheatDone('🫧 Air refilled'); }],
      ['Empty catch bag', () => { dive.bag = []; cheatDone('🎒 Dive bag emptied'); }],
      ['Teleport to seabed', () => { if (!dive.active) { showToast('Start a dive first (X)'); return; } dive.pos.y = Math.max(seabedY(dive.pos.x, dive.pos.z) + 0.8, cheats.noDepth ? -999 : -diveGear().maxDepth); cheatDone('⬇️ Seabed reached'); }],
      ['Teleport to surface', () => { if (!dive.active) { showToast('Start a dive first (X)'); return; } dive.pos.y = -0.3; cheatDone('⬆️ Surface'); }],
      ['Spawn rare fish', () => { if (!dive.active) { showToast('Start a dive first (X)'); return; } for (let i = 0; i < 4; i++) { const a = Math.random() * 6.28, z = Math.min(-5, dive.pos.z + Math.sin(a) * 9), x = dive.pos.x + Math.cos(a) * 9; const zn = diveZoneAt(z); spawnDiveFish(pickDiveFishItem(zn.id, ['Epic', 'Legendary', 'Rare']), zn, x, z); } cheatDone('🐟 Rare fish nearby!'); }],
      ['Respawn all chests', () => { diveOpened.clear(); cheatDone('🧰 All chests will be closed again on your next dive'); }]] },
    { title: '🤿 Diving (toggles)', toggles: [
      ['infAir', 'Infinite air'], ['noDepth', 'No depth limit'], ['autoHit', 'Harpoon never misses (any size)'], ['fastReload', 'Instant reload'], ['bigBag', 'Unlimited catch bag']] },
    { title: '🌍 World', items: [
      ['Dawn', () => { shared.state.timeOfDay = 0.27; cheatDone('🌅 Dawn'); }], ['Noon', () => { shared.state.timeOfDay = 0.5; cheatDone('☀️ Noon'); }],
      ['Dusk', () => { shared.state.timeOfDay = 0.74; cheatDone('🌇 Dusk'); }], ['Midnight', () => { shared.state.timeOfDay = 0.0; cheatDone('🌙 Midnight'); }],
      ['Clear', () => { shared.state.weather = 'CLEAR'; shared.weatherTimer = 120; cheatDone('☀️ Clear skies'); }], ['Overcast', () => { shared.state.weather = 'OVERCAST'; shared.weatherTimer = 120; cheatDone('☁️ Overcast'); }],
      ['Rain', () => { shared.state.weather = 'RAIN'; shared.weatherTimer = 120; cheatDone('🌧️ Rain'); }], ['Storm', () => { shared.state.weather = 'STORM'; shared.weatherTimer = 120; cheatDone('⛈️ Storm'); }],
      ['Full moon night', () => { shared.state.dayCount = Math.max(0, MOON_PHASES.findIndex(m => m.isFull)); shared.state.timeOfDay = 0.9; cheatDone('🌕 Full moon night'); }]] },
    { title: '📖 Collection', items: [
      ['Discover all species', () => { shared.state.discovered = CATCH_CATALOG.map(c => c.id); cheatDone('📖 Encyclopedia complete'); }],
      ['Collect all bottles', () => { shared.state.foundMessages = BOTTLE_MESSAGES.map(m => m.id); checkGalleryCompletionReward(); cheatDone('📜 All bottles collected'); }],
      ['Complete bounties', () => { (shared.state.bounties || []).forEach(b => { b.progress = b.target; }); cheatDone('📋 Bounties ready to claim'); }],
      ['New bounties', () => { shared.state.bounties = generateBountyContracts(shared.state); cheatDone('📋 New bounties'); }],
      ['Fill bucket', () => {
        const fish = CATCH_CATALOG.filter(c => c.category === 'Fish');
        for (let tries = 0; tries < 60; tries++) {
          const it = fish[Math.floor(Math.random() * fish.length)];
          const w = +(it.minW + Math.random() * (it.maxW - it.minW)).toFixed(2);
          if (getBucketWeight() + w > getBucketCapacity()) continue;
          shared.state.bucket.push({ uid: Date.now() + Math.random(), id: it.id, name: it.name, category: it.category, rarity: it.rarity, zoneName: ZONES[it.zones[0] - 1].name, weight: w, value: it.value, bottleMessageId: null });
        }
        rebuildPierBucketVisual(); cheatDone('🪣 Bucket filled');
      }],
      ['Empty bucket', () => { shared.state.bucket = []; rebuildPierBucketVisual(); cheatDone('🪣 Bucket emptied'); }]] },
    { title: '🧭 Teleport (on the pier)', items: [
      ['Pier tip', cheatTeleport(0, -10.59, 'Pier tip')], ['Tackle shop', cheatTeleport(-7.6, 4.2, 'Tackle shop')],
      ['Pier entrance', cheatTeleport(0, 3.6, 'Pier entrance')], ['Mooring platform', cheatTeleport(MOOR.boardX, -5.6, 'Mooring platform')],
      ['Fish market', cheatTeleport(SHORE_SHOPS.fish.x, 6.5, 'Fish market')], ['Boatyard', cheatTeleport(SHORE_SHOPS.boatyard.x, 6.5, 'Boatyard')], ['Dive shop', cheatTeleport(SHORE_SHOPS.dive.x, 6.5, 'Dive shop')],
      ['Recycling', cheatTeleport(RECYCLE.x, 4.2, 'Recycling')], ['Aquarium Shop', cheatTeleport(SHORE_SHOPS.aquashop.x, 4.2, 'Aquarium Shop')], ['Cabin', cheatTeleport(CABIN.x, 2.4, 'Cabin')]] },
    { title: '🌊 Sea events (on a boat)', items: [
      ['Spawn treasure chest', () => { if (!shared.onBoat) { showToast('Take your boat out first.'); return; } seaEvents.spawn('treasure'); }],
      ['Spawn boss shadow', () => { if (!shared.onBoat) { showToast('Take your boat out first.'); return; } seaEvents.spawn('boss'); }]] },
    { title: '🧱 Debug', items: [
      ['Show / hide collision boxes', () => { const on = toggleColliderView(); showToast(on ? '🧱 Collision boxes shown (green walk, orange boat, cyan dive, white = Rapier)' : 'Collision boxes hidden'); }],
      ['Walking physics: Rapier / built-in', () => { if (!Physics.on) { showToast('⚙️ Rapier did not load: the built-in collisions are in use.'); return; } PHYS.walk = PHYS.walk === 'rapier' ? 'legacy' : 'rapier'; townNav.nodes = null; showToast(PHYS.walk === 'rapier' ? '⚙️ Walking uses Rapier physics' : '⚙️ Walking uses the built-in collisions'); }]] },
    { title: '⚙️ Cheats', items: [
      ['Turn all toggles off', () => { Object.keys(cheats).forEach(k => { cheats[k] = false; }); renderCheatMenu(); showToast('Cheat toggles off'); }]] }
  ];
  cheatConfirmModal = document.getElementById('modal-cheat-confirm');
  document.getElementById('cheat-confirm-yes').addEventListener('click', () => {
    const fn = shared.pendingCheat;
    shared.pendingCheat = null;
    cheatConfirmModal.classList.remove('open');
    if (fn) { sfx.playCoin(); fn(); }
  });
  document.getElementById('cheat-confirm-no').addEventListener('click', () => { shared.pendingCheat = null; });
}
