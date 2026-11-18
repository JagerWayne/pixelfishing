# 🎣 Pixel Fishing

A 3D retro pixel-art fishing adventure that runs entirely in the browser. Cast from a wooden pier, buy better gear,
sail out to the deep, fill your encyclopedia and dress your fisherman however you like. Built for phones first,
but it plays great with a keyboard too.

**Play it:** https://jagerwayne.github.io/pixelfishing/
**Install it:** open the link on your phone and use *Add to Home Screen* (or the **Install** button in Settings on browsers that offer it).
Once installed it also works offline.

> This file is kept up to date with every change to the game. See [Maintaining this file](#maintaining-this-file) and the [Changelog](#changelog).

---

## Contents
1. [How to play](#how-to-play)
2. [Controls](#controls)
3. [The pier](#the-pier)
4. [Progression and equipment](#progression-and-equipment)
5. [The sea: zones, weather and the moon](#the-sea-zones-weather-and-the-moon)
6. [Catches and the encyclopedia](#catches-and-the-encyclopedia)
7. [Bounties, bottles and rewards](#bounties-bottles-and-rewards)
8. [Character customisation](#character-customisation)
9. [Secret: the Seagull's menu](#secret-the-seagulls-menu)
10. [Settings](#settings)
11. [Saving](#saving)
12. [Installing and offline play](#installing-and-offline-play)
13. [Technical overview](#technical-overview)
14. [Running and deploying](#running-and-deploying)
15. [Testing](#testing)
16. [Maintaining this file](#maintaining-this-file)
17. [Changelog](#changelog)

---

## How to play

1. Walk to the **far tip of the pier** and sit in the fishing chair. You can only cast from the tip of the pier, or from a boat.
2. **Hold the action button** to charge a cast and **release** to throw. Longer holds throw further.
3. When a fish bites, hook it and **reel it in**, keeping the line tension in the safe zone. Pull too hard on a fish your rod can't handle and the line snaps.
4. Keep what you want in your **bucket** or release it. Bring the bucket to the **Tackle Shop** to sell the catch.
5. Spend your money on better rods, boats, bait, buckets and boat modules. Complete **bounties**, collect **message bottles**, recycle junk and fill the **encyclopedia**.

Fish are only worth keeping if they fit: your bucket has a weight capacity, and heavier catches need a stronger rod.

## Controls

| Action | Touch | Keyboard |
|---|---|---|
| Walk / steer boat | Left thumbstick | `W` `A` `S` `D` or arrow keys |
| Cast, reel, interact | On-screen **action button** (bottom right) | Hold `Space` |
| Interact with the nearest pier object | Action button | `E` |
| Open bag / bucket | **☰ Menu → 🪣 Bag** | `B` |
| Open encyclopedia | **☰ Menu → 📖 Log** (a dot on ☰ marks new species) | `L` |
| Toolbox or bucket (when nearby) | Action button | `T` |
| Open the menu (Bag, Log, Settings, Look, Sound, gear info) | **☰** button, top right | none |
| Close a menu | **Close** button | `Esc` |

The action button changes with context: *Walk Edge*, *Hold Cast*, *Shop*, *Bounties*, *Gallery*, *Board / Dock*, and so on. Tapping empty screen does nothing; only the button acts.

## The pier

The pier is a small harbour. Walk up to each object and press the action button.

| Object | What it does |
|---|---|
| 🏪 **Tackle Shop** (west side of the boardwalk) | Buy rods, boats, boat modules, bait, buckets and the live bait cam. Sell your catch. Refuel your boat. |
| 📋 **Bounty Board** | Take on contracts for cash and bait. |
| 📜 **Bottle Gallery** | Browse the message-in-a-bottle collection. |
| 🎬 **Director's Camera** | Change the camera lens and look. |
| 🧰 **Tackle Toolbox** | Pick which bait to fish with. |
| 🪣 **Catch Bucket** (open cooler, fish box or freezer depending on your upgrade) | See and manage what you caught. |
| ⚓ **Moored boat** (down the stairs on the port side) | Board your boat once you own one. |
| 🪑 **Pier tip** | Where you sit and fish from the pier. |

Railings run down both sides of the pier. The only gap is the stair opening to the mooring platform.

## Progression and equipment

### Rods
A rod has a **maximum weight** and a **deepest zone** it can handle. Hooking something heavier than your rod, or deeper than its zone, makes the line much easier to snap.

| Rod | Cost | Max weight | Deepest zone |
|---|---|---|---|
| Bamboo Cane | free | 3.5 kg | 1 |
| Ashwood Drift Rod | $75 | 7 kg | 1 |
| Fiberglass Spin | $180 | 14 kg | 2 |
| Graphite Inshore | $380 | 24 kg | 2 |
| Carbon Surf Rod | $750 | 42 kg | 3 |
| Titanium Rig | $1,800 | 85 kg | 4 |
| Abyssal Leviathan Winch | $3,600 | 140 kg | 4 |

### Boats
Boats take you out of the cove. They burn fuel (refill at the shop) and limit which zones you can reach. If you run dry far from shore, the coast guard tows you back for a **$100 emergency fee**.

| Boat | Cost | Fuel tank | Reaches zone |
|---|---|---|---|
| Pier only | free | n/a | 1 |
| Wooden Rowboat | $120 | 60 | 2 |
| Fiberglass Skiff | $550 | 150 | 3 |
| Deep-Sea Trawler | $1,800 | 350 | 4 |

### Boat modules
| Module | Cost | Effect |
|---|---|---|
| 📡 Sonar Fish Finder | $240 | Shows bearing and distance to the nearest Feeding Frenzy. |
| 🔦 Bow Floodlight | $190 | A spotlight for dark nights and storms. |
| 🫧 Livewell Aerator | $380 | Fish sell for 15% more. |

There is also the **Rod-Tip Live Bait Cam** ($180), a picture-in-picture view of your bait and the fish while reeling.

### Bait
| Bait | Cost (pack of 10) | Effect |
|---|---|---|
| Bread Crumbs | free, unlimited | Basic bait for small common fish. |
| Garden Worms | $25 | Heavier fish, 25% less junk, better Uncommon odds. |
| Live Shrimp | $80 | 50% less junk, better Rare odds. |
| Glowing Lure | $220 | 80% less junk, much better Epic and Legendary odds. |

Choose your bait in the **Tackle Toolbox** on the pier. When special bait runs out you are switched back to Bread Crumbs.

### Buckets
| Bucket | Cost | Capacity |
|---|---|---|
| Rusty Tin Bucket | free | 6 kg |
| Plastic Cooler | $100 | 18 kg |
| Insulated Fish Box | $450 | 50 kg |
| Refrigerated Hold | $1,500 | 150 kg |

The bucket on the pier shows your upgrade, open with the catch inside. In the bag you can **sort** by newest, value, weight or name.

## The sea: zones, weather and the moon

| Zone | Name | Distance from the pier |
|---|---|---|
| 1 | Shallow Cove | 0 to 100 m |
| 2 | Coastal Reef | 100 to 300 m |
| 3 | Open Shelf | 300 to 650 m |
| 4 | Abyssal Trench | 650 m and beyond |

- **Weather** cycles between ☀️ Clear, ☁️ Overcast, 🌧️ Rain and ⛈️ Storm. Rougher weather means bigger waves.
- **Storm-only catches** appear in storms (for example the Thunder Eel).
- **The moon** has phases over the days. On a **full moon night** special glowing fish can be caught.
- **Feeding Frenzies** are patches of churning water. Casting into one gives much faster bites and better odds at rare fish.
- Days and nights pass in real time, and the sky, lighting and lamps change with them.

## Catches and the encyclopedia

The encyclopedia (📖 Log) tracks **63 catchable things**:

| Kind | Count |
|---|---|
| Fish | 52 (9 Common, 10 Uncommon, 15 Rare, 13 Epic, 5 Legendary) |
| Junk | 7 (boot, tin can, bottles, strongbox, hat, anchor and a message bottle) |
| Flora | 4 (sea lettuce, kelp, bladderwrack, glowing abyssal moss) |

- Fish per zone: 13 in Shallow Cove, 17 in Coastal Reef, 18 in Open Shelf, 15 in the Abyssal Trench (some species appear in more than one zone).
- 6 fish are **full-moon exclusives** and 5 are **storm exclusives**.
- The log shows your **personal best weight** and catch count per species, flags new discoveries with a **NEW** badge and a red dot on the Log button, and can be filtered by Fish, Junk, Flora or Undiscovered.
- All catches are rendered as 3D models: smooth countershaded fish with species-specific fins, markings, bills, sails, spines and lures, plus modelled junk.

## Bounties, bottles and rewards

- **Bounties:** the board offers three contracts at a time from a pool of 14 (catch fish in a zone, land a heavy fish, land rare catches, clean up junk, and so on). Each pays cash plus bait. A tracker on the HUD shows your closest contract and tells you when one is ready to claim.
- **Message in a bottle:** 36 collectable scrolls are hidden across the four zones. Keep a bottle in your bucket to add its message to the Gallery. Collect all 36 for a **$2,500 Master Archivist** reward.
- **Eco cleanup:** junk and flora you sell are recycled. Every **100 kg** recycled earns a **$1,000 Mayor's Award**.

## Character customisation

Open it from the start screen (**🎨 Customise Look**), the **☰ Menu** (**🎨 Look**) or **Settings → Appearance**.

- A live **3D preview** that rotates by itself and can be dragged to turn.
- **Male / Female** bodies. The female body has a different build and a smoothly shaped bust that every top, sweater and coat follows.
- Tabs: **Outfits** (quick presets), **Body** (skin tone, eye colour), **Hair** (style and colour), **Face** (facial hair, glasses), **Top**, **Bottom**, **Shoes**, **Hat**. Every clothing item has its own colour and the sweater and hoodie have an accent colour.
- **Quick outfits:** one tap sets a whole outfit: *Fisherman*, *Beach: Bikini* (bikini, sandals, straw hat, sunglasses), *Beach: Shorts only* (swim shorts, bare chest, barefoot) and *Raincoat day*.
- **Hats and hair:** some hair styles would poke through a hat, so they are greyed out while that hat is worn (and picking a hat that clashes switches the hair to *Short*). Cap blocks Wavy, Bob and Bun; Beanie, Bucket hat and Straw hat also block Ponytail; the Sou'wester also blocks Long. Choose *None* for the hat to use every style.
- **🎲 Random** rolls a whole new character (it keeps your chosen gender) and **↺ Reset** restores the default outfit.
- Options:

| Category | Choices |
|---|---|
| Skin tone | 6 |
| Eye colour | 4 |
| Hair styles | Short, Buzz, Wavy, Ponytail, Long, Bob, Bun, Braid, Bald |
| Hair colours | 10 |
| Facial hair | None, Stubble, Mustache, Goatee, Full beard |
| Glasses | None, Round, Sunglasses |
| Tops | Striped sweater, T-shirt, Tank top, Hoodie, Raincoat, Bikini top, Bare chest |
| Bottoms | Jeans, Shorts, Swim shorts, Bikini bottom, Skirt |
| Shoes | Rubber boots, Sneakers, Sandals, Barefoot |
| Hats | Sou'wester, Cap, Beanie, Bucket hat, Straw hat, None |
| Clothing colours | 14 per item |

Your look is saved and applied immediately in the game world. While walking, the arms swing opposite to the legs; when you stop they return to the rod-holding pose.

## Secret: the Seagull's menu

There is a hidden cheat menu. Stand close to the **seagull perched behind the tackle shop** (beside the left end of the shop works) and press the action button while it reads **WALK EDGE** **31 times in a row**. Pressing any other key or button resets the count, and so does an action press anywhere else.

The menu can add money, unlock all gear, restock bait and fuel, change the time of day, weather and moon, discover every species and bottle, complete or reroll bounties, fill or empty the bucket, teleport around the pier, and toggle session-only helpers: instant bites, a line that never snaps, rare-fish luck, infinite bait and infinite fuel. The toggles reset when you reload; changes to money and gear are saved like normal progress.

## Settings

Open **☰ Menu → Settings**.

- **Sound effects** on or off (also on the 🔊 button).
- **Haptics** (vibration) on or off, independent of sound.
- **Graphics:** *High* or *Battery saver* (renders at lower resolution).
- **Handedness:** *Right* or *Left*; left swaps the thumbstick and action button.
- **Thumbstick:** *Fixed*, or *Floating*, where the stick appears under your thumb anywhere on its half of the screen and the fixed one stays as a faint hint.
- **Button size:** *S*, *M* or *L* for the thumbstick and action button.
- **Fade HUD while fishing:** dims the gauges and shortcuts while your line is out.
- **Appearance:** opens the customisation screen.
- **Install app** (when your browser offers it).
- **Save data → Reset:** needs two taps to confirm. Settings are kept when you reset.

Settings are stored separately from the save, so resetting progress never changes them.

## Saving

Progress is saved automatically in your browser's `localStorage`:

| Key | Contents |
|---|---|
| `pixel_fishing_save_v1` | Cash, gear, bucket, discoveries, bounties, appearance and more (save format version 2) |
| `pixel_fishing_settings_v1` | Sound, haptics, graphics quality, bucket sort order, handedness, thumbstick mode, button size, HUD fade |
| `pixel_fishing_save_v1_backup` | A copy of a save that could not be read, kept so progress is never silently destroyed |

Every field is **validated and clamped on load**, so a corrupted or hand-edited save can never crash the game. Saves from older versions upgrade automatically (existing players keep their outfit, which is the default look for their gender).

On iPhones the home-screen app and Safari can keep separate saves. Clearing site data erases progress.

## Installing and offline play

The game is a Progressive Web App: it has a web manifest, icons, and a service worker (`sw.js`).

- The **page itself is fetched network-first**, so an installed copy picks up new versions whenever you open it online (GitHub Pages may cache it for a few minutes).
- **Static files** (the bundled Three.js, icons, manifest) are cache-first, which is what makes offline play work.
- If the list of static files changes, bump `CACHE_VERSION` in `sw.js`.

## Technical overview

The whole game is **one HTML file** (`index.html`) with no build step, plus a handful of static assets.

```
index.html                 the game: HTML, CSS and all JavaScript
vendor/three.r128.min.js   Three.js r128, bundled (CDN copies are fallbacks)
manifest.webmanifest       installable app manifest
sw.js                      service worker (offline support)
icons/                     app icons (192, 512, maskable, Apple touch)
.github/workflows/static.yml   GitHub Pages deployment
README.md                  this file
CLAUDE.md                  working notes for AI-assisted changes
```

The script inside `index.html` is organised in labelled sections:

| Section | Contents |
|---|---|
| A | Web Audio engine (soft synthesised sounds, ambience, haptics) |
| B | Game data tables: rods, boats, modules, bait, buckets, zones, weather, the catch catalog, bottle messages, bounties |
| C | Procedural pixel-art texture and icon factory |
| D | 3D model builders: the lofted fish generator, junk models, boats, pier props, the pier and island, and the **AnglerFactory** (customisable character) |
| E2 | Particles, ripples, feeding frenzies, weather and jumping fish |
| F | Three.js rendering pipeline and screen shaders |
| G | Runtime state and multi-touch controls |
| H | Save state, validation and helper queries |
| I | Boarding, docking and the rescue loop |
| J | Fishing mechanics and the context-sensitive action button |
| K | UI modals: shop, bucket, toolbox, catch reveal, log, gallery, camera, bounties, settings, customise |
| L | HUD and button synchronisation |
| M | Main animation and physics loop |

Notes on the models:

- **Fish** are generated from a per-species spec (length, height, width, fin layout, markings and features) and lofted into a smooth body with vertex-colour countershading and a pixel scale texture. They are normalised to fit the catch preview.
- **Boats** share a lofted hull generator (sheer line, keel, rounded quarters, transom) with three detailed vessels on top.
- **The character** is built from a skin body plus layered clothing shells, driven by a `look` object. It dresses the same animated rig the game already used (body, head, arms, legs), so walking, sitting, casting and reeling are unaffected. The customise screen uses a second rig with its own small renderer.
- Models keep their footprints and orientation (fronts face +Z, boats point toward -Z), so collisions and interaction ranges do not change when art is updated.

## Running and deploying

Run locally with any static file server (the service worker needs `http://localhost`, not `file://`):

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` directly also works, just without offline support.

Deployment is **GitHub Pages from the `main` branch**. Merging to `main` publishes the site (the *Deploy static content to Pages* workflow and GitHub's own *pages build and deployment* both run).

## Testing

There is no test framework in the repository. Changes are checked with headless Chromium (Playwright) against a local copy:

- the page boots with no console or page errors, including with a deliberately corrupted save,
- settings, bucket sorting, encyclopedia filters, the bounty tracker and the customise screen work,
- walking and collisions (shop reachable, railings hold, ramp and platform ends, no teleports),
- the action button only responds to the button, not the canvas,
- every one of the 63 catch models builds,
- the app registers its service worker and reloads and runs offline,
- contact-sheet renders of fish, boats, props and characters are reviewed by eye.

## Maintaining this file

**Every update to the game must update this README in the same change:**

1. Update any section the change affects (controls, tables, counts, features).
2. Add an entry at the top of the [Changelog](#changelog) with the date and a short summary.
3. If counts changed (species, bounties, options), update the numbers above.

`CLAUDE.md` repeats this rule for AI-assisted work.

## Changelog

### 2026-11-18, Mobile interface, part 2: controls
- **New control settings:** left-handed layout, floating thumbstick, small/medium/large buttons and an option to fade the HUD while fishing. Stored in the settings, validated on load.
- Fishing meters are more compact in landscape, and the stacked pills sit under the top bar on short screens so they never push the controls off screen.

### 2026-11-18, Mobile interface, part 1
- **Top bar:** one tidy status bar (cash, time and weather, menu button) with bucket and fuel gauges underneath. Nothing is clipped on a 360 px phone any more, and low fuel turns the gauge red and pulsing instead of popping a drawer open.
- **Menu sheet:** the ☰ button opens a slide-up sheet with large tiles (Bag, Log, Settings, Look, Sound) and the rod, bait, vessel, eco perk, lens and moon info. It replaces the small gear drawer.
- **Bag and Log** live in the menu sheet only; the screen bottom is just the thumbstick and action button.
- **Bigger touch targets:** all buttons are at least 44 px and all text at least 12 px.
- **Toasts** now queue and stack (up to three) with a length-based duration. Layout is measured, so toasts and the fishing meters no longer overlap the HUD. Thumbstick and action button scale with the screen.

### 2026-11-18, Beach wear, hat rules, face and walking arms, secret menu
- **Beach wear:** new *Bikini top*, *Bare chest*, *Bikini bottom* and *Swim shorts* options, plus a new **Outfits** tab with one-tap presets (Fisherman, Beach: Bikini, Beach: Shorts only, Raincoat day). Subtle pecs on the male chest.
- **Hats and hair:** hair styles that clip through a hat are now disabled while that hat is worn, and a clashing hat switches the hair automatically. Saved looks are corrected on load. Fixed short-hair tufts poking through caps and beanies.
- **Face:** the female mouth is rebuilt with natural, toned-down lips and a soft smile line (the red upper lip and chin-like arc are gone), and the male smile line is cleaner.
- **Walking:** the arms now swing opposite to the legs while walking.
- **Secret cheat menu** (see above).

### 2026-11-18, Character fixes
- Hair no longer covers the eyes: shorter hairlines, and hats now sit above the eyes.
- Long hair is rotated 90 degrees about the head's centre so it hangs down the back.
- Removed the waders option. Saves that used waders switch to jeans automatically.
- New female bust: a smooth bulge shaped into the body and into every garment, replacing the two attached spheres.
- One smooth head surface with a tapered chin (fixes speckling on the face), a proper cap visor, and cleaner tank-top hems.

### 2026-11-18, Customisable character
- Rebuilt the fisherman with smooth, layered geometry instead of chunky low-poly parts: a skin body with clothing shells, proper head, hands and feet.
- New **character customisation screen** with a live 3D preview, tabs and colour swatches for skin, eyes, hair, facial hair, glasses, top, bottom, shoes and hat. Separate male and female bodies, including the female bust shape.
- **🎲 Random** character button and a **Reset** button.
- Entry points on the start screen, the ⚙️ drawer and Settings.
- Appearance is saved with the game and validated on load; existing saves keep their outfit.
- Pier bunting moved well above the camera view.
- Added this README and `CLAUDE.md`.

### 2026-11-18, Fisherman and rod detail
- Fisherman gets ears, brows, white eyes, a smile, shoulders, belt, hands, boot cuffs, a sou'wester flap and strap; the rod gets a cork grip, reel and line guides.

### 2026-11-18, Open freezers and pier scenery
- The cooler, fish box and freezer are **open**, with lined interiors, ice and fish inside and the lid hinged back.
- Pier scenery: bunting, mooring bollards with rope, a life ring, bracing under the pier, barnacles and rope wraps on pilings, a rod rack, perched seagulls and a distant lighthouse.

### 2026-11-18, Boats and pier props
- Three new boats with a shared lofted hull (proper sterns): a clinker rowboat, a fibreglass skiff and a steel trawler.
- Rebuilt tackle shop (with a shopkeeper), bounty board with pinned notices, bottle gallery with string lights, film camera (tripod fixed to stand the right way up), toolbox and four catch containers with fish in them.

### 2026-11-18, Fish and junk model overhaul
- New parametric fish generator: smooth countershaded bodies, real fin shapes, layered eyes (one per side), gill covers and mouth lines, with per-species features for all 52 fish.
- Rebuilt boot, tin can, bottles, message bottle, anchor, pirate hat, strongbox and seaweed.

### 2026-11-18, Controls, pier layout and sound
- The action button only responds to the on-screen button; tapping empty screen no longer casts.
- Railings along both sides of the pier; fishing only at the far tip.
- The mooring ramp and platform are walkable and no longer snap you onto the pier.
- The bottle gallery stand is wider and its sign text no longer clips.
- Smoother, rounder sounds.

### 2026-11-18, Bugfixes, settings, quality of life, content and installable app
- Bundled Three.js locally; validated and backed-up saves; smooth collision around the bucket and toolbox.
- Settings panel (sound, haptics, graphics quality, two-tap reset).
- Bucket sorting, encyclopedia filters with NEW badges, HUD bounty tracker.
- 13 new species (including storm and full-moon exclusives) and 7 new bounties.
- Installable app: manifest, icons, offline service worker and an Install button.

### 2026-11-18, First fixes
- You can walk to the tackle shop along the boardwalk.
- The boardwalk railing no longer teleports you onto the pier.
- The fishing chair only unfolds at real water edges.
- Restored the GitHub Pages deployment workflow.

### Initial release
- The original 3D retro fishing game: pier, shop, boats, zones, weather and moon, encyclopedia, bounties and message bottles.
