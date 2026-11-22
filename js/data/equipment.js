/* The sound engine instance, the start screen's fullscreen helpers, and the equipment tables: boats, boat
   modules, rods, the live cam, bait and buckets. */
import { settings } from '../core/settings.js';
import { AudioEngine } from '../audio/audio-engine.js';
import { checkDailyStreak } from '../fishing/market.js';
import { updateHUD } from '../ui/hud.js';

export let sfx;
let startOverlayEl, startBtnEl;

/* Full screen needs a user gesture; iPhone Safari does not allow it for web pages (the installed app is already full screen). */
export function enterFullscreen() {
  try {
    const el = document.documentElement;
    if (document.fullscreenElement || document.webkitFullscreenElement) return;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (req) { const p = req.call(el); if (p && p.catch) p.catch(() => {}); }
  } catch {}
}
export function exitFullscreen() {
  try {
    if (!(document.fullscreenElement || document.webkitFullscreenElement)) return;
    const ex = document.exitFullscreen || document.webkitExitFullscreen;
    if (ex) { const p = ex.call(document); if (p && p.catch) p.catch(() => {}); }
  } catch {}
}
const dismissStartScreen = e => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  if (!startOverlayEl.classList.contains('open')) return;
  startOverlayEl.classList.remove('open');
  checkDailyStreak();
  updateHUD();
  sfx.init();
  sfx.playCoin();
  if (settings.fullscreen) enterFullscreen();
};

/* =========================================================================
   SECTION B: GAME DATA TABLES (EQUIPMENT, ZONES, WEATHER, BOUNTIES & CATALOG)
   ========================================================================= */
export const BOAT_TIERS = [
  { tier: 0, name: 'None (Pier Only)', cost: 0, maxFuel: 0, speed: 0, burnRate: 0, maxZone: 1, desc: 'Fish directly from the wooden harbor pier.' },
  { tier: 1, name: 'Wooden Rowboat', cost: 120, maxFuel: 60, speed: 8, burnRate: 0.20, maxZone: 2,
    handling: { accel: 2.0, turn: 0.85, yawK: 2.6, slip: 3.2, hz: 1.5, damp: 0.3, plane: 0.04, bank: 0.05, chop: 1.2 }, desc: 'Clinker hull with 5HP outboard. Reaches Coastal Reef (300m).' },
  { tier: 2, name: 'Fiberglass Skiff', cost: 550, maxFuel: 150, speed: 13, burnRate: 0.17, maxZone: 3,
    handling: { accel: 3.0, turn: 0.8, yawK: 2.4, slip: 2.0, hz: 1.25, damp: 0.28, plane: 0.09, bank: 0.13, chop: 1.0 }, desc: 'Agile planing center-console skiff. Safely navigates Open Shelf (650m).' },
  { tier: 3, name: 'Deep-Sea Trawler', cost: 1800, maxFuel: 350, speed: 15, burnRate: 0.14, maxZone: 4,
    handling: { accel: 1.5, turn: 0.5, yawK: 1.1, slip: 4.5, hz: 0.7, damp: 0.45, plane: 0.025, bank: 0.04, chop: 0.55 }, desc: 'Heavy steel expedition vessel built for Abyssal Trench swells (1200m+).' },
  { tier: 4, name: 'Expedition Yacht', cost: 6500, maxFuel: 700, speed: 20, burnRate: 0.12, maxZone: 5,
    handling: { accel: 2.4, turn: 0.55, yawK: 1.5, slip: 2.8, hz: 0.9, damp: 0.38, plane: 0.07, bank: 0.1, chop: 0.75 }, desc: 'Twin-engine ocean yacht with a radar arch and a raised helm. The only boat that reaches the Mariana Rift (1500m+).' }
];

export const BOAT_MODULES = [
  { id: 'sonar', name: 'Sonar Fish Finder', cost: 240, icon: '📡', desc: 'Reveals feeding frenzies on the water and shows the live bearing & distance to the nearest one while you are aboard.' },
  { id: 'spotlight', name: 'Bow Floodlight', cost: 190, icon: '🔦', desc: 'High-beam marine spotlight that cuts through dark nights and storms.' },
  { id: 'livewell', name: 'Livewell Aerator', cost: 380, icon: '🫧', desc: 'Oxygenates your catch hold, boosting all fish sale values by +15%.' }
];

