/* The default save state and dressing the player's angler. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { AnglerFactory } from '../angler/angler-factory.js';
import { world } from '../render/lights.js';
import { generateBountyContracts } from '../fishing/bounties.js';
import { defaultAquarium } from '../town/aquarium.js';
import { BOOKS_V } from '../town/books.js';
import { saveGame } from './save-game.js';
import { showToast } from '../ui/toasts.js';
import { defaultStory } from '../town/story.js';
import { defaultKitchen } from '../town/restaurant.js';
import { defaultTown } from '../town/town-state.js';

export function defaultSaveState() {
  return {
    cash: 25.0,
    anglerGender: 'male',
    boatTier: 0,
    rodTier: 1,
    hasLiveBaitCam: false,
    baitTier: 1,
    baitCount: 0,
    baitStock: { 2: 0, 3: 0, 4: 0 },
    bucketTier: 1,
    fuel: 0,
    bucket: [],
    discovered: [],
    foundMessages: [],
    galleryRewardClaimed: false,
    speciesStats: {},
    dayCount: 0,
    timeOfDay: 0.32,
    weather: 'CLEAR',
    junkRecycledKg: 0,
    mayorRewardsClaimed: 0,
    vfxShader: 'none',
    modules: [],
    bounties: generateBountyContracts(),
    aquarium: defaultAquarium(),
    books: {},
    booksV: BOOKS_V,
    bookSel: null,
    story: defaultStory(),
    kitchen: defaultKitchen(),
    town: defaultTown(),
    rig: { owned: [], eq: null, chum: 0 },
    buoys: [],
    playerName: '',
    seenSpecies: [],
    look: AnglerFactory.defaultLook('male'),
    xp: 0,
    stats: {},
    achievements: [],
    rankClaimed: 0,
    diveTier: 0,
    spearTier: 0,
    daily: { day: 0, streak: 0, best: 0, codDay: 0, codCount: 0 },
    ownedBoats: [],
    boatFuel: {},
    saveVersion: 2
  };
}

export function dressAngler() {
  AnglerFactory.dress(world.anglerRig, shared.state.look);
}

export function applyAnglerGender(gender, notify = false) {
  const chosen = gender === 'female' ? 'female' : 'male';
  const wasDefault = !shared.state.look || AnglerFactory.isDefault(shared.state.look);
  shared.state.anglerGender = chosen;
  // an untouched outfit swaps to the other gender's default; a customised one keeps its clothes
  if (wasDefault) shared.state.look = AnglerFactory.defaultLook(chosen); else shared.state.look.gender = chosen;
  const isFemale = chosen === 'female';
  dressAngler();

  const startMaleBtn = document.getElementById('btn-start-male');
  const startFemaleBtn = document.getElementById('btn-start-female');
  if (startMaleBtn && startFemaleBtn) {
    startMaleBtn.className = isFemale ? 'pixel-btn' : 'pixel-btn green';
    startFemaleBtn.className = isFemale ? 'pixel-btn green' : 'pixel-btn';
  }

  const drawerMaleBtn = document.getElementById('btn-drawer-male');
  const drawerFemaleBtn = document.getElementById('btn-drawer-female');
  if (drawerMaleBtn && drawerFemaleBtn) {
    drawerMaleBtn.classList.toggle('active', !isFemale);
    drawerFemaleBtn.classList.toggle('active', isFemale);
  }

  saveGame();
  if (notify) {
    showToast(isFemale ? '👩 Switched to Female Fisherman!' : '🧔 Switched to Male Fisherman!');
  }
}

export function init() {
  document.getElementById('btn-start-male').addEventListener('click', e => {
    e.stopPropagation();
    sfx.init();
    sfx.playCoin();
    applyAnglerGender('male', false);
  });
  document.getElementById('btn-start-female').addEventListener('click', e => {
    e.stopPropagation();
    sfx.init();
    sfx.playCoin();
    applyAnglerGender('female', false);
  });
  document.getElementById('btn-drawer-male').addEventListener('click', () => {
    sfx.playCoin();
    applyAnglerGender('male', true);
  });
  document.getElementById('btn-drawer-female').addEventListener('click', () => {
    sfx.playCoin();
    applyAnglerGender('female', true);
  });
}
