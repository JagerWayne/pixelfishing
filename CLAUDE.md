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
- The animated angler rig (body, head, arms, legs, rod pivot, chair) must keep its pivots. Change the look through
  `AnglerFactory`, not by moving groups.
- Anything stored in the save must be validated in `sanitizeSave`. Bump the save version only for breaking changes.
- Deployment is GitHub Pages from `main`.

## Checking a change

Use headless Chromium (Playwright) against a local copy: boot with no errors (also with a corrupted save), walk the
pier, exercise the menus, and make sure all 63 catch models still build. See the Testing section of the README.
