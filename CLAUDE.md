# Working notes for Pixel Fishing

This is a single-file browser game (`index.html`, Three.js r128 bundled in `vendor/`). See `README.md` for the full
description of the game, its systems and its structure.

## Always do this with every update

1. **Update `README.md` in the same change.** Update any section the change touches (controls, tables, counts,
   features, technical overview) and add a new entry at the **top of the Changelog** with today's date and a short
   summary. Do not leave the README describing old behaviour.
2. If you add, remove or rename static files (assets, icons, scripts), update the file list in the README, `PRECACHE` in `sw.js`
   and `STATIC` in the loader at the top of `index.html`. Bump `PF_VERSION` (top of `index.html`) for every release: it is shown on the
   start screen and names the offline cache (there is no `CACHE_VERSION` any more).
3. Keep numbers in the README accurate (species counts, bounty pool, option counts, prices). Re-read them from the
   data tables in `index.html` rather than from memory.

## Conventions

- Models keep their footprint and orientation (fronts face +Z, boats point toward -Z) so collisions and interaction
  ranges stay valid.
- The angler is a skeleton (`AnglerFactory.createRig`: hips, spine, chest, neck, head, clavicles, upper arms, forearms,
  hands, thighs, shins, feet, plus the soft-tissue `bustL`/`bustR` bones last, driven by `AnglerAnimator.bustPhysics`) with a skinned body built in `AnglerFactory.dress`. Change the look in `dress`, the movement in
  `AnglerAnimator`; front is -Z. The rod pivot, chair and bobber stay on `world.anglerGroup`.
- Anything solid gets a collider in the `Colliders` registry (`Colliders.box` / `Colliders.circle` with `COL.WALK`, `COL.BOAT`, `COL.DIVE`) right where its model is built. The walk, boat and dive code all read from it; check with the secret menu's Debug → collision boxes.
- Static pier props are merged by `ModelKit.mergeStatic`; anything that moves or is rebuilt must be passed in its `keep` list.
- World time is `dt` from `animate()`: it is 0 while paused, in a menu or during a freeze frame, so per-frame code must cope with `dt = 0` (no division by it). Random per-frame events use `chancePerSec(rate, dt)`, never `Math.random() < p`.
- The pier's width is `PIER_HW` (rails), `PIER_WALK` (walk limit), `PIER_PILE` and `PIER_DX` (port-side shift of the stairs, mooring platform and moored boat, see `MOOR`); use them instead of raw numbers. The boardwalk runs to +-`BW_HALF`; the mooring platform is `PLATFORM` (with `BOAT_TERMINAL` and `DOCK_PUMP` on it). The boardwalk shops are `SHORE_SHOPS` (position, size, sign; fronts face south) and their goods are `SHOP_KINDS` / `shopItems()`.
- Shops are not menus: goods come from `shopItems(kind, tab)` (data, states, what a purchase does) and their pictures from `WorldBuilder.buildShopItem(key, data)` rendered by `shopPictureFor`; `SHOP_KINDS` lists each shop's tabs, and the Fish Market and Recycling are lists (`shopListRender`). A new item needs a model and goes through the confirm bar (`shopAsk` / `shopConfirmYes`). Use `refreshShopBrowse()` after changing state while a shop is open.
- The harbour order (Boatyard, Dive, Tackle, Bounty, pier, Recycling, Fish Market, Aquarium Shop, Cabin) is set by `SHORE_SHOPS`, `RECYCLE` and `CABIN` (the cabin's interior x positions are derived from `CABIN.x`); the harbour map lists the landmarks in `MAP_PLACES`, so add new ones there; the gallery, aquarium (`CABIN.aquaX`) and film camera stand inside the cabin (`CABIN.galleryX` and so on). The cabin's front wall and roof are kept out of `mergeStatic` because they fade.
- Boat handling numbers live in `BOAT_TIERS[n].handling`; hull motion is `updateHullMotion`.
- Where the angler stands on a boat is `BOAT_STATIONS[tier]` (and `LH_STATIONS` for the lighthouse jetty, `LH_J`); the casting direction always comes from the station (`boatCastYaw()`), never from `boatYaw` alone. The bounty board's papers are `world.bountyPapers`, redrawn by `refreshBountyPapers`; claim through `claimBounty(idx)`.
- Bounties are chosen by `pickBounties` from what `bountyEligible(b, bountyReach(state))` allows (pier or boat zone, rod weight); a new contract type needs a case in `bountyEligible` and `bountyLevel`.
- The aquarium (Cabin, back wall) is `state.aquarium`: what fits is decided only by `aquariumCanHold` against `AQUARIUM_TANKS` (whose `w`/`h` also size the tank model, rebuilt per tier by `aquaRebuildTank`; owned decorations are `decor` placed + `stored`) (no fish over `AQUARIUM_MAX_W`), daily upkeep and breeding run in `aquariumDay()` from the day-night tick, the fish in the world are `aquaSync`/`updateAquarium`, and its sheet is `aquaRender` (shop sheet kind `aqua`). The tank's `live` group is kept out of `mergeStatic`.
- Skill books are the `BOOKS` table (one per shop, `SHOP_BOOK`); perks are read with `bookBonus(perkId)` (max x minutes read / 44,640) wherever they apply; reading time comes only from the in-game clock via `updateReading(dMinutes)`, never real timers; underwater weights are only ever shown through `diveWeightRange` / `fmtWeightRange` (a per-fish stored seed `estU`).
- Harbour Town (v6.0): the walkable island is `ISLAND` (gate at |x| < `gateHW`, z up to `zMax`) with buildings in `TOWN`; things that may block the camera go in `world.townFade` (`userData.townFade` / `userData.fade`, faded by `updateTownFade`). The townsfolk are `NPCS` (looks, home, day spots, chat) moved by `updateNpcs` along `planRoute(to, from)`; the story is `QUESTS` (step types handled in `questEvent` for events and `questTick` for states), saved in `state.story` via `sanitizeStory`.
- Movement (v6.1.1): on foot the stick steers like a car (left / right turn `playerYaw`, up / down walk along it), speeds and turn rate in `MOVE`, velocity `walkVel`; the camera follows `playerYaw` (`camOrbit.yaw`) plus a drag look offset `camOrbit.look`; tap-to-walk is `autoWalk` built by `planRoute`.
- The restaurant (v6.1) is the player's: `restoName()` from `playerName` (fallback *Fisherman's Restaurant*); recipes are `RECIPES` (with `PANTRY`, `RESTO_UP`, `BUFFS`), saved in `state.kitchen` via `sanitizeKitchen`; service runs from the in-game clock in `updateRestaurant(dMinutes)`; its sheet is shop kind `resto` (`restoRender`), the cooking mini-game is `startCooking` / `cookStep`.
- Anything stored in the save must be validated in `sanitizeSave`. Bump the save version only for breaking changes.
- Deployment is GitHub Pages from `main`.

## Checking a change

Use headless Chromium (Playwright) against a local copy: boot with no errors (also with a corrupted save), walk the
pier, exercise the menus, and make sure all 69 catch models still build. See the Testing section of the README.
