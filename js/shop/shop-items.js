/* shopItems: the goods of every shop tab (data, states, what a purchase does). Kept whole. */
import { shared } from '../state.js';
import { BAIT_TIERS, BOAT_MODULES, BOAT_TIERS, BUCKET_TIERS, LIVE_CAM_UPGRADE, ROD_TIERS, sfx } from '../data/equipment.js';
import { DIVE_GEAR, SPEAR_GUNS } from '../data/catalog.js';
import { AQUARIUM_TANKS } from '../world/layout.js';
import { RIGS, friendPerk, fuelPrice, modCost } from '../data/townsfolk.js';
import { AQUARIUM_DECOR } from '../town/aquarium.js';
import { aquaDecorOwned, aquariumBuyDecor } from '../town/aquarium-care.js';
import { BOOKS, BOOK_PAGES, SHOP_BOOK, bookOwned, bookPages, bookProgress, buyBook } from '../town/books.js';
import { hasModule } from '../save/queries.js';
import { getCurrentBoat, saveGame } from '../save/save-game.js';
import { rebuildPierBucketVisual } from '../boat/terminal.js';
import { rebuildPlayerBoatVisual, showToast } from '../ui/toasts.js';
import { rigState } from '../fishing/rigs.js';
import { refuelBoat, shopMoney, shopNeed } from './shop-kinds.js';
import { updateHUD } from '../ui/hud.js';

