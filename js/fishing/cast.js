/* Releasing the action button, launching the bobber and boss catches. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { CATCH_CATALOG } from '../data/catalog.js';
import { world } from '../render/lights.js';
import { vfx } from '../render/previews.js';
import { boatCastYaw } from '../boat/stations.js';
import { bobberPos, bobberVel, cheats } from '../sim/controls-state.js';
import { getCurrentBait, getCurrentRod, saveGame } from '../save/save-game.js';
import { showToast } from '../ui/toasts.js';
import { useBuff } from '../town/restaurant.js';
import { rigBiteMult } from './rigs.js';
import { clearFightEnd } from './hook.js';
import { seaEvents } from './sea-events.js';
import { updateHUD } from '../ui/hud.js';

export function handleActionRelease() {
  if (shared.mode === 'CASTING') {
    document.getElementById('cast-meter-box').style.display = 'none';
    launchBobber(shared.castCharge);
  }
}

function launchBobber(power) {
  const bait = getCurrentBait();
  if (!bait.infinite && !cheats.freeBait) {
    const curStock = shared.state.baitStock[shared.state.baitTier] || 0;
    if (curStock > 0) {
      shared.state.baitStock[shared.state.baitTier] = curStock - 1;
      shared.state.baitCount = shared.state.baitStock[shared.state.baitTier];
      if (shared.state.baitCount === 0) {
        showToast(`Used your last ${bait.name}!`);
      }
      saveGame();
    }
  }

  sfx.playCast();
  shared.mode = 'WAITING_BITE';
  shared.bobberInWater = false;

  const castYaw = shared.onBoat ? boatCastYaw() : shared.playerYaw;
  const forward = new THREE.Vector3(-Math.sin(castYaw), 0, -Math.cos(castYaw));
  const origin = shared.onBoat
    ? world.anglerGroup.position.clone().add(new THREE.Vector3(0, 1.8, 0)).addScaledVector(forward, 0.8)
    : world.anglerGroup.position.clone().add(new THREE.Vector3(0, 1.8, -0.8));
  bobberPos.copy(origin);

  const dist = 7 + power * 15;

  const landingEstimate = origin.clone().addScaledVector(forward, dist * 1.15);
  const inFrenzy = vfx.isPointInFrenzy(landingEstimate);
  if (shared.onBoat && seaEvents.bossAt(landingEstimate)) showToast('🐉 Your bait splashes into the giant shadow...');

  bobberVel.set(forward.x * dist * 1.15, 5.5 + power * 3.5, forward.z * dist * 1.15);
  clearFightEnd();
  world.bobberGroup.position.copy(bobberPos);
  world.bobberGroup.visible = true;
  world.fishingLine.visible = true;
  shared.waitTimer = cheats.fastBites ? 0.35 : (inFrenzy ? (0.9 + Math.random() * 1.1) : (1.8 + Math.random() * 2.4));
  if (useBuff('bite')) shared.waitTimer *= 0.7;   // a meal from the restaurant: one charge per cast
  shared.waitTimer *= rigBiteMult();                // the rig on the line (v6.5.0)
  if (inFrenzy) {
    showToast('🔥 Landed in a Feeding Frenzy! Fast bites & rare odds!');
  }
  updateHUD();
}

/* Boss encounter: a Legendary fish of this zone, heavier than normal and worth double */
export function makeBossCatch(zone) {
  const pool = CATCH_CATALOG.filter(c => c.category === 'Fish' && c.rarity === 'Legendary' && c.zones.includes(zone.id) && !c.fullMoonOnly && !c.stormOnly);
  const item = (pool.length ? pool : CATCH_CATALOG.filter(c => c.rarity === 'Legendary' && c.category === 'Fish'))[Math.floor(Math.random() * (pool.length || 1))] || CATCH_CATALOG.find(c => c.rarity === 'Legendary');
  const weight = +Math.min(item.maxW * 1.4, (item.minW + (item.maxW - item.minW) * (0.6 + Math.random() * 0.4)) * 1.2).toFixed(2);
  const rod = getCurrentRod();
  return { item, weight, value: Math.round(item.value * 2), zoneObj: zone, isUnderpowered: weight > rod.maxWeight || zone.id > rod.maxZone, inFrenzy: false, bottleMessage: null, isBoss: true };
}
