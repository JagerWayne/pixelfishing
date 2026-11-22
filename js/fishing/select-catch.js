/* selectCatchForCurrentZone: which fish, junk or flora bites, and how heavy it is. */
import { shared } from '../state.js';
import { CATCH_CATALOG } from '../data/catalog.js';
import { BOTTLE_MESSAGES } from '../data/bottles-bounties.js';
import { vfx } from '../render/previews.js';
import { bobberPos, cheats } from '../sim/controls-state.js';
import { releaseBonus } from '../town/aquarium-care.js';
import { bookBonus } from '../town/books.js';
import { hasModule, isFullMoonNight } from '../save/queries.js';
import { getCurrentBait, getCurrentRod, getCurrentZone } from '../save/save-game.js';
import { rigWeight } from './rigs.js';
import { makeBossCatch } from './cast.js';
import { seaEvents } from './sea-events.js';

export function selectCatchForCurrentZone() {
  const zone = getCurrentZone();
  if (shared.onBoat && seaEvents.bossAt(bobberPos)) return makeBossCatch(zone);
  const bait = getCurrentBait();
  const fullMoon = isFullMoonNight();
  const isStorm = shared.state.weather === 'STORM';
  const inFrenzy = !!vfx.isPointInFrenzy(bobberPos);

  const foundMsgs = shared.state.foundMessages || [];
  const zoneUncollectedMsgs = BOTTLE_MESSAGES.filter(m => m.zones.includes(zone.id) && !foundMsgs.includes(m.id));
  const anyUncollectedMsgs = BOTTLE_MESSAGES.filter(m => !foundMsgs.includes(m.id));

  let pool = CATCH_CATALOG.filter(c => {
    if (c.isMessageBottle) return anyUncollectedMsgs.length > 0;
    return c.zones.includes(zone.id) && (!c.fullMoonOnly || fullMoon) && (!c.stormOnly || isStorm);
  });
  if (pool.length === 0) pool = CATCH_CATALOG.filter(c => c.category === 'Fish' && !c.fullMoonOnly && !c.stormOnly);

  const frenzyRarityMult = (inFrenzy ? 2.1 : 1.0) * (cheats.luck ? 5 : 1);
  const rb = bait.rarityBonus + bookBonus(shared.onBoat ? 'boatRare' : 'pierRare') + releaseBonus(zone.id);   // bait, the pier or boat book, and bred fish released here

  const weightedPool = pool.map(item => {
    let w = 10;
    if (item.isMessageBottle) {
      w = zoneUncollectedMsgs.length > 0 ? 2.2 : 1.1;
    } else if (item.category === 'Junk' || item.category === 'Flora') {
      w = 7 * bait.trashMod * (inFrenzy ? 0.25 : 1.0) * (cheats.luck ? 0.15 : 1);
    } else if (item.stormOnly && isStorm) {
      w = 13 * (1 + rb * 1.8) * frenzyRarityMult;
    } else if (item.fullMoonOnly && fullMoon) {
      w = 11 * (1 + rb * 2.0) * frenzyRarityMult;
    } else {
      if (item.rarity === 'Common') w = 14;
      if (item.rarity === 'Uncommon') w = 9 * (1 + rb * 1.5);
      if (item.rarity === 'Rare') w = 5 * (1 + rb * 2.2) * frenzyRarityMult;
      if (item.rarity === 'Epic') w = 2.5 * (1 + rb * 3.0) * frenzyRarityMult;
      if (item.rarity === 'Legendary') w = 1.2 * (1 + rb * 3.5) * frenzyRarityMult;
    }
    w *= rigWeight(item);   // the popper draws jumpers and is ignored by bottom-dwellers (v6.5.0)
    return { item, weight: Math.max(0.2, w) };
  });

  const totalW = weightedPool.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * totalW;
  let chosen = weightedPool[0].item;
  for (const entry of weightedPool) {
    roll -= entry.weight;
    if (roll <= 0) {
      chosen = entry.item;
      break;
    }
  }

  const rawW = chosen.minW + Math.random() * (chosen.maxW - chosen.minW);
  const baitMult = bait.weightMin + Math.random() * (bait.weightMax - bait.weightMin);
  const finalWeight = +Math.max(0.1, rawW * (chosen.category === 'Fish' ? baitMult : 1.0)).toFixed(2);
  const scaleRatio = finalWeight / ((chosen.minW + chosen.maxW) * 0.5);
  let finalValue = Math.max(1, Math.round(chosen.value * (0.85 + scaleRatio * 0.25)));
  if (chosen.category === 'Fish' && hasModule('livewell')) {
    finalValue = Math.round(finalValue * 1.15);
  }

  const rod = getCurrentRod();
  const isUnderpowered = finalWeight > rod.maxWeight || zone.id > rod.maxZone;

  let bottleMessage = null;
  if (chosen.isMessageBottle && anyUncollectedMsgs.length > 0) {
    const pickFrom = zoneUncollectedMsgs.length > 0 ? zoneUncollectedMsgs : anyUncollectedMsgs;
    bottleMessage = pickFrom[Math.floor(Math.random() * pickFrom.length)];
  }

  return {
    item: chosen,
    weight: finalWeight,
    value: finalValue,
    zoneObj: zone,
    isUnderpowered,
    inFrenzy,
    bottleMessage
  };
}
