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
- The harbour order (Boatyard, Dive, Tackle, Bounty, pier, Recycling, Fish Market, Cabin) is set by `SHORE_SHOPS`, `RECYCLE` and `CABIN`; the gallery, trophy case and film camera stand inside the cabin (`CABIN.galleryX` and so on). The cabin's front wall and roof are kept out of `mergeStatic` because they fade.
- Boat handling numbers live in `BOAT_TIERS[n].handling`; hull motion is `updateHullMotion`.
- Where the angler stands on a boat is `BOAT_STATIONS[tier]` (and `LH_STATIONS` for the lighthouse jetty, `LH_J`); the casting direction always comes from the station (`boatCastYaw()`), never from `boatYaw` alone. The bounty board's papers are `world.bountyPapers`, redrawn by `refreshBountyPapers`; claim through `claimBounty(idx)`.
- Anything stored in the save must be validated in `sanitizeSave`. Bump the save version only for breaking changes.
- Deployment is GitHub Pages from `main`.

## Checking a change

Use headless Chromium (Playwright) against a local copy: boot with no errors (also with a corrupted save), walk the
pier, exercise the menus, and make sure all 69 catch models still build. See the Testing section of the README.
