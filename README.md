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
6. [The fight](#the-fight)
7. [Catch of the Day and the daily streak](#catch-of-the-day-and-the-daily-streak)
8. [Catches and the encyclopedia](#catches-and-the-encyclopedia)
9. [Bounties, bottles and rewards](#bounties-bottles-and-rewards)
10. [Diving and spearfishing](#diving-and-spearfishing)
11. [Career: rank and achievements](#career-rank-and-achievements)
12. [The fish market](#the-fish-market)
13. [The Trophy Cabinet](#the-trophy-cabinet)
14. [Sea events](#sea-events)
15. [Character customisation](#character-customisation)
16. [Secret: the Seagull's menu](#secret-the-seagulls-menu)
17. [Settings](#settings)
18. [Saving](#saving)
19. [Installing and offline play](#installing-and-offline-play)
20. [Technical overview](#technical-overview)
21. [Running and deploying](#running-and-deploying)
22. [Testing](#testing)
23. [Maintaining this file](#maintaining-this-file)
24. [Changelog](#changelog)

---

## How to play

1. Walk to the **far tip of the pier** and sit in the fishing chair. You can only cast from the tip of the pier, or from a boat.
2. **Hold the action button** to charge a cast and **release** to throw. Longer holds throw further. The power bar loops, and a **yellow sweet spot at 72 to 88%** is marked on it (the label reads *★ SWEET!* while you are in it).
3. When a fish bites, hook it and **reel it in**, keeping the line tension in the safe zone. Pull too hard on a fish your rod can't handle and the line snaps. Every fish fights in its own style (see [The fight](#the-fight)), and landing it is a short slow-motion moment as it leaps out of the water to you.
4. Keep what you want in your **bucket** or release it. Bring the bucket to the **🐟 Fish Market** on the boardwalk (east of the pier) to sell the catch.
5. Spend your money on better rods, bait and buckets (Tackle Shop), boats and modules (Boatyard), fuel (the dock pump or the Boatyard) and dive gear (Dive Shop). Complete **bounties**, collect **message bottles**, recycle junk and fill the **encyclopedia**.

Fish are only worth keeping if they fit: your bucket has a weight capacity, and heavier catches need a stronger rod.

## Controls

| Action | Touch | Keyboard |
|---|---|---|
| Walk | Thumbstick | `W` `A` `S` `D` or arrow keys |
| Sail the boat | Thumbstick: **up** is the throttle, **left / right** the helm, **down** brakes then reverses. The helm needs the boat moving (no spinning on the spot) | `W` `S` throttle and reverse, `A` `D` or arrow keys steer |
| Cast, reel, interact | On-screen **action button** (bottom right) | Hold `Space`, `E` or `Enter` (all three are the action button: they do exactly what the button shows) |
| Open bag / bucket | **☰ Menu → 🪣 Bag** | `B` |
| Open encyclopedia | **☰ Menu → 📖 Log** (a dot on ☰ marks new species) | `L` |
| Toolbox or bucket (when nearby) | Action button | `T` |
| Dive / surface | **🤿 DIVE** button (next to the action button) | `X` |
| Swim up / down while diving | **▲ UP** / **▼ DOWN** buttons | `R` / `F` |
| Switch **first person / third person** view | **☰ Menu → 🎥 View** tile (shows 👁️ in first person) | `V` |
| Open the menu (Bag, Log, Career, Trophies, Settings, Look, Sound, gear info) | **☰** button, top right | none |
| Close a menu | **Close** button | `Esc` |
| **Pause** (world stops, sound toggle, controls help) | **⏸** button, top right | `P` or `Esc` (when no menu is open) |

**First person** puts the camera in the angler's head, looking where you face. The thumbstick then turns you on the spot (left / right) and walks forward or backward (up / down); on a boat the normal boat control and chase camera apply. The choice is remembered in the settings. Whenever you stand still for half a second in front of a stand, the camera also **zooms in on it** by itself (Shop, Bounty Board, Gallery, Trophy Cabinet and Camera) and lets go as soon as you move.

The action button changes with context: *Walk Edge*, *Hold Cast*, *Shop*, *Bounties*, *Gallery*, *Board / Dock*, and so on. Tapping empty screen does nothing; only the button acts.

## The pier

The pier is a small harbour: a 6.9 m wide pier (widened from 4.9 m in v4.5.0) and a **42 m waterfront boardwalk** (twice as long since v4.6.0) with every shop along its sea edge, backs to the sea and fronts facing south (toward the island), like the Tackle Shop. Walk right up to a stand (about one metre from its front) and press the action button; the button only changes when you are that close. Stop in front of a shop and the camera zooms in on it.

**Harbour layout (since v4.9.0), left to right as you look at the harbour from the island:** Boatyard (big), Dive Shop (big), Tackle Shop (small), Bounty board, **the pier**, Recycling (three skips), Fish Market (small), Cabin. All fronts face south and every back is on the sea rail. The layout numbers live in `SHORE_SHOPS`, `RECYCLE` and `CABIN` in `index.html`.

**Shops (each has its own trade; none is a menu):**

| Shop | Where | What it does |
|---|---|---|
| 🎣 **Tackle Shop** | left of the pier, small | **catalogue:** rods (and the live bait cam), bait packs, buckets |
| ⚓ **Boatyard** | far left, big (a fuel pump and an outboard on a stand outside) | **catalogue:** boats, boat modules, **fuel** |
| 🤿 **Dive Shop** | left, big (tanks, fins and a diver-down flag outside) | **catalogue:** dive gear and spear guns |
| 🐟 **Fish Market** | right of the pier, small (an iced fish bench outside) | your **bucket of fish** as a list with a **Sell all fish** button; shows today's market and the Catch of the Day. It buys fish only. |
| ♻️ **Recycling** | right of the pier, three skips (green *Flora*, blue *Metal*, yellow *Other*) | your **junk and seaweed** as a list grouped by skip, a **Recycle all** button and the Mayor's award bar ($1,000 per 100 kg) |

- **The catalogue (Tackle Shop, Boatyard, Dive Shop):** press *Browse* and a cream paper brochure slides up over the lower part of the screen while the camera stays on the shop. Category chips on top (Tackle: Rods, Bait, Buckets; Boatyard: Boats, Modules, Fuel; Dive: Dive gear, Spear guns). **One item per page:** a big picture of the item, its title, stats, description, price and state (*Equipped*, *Owned*, *Locked: needs tier 2 first*, *Need $x more*). The ‹ › arrows turn the page (with a page-turn animation), a swipe works too, `A` / `D` or the arrow keys on a keyboard, and `1` to `3` pick a category. `✕` or `Esc` closes it.
- **Buying:** tap the picture or the *Buy for $X* button; a **confirmation** asks first (*Buy X for $Y? Cash $a to $b*, *Cancel* / *Buy*). The touch that opens it can never confirm it by accident. Locked or unaffordable pages have no active button and say why.
- **Lists (Fish Market, Recycling):** each row is one piece from your bucket (icon, name, kg, price, hot or glut marks); tap a row to sell just that one (after the confirm) or the big button at the bottom to sell or recycle them all. The bag screen's own *Sell* buttons work only in front of the matching stand.
- The pictures are the goods' 3D models, rendered once to small images and cached, so every shop item has a model (`WorldBuilder.buildShopItem`).

**The cabin** (right end of the boardwalk) is a walk-in room: the **bottle gallery** on the back wall to the left, the **trophy case** to the right, the **film camera** (VFX lens) by the door, and a bunk bed, rug, lamp and window. The front wall and roof fade away while you are inside so the camera can see in.

In **third person the island's palms, cottages and bushes are hidden** so the camera never gets stuck behind them; first person shows them again.

| 📋 **Bounty Board** | Your three open contracts are written on papers pinned to the board (title, task, reward, progress). Tap a finished paper (marked READY) or press the action button to claim it. |
| 📜 **Bottle Gallery** (cabin, back wall left) | Browse the message-in-a-bottle collection. |
| 🎬 **Director's Camera** (cabin, by the door) | Change the camera lens (**Normal**, **8-Bit CRT Monitor**, **Pixelate** and **Pocket DMG-01**, a four-shade handheld look with dithering and dark outlines so boats and fish stay readable) and press **📸 SNAP POSTCARD** to save the current view as a retro postcard PNG (it includes the zone and lens name). |
| 🧰 **Tackle Toolbox** | Pick which bait to fish with. |
| 🪣 **Catch Bucket** (open cooler, fish box or freezer depending on your upgrade) | See and manage what you caught. |
| ⚓ **Moored boat** (down the stairs on the port side, beside the low mooring platform, which is 4.5 m long since v4.6.0) | Board your boat once you own one. |
| 🛥️ **Boat Terminal** (sea end of the mooring platform, inner corner) | Choose which of your boats is moored. |
| ⛽ **Dock fuel pump** (sea end of the mooring platform, right by the boat) | Fills the moored boat's tank at $0.50 a unit (as much as you can afford). |
| 🪑 **Benches** (back of the boardwalk) | Stand still in front of one for two seconds and the angler sits down, leans back and now and then crosses his legs. Move to get up. |
| 🌊 **Railing** | Stand still at the pier rails or the free parts of the boardwalk rail for two seconds and the angler leans his forearms on the rail and gazes out to sea. |
| 🪑 **Pier tip** | Where you sit and fish from the pier, and where you can start a dive (the pier is two planks longer since v2.3.0; the bucket and toolbox stayed where they were). |

Railings run down both sides of the pier. The only gap is the stair opening to the mooring platform. The deck has boards with grain along their length and dark timber underneath, and the lamp posts and every stand are lit at night.

The **lighthouse** out at sea (about 130 m from the pier, in the Coastal Reef) has a rotating beam and, since v4.7.0, a small **jetty** on its south-west rocks: sail alongside it (within about 11 m, slow, at the helm) and the action button says *Dock Jetty*. The boat eases into a berth on the jetty's south side and you step onto the deck. You fish from the **Tip** (casting west) or the **Rail** (casting north) exactly as from a boat; the **Cast off** chip, or any throttle, puts you back at the helm. There is no free walking on the rocks, no fuel is used while moored and no tow is called. The jetty has pilings, a rail, bollards, fenders, a ladder, a lamp, a ring buoy and a sign, and its colliders keep other hulls off it.

The beacon's flare is drawn at a fixed size on screen and is never fogged, so you can see it flash from anywhere on the sea, even 2000 m away, day or night (brighter at night).

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
| Mythril Deepcaster | $9,000 | 220 kg | 5 |

### Boats
Boats take you out of the cove. They burn fuel (refill at the dock pump next to the boat, or at the Boatyard) and limit which zones you can reach. Fuel is only burned while the engine drives the boat. When the tank runs dry the boat keeps its way and **coasts to a stop by inertia** (it glides roughly 30 to 40 m from top speed); the stick does nothing until you refuel. If it stops far from shore, the coast guard then tows you back for a **$100 emergency fee**; within 15 m of the pier you can just dock.

**Your fleet (since v4.4.0).** Every boat you buy is kept. A small **🛥️ Boat Terminal** kiosk stands on the corner of the mooring platform (at the foot of the stairs): walk up to it and press the action button to pick which of your boats is moored there. Each boat keeps **its own fuel tank**, so switching never loses fuel (the dock pump and the Boatyard both fill the boat that is moored). Buying a new boat adds it to the fleet and moors it. Older saves own every boat up to the one they had, as the shop already showed.

**Reversing:** when the boat goes astern (faster than 0.8 m/s backwards), the chase camera swings round to the bow and looks the way you are moving; in first person the view turns to look back. It swings back once you stop reversing.

You ride each boat at a proper helm, built for the angler's body and checked in first and third person:
- **Wooden Rowboat:** sit on the stern bench, facing forward, right hand on a tiller arm that swings as you steer.
- **Fiberglass Skiff:** stand at a padded **leaning post** behind the console; the wheel is on the console's aft face, facing you, with a throttle and chart plotter beside it.
- **Deep-Sea Trawler:** sit in a **helm chair inside an open-backed wheelhouse** (which stands clear above the bulwark since v4.3.0), wheel and console in front and the bow through big front windows. In third person the wheelhouse roof turns see-through while you drive.
- **Expedition Yacht:** sit on a **raised helm seat** behind the helm console, high enough to look over the low cabin and the bow; a radar arch replaces the old flybridge. Since v4.3.0 the hull has a lower freeboard, so the cabin and its windows sit properly above the sheer.
Your hands stay on the wheel or tiller and the wheel turns as you steer.

**Fishing stations (v4.7.0).** Once the boat is nearly stopped a **FISH FROM** row of chips appears above the action button (keys `1` to `5` pick them too). Pick a station and the angler walks there, turns outwards and the camera swings to face the same way; the cast, the hooked fish and the landing all go that direction. Any throttle or steering sends you back to the helm, and a boat that is stopped keeps you at your station between casts. Small boats let you fish from anywhere; big boats only from the working deck:

| Boat | Stations |
|---|---|
| Wooden Rowboat | Bow, Port, Starboard, Stern |
| Fiberglass Skiff | Bow, Port, Starboard, Stern |
| Deep-Sea Trawler | Port, Starboard (the stern has the trawl gear, the bow the winch) |
| Expedition Yacht | Stern, Port, Starboard (the bow is a railed foredeck) |

The numbers live in `BOAT_STATIONS` in `index.html` (boat-local position and casting direction per station).

| Boat | Cost | Fuel tank | Reaches zone |
|---|---|---|---|
| Pier only | free | n/a | 1 |
| Wooden Rowboat | $120 | 60 | 2 |
| Fiberglass Skiff | $550 | 150 | 3 |
| Deep-Sea Trawler | $1,800 | 350 | 4 |
| Expedition Yacht | $6,500 | 700 | 5 |

**Handling (since v4.3.0).** Each hull has its own feel:

| Boat | Top speed | Character |
|---|---|---|
| Wooden Rowboat | 8 m/s | light and twitchy, rolls and pitches a lot in chop |
| Fiberglass Skiff | 13 m/s | quick to accelerate, planes with its bow up, banks hard and skids in turns, slams the most |
| Deep-Sea Trawler | 15 m/s | heavy: slow to speed up and to turn, wide turning circle, ploughs through chop and barely rolls |
| Expedition Yacht | 20 m/s | fast and steady, planes and banks gently, only slams in the big outer zones |

How it works: the throttle pushes against water drag, so a boat builds up speed over several seconds and **coasts down slowly** when you let go. The helm only works with water flowing past it, so a boat at rest can't spin on the spot (a little throttle lets it creep round). Turns have inertia, are wider at full speed, and the hull keeps some sideways momentum, so it **skids** through a fast turn and loses speed. The hull floats on the swell plus a short chop that grows with the zone and the weather: it heaves, pitches and rolls on springs, rises onto the plane, banks into turns, and at speed **slams into the chop**, kicking the bow up with spray off both sides, a thud, a camera jolt and a haptic bump (each slam costs a little speed). Spray peels off the bow at speed. When you fish from a boat it drifts to a stop.

### Boat modules
| Module | Cost | Effect |
|---|---|---|
| 📡 Sonar Fish Finder | $240 | Reveals Feeding Frenzies on the water (the glowing rings and ripples) and shows the bearing and distance to the nearest one. Only while you are aboard the boat; without Sonar the frenzy cannot be seen (the bonus still applies if you happen to cast into one). |
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
| Deep-Freeze Vault | $4,000 | 400 kg |

The bucket on the pier shows your upgrade, open with the catch inside (the Deep-Freeze Vault is a gilded freezer). In the bag you can **sort** by newest, value, weight or name.

### Dive gear and spear guns
The Dive Shop's **🤿 Dive gear** and **🔱 Spear guns** counters sell the gear for diving and spearfishing (see [Diving and spearfishing](#diving-and-spearfishing)). Tiers are bought in order and the best one you own is used.

| Dive gear | Price | Rated depth | Air at the surface | Catch bag | Swim speed | Lamp |
|---|---|---|---|---|---|---|
| Mask, Snorkel & Fins | $140 | 4 m | 28 s | 6 kg | 2.4 m/s | none |
| Wetsuit & Single Tank | $520 | 16 m | 170 s | 16 kg | 3.0 m/s | none |
| Twin-Tank Tech Rig | $1,650 | 32 m | 360 s | 34 kg | 3.5 m/s | 1 |
| Rebreather & Scooter | $4,300 | 62 m | 780 s | 60 kg | 5.0 m/s | 2 |
| Atmospheric Exo-Suit | $9,800 | 130 m | 1,600 s | 140 kg | 6.0 m/s | 3 |

| Spear gun | Price | Range | Spear speed | Heaviest fish | Reload |
|---|---|---|---|---|---|
| Hand Pole Spear | $60 | 6 m | 17 m/s | 8 kg | 1.5 s |
| Band Speargun | $260 | 11 m | 25 m/s | 22 kg | 1.2 s |
| Pneumatic Speargun | $820 | 17 m | 33 m/s | 50 kg | 0.9 s |
| CO2 Power Harpoon | $2,400 | 25 m | 42 m/s | 120 kg | 0.7 s |
| Rail Harpoon | $6,200 | 36 m | 55 m/s | 320 kg | 0.5 s |

## The sea: zones, weather and the moon

Boats are solid: the **pier deck, stairs, mooring platform and pilings, the boardwalk, the island shore, the lighthouse rocks and the buoys** all block the hull. You slide along them, lose speed, and get a thump, a buzz and a short warning. The hull is measured from the boat model, so bigger boats need more room. There is no damage.


| Zone | Name | Distance from the pier |
|---|---|---|
| 1 | Shallow Cove | 0 to 100 m |
| 2 | Coastal Reef | 100 to 300 m |
| 3 | Open Shelf | 300 to 650 m |
| 4 | Abyssal Trench | 650 to 1,500 m |
| 5 | Mariana Rift | 1,500 m and beyond (Expedition Yacht and a strong rod needed) |

- **Weather** cycles between ☀️ Clear, ☁️ Overcast, 🌧️ Rain and ⛈️ Storm. Rougher weather means bigger waves.
- **Storm-only catches** appear in storms (for example the Thunder Eel).
- **The moon** has phases over the days. On a **full moon night** special glowing fish can be caught.
- **Feeding Frenzies** are patches of churning water. Casting into one gives much faster bites and better odds at rare fish.
- **Sea events** (see below) add floating treasure and a boss fish.
- Days and nights pass in real time, and the sky, lighting and lamps change with them.

## The fight

The reel box names the fish's fighting style next to its direction (for example *⚡ RUNNER: LEFT ◀*):

| Style | Fish | What it does | How to beat it |
|---|---|---|---|
| 🐟 Steady | standard-shaped fish | the classic tug of war, left and right | hold the reel and steer the stick against it |
| ⚡ Runner | tuna-shaped fish | every few seconds a long, fast run to one side with a heavier pull | keep countering; the run ends after about 2 s |
| ⬇ Diver | flatfish, groupers, anglerfish, spiky fish and every boss | heavy dives straight down: the reel barely gains and the tension spikes | **ease off the reel** during the dive; read it well (reel held for less than 40% of it) and you gain 4% |
| 🐬 Jumper | slim fish and marlins | a tell (*! SOMETHING IS COMING UP !*), then the fish leaps clear of the water | **tap the action button while *TAP TO DIP THE ROD!* shows**: +7% and less tension. Miss it and the line goes slack (-6%) |
| 〰 Thrasher | eels | changes direction twice as often and moves faster | quick stick work |

Junk, weed and bottles are dead weight, and an underpowered rod skips the events (it is already a losing fight).

**Feel:** while you reel, a strain sound (a hum and a creaking line) rises with the tension, a red vignette closes in from the screen edges above 55%, and above 80% the phone pulses like a heartbeat (with haptics on), faster as it gets worse.

**Landing:** at 100% the game freezes for a split second, drops into slow motion and the catch leaps out of the water in an arc to the angler, with a splash in its rarity colour, a camera kick that grows with rarity, a rising sting (one more note per rarity step) and its name, weight and value floating above it. Then the catch card opens.

## Catch of the Day and the daily streak

- **Catch of the Day:** one fish species a day (picked from the real date, the same for everyone, more often common and uncommon ones) is worth **3x** when you catch it on the rod that day. It is shown on the start screen, the pause screen, the Fish Market's board and with a gold ⭐ TODAY tag in the encyclopedia; the catch card shows *⭐ CATCH OF THE DAY x3*. The first one each day also gives +25 XP.
- **Daily streak:** the first time you play on a new calendar day you get a reward, and playing on consecutive days builds a streak (missing a day starts again at 1):

| Streak day | Reward |
|---|---|
| every day | $10 + $10 per streak day (up to $80) |
| 3, 10, 17... | + 5 Garden Worms |
| 5, 12, 19... | + 5 Live Shrimp |
| 7, 14, 21... | + 3 Glowing Lures and $50 |

## Catches and the encyclopedia

The encyclopedia (📖 Log) tracks **69 catchable things**:

| Kind | Count |
|---|---|
| Fish | 58 (9 Common, 10 Uncommon, 16 Rare, 15 Epic, 8 Legendary) |
| Junk | 7 (boot, tin can, bottles, strongbox, hat, anchor and a message bottle) |
| Flora | 4 (sea lettuce, kelp, bladderwrack, glowing abyssal moss) |

- Fish per zone: 13 in Shallow Cove, 17 in Coastal Reef, 18 in Open Shelf, 15 in the Abyssal Trench and 6 in the Mariana Rift (some species appear in more than one zone).
- 6 fish are **full-moon exclusives** and 5 are **storm exclusives**.
- The log shows your **personal best weight** and catch count per species, flags new discoveries with a **NEW** badge and a red dot on the Log button, and can be filtered by Fish, Junk, Flora or Undiscovered.
- All catches are rendered as 3D models: smooth countershaded fish with species-specific fins, markings, bills, sails, spines and lures, plus modelled junk.

## Bounties, bottles and rewards

- **Bounties:** the board offers three contracts at a time from a pool of 16 (catch fish in a zone, land a heavy fish, land rare catches, clean up junk, and so on). Each pays cash plus bait. The contracts are **written on the three papers pinned to the board** (there is no menu any more): stand in front of it and the camera zooms in so you can read the title, task, reward and progress bar of each. A finished contract gets a red READY stamp; **tap its paper**, or press the action button (*Claim*), to collect, and a fresh contract is pinned up in its place. Tapping an unfinished paper just tells you its progress. A tracker on the HUD shows your closest contract and tells you when one is ready to claim.
- **Message in a bottle:** 36 collectable scrolls are hidden across the four zones. Keep a bottle in your bucket to add its message to the Gallery. Collect all 36 for a **$2,500 Master Archivist** reward.
- **Eco cleanup:** junk and flora you sell are recycled. Every **100 kg** recycled earns a **$1,000 Mayor's Award**.

## Diving and spearfishing

You can leave the surface and hunt fish by hand. You need **dive gear** (to go under) and a **spear gun** (to catch anything); both are in the **Dive Shop** on the harbour terrace (see [Dive gear and spear guns](#dive-gear-and-spear-guns)).

- **Start a dive** with the **🤿 DIVE** button or `X`, either from the **pier tip** or from a **boat that is almost stopped** (speed under 1.5). The button turns into **🫧 SURFACE** while you are under, and pressing it starts an **auto-ascent** (press again to cancel).
- **Swim** with the thumbstick (left / right turn, up / down move forward and back) and the **▲ UP** / **▼ DOWN** buttons (`R` and `F` on a keyboard). The camera is first person with the spear gun in view.
- **Shoot** with the action button (or `Space`). The game **auto-aims**: the fish closest to the crosshair inside a cone and within your gun's range gets a lock marker. A fish that is too heavy for the gun is not landed (*too big for the Band Speargun*), so match the gun to the fish. After a shot the spear is reeled back and the gun reloads.
- **Fish** are the normal catalogue (fish only, with the usual rarity odds). They wander, school together, and flee from you and from a flying spear, staying between the sea floor and the surface. Speared fish count like any catch: encyclopedia, trophies, bounties, XP, records and the market all apply.
- **Air** drains at 1 second per second at the surface and faster with depth (pressure). Warnings come at 25% and 10%. At zero you make an **emergency ascent** and lose the heaviest half of your catch bag. The dive also stops you at your gear's **rated depth**, at the sea floor, and 150 m from where you entered the water.
- **Catch bag:** each gear tier has a bag size in kilograms; when it is full, surface to unload it. When the dive ends the fish go into your bucket, and anything that does not fit is sold on the spot.
- **Underwater world:** a sea floor that changes with depth and distance from shore (sand, then rock, then dark silt), props such as corals and rocks, **wrecks and sunken chests** (open a chest with the action button for cash), a headlamp that matters in the deep, light shafts near the surface, marine snow, bubbles, a whale that sometimes drifts past, and underwater sound and a pressure rumble. The dive HUD shows depth, air, bag and the nearest lock.
- Rocks, coral, wrecks, chests, pilings, the lighthouse rocks and buoys are solid: you slide around them, fish steer away, and the spear stops on them.
- Seven new achievements cover it (see Career): *First Plunge*, *Regular Diver*, *Spearfisher*, *Harpoon Hunter*, *Deep Diver* (30 m), *Abyss Walker* (100 m) and *Wreck Raider*.

## Career: rank and achievements

Everything you do earns **XP**: catches (more for rarer and heavier fish, a bonus for a new species or a new record), bounties, message bottles, treasure and boss fish. There are **12 ranks** from Deckhand to Sea Legend; each rank-up pays cash and bait. Open **☰ Menu → 🏅 Career** for your rank, XP bar, counters (catches, night and storm catches, kilometres sailed, money earned and more) and the **39 achievements**, each with a progress bar and a cash reward that pays out automatically. Old saves get their counters and XP rebuilt from the species records.

## The fish market

Prices move every in-game day (every 3.5 minutes). Each fish species gets a multiplier between **x0.75 and x1.35**; three species are **hot at x1.9** and three are in a **glut at x0.6**. The board in the Fish Market lists today's hot and glut fish and the time until the next prices; the bag and *Sell All* use the current prices, and ▲ ▼ mark fish that are selling well or badly. Junk and flora are unaffected. Prices come from the day number, so nothing extra is saved.

## The Trophy Cabinet

A glass cabinet stands inside the Cabin, on the back wall to the right of the Bottle Gallery. It mounts your **five best species** (ranked by rarity, then how close your record is to the species' top weight) as small 3D fish with name plates. Walk up to it and press **TROPHIES** (or use **☰ Menu → 🏆 Trophies**) for the full list: every fish you have caught with its record weight, catch count and a medal: 🥇 gold at 90% of the species' top weight, 🥈 silver at 70%, 🥉 bronze below.

## Sea events

While you are out on a boat, two things can appear (they are never saved):

- **Treasure chests:** about every one to two minutes (up to two at a time) a chest floats 70 to 220 m away in your current zone, marked by a tall golden beam. Sail within a few metres to collect cash (more in deeper zones), bait and XP. They sink after about 2.5 minutes.
- **Boss shadow:** in zone 3 and deeper, roughly every 6 to 10 minutes a huge shadow circles a marked spot (red ring and beam). Cast into the ring and you hook a boss: a Legendary fish of that zone, heavier than normal and worth double, plus a **$500 x zone** bonus and 150 XP. Your rod must be strong enough or the line snaps. It leaves after about 4 minutes.

A pill under the top bar shows the nearest event with its distance and bearing relative to your boat. The secret menu can spawn both for testing.

## Character customisation

Open it from the start screen (**🎨 Customise Look**), the **☰ Menu** (**🎨 Look**) or **Settings → Appearance**.

- A live **3D preview** that rotates by itself and can be dragged to turn.
- **A human-shaped angler** (since v4.0.0): a real skeleton (hips, spine, chest, neck, head, shoulders, elbows, wrists, hips, knees and ankles) with one smooth skinned body, so knees, elbows and shoulders bend like skin. Stylised adult proportions with a slightly larger head.
- **Male / Female** bodies with different builds. The female body has a natural teardrop-shaped bust (a gentle upper slope and a fuller lower curve) that every top, sweater and coat follows.
- **Bust physics** (since v4.2.0): the bust sits on two soft-tissue bones driven by a damped spring, so it bounces and sways a little with walking, jogging, turning, sitting down, casting and the boat's motion, then settles. Supportive tops (raincoat, hoodie, sweater, fishing vest) hold it firmer and show less of the motion than a T-shirt, tank top, bikini or bare chest.
- Tabs: **Outfits** (quick presets), **Body** (skin tone, height, build, eye colour), **Hair** (style and colour), **Face** (face shape, nose, eyebrows, facial hair, glasses), **Top**, **Bottom**, **Shoes**, **Hat**. Every clothing item has its own colour and the sweater and hoodie have an accent colour.
- **Quick outfits:** one tap sets a whole outfit: *Fisherman*, *Vest & overalls* (fishing vest, bib overalls, cap with flaps), *Beach: Bikini* (bikini, sandals, straw hat, sunglasses), *Beach: Shorts only* (swim shorts, bare chest, barefoot) and *Raincoat day*.
- **Hats and hair:** some hair styles would poke through a hat, so they are greyed out while that hat is worn (and picking a hat that clashes switches the hair to *Short*). Cap blocks Wavy, Bob and Bun; Beanie, Bucket hat and Straw hat also block Ponytail; the Sou'wester also blocks Long. Choose *None* for the hat to use every style. The cap with ear flaps blocks the same styles as the beanie.
- **🎲 Random** rolls a whole new character (it keeps your chosen gender) and **↺ Reset** restores the default outfit.
- Options:

| Category | Choices |
|---|---|
| Skin tone | 6 |
| Height | Very short, Short, Average, Tall, Very tall (about ±8%) |
| Build | Slim, Average, Broad |
| Face shape | Oval, Round, Square, Long |
| Nose | Straight, Small, Button, Broad |
| Eyebrows | Normal, Thin, Bushy |
| Eye colour | 4 |
| Hair styles | Short, Buzz, Wavy, Ponytail, Long, Bob, Bun, Braid, Bald |
| Hair colours | 10 |
| Facial hair | None, Stubble, Mustache, Goatee, Full beard |
| Glasses | None, Round, Sunglasses |
| Tops | Striped sweater, T-shirt, Fishing vest, Tank top, Hoodie, Raincoat, Bikini top, Bare chest |
| Bottoms | Jeans, Bib overalls, Shorts, Swim shorts, Bikini bottom, Skirt |
| Shoes | Rubber boots, Sneakers, Sandals, Barefoot |
| Hats | Sou'wester, Cap, Cap with flaps, Beanie, Bucket hat, Straw hat, None |
| Clothing colours | 14 per item |

Your look is saved and applied immediately in the game world. In the world the angler walks and jogs with bending knees and elbows, breathes and shifts weight when standing, holds the rod in both hands, sits properly on the chair and in the rowboat, and puts the hands on the controls while driving a boat.

## Secret: the Seagull's menu

There is a hidden cheat menu. Stand close to the **seagull perched on the west end post of the boardwalk rail**, at the far left of the boardwalk and press the action button while it reads **WALK EDGE** **31 times in a row**. Pressing any other key or button resets the count, and so does an action press anywhere else.

The menu can show the collision boxes, spawn a treasure chest or boss shadow (on a boat), add money, unlock all gear, restock bait and fuel, change the time of day, weather and moon, discover every species and bottle, complete or reroll bounties, fill or empty the bucket, teleport around the pier, and toggle session-only helpers: instant bites, a line that never snaps, rare-fish luck, infinite bait and infinite fuel. Every cheat asks **Apply cheat?** first, so a stray tap changes nothing; *Cancel*, tapping outside, swiping down or `Esc` all back out. The toggles reset when you reload; changes to money and gear are saved like normal progress.

## Settings

Open **☰ Menu → Settings**.

- **Sound effects** on or off (also on the 🔊 button).
- **Haptics** (vibration) on or off, independent of sound.
- **Graphics:** *High* (with soft sun shadows) or *Battery saver* (renders at lower resolution and turns shadows off).
- **Full screen:** on by default; the game enters full screen when you tap *Start*. Turn it off here to stay windowed. (iPhone Safari does not allow full screen for web pages; the installed home-screen app is already full screen.)
- **Handedness:** *Right* or *Left*; left swaps the thumbstick and action button.
- **Thumbstick:** *Fixed*, or *Floating*, where the stick appears under your thumb anywhere on its half of the screen and the fixed one stays as a faint hint.
- **Button size:** *S*, *M* or *L* for the thumbstick and action button.
- **View:** third person or first person (also the **View** tile in the menu, or `V`).
- **Fade HUD while fishing:** dims the gauges and shortcuts while your line is out.
- **Appearance:** opens the customisation screen.
- **Install app** (when your browser offers it).
- **Save data → Reset:** needs two taps to confirm. Settings are kept when you reset.

Settings are stored separately from the save, so resetting progress never changes them.

## Saving

Progress is saved automatically in your browser's `localStorage`:

| Key | Contents |
|---|---|
| `pixel_fishing_save_v1` | Cash, gear, bucket, discoveries, bounties, appearance, XP, stats, achievements, the daily streak (`daily`), the owned boats (`ownedBoats`) and each boat's fuel (`boatFuel`) and more (save format version 2; new fields are validated and old saves load with defaults) |
| `pixel_fishing_settings_v1` | Sound, haptics, graphics quality, bucket sort order, handedness, thumbstick mode, button size, HUD fade, full screen |
| `pixel_fishing_save_v1_backup` | A copy of a save that could not be read, kept so progress is never silently destroyed |

Every field is **validated and clamped on load**, so a corrupted or hand-edited save can never crash the game. Saves from older versions upgrade automatically (existing players keep their outfit, which is the default look for their gender).

The start screen offers **Continue** (when a save exists) and **New game**, which erases the save after a second tap. The game version shown there is `PF_VERSION` at the top of `index.html`; bump it with each release (it also names the offline cache).

On iPhones the home-screen app and Safari can keep separate saves. Clearing site data erases progress.

## Installing and offline play

The game is a Progressive Web App: it has a web manifest, icons, and a service worker (`sw.js`).

- A **loading screen** shows `Loading... 412 KB / 1.07 MB. Please Wait!` while the game downloads, then `Starting the game...`.
- **Every start re-checks and overwrites the cache.** The loader downloads the 3D engine fresh each time (bypassing the browser cache), overwrites the offline copy, removes caches from older versions and re-fetches the icons and manifest. The service worker is registered as `sw.js?v=<PF_VERSION>` and is re-checked on every load, so a new version always installs a new worker and a new cache. If you are offline, the cached copy is used.
- The **page itself is fetched network-first and never from the browser cache**, so an installed copy picks up new versions whenever you open it online.
- **Static files** (icons, manifest) are cache-first, which is what makes offline play work.
- There is no cache number to bump any more: change `PF_VERSION` in `index.html` for a release. If the list of static files changes, update `PRECACHE` in `sw.js` and `STATIC` in the loader.

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
| E2 | Pooled particles and ripples, feeding frenzies, weather and jumping fish; sea events (treasure and boss) are in the UI section |
| F | Three.js rendering pipeline and screen shaders |
| G | Runtime state and multi-touch controls |
| H | Career (XP, ranks, achievements), the daily market, save state, validation and helper queries |
| I | Boarding, docking and the rescue loop |
| J | Fishing mechanics and the context-sensitive action button |
| K | UI: shop catalogue and bucket lists (brochure, confirm), bucket modal, toolbox, catch reveal, log, gallery, camera, bounties, settings, customise |
| L | HUD and button synchronisation |
| M | Main animation and physics loop |

Notes on the models:

- **Fish** are generated from a per-species spec (length, height, width, fin layout, markings and features) and lofted into a smooth body with vertex-colour countershading, a pixel scale texture, fin rays, a gill arc and a lateral line. They are normalised to fit the catch preview.
- **Boats** share a lofted hull generator (sheer line, keel, rounded quarters, transom, extra rows at every paint-band edge for crisp stripes) with four detailed vessels on top. Paint shifts the hue of the hull's vertex colours.
- **The character** (v4) is a `THREE.Skeleton` with a generated `SkinnedMesh` body: the torso is lofted from chest, waist and hip sections and the limbs along their bones, with skin weights blended across every joint; clothes are skinned shells cut from the same lofts, and the head, hands, shoes, hats and glasses are rigid meshes on their bones. `AnglerAnimator` poses it every frame: a speed-driven gait (walk to jog, the steps follow the ground speed), idle breathing, weight shifts, looking around and stretches, sitting on the chair or the rowboat thwart, the cast wind-up and whip, reeling with the right hand on the crank, leaning back against a fish, a step when boarding, and two-bone IK that puts the hands on the rod, the wheel or the tiller. Last of all, a small spring step (`bustPhysics`) drives the two bust bones (`bustL`, `bustR`, children of the chest and kept at the end of the bone list) from the chest's motion; male rigs have the bones but no weight on them.
- Models keep their footprints and orientation (fronts face +Z, boats point toward -Z), so collisions and interaction ranges do not change when art is updated.
- **Model kit:** `ModelKit.roundedBox` gives every box-built prop bevelled edges (textures stay undistorted), and `ModelKit.mergeStatic` bakes the static pier into one mesh per material look, which roughly halves the draw calls. The film camera, the trophy mounts and the secret seagull stay separate because they move or are rebuilt.
- **Colliders:** everything solid registers in one list, `Colliders`, with layers for walking (`COL.WALK`), boats (`COL.BOAT`) and diving (`COL.DIVE`). The pier walk code, the boat hull collisions and the dive all read from it, so a new prop only needs one `Colliders.box(...)` or `Colliders.circle(...)` line next to its model. The secret menu's **🧱 Debug → Show / hide collision boxes** draws them as wireframes (green walking, orange boats, cyan diving).
- **Shadows:** on *High* graphics the sun casts one soft shadow map that follows the player or the boat.
- **Game loop and time:** `animate()` takes the real frame time (capped at 50 ms) and turns it into world time: 0 while paused or while any menu sheet is open (`isGamePaused()`), 0 during a freeze frame (`hitStop`) and scaled during slow motion (`slowMo`). Camera shake is an offset added after the follow camera and removed at the start of the next frame. Random effects use `chancePerSec(rate, dt)`, so they don't depend on the frame rate.
- **Boat physics:** `updateBoatControl` (thrust against drag, a helm that needs flow, yaw inertia, sideways slip in `boatSide`) and `updateHullMotion` (heave, pitch and roll springs on the swell plus `chopHeight`, planing, banking, slam detection at the bow). Each boat's numbers are in `BOAT_TIERS[n].handling`.
- **Game feel:** `fightTick` runs the fighting styles and returns multipliers for the reel simulation; `startLeap`/`beginLanding` fly a catch model in an arc; the line-strain voice is `sfx.startLineStrain`/`updateLineStrain`/`stopLineStrain`; `endFightFx` turns everything off when a fight ends.

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
- the fight (each style, the jump prompt, pause and the 3-2-1 resume, menu keys blocked mid-fight, the landing moment) and the boat handling numbers (top speed, no spin at rest, turn rates, coasting, slams per zone),
- the action button only responds to the button, not the canvas,
- every one of the 69 catch models builds,
- the app registers its service worker and reloads and runs offline,
- contact-sheet renders of fish, boats, props and characters are reviewed by eye.

## Maintaining this file

**Every update to the game must update this README in the same change:**

1. Update any section the change affects (controls, tables, counts, features).
2. Add an entry at the top of the [Changelog](#changelog) with the date and a short summary.
3. If counts changed (species, bounties, options), update the numbers above.

`CLAUDE.md` repeats this rule for AI-assisted work.

## Changelog

### 2026-11-20, Version 4.9.3: a clear path to the secret seagull
- The west barrel stack moved back from the walkway and the Boatyard and Dive Shop shifted a little east, so the angler can walk up to the seagull on the end post of the boardwalk rail again (it had been walled in since the layout change).
- Version bumped to **v4.9.3**.

### 2026-11-20, Version 4.9.2: smaller shops
- The Boatyard, Dive Shop and Fish Market are built at 85% size (`s` in `SHORE_SHOPS`; each is built full size and scaled, so props, colliders, prompts, lights and stand zooms follow), which gives the boardwalk more room between the buildings.
- Version bumped to **v4.9.2**.

### 2026-11-20, Version 4.9.1: no sitting at the shops
- The angler no longer unfolds the fishing chair, sits down or pulls out the rod while a shop, the Fish Market or the Recycling stand is open: he just stands there. (The chair is for the pier tip and the boats only.)
- Version bumped to **v4.9.1**.

### 2026-11-20, Version 4.9.0: shop catalogues, recycling, a cabin, a new harbour order
- **Catalogue brochure:** the Tackle Shop, Boatyard and Dive Shop open a page-flip brochure (one item per page: a rendered picture, title, stats, description, price and state; arrows, swipe or keys turn the pages; category chips on top; buying asks to confirm). It replaces the counter and camera sliding of v4.8.0.
- **Fish Market:** shows your bucket's fish as a list with a *Sell all fish* button (fish only). New **Recycling stand** with three coloured skips (flora, metal, other) takes junk and seaweed, with a *Recycle all* button and the Mayor's award bar. Bucket Sell buttons follow: fish at the Fish Market, junk at Recycling.
- **New harbour order:** Boatyard (big), Dive Shop (big), Tackle Shop, Bounty board, pier, Recycling, Fish Market (smaller), Cabin. The bottle gallery, trophy case and film camera moved into the new walk-in **Cabin**, whose front wall and roof fade out while you are inside. Colliders, lights, stand zooms, rail-lean spots and the cheat menu's teleports (new: Recycling, Cabin) follow the new layout.
- **Third person:** the island's palms, cottages and bushes are hidden so the camera is never blocked; first person shows them.
- Version bumped to **v4.9.0**.

### 2026-11-20, Version 4.8.0: no more shop menus, real goods on a counter
- **Shop browser:** the Tackle Shop, Boatyard, Dive Shop and Fish Market no longer open a menu. A display counter slides out with the actual goods on it (new low-poly models for 9 rods and the live cam, baits in jars, buckets, scale-model boats, three boat modules, a fuel can, five dive kits, five spear guns, and a crate for *Sell everything*; your own fish go on the counter at the Fish Market). The camera slides from item to item with arrows, swipe or `A` / `D`; category chips switch tabs.
- **Text and confirm:** a price tag on every item and an info card with title, stats, description, price and state. Tapping the centred item (or the card) opens a Buy / Sell confirmation first; the tap that opens it can't confirm it by accident.
- **Mobile:** big arrows, tap targets larger than the models, swipe to browse, and the joystick and action button hide while you browse.
- The old shop modal, its market board panel and its Reset Save button are gone (Reset is still in Settings); the market numbers, Catch of the Day and the recycling perk now show in the *Sell everything* card.
- Version bumped to **v4.8.0**.

### 2026-11-20, Version 4.7.0: fishing stations on boats, a lighthouse jetty, bounties on the board
- **Fishing stations:** with the boat nearly stopped, a *Fish from* row lets you fish from the bow, port, starboard or stern, depending on the hull (rowboat and skiff: all four; trawler: both sides; yacht: stern and both sides). The angler walks to the spot and turns, the chase camera follows, and the cast, the fish's run and the landing go that way. The line now leaves from the rod, not from a fixed point in front of the hull, and the angler no longer snaps between helm and spot.
- **Lighthouse jetty:** a wooden jetty on the lighthouse rocks with a berth for any boat. Dock from the helm, fish from its tip or rail, cast off with a chip or the throttle. New colliders for the deck and pilings.
- **Bounty board:** the three open contracts are drawn on large readable papers on the board and are claimed by tapping a finished paper (or the action button). The bounty menu is gone; claiming pays out, pins a new paper and celebrates.
- Version bumped to **v4.7.0**.

### 2026-11-20, Version 4.6.0: shops on the boardwalk facing south, a dock fuel pump, no more boat paint
- **Shops face south with their backs to the sea:** the Boatyard, Fish Market and Dive Shop moved from the terrace onto the waterfront boardwalk, which is now 42 m long (it was 21 m), with new pilings, rails, joists and end fascias; the coastal boulders, barrel stacks and the secret seagull moved out to the new ends, and two palms stepped back so they don't block the shop camera. The terrace is scenery again (no more walking up there, and no camera swing).
- **Dock fuel pump:** the low mooring platform is twice as long toward the sea, with a third pontoon, piling and cleat. A red fuel pump with a lit globe stands at its sea end right by the moored boat (*REFUEL* fills the moored boat at $0.50 a unit), and the Boat Terminal moved to the other sea-end corner.
- **Boat paint removed:** the Paint tab, the six paints, the hull recolouring code, the `paint` / `ownedPaints` save fields and the *Fresh Coat* achievement are gone (39 achievements now). Old saves simply drop those fields.
- Version bumped to **v4.6.0**.

### 2026-11-20, Version 4.5.0: a wider pier, shops on the terrace, daylight far out at sea
- **Wider pier:** 6.9 m instead of 4.9 m. Rails, pilings, lamps, bracing, bunting, the bollards and rod rack all moved out; the stairs, mooring platform, Boat Terminal and moored boat moved out with the port rail; the bucket and toolbox stand a little further apart. Walking, the rail lean spots, boat collisions and diver collisions follow the new width.
- **Harbour terrace and three new shops:** you can now walk off the back of the boardwalk onto the terrace, where a **Boatyard** (boats, modules, paint, fuel), a **Fish Market** (selling, market board, recycling perk) and a **Dive Shop** (dive gear, spear guns) stand facing the sea, each with its own sign, awning, shopkeeper, props and night light. The **Tackle Shop** now sells rods, bait and buckets only. The camera swings round on the terrace to look at the shop fronts and auto-zooms on a shop when you stop in front of it.
- **Selling:** only the Fish Market buys your catch now (its screen lists every item with its price and market trend).
- **Sky far out:** the deep zones no longer turn the daytime sky nearly black. By day the sky stays a daylight sky with only a light tint per zone; the water still turns deep blue, and the dark zone colours show at night and in bad weather.
- Version bumped to **v4.5.0**.

### 2026-11-20, Version 4.4.0: boat fleet terminal and a reversing camera
- **Fleet:** every boat you buy is kept; a new **Boat Terminal** kiosk on the mooring platform lets you choose which one is moored. Each boat has its own fuel tank. New save fields `ownedBoats` and `boatFuel` (validated; older saves own every boat up to their current one).
- **Reversing camera:** going astern swings the chase camera round to look the way the boat is moving (first person turns to look back).
- Version bumped to **v4.4.0**.

### 2026-11-20, Version 4.3.0: game feel, fight styles, daily catch, real boat handling, fixed boats
- **Landing moment:** a freeze frame, slow motion and the catch leaping out of the water to you, with a rarity splash, camera kick, a rising sting and its name, weight and value floating up, before the catch card.
- **A line that feels alive:** a strain sound that rises with the tension, a red vignette at the screen edges and a heartbeat on the phone near snapping point.
- **Fish fighting styles:** steady, runners, divers, jumpers (tap to dip the rod when one leaps) and thrashers. See [The fight](#the-fight).
- **Pause screen:** ⏸ button, `P` or `Esc`; it also opens by itself when you switch away mid-fight or hide the tab. Sound toggle, menu and a controls cheat sheet; in a fight it resumes with a 3-2-1 countdown.
- **Catch of the Day and daily streak:** one species pays 3x each day; daily rewards that grow with your streak. New save field `daily` (validated).
- **Boat handling:** lower top speeds (8 / 13 / 15 / 20 m/s), thrust against drag with slow coasting, a helm that needs flow (no spinning on the spot), yaw inertia, skids in fast turns, and a hull that heaves, pitches, rolls, planes, banks and slams into chop with spray, a thud and a camera jolt.
- **Boat models:** the trawler's wheelhouse and the yacht's cabin no longer sink into the hull (both hulls had far too much freeboard above their decks); the trawl doors and rail floats were moved to match, and the yacht's outboards now sit on the transom.
- **Fixes:**
  - The fight kept running behind menus (B, L and T now wait until the fight ends, and every menu freezes the world clock: weather, time of day, sea events, treasure timers, the fight).
  - Camera shake was being smoothed into a slow wobble by the follow camera (now an offset that is removed every frame).
  - Ripples, wakes, frenzy rings and glow sparkles spawned more often on high refresh-rate screens (now per second).
  - Sound kept playing in a hidden tab (the audio now suspends and resumes, also on iOS after a touch).
  - The game saved to `localStorage` every frame while sailing (now every 2 s).
  - Fewer per-frame allocations in the camera, fight and live bait cam code.
- Version bumped to **v4.3.0**.

### 2026-11-20, Version 4.2.0: teardrop bust and bust physics
- **Shape:** the female bust is reshaped from two round bumps into a natural teardrop (a long, gentle upper slope, a fuller rounded lower curve and a soft crease underneath), with a finer mesh through the chest so the curve looks smooth. All tops, the bikini and the overalls bib follow the new shape.
- **Physics:** two new soft-tissue bones on the chest, moved by a damped spring that reacts to the body's motion (walking bob, jogging, turning, sitting, casting, boat pitch and roll). Motion is soft up and down, gentler sideways and firm front to back, stays within a few centimetres and settles in about a second. Teleports such as boarding or changing outfit reset it, so there is never a jolt.
- **Support:** the raincoat, hoodie, sweater and fishing vest hold it firmer. The T-shirt, tank top, bikini and bare chest move more.
- The male body is unchanged.
- Version bumped to **v4.2.0**.

### 2026-11-20, Version 4.1.0: benches, leaning on the rail, proper boat helms, compass
- **Sit on the benches:** stand still in front of a boardwalk bench for two seconds and the angler sits down, leans back, rests his hands on his thighs and now and then crosses his legs. Moving gets him up.
- **Lean on the railing:** stand still at the pier rails (or the free parts of the boardwalk rail) for two seconds and he leans his forearms on the top rail, crosses one foot behind the other and gazes out to sea.
- **Boat helms rebuilt for the human angler:** a tiller arm on the rowboat, a console wheel facing you and a leaning post on the skiff, a helm chair in an open-backed wheelhouse on the trawler (its roof turns see-through in third person while you drive), and a raised helm seat behind a lower cabin on the yacht. Hands stay on the wheel or tiller and the wheels turn with steering. First-person views look out over each bow.
- **Compass:** a heading tape under the top bar. North is straight out to sea, so the island and the pier are to the **South**.
- **Keyboard = action button:** `Space`, `E` and `Enter` all do exactly what the action button shows (hold to cast). `E` no longer boards your boat from anywhere on the pier.
- **Bucket hitbox:** the bucket's collision box is measured from the bucket model on the pier, so it grows with every upgrade.
- Version bumped to **v4.1.0**.

### 2026-11-20, Version 4.0.1: slower walking
- The angler walks at about **3 m/s** at full stick instead of 6.5 m/s, with longer, calmer steps, so the new body walks at a brisk pace instead of jogging. Half stick walks slower still.
- Walking diagonally is no longer about 40% faster than walking straight.
- Version bumped to **v4.0.1**.

### 2026-11-20, Version 4.0.0: a human angler
- **New body:** the toy-like figure is replaced by a stylised adult on a real skeleton (spine, neck, shoulders, elbows, wrists, hips, knees and ankles) with one smooth skinned body, so joints bend like skin instead of hinges. Hands have fingers that curl round the rod, and feet have heels and toes.
- **Clothes bend with the body:** shirts, sweaters, hoodies, raincoats, jeans, shorts and overalls are skinned to the same skeleton.
- **New customisation:** height (five steps), build (slim, average, broad), face shape (oval, round, square, long), nose (straight, small, button, broad) and eyebrows (normal, thin, bushy); new clothes: a **fishing vest**, **bib overalls** and a **cap with ear flaps**, plus a *Vest & overalls* quick outfit. Old saves keep their look and get the defaults for the new options.
- **Human movement:** a gait that follows your speed (walk to jog, with knees, elbows, hip sway and counter-rotating shoulders), idle breathing, weight shifts, looking around and an occasional stretch; a cast with a wind-up and a whip; reeling with the right hand turning the crank and the body leaning back as tension rises; sitting properly on the chair and the rowboat thwart; hands on the console, wheelhouse door or tiller while driving; a step when boarding or docking. The customise preview plays the idle animation.
- First person now takes its eye height from the head bone.
- Version bumped to **v4.0.0**.

### 2026-11-20, Version 3.10.0: angler polish
- **Shoes:** the flat slab soles are replaced by rounded soles shaped like the foot (wider at the ball, narrower at the heel) with a heel block, on boots, sneakers and sandals. Sneakers also get a toe cap and criss-cross laces.
- The animation rig, every customisation option and the presets are unchanged (the character was already built from smooth lathed shapes, so this is a light polish).
- Version bumped to **v3.10.0**. This completes the model upgrade started in v3.6.0 (pier, island, boats, fish and underwater, angler).

### 2026-11-20, Version 3.9.0: better fish and underwater props
- **Fish:** smoother bodies (about twice the polygons) with cleaner pattern edges, fin rays fanning out from the root of every fin, a gill-cover arc and a lateral line on both sides. All 69 catch models still build and fit the catch preview.
- **Seabed rocks** are lumpy, shaded low-poly rocks instead of twelve-sided shapes.
- **Shipwrecks** are a ribbed wooden hull lying on its side: keel, ribs, broken planks, deck beams, a stem post and a fallen mast with its yard. They keep the same footprint, so the wreck colliders from v3.5.1 still fit.
- Version bumped to **v3.9.0**.

### 2026-11-20, Version 3.8.0: better boats
- **Smoother hulls:** the lofted hull has almost twice as many sections, and every paint band gets its own edge rows, so the stripes, boot-top and waterline are clean straight lines instead of zigzags. The transom is one flat colour (no more streaks).
- **Rowboat:** steamed ribs inside the hull, oarlocks, a bow painter rope and a bailer.
- **Skiff:** a T-top canopy with a VHF aerial, grab rails, bow cushions, a livewell lid and cleats.
- **Trawler:** hull portholes, framed wheelhouse windows, a wheelhouse door and ladder, a life-raft canister, a green net with floats on the drum, floats along the rail and an exhaust cap.
- **Expedition Yacht:** hull portholes, a window band, flybridge rails, a radome, bow sun pads, an anchor, bench cushions and an orange tender on the cabin roof.
- Every boat keeps its size, its ride spot and its paint options; the hull collision capsule is still measured from the model.
- Version bumped to **v3.8.0**.

### 2026-11-20, Version 3.7.0: better island, lighthouse and buoys
- **Island:** the cone-shaped hills are replaced by one rolling heightfield with lighter and darker grass, dry patches and rocky slopes, plus bushes and rocks scattered over it.
- **Palm trees:** eight palms with curved, ringed trunks, drooping leafy fronds and coconuts (there were four simple ones).
- **Fishermen's cottages:** four little houses along the back of the harbour terrace, with gabled tiled roofs, chimneys, doors, shuttered windows and flower boxes, and a stone path from the pier ramp.
- **Rocks:** the seawall boulders and the lighthouse rocks are lumpy, shaded low-poly rocks instead of plain twelve-sided shapes.
- **Lighthouse:** a tapered red-and-white tower with a stone base, a door, windows, a gallery railing, a framed lantern room with a dome and vent, and a keeper's hut on the rocks. The rotating beacon is unchanged.
- **Buoys:** lattice day-marks with legs, hoops, a top deck, a radar reflector, a number board and a solar panel.
- Collisions are unchanged: the island shore, lighthouse rocks and buoys keep their colliders. The new cottages and hills are beyond where you can walk or sail.
- Version bumped to **v3.7.0**.

### 2026-11-20, Version 3.6.0: better pier models, shadows and one collision system
- **Better pier models:** every box-built prop now has bevelled edges. The **tackle shop** has a shingled roof, a chalk price board, stacked fish crates, an oar, a mounted trophy fish, a coiled net with floats and a shopkeeper with an apron. The **bounty board** has stone footings, crossed oars, a ship's bell and barrels. The **trophy cabinet** has a cornice, brass feet, a framed glass door, a light strip and brass plaques. The **bottle gallery** has a driftwood frame, a rope trim, a cloth fringe and a ship in a bottle. The **film camera** has a clapperboard and a cable coil.
- **New boardwalk props:** two benches facing the sea and barrel stacks at both ends, all solid.
- **Soft sun shadows** on *High* graphics (off on *Battery saver*).
- **Fewer draw calls:** the static pier is merged into a few meshes, which roughly halves the draw calls on the pier.
- **One collision system:** the stands, benches, barrels, pilings, pier, lighthouse and buoys all register in one collider list used by walking, boats and diving. The walking boxes now keep a little extra room for the angler's body. A new **Debug** section in the secret menu shows every collision box.
- Version bumped to **v3.6.0**.

### 2026-11-20, Version 3.5.1: collision sweep
- **Underwater collisions:** seabed rocks, coral, shipwrecks, sunken chests, the pier and mooring pilings, the lighthouse rocks and the channel buoys are now solid for the diver, for the fish and for the spear (the spear stops on rock and returns). Before, you could swim, and fish could swim, straight through them. Kelp, grass and tube plants stay soft on purpose.
- **Pier walking:** found by walking the whole pier and boardwalk and testing the angler's body against every mesh in the scene. The mooring platform no longer lets you stand inside the two corner pilings (the limit moved 25 cm in), the boardwalk ends stop short of the beach boulders (limit 9.3 m at the beach end), and the shop and trophy cabinet boxes were widened by a few centimetres to cover their props.
- Checked: all 69 catch models build, a corrupted save boots with no errors, and the dive, spear and surface flow runs without errors.
- Version bumped to **v3.5.1**.

### 2026-11-20, Version 3.5.0: diving and spearfishing
Made by hand in `index.html` and documented here.
- **Diving:** a **🤿 DIVE** button (and `X`) takes you underwater from the pier tip or a slow boat. Swim in first person, with air that drains faster with depth, a rated depth per gear tier, a headlamp, a catch bag and an auto-ascent. Running out of air means an emergency ascent and a lost half-bag.
- **Spearfishing:** a spear gun with auto-aim lock-on fires at schooling, fleeing fish from the normal catalogue; heavier fish than the gun's power are not landed. Speared fish register like normal catches (encyclopedia, trophies, bounties, XP).
- **Gear:** five dive gear tiers ($140 to $9,800) and five spear guns ($60 to $6,200), in new **🤿 Dive** and **🔱 Spear** shop tabs. Saved as `diveTier` and `spearTier` (validated, old saves default to none).
- **Underwater world:** a sea floor with depth-based colour, props, wrecks and sunken chests with cash, light shafts, marine snow, bubbles, a passing whale, and new underwater sounds.
- **Career:** new counters (dives, fish speared, deepest dive, dive time, chests) and **7 new achievements** (40 in total). The secret menu gained dive-gear, harpoon, seabed and rare-fish cheats.
- Version bumped to **v3.5.0**.

### 2026-11-20, Version 3.4.0 (manual updates 3.1.0 to 3.5.0): first person, sweet-spot casting, postcards
These changes were made by hand in `index.html` after v3.0.0 and are documented here. (The in-game version string reads 3.4.0.)
- **First-person view:** a new View tile in the menu (and the `V` key) puts the camera in the angler's head; the stick turns and walks. The view is saved in the settings.
- **Stand auto-zoom:** standing still for 0.5 s in front of a stand swings the camera in on it, no key press needed.
- **Casting sweet spot:** a yellow zone at 72 to 88% on the cast bar; the label shows *★ SWEET!* inside it.
- **Fishing feedback:** floating *! BITE !* and *LINE SNAPPED!* callouts at the bobber, camera shake on bites and heavy tension, a narrower field of view while reeling, and the camera looks toward the hooked fish. The drag meter now sits at the top of the screen so thumbs never cover it, and toasts drop to the bottom while a fish is on. Boats pitch and bank with speed and turning.
- **Director's Camera:** the lens list is cut to four (Normal, 8-Bit CRT, Pixelate, Pocket DMG-01); the Game Boy lens was redone with dithering and colour-difference outlines. New **Snap Postcard** button saves a PNG.
- **Start screen:** simpler card (the collapsible *How to play* is gone); the main button reads *START NEW GAME*, or *CONTINUE* with a save summary and a separate *NEW GAME* button.
- **Pier tweaks:** the secret seagull moved to the west corner of the boardwalk rail (the other perched seagulls were removed), the rod rack sits between two rail posts, the life ring moved back to sit between two rail posts, the rail posts are 5 cm wider apart, and the boardwalk bunting and its posts sit a little further forward.
- **Loading:** the local copy of the 3D engine now times out after 1.8 s and falls back to the cdnjs, jsDelivr and unpkg copies in turn, with the progress counter following along.
- **Performance:** splash particles and ripples now come from reusable pools with shared materials instead of creating and disposing meshes, and several per-frame vector allocations were removed.
- Catch counts are unchanged (69 catchable things).

### 2026-11-18, Version 3.0.0: career, trophies, sea events, market and the Mariana Rift
- **Career:** XP, 12 ranks and 33 achievements with cash rewards (☰ Menu → Career). Old saves are migrated from their species records.
- **Fish market:** daily prices per species with hot (x1.9) and glut (x0.6) fish, a market board in the shop, and sell prices that follow the market.
- **Trophy Cabinet** on the boardwalk showing your five best fish as 3D mounts, plus a Trophies screen with gold, silver and bronze medals.
- **Sea events:** floating treasure chests with golden beams and a boss shadow that forces a Legendary catch with a big bonus; an event pill shows the nearest one. The frenzy readout now points relative to your boat.
- **Endgame:** the **Mariana Rift** (zone 5, 1,500 m and beyond), six new fish (1 Rare, 2 Epic, 3 Legendary), 2 bounties, the **Expedition Yacht**, the **Mythril Deepcaster** rod, the **Deep-Freeze Vault** bucket and six **boat paints**.
- **Bug fix:** the toast queue could freeze the game when four toasts arrived at once (an endless loop); fixed.
- Catalogue is now 69 catchable things (58 fish); version bumped to **v3.0.0**.

### 2026-11-18, Version 2.4.0: sonar frenzies and a proper boat ride
- **Frenzy:** the FRENZY readout and the frenzy rings and ripples on the water now need the **Sonar** module and are only shown while you are aboard a boat (driving, casting or reeling). Before, the readout also showed on the pier and the rings were visible to everyone. The frenzy fishing bonus itself is unchanged.
- **Boat ride:** the angler no longer floats at the middle of every boat. He sits on the rowboat's stern thwart, stands behind the skiff's console and at the trawler's wheelhouse door, and moves, tilts and bobs with the hull. His hands go to the wheel or tiller while steering and the rod is stowed until you cast.
- Version bumped to **v2.4.0**.

### 2026-11-18, Version 2.3.1: coasting and softer lights
- **Out of fuel:** the boat no longer stops dead. It coasts and slows down by water drag, and the coast guard tow starts only once it has stopped. Fuel is burned only under power, so gliding is free.
- **Lights:** warmer, paler colours and roughly a third less brightness on the pier lamps, stand lights, light pools and the lighthouse (night glow 3.6 to 2.4, pool glow 0.55 to 0.28). The numbers are gathered in `LIGHT_TUNING` in `index.html` if you want to tweak them.
- Version bumped to **v2.3.1**.

### 2026-11-18, Version 2.3.0: lighthouse, stand reach, longer pier, new deck wood
- **Lighthouse:** a rotating beacon with two sweeping beams and a flare that flashes as the beam passes you. The flare is not affected by fog or distance, so it is visible even 2000 m out.
- **Stand reach:** the shop, bounty board, gallery, camera, bucket, toolbox and moored boat now react only when you are within about a metre of their front, instead of from several metres away (and no longer overlap each other).
- **Longer pier:** two more planks (1.44 m). The bucket and toolbox stay where they were; the walking limit, fishing spot, rails, lamps, pilings, stringers and boat collision moved out with the tip.
- **Pier wood:** the boardwalk was built twice on top of itself (flickering planks near the island); fixed. New board texture with the grain along each plank, three tints, dark joists and underlay so the gaps are no longer see-through, trim along the island edge, and the stone abutment no longer shows through the gaps.
- Version bumped to **v2.3.0**.

### 2026-11-18, Version 2.2.0: pier lighting and loading screen
- **Lighting:** every stand now has its own light: warm string lights and a glow under the tackle shop awning, a gooseneck lamp over the bounty board, a teal light for the bottle gallery, a lamp post by the film camera, and a lantern on the mooring piling. The pier lamps moved onto the rails in pairs (entrance, around the bucket and toolbox, and the tip). Each light also lays a soft glow on the deck at night. Battery-saver graphics keep the glows but drop the extra real lights.
- **Loading screen** with a progress bar and `Loading... [size] / [size]. Please Wait!`.
- **Cache refresh on every load:** the 3D engine is re-downloaded and the offline cache overwritten at each start, the service worker is versioned (`sw.js?v=...`) and re-checked every time, and old caches are deleted. The page is never served from the browser cache.
- Version bumped to **v2.2.0**.

### 2026-11-18, Version 2.1.0
- Game version bumped to **v2.1.0** (shown on the start screen): boat camera and controls update, boat collisions, full screen, cheat confirmation and the mobile interface.

### 2026-11-18, Camera follows the boat
- The sailing camera rotates with the boat again (with a short, smooth lag, so turns never snap), and the stick works relative to the boat: up sails ahead, left and right turn, down brakes and then reverses. Banking, momentum and the collisions are unchanged, and backing into the pier or beach now bumps and slows as well.

### 2026-11-18, Boat collisions, boat control, Continue / New game
- **Real boat collisions:** the invisible wall at the pier is gone. The pier, boardwalk, stairs, mooring platform, pilings, island shore, lighthouse rocks and buoys are solid, using a hull shape measured from your boat; you slide along them instead of stopping dead.
- **New boat control:** the thumbstick now points where the boat should go (arcade style) instead of tank steering. Turning depends on speed, the boat banks into turns, and the camera keeps a fixed view out to sea so stick directions always match the screen. Boarding and rescue now place the boat beside the pier tip at (-8.2, -9.0).
- **Start screen:** shows the game version (v2.0.0) and, when a save exists, a **Continue** button with a short summary plus **New game** (two taps to confirm). The card scrolls on short landscape screens.

### 2026-11-18, Full screen by default
- The game now enters full screen when you start it, on phones, tablets and desktops (before, only on narrow screens). New **Full screen** switch in Settings to opt out.

### 2026-11-18, Cheat confirmation
- Every secret-menu cheat (including the toggles) now opens an **Apply cheat?** dialog with Apply and Cancel before anything changes.

### 2026-11-18, Mobile interface, part 3: sheets and feedback
- **Bottom-sheet menus** on phones (full-screen-height in short landscape): drag handle, **tap outside or swipe down to close**, dialog roles for screen readers, focus handling. The catch screen stays modal.
- **Shop:** cash in the header, tabs stay pinned while the list scrolls, and buttons you cannot afford say how much more you need.
- **Catch screen:** Keep and Release stay pinned at the bottom.
- **Feedback:** every button gives a soft tick and a short buzz (respecting the Sound and Haptics settings).
- **Start screen:** collapsible *How to play*. Animations are switched off for players with reduced-motion on.
- Bag and Log buttons removed from the bottom of the screen (they are in the menu).

### 2026-11-18, Sea collisions
- Boats now collide with the **lighthouse and its rocks** and with the **channel buoys**: you slide along them, lose speed, and get a thump, a buzz and a short warning toast.

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