/* The goods. Each item: key + data pick the 3D model; badge / note / can say what tapping does. */
export function shopItems(kind, tab) {
  const out = [];
  const add = o => out.push(Object.assign({ badge: '', note: '', can: false, price: null, priceText: null, verb: 'Buy', stats: '', desc: '' }, o));
  const pay = c => { shared.state.cash = +(shared.state.cash - c).toFixed(2); sfx.playCoin(); };
  const afford = c => shared.state.cash >= c;
  if (tab === 'books') {
    const b = BOOKS[SHOP_BOOK[kind]], own = bookOwned(b.id), fin = bookProgress(b.id) >= 1;
    add({ id: 'book_' + b.id, key: 'book', data: b, title: b.title, stats: `${BOOK_PAGES} pages`,
      desc: b.desc + ' ' + b.perks.map(p => p.kind === 'est' ? 'Perk: underwater weight guesses tighten from +-35% to +-5%.' : `Perk: ${p.label.toLowerCase()}, up to +${Math.round(p.max * 100)}%.`).join(' '),
      price: b.cost, badge: own ? (fin ? 'FINISHED' : 'OWNED') : '', can: !own && afford(b.cost), note: own ? `${bookPages(b.id).toFixed(1)} / ${BOOK_PAGES} pages read.` : afford(b.cost) ? '' : shopNeed(b.cost),
      confirm: `Buy "${b.title}" for ${shopMoney(b.cost)}?`, act: () => buyBook(b.id) });
  } else if (tab === 'rods') {
    const hasCam = !!shared.state.hasLiveBaitCam;
    add({ id: 'cam', key: 'cam', data: LIVE_CAM_UPGRADE, title: LIVE_CAM_UPGRADE.name, stats: 'Attachment: Picture-in-Picture subsea feed', desc: LIVE_CAM_UPGRADE.desc, price: LIVE_CAM_UPGRADE.cost,
      badge: hasCam ? 'INSTALLED' : '', can: !hasCam && afford(LIVE_CAM_UPGRADE.cost), note: hasCam ? 'Clipped to your rod.' : afford(LIVE_CAM_UPGRADE.cost) ? '' : shopNeed(LIVE_CAM_UPGRADE.cost),
      confirm: `Install ${LIVE_CAM_UPGRADE.name} for ${shopMoney(LIVE_CAM_UPGRADE.cost)}?`, verb: 'Install',
      act: () => { pay(LIVE_CAM_UPGRADE.cost); shared.state.hasLiveBaitCam = true; saveGame(); updateHUD(); showToast('📹 Installed Rod-Tip Live Bait Cam!'); } });
    ROD_TIERS.forEach(rod => {
      const owned = shared.state.rodTier >= rod.tier, eq = shared.state.rodTier === rod.tier;
      add({ id: 'rod' + rod.tier, key: 'rod', data: rod, title: rod.name, stats: `Tier ${rod.tier} • Max weight ${rod.maxWeight} kg • Safe zone ${rod.maxZone}`, desc: rod.desc, price: rod.cost, priceText: rod.cost === 0 ? 'FREE' : null,
        badge: eq ? 'EQUIPPED' : owned ? 'OWNED' : '', can: !owned && afford(rod.cost), note: eq ? 'In your hands.' : owned ? 'You have a better rod.' : afford(rod.cost) ? '' : shopNeed(rod.cost),
        confirm: `Buy ${rod.name} for ${shopMoney(rod.cost)}?`,
        act: () => { pay(rod.cost); shared.state.rodTier = rod.tier; saveGame(); rebuildPlayerBoatVisual(); updateHUD(); showToast(`Equipped ${rod.name}!`); } });
    });
  } else if (tab === 'baits') {
    BAIT_TIERS.forEach(bt => {
      const stock = bt.infinite ? 0 : (shared.state.baitStock[bt.tier] || 0), eq = shared.state.baitTier === bt.tier;
      if (bt.infinite) {
        add({ id: 'bait' + bt.tier, key: 'bait', data: bt, title: bt.name, stats: `Weight x${bt.weightMin} to x${bt.weightMax} • infinite`, desc: bt.desc, priceText: 'FREE', verb: 'Equip',
          badge: eq ? 'EQUIPPED' : '', can: !eq, note: eq ? 'Ready on your hook.' : '', confirm: `Equip ${bt.name}?`,
          act: () => { shared.state.baitTier = 1; shared.state.baitCount = 0; saveGame(); updateHUD(); showToast(`Equipped ${bt.name}.`); } });
      } else {
        add({ id: 'bait' + bt.tier, key: 'bait', data: bt, title: bt.name + ' (10x pack)', stats: `Weight x${bt.weightMin} to x${bt.weightMax} • you have ${stock}`, desc: bt.desc, price: bt.cost,
          can: afford(bt.cost), note: afford(bt.cost) ? (stock ? `${stock} in stock` : '') : shopNeed(bt.cost), confirm: `Buy 10x ${bt.name} for ${shopMoney(bt.cost)}?`,
          act: () => { pay(bt.cost); shared.state.baitStock[bt.tier] = stock + 10; shared.state.baitTier = bt.tier; shared.state.baitCount = shared.state.baitStock[bt.tier]; saveGame(); updateHUD(); showToast(`Bought 10x ${bt.name}!`); } });
      }
    });
  } else if (tab === 'rigs') {
    const rg = rigState();
    ['popper', 'jig'].forEach(id => {
      const r = RIGS[id], owned = rg.owned.includes(id), eq = rg.eq === id;
      add({ id: 'rig' + id, key: 'rig', data: r, title: `${r.icon} ${r.name}`, stats: 'Rig: one at a time, with any bait', desc: r.desc, price: owned ? null : r.cost, verb: owned ? (eq ? 'Take off' : 'Equip') : 'Buy',
        badge: eq ? 'EQUIPPED' : owned ? 'OWNED' : '', can: owned || afford(r.cost), note: owned ? (eq ? 'On your line.' : 'In your toolbox.') : afford(r.cost) ? '' : shopNeed(r.cost),
        confirm: owned ? (eq ? `Take the ${r.name} off your line?` : `Put the ${r.name} on your line?`) : `Buy the ${r.name} for ${shopMoney(r.cost)}? It goes on your line.`,
        act: () => { if (!owned) { pay(r.cost); rg.owned.push(id); } rg.eq = eq ? null : id; saveGame(); updateHUD(); showToast(eq ? `🪝 ${r.name} taken off.` : `🪝 ${r.name} on your line.`); } });
    });
    const c = RIGS.chum;
    add({ id: 'rigchum', key: 'rig', data: c, title: `${c.icon} ${c.name}`, stats: `You have ${rg.chum}`, desc: c.desc, price: c.cost, verb: 'Buy',
      badge: '', can: afford(c.cost), note: afford(c.cost) ? 'Use it with the 🪣 CHUM button on a stopped boat (or C).' : shopNeed(c.cost),
      confirm: `Buy 3 chum buckets for ${shopMoney(c.cost)}?`, act: () => { pay(c.cost); rg.chum += c.pack; saveGame(); updateHUD(); showToast(`🪣 +3 chum buckets (${rg.chum}).`); } });
  } else if (tab === 'buckets') {
    BUCKET_TIERS.forEach(bk => {
      const owned = shared.state.bucketTier >= bk.tier, eq = shared.state.bucketTier === bk.tier;
      add({ id: 'bucket' + bk.tier, key: 'bucket', data: bk, title: bk.name, stats: `Tier ${bk.tier} • Holds ${bk.capacity} kg`, desc: bk.desc, price: bk.cost, priceText: bk.cost === 0 ? 'FREE' : null,
        badge: eq ? 'EQUIPPED' : owned ? 'OWNED' : '', can: !owned && afford(bk.cost), note: eq ? 'On the pier.' : owned ? 'You have a bigger one.' : afford(bk.cost) ? '' : shopNeed(bk.cost),
        confirm: `Buy ${bk.name} for ${shopMoney(bk.cost)}?`,
        act: () => { pay(bk.cost); shared.state.bucketTier = bk.tier; saveGame(); rebuildPierBucketVisual(); updateHUD(); showToast(`Upgraded to ${bk.name}!`); } });
    });
  } else if (tab === 'boats') {
    BOAT_TIERS.filter(b => b.tier > 0).forEach(b => {
      const owned = (shared.state.ownedBoats || []).includes(b.tier), active = shared.state.boatTier === b.tier;
      add({ id: 'boat' + b.tier, key: 'boat', data: b, title: b.name, stats: `Tier ${b.tier} • Fuel ${b.maxFuel}u • Safe access: zone ${b.maxZone} • ${b.speed} m/s`, desc: b.desc, price: b.cost,
        badge: active ? 'ACTIVE' : owned ? 'OWNED' : '', can: !owned && afford(b.cost), note: active ? 'Moored at the platform.' : owned ? 'Switch at the 🛥️ Boat Terminal.' : afford(b.cost) ? '' : shopNeed(b.cost),
        confirm: `Buy the ${b.name} for ${shopMoney(b.cost)}?`,
        act: () => {
          pay(b.cost);
          if (shared.state.boatTier > 0) shared.state.boatFuel[shared.state.boatTier] = shared.state.fuel;   // the old boat keeps its tank
          if (!shared.state.ownedBoats.includes(b.tier)) { shared.state.ownedBoats.push(b.tier); shared.state.ownedBoats.sort((x, y) => x - y); }
          shared.state.boatTier = b.tier; shared.state.fuel = b.maxFuel; shared.state.boatFuel[b.tier] = b.maxFuel;
          saveGame(); rebuildPlayerBoatVisual(); updateHUD();
          showToast(`Bought ${b.name}! It is moored at the platform; switch boats at the 🛥️ Boat Terminal there.`);
        } });
    });
  } else if (tab === 'modules') {
    BOAT_MODULES.forEach(mod => {
      const installed = hasModule(mod.id), noBoat = shared.state.boatTier === 0;
      add({ id: 'mod' + mod.id, key: 'module', data: mod, title: `${mod.icon} ${mod.name}`, stats: 'Boat module', desc: mod.desc, price: modCost(mod), verb: 'Install',
        badge: installed ? 'INSTALLED' : noBoat ? 'NEEDS A BOAT' : '', can: !installed && !noBoat && afford(modCost(mod)), note: installed ? 'Fitted to your boats.' : noBoat ? 'Buy a boat first.' : afford(modCost(mod)) ? '' : shopNeed(modCost(mod)),
        confirm: `Install ${mod.name} for ${shopMoney(modCost(mod))}?`,
        act: () => { pay(modCost(mod)); shared.state.modules.push(mod.id); saveGame(); rebuildPlayerBoatVisual(); updateHUD(); showToast(`Installed ${mod.name}!`); } });
    });
  } else if (tab === 'fuel') {
    const boat = getCurrentBoat(), missing = Math.max(0, boat.maxFuel - shared.state.fuel);
    const units = Math.min(missing, Math.floor(shared.state.cash / fuelPrice())), cost = +(units * fuelPrice()).toFixed(2), full = +(missing * fuelPrice()).toFixed(2);
    const none = shared.state.boatTier === 0, topped = !none && missing <= 0.1;
    add({ id: 'fuel', key: 'fuel', data: {}, title: none ? 'Marine fuel' : `Refuel the ${boat.name}`, stats: none ? `${shopMoney(fuelPrice())} per unit` : `Tank ${shared.state.fuel.toFixed(0)} / ${boat.maxFuel} u • ${shopMoney(fuelPrice())} per unit${friendPerk('rook') ? ' (Rook\'s price)' : ''}`,
      desc: 'Fill the tank of the boat that is moored. The dock pump at the end of the mooring platform sells the same fuel.', price: none || topped ? null : (units > 0 ? cost : full), verb: 'Refuel',
      badge: topped ? 'TANK FULL' : none ? 'NO BOAT' : '', can: !none && !topped && units > 0, note: none ? 'Buy a boat first.' : topped ? 'Nothing to add.' : units <= 0 ? 'Not enough cash.' : units < missing ? 'All you can afford.' : '',
      confirm: `Add ${units.toFixed(0)} units of fuel for ${shopMoney(cost)}?`, act: refuelBoat });
  } else if (tab === 'tanks') {
    const aq = shared.state.aquarium;
    AQUARIUM_TANKS.forEach(t => {
      const owned = aq.tier >= t.tier, cur = aq.tier === t.tier, locked = t.tier > aq.tier + 1;
      add({ id: 'tank' + t.tier, key: 'tank', data: t, title: `🐠 ${t.name}`, stats: `Fish up to ${t.maxW} kg • Room ${t.cap} • ${t.decor} decor slots • ${t.w} m wide`,
        desc: 'A bigger tank holds bigger fish, more of them and more decorations. Your fish and decorations move into the new tank.', price: t.cost || null,
        badge: cur ? 'IN YOUR CABIN' : owned ? 'OWNED' : locked ? 'LOCKED' : '', can: !owned && !locked && afford(t.cost),
        note: cur ? 'Your current tank.' : owned ? 'You have a bigger one.' : locked ? `Needs the ${AQUARIUM_TANKS[t.tier - 2].name} first.` : afford(t.cost) ? '' : shopNeed(t.cost),
        confirm: `Buy the ${t.name} for ${shopMoney(t.cost)}?`, act: () => { pay(t.cost); aq.tier = t.tier; saveGame(); updateHUD(); showToast(`🐠 The ${t.name} is set up in your cabin.`); } });
    });
  } else if (tab === 'adecor') {
    const aq = shared.state.aquarium;
    AQUARIUM_DECOR.forEach(d => {
      const own = aquaDecorOwned(d.id), on = aq.decor.includes(d.id);
      add({ id: 'decor_' + d.id, key: 'decor', data: d, title: `${d.icon} ${d.name}`, stats: `+${d.charm} charm`, desc: d.desc + ' Charm makes visitors happier and raises ticket income.',
        price: d.cost, badge: own ? 'OWNED' : '', can: !own && afford(d.cost), note: own ? (on ? 'In your tank.' : 'Stored: place it from the tank.') : afford(d.cost) ? '' : shopNeed(d.cost),
        confirm: `Buy the ${d.name} for ${shopMoney(d.cost)}?`, act: () => aquariumBuyDecor(d.id) });
    });
  } else if (tab === 'acare') {
    const aq = shared.state.aquarium;
    add({ id: 'pellets', key: 'pellets', data: {}, title: '🥫 Premium pellets (5 feeds)', stats: `In stock at home: ${aq.pellets}`, desc: 'Each feed fills the food bar completely. Use them from the Care tab at your tank.',
      price: 90, can: afford(90) && aq.pellets <= 994, note: afford(90) ? '' : shopNeed(90), confirm: 'Buy 5 premium pellet feeds for $90?', act: () => { pay(90); aq.pellets += 5; saveGame(); updateHUD(); showToast('🥫 5 premium feeds added to your stock.'); } });
    add({ id: 'kit', key: 'kit', data: {}, title: '🧴 Deep-clean kit', stats: `In stock at home: ${aq.kits}`, desc: 'Leaves the tank spotless, and it stays clean twice as long for the next 3 days. Use it from the Care tab at your tank.',
      price: 60, can: afford(60) && aq.kits <= 998, note: afford(60) ? '' : shopNeed(60), confirm: 'Buy a deep-clean kit for $60?', act: () => { pay(60); aq.kits += 1; saveGame(); updateHUD(); showToast('🧴 Deep-clean kit added to your stock.'); } });
  } else if (tab === 'dive' || tab === 'spear') {
    const isDive = tab === 'dive', list = (isDive ? DIVE_GEAR : SPEAR_GUNS).filter(g => g.tier > 0), have = isDive ? shared.state.diveTier : shared.state.spearTier;
    list.forEach(g => {
      const owned = have >= g.tier, eq = have === g.tier, locked = g.tier > have + 1;
      const stats = isDive
        ? `Tier ${g.tier} • Depth ${g.maxDepth} m • Air ${Math.floor(g.air / 60)}:${String(g.air % 60).padStart(2, '0')} • Bag ${g.bagKg} kg • Swim ${g.speed} m/s${g.light ? ' • Lamp L' + g.light : ''}`
        : `Tier ${g.tier} • Range ${g.range} m • Power ${g.power} kg • Reload ${g.reload}s • Speed ${g.speed} m/s`;
      add({ id: tab + g.tier, key: isDive ? 'dive' : 'spear', data: g, title: g.name, stats, desc: g.desc, price: g.cost,
        badge: eq ? 'EQUIPPED' : owned ? 'OWNED' : locked ? 'LOCKED' : '', can: !owned && !locked && afford(g.cost), note: eq ? 'The best you own.' : owned ? 'You have better.' : locked ? `Needs tier ${g.tier - 1} first.` : afford(g.cost) ? '' : shopNeed(g.cost),
        confirm: `Buy ${g.name} for ${shopMoney(g.cost)}?`,
        act: () => { pay(g.cost); if (isDive) shared.state.diveTier = g.tier; else shared.state.spearTier = g.tier; saveGame(); updateHUD(); showToast(`${isDive ? '🤿' : '🔱'} Bought ${g.name}!`); } });
    });
  }
  return out;
}