export const ROD_TIERS = [
  { tier: 1, name: 'Bamboo Cane', cost: 0, maxWeight: 3.5, forgiveness: 0.22, maxZone: 1, color: 0xd97706, desc: 'Simple flexible pole. Snaps easily on heavy or deep-water catches.' },
  { tier: 2, name: 'Ashwood Drift Rod', cost: 75, maxWeight: 7.0, forgiveness: 0.28, maxZone: 1, color: 0xb45309, desc: 'Sturdy split-cane rod with cork grip. Tames big harbor bass & anchors.' },
  { tier: 3, name: 'Fiberglass Spin', cost: 180, maxWeight: 14.0, forgiveness: 0.35, maxZone: 2, color: 0x0284c7, desc: 'Reinforced guides & spinning reel. Handles Coastal Reef fighters.' },
  { tier: 4, name: 'Graphite Inshore', cost: 380, maxWeight: 24.0, forgiveness: 0.41, maxZone: 2, color: 0x0d9488, desc: 'Fast-taper graphite blank with smooth drag for trophy reef predators.' },
  { tier: 5, name: 'Carbon Surf Rod', cost: 750, maxWeight: 42.0, forgiveness: 0.48, maxZone: 3, color: 0x334155, desc: 'High-modulus carbon blank built for pelagic Open Shelf gamefish.' },
  { tier: 6, name: 'Titanium Rig', cost: 1800, maxWeight: 85.0, forgiveness: 0.56, maxZone: 4, color: 0x94a3b8, desc: 'Roller-guide offshore rod engineered to battle deep trench monsters.' },
  { tier: 7, name: 'Abyssal Leviathan Winch', cost: 3600, maxWeight: 140.0, forgiveness: 0.66, maxZone: 4, color: 0xfacc15, desc: 'Gold-anodized heavy roller winch capable of hauling any beast in the sea.' },
  { tier: 8, name: 'Mythril Deepcaster', cost: 9000, maxWeight: 220.0, forgiveness: 0.74, maxZone: 5, color: 0x67e8f9, desc: 'Mythril-alloy winch rod with a self-cooling reel, forged for the monsters of the Mariana Rift.' }
];

export const LIVE_CAM_UPGRADE = {
  id: 'liveBaitCam',
  name: 'Rod-Tip Live Bait Cam',
  cost: 180,
  desc: 'Submersible micro-camera clipped to your line. Streams a live Picture-in-Picture feed of your bait and hooked fish during reeling!'
};

export const BAIT_TIERS = [
  { tier: 1, name: 'Bread Crumbs', cost: 0, infinite: true, weightMin: 0.8, weightMax: 1.1, trashMod: 1.0, rarityBonus: 0.0, desc: 'Infinite basic bait. Attracts small common shoreline nibblers.' },
  { tier: 2, name: 'Garden Worms', cost: 25, infinite: false, weightMin: 1.0, weightMax: 1.35, trashMod: 0.75, rarityBonus: 0.15, desc: '10x Pack. +Weight, -25% junk rate, +15% Uncommon fish.' },
  { tier: 3, name: 'Live Shrimp', cost: 80, infinite: false, weightMin: 1.2, weightMax: 1.65, trashMod: 0.50, rarityBonus: 0.25, desc: '10x Pack. Juicy shrimp: -50% junk rate, +25% Rare fish.' },
  { tier: 4, name: 'Glowing Lure', cost: 220, infinite: false, weightMin: 1.5, weightMax: 2.2, trashMod: 0.20, rarityBonus: 0.40, desc: '10x Pack. Bioluminescent lure: -80% junk, +40% Epic/Legendary.' }
];

export const BUCKET_TIERS = [
  { tier: 1, name: 'Rusty Tin Bucket', cost: 0, capacity: 6.0, desc: 'Small galvanized pail. Holds up to 6.0 kg of catch.' },
  { tier: 2, name: 'Plastic Cooler', cost: 100, capacity: 18.0, desc: '24-quart marine ice chest. Holds up to 18.0 kg.' },
  { tier: 3, name: 'Insulated Fish Box', cost: 450, capacity: 50.0, desc: 'Heavy-duty deck fish box. Holds up to 50.0 kg.' },
  { tier: 4, name: 'Refrigerated Hold', cost: 1500, capacity: 150.0, desc: 'Chilled commercial catch hold. Holds up to 150.0 kg.' },
  { tier: 5, name: 'Deep-Freeze Vault', cost: 4000, capacity: 400.0, desc: 'Gilded cryogenic vault for rift-sized catches. Holds up to 400.0 kg.' }
];

export function init() {
  sfx = new AudioEngine();

  startOverlayEl = document.getElementById('start-overlay');
  startBtnEl = document.getElementById('btn-start-game');
  startBtnEl.addEventListener('pointerup', dismissStartScreen);
  startBtnEl.addEventListener('touchend', dismissStartScreen, { passive: false });
  startBtnEl.addEventListener('click', dismissStartScreen);
  startOverlayEl.addEventListener('click', e => {
    if (e.target === startOverlayEl) dismissStartScreen(e);
  });
}
