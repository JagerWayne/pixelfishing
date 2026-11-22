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
13. [The Aquarium](#the-aquarium)
13a. [Harbour Town, its people and the story](#harbour-town-its-people-and-the-story)
13b. [Your restaurant and cooking](#your-restaurant-and-cooking)
14. [Sea events](#sea-events)
15. [Character customisation](#character-customisation)
16. [Secret: the Seagull's menu](#secret-the-seagulls-menu)
16a. [The interface (Tide Glass)](#the-interface-tide-glass)
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
| Walk / run | Thumbstick, **steered like a car**: left / right turns the angler on the spot (any angle), up walks forward, **down turns him round** (the camera swings round behind him) and he walks that way. A light push walks (up to 2.4 m/s), a **full push runs** (3.8 m/s). The camera stays behind him and turns with him. Or **tap the ground** (or a shop, or someone) to walk there by yourself | `A` `D` turn, `W` forward, `S` turn round and walk; hold `Shift` to run |
| Look around | **Drag on the screen** to look around (it swings back behind the angler when you walk; in first person dragging turns you). Tap the **compass** (top right, under the status bar) to look straight ahead again | none |
| Talk to someone | Walk up to them: the action button says **💬 TALK** | `E` |
| Open the menu | **☰** (right end of the status bar): a **side drawer** with Pause, Map, Bag, Log, Settings, Career, Records, Look, Sound, View (first / third person), Filter (camera filters and postcards), Quests and Exit | none |
| Harbour map | **☰ → 🗺️ Map** (📍 on the map drops buoys) | `M` |
| Tip a chum bucket | **🪣 CHUM** beside the action button on a stopped boat | `C` |
| Quests | **☰ Menu → 📜 Quests** | none |
| Sail the boat | Thumbstick: **up** is the throttle, **left / right** the helm, **down** brakes then reverses. The helm needs the boat moving (no spinning on the spot) | `W` `S` throttle and reverse, `A` `D` or arrow keys steer |
| Cast, reel, interact | On-screen **action button** (bottom right) | Hold `Space`, `E` or `Enter` (all three are the action button: they do exactly what the button shows) |
| Open bag / bucket | **☰ Menu → 🪣 Bag** | `B` |
| Open encyclopedia | **☰ Menu → 📖 Log** (a dot on ☰ marks new species) | `L` |
| Toolbox or bucket (when nearby) | Action button | `T` |
| Dive / surface | **🤿 DIVE** button (next to the action button) | `X` |
| Swim up / down while diving | **▲ UP** / **▼ DOWN** buttons | `R` / `F` |
| Switch **first person / third person** view | **☰ Menu → 🎥 View** row (says *first person* or *third person*) | `V` |
| See every objective | Tap **+N** next to the objective chip under the status bar (tap **−** to fold it again) | none |
| Close a menu | **Close** button | `Esc` |
| **Pause** (world stops, sound toggle, controls help) | **☰ → ⏸ Pause** (opening the menu already stops the world) | `P` or `Esc` (when no menu is open) |

**First person** puts the camera in the angler's head, looking where you face. The thumbstick then turns you on the spot (left / right) and walks forward or backward (up / down); on a boat the normal boat control and chase camera apply. The choice is remembered in the settings. Whenever you stand still for half a second in front of a stand, the camera also **zooms in on it** by itself, but only at the **Bounty Board** (to tap its papers) and the **Aquarium** (its slow sweep along the tank) since v6.6.2; it lets go as soon as you move. Shops only frame themselves while their sheet is open.

The action button changes with context: *Walk Edge*, *Hold Cast*, *Shop*, *Bounties*, *Gallery*, *Board / Dock*, *Read* (seated on a bench), and so on. Where there is nothing to do the button hides (the **🗺️ Map** is in the side drawer and on `M`). A tap on the 3D view walks you to that spot (it never casts or buys).

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

- **The shop sheet (every shop, stand and counter, v6.7.0):** press *Browse* (or *Sell fish*, *Kitchen*, *Aquarium* and so on) and a dark sheet slides up over the lower part of the screen while the camera stays on the shop. On top: the shop's name, **your cash** and a close button; under it the **departments** as pill tabs (Tackle: Rods, Bait, Rigs, Buckets, Book; Boatyard: Boats, Modules, Fuel, Book; and so on). In a catalogue every good of the department is a **card**: its 3D picture, a badge (*Equipped*, *Owned*, *Locked*), the title, stats, the full description, the price and one button (*Buy*, *Equip*, *Install*...). A card you cannot use yet says why in red.
- **Buying:** the card's button opens a **confirmation** first (*Buy X for $Y?*, *Cash $a → $b*, *Cancel* / *Buy*); the touch that opens it can never confirm it by accident.
- **Lists (Fish Market, Recycling, aquarium, restaurant):** the same cards: each row is one piece from your bucket (icon, name, kg, price, hot or glut marks) with a *Sell* / *Recycle* button, and a big button at the bottom sells or recycles them all (or collects the tickets or takings).
- **Accessible:** the sheet is a proper dialog for screen readers; the departments are a real tab list (arrow keys, Home / End, `1` to `5`), arrow up / down moves between buttons, focus stays inside the sheet and returns to the right button after a confirmation, `Esc` closes, every button says what it acts on (*Buy Carbon Surf Rod for $750*), results are announced, buttons are at least 44 px and the slide animations are off when your device asks for reduced motion. The town counters (noticeboard, Post Office, tavern, traps, workshop, greenhouse, bunk) use the same cards.
- The pictures are the goods' 3D models, rendered once to small images and cached, so every shop item has a model (`WorldBuilder.buildShopItem`).

**The cabin** (right end of the boardwalk) is a walk-in room: the **bottle gallery** on the back wall to the left, the **aquarium** to the right, and a bunk bed, rug, lamp and window. Stand beside the **bunk** and the action button says **🛏️ SLEEP**: it opens the bunk sheet with the **🏆 Trophy Wall** (mount your heaviest fish over 18 kg, or a boss you landed, on a plaque above the bunk: a 3D replica with species, weight, zone and day) and, from 18:00, **Sleep**: the screen fades and you wake at **06:00** the next morning (a new day: weather, moon, market prices and the aquarium's daily care move on, and the restaurant keeps serving through the evening) having **read 30 pages** of your selected book (the last one opened on a bench, else the first unfinished one). The front wall and roof fade away while you are inside so the camera can see in.

In **third person the island's palms, cottages and bushes are hidden** so the camera never gets stuck behind them; first person shows them again.

| 📋 **Bounty Board** | Your three open contracts are written on papers pinned to the board (title, task, reward, progress). Tap a finished paper (marked READY) or press the action button to claim it. |
| 📜 **Bottle Gallery** (cabin, back wall left) | Browse the message-in-a-bottle collection. |
| 🎬 **Camera filters** (side drawer → **🎬 Filter**, since v6.6.2; the cabin's film camera is gone) | Change the camera filter (**Normal**, **8-Bit CRT Monitor**, **Pixelate** and **Pocket DMG-01**, a four-shade handheld look with dithering and dark outlines so boats and fish stay readable) and press **📸 SNAP POSTCARD** to save the current view as a retro postcard PNG (it includes the zone and lens name). |
| 🧰 **Tackle Toolbox** | Pick which bait to fish with. |
| 🪣 **Catch Bucket** (open cooler, fish box or freezer depending on your upgrade) | See and manage what you caught. |
| ⚓ **Moored boat** (down the stairs on the port side, beside the low mooring platform, which is 4.5 m long since v4.6.0) | Board your boat once you own one. |
| 🛥️ **Boat Terminal** (sea end of the mooring platform, inner corner) | Choose which of your boats is moored. |
| ⛽ **Dock fuel pump** (sea end of the mooring platform, right by the boat) | Fills the moored boat's tank at $0.50 a unit (as much as you can afford). |
| 🪑 **Benches** (16: the boardwalk, the town plaza, the upper terrace, the Market Square, the tide pool and the Lookout) | Walk up and press **🪑 SIT** (or stand still in front of one for two seconds); the angler sits down, leans back and now and then crosses his legs. While reading, his right index finger follows the lines on the page. Each bench has a lamp that glows at night over a warm pool of light. Move to get up. |
| 🌊 **Railing** | Stand still at the pier rails or the free parts of the boardwalk rail for two seconds and the angler leans his forearms on the rail and gazes out to sea. |
| 🪑 **Pier tip** | Where you sit and fish from the pier (the pier is two planks longer since v2.3.0; the bucket and toolbox stayed where they were). |

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

### Rigs (v6.5.0)

A **rig** goes on the line with any bait, one at a time (Tackle Shop → **🪝 Rigs**; equip or take off there or at the pier toolbox):
| Rig | Price | Effect |
|---|---|---|
| 🎯 Surface Popper | $220 | Bites come 25% faster; jumpers (marlins, slim fish) are 2.5x as likely, bottom-dwellers (flatfish, anglers) almost never bite |
| ⚓ Weighted Deep Jig | $480 | From the Open Shelf out (zones 3 to 5): bites come 15% sooner and fish that dive pull 20% less on the line |
| 🪣 Chum Bucket | $140 for 3 | On a stopped boat press **🪣 CHUM** (or `C`): a feeding frenzy gathers off the stern, visible even without a sonar |

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

- **Bounties:** the board offers three contracts at a time from a pool of 16 (since v4.10.0 only ones you can actually do: the farthest zone is the pier's zone 1, or your boat's top zone, and a heavy-fish contract must be within your rod's rated weight and a species that big must live in reach; the three are balanced into a mix of types and of easy, medium and stretch contracts, and a claimed paper is replaced the same way; old saves swap any untouched contract that was out of reach) (catch fish in a zone, land a heavy fish, land rare catches, clean up junk, and so on). Each pays cash plus bait. The contracts are **written on the three papers pinned to the board** (there is no menu any more): stand in front of it and the camera zooms in so you can read the title, task, reward and progress bar of each. A finished contract gets a red READY stamp; **tap its paper**, or press the action button (*Claim*), to collect, and a fresh contract is pinned up in its place. Tapping an unfinished paper just tells you its progress. A tracker on the HUD shows your closest contract and tells you when one is ready to claim.
- **Message in a bottle:** 36 collectable scrolls are hidden across the four zones. Keep a bottle in your bucket to add its message to the Gallery. Collect all 36 for a **$2,500 Master Archivist** reward.
- **Eco cleanup:** junk and flora you sell are recycled. Every **100 kg** recycled earns a **$1,000 Mayor's Award**.

## Diving and spearfishing

**Thermal vents and reef overhangs (v6.5.0):** from the Coastal Reef out, the sea floor has **thermal vents** (rising bubbles over a glowing cone: swimming in the column lifts you and gives **+15% air**, once every 45 s per vent) and **reef overhangs** (rock arches with one or two **lurkers**: eels and rare fish worth 50% more, which bolt if you swim in fast, so approach slowly).

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

Everything you do earns **XP**: catches (more for rarer and heavier fish, a bonus for a new species or a new record), bounties, message bottles, treasure and boss fish. There are **12 ranks** from Deckhand to Sea Legend; each rank-up pays cash and bait. Open **☰ Menu → 🏅 Career** for your rank, XP bar, counters (catches, night and storm catches, kilometres sailed, money earned and more) and the **45 achievements**, each with a progress bar and a cash reward that pays out automatically. Old saves get their counters and XP rebuilt from the species records.

## The fish market

Prices move every in-game day (every 7 real minutes since v6.2.0). Each fish species gets a multiplier between **x0.75 and x1.35**; three species are **hot at x1.9** and three are in a **glut at x0.6**. The board in the Fish Market lists today's hot and glut fish and the time until the next prices; the bag and *Sell All* use the current prices, and ▲ ▼ mark fish that are selling well or badly. Junk and flora are unaffected. Prices come from the day number, so nothing extra is saved.

## The Aquarium

Since v5.0.0 a working **aquarium** fills the Cabin's back wall (it replaced the Trophy Case). The tank grows with each tier (1.8 m wide for the Starter Tank up to 4.3 m for the Grand Aquarium) and the Cabin is wide enough for the biggest. Stand in front of it: the angler steps out of the picture and the camera slowly sweeps along the glass from the right end to the left end and back (it stays still when the whole tank fits on screen). Press **AQUARIUM** and a paper sheet opens with four tabs:

- **🐠 Fish:** what lives in the tank, with weight, value and mood; each can go back into your bucket or be released.
- **➕ Add:** the fish in your bucket, each with an *Add* button, or the reason it cannot go in. **Only fish go in, and large fish never do.** Each tank has a largest fish it can hold and a limit on room (a fish takes about its weight to the power 0.8 of room, at least 1):

| Tank | Largest fish | Room | Decorations | Glass | Price |
|---|---|---|---|---|---|
| Starter Tank | 1.5 kg | 8 | 3 | 1.8 x 0.95 m | owned |
| Reef Tank | 4 kg | 20 | 4 | 2.4 x 1.14 m | $450 |
| Display Tank | 9 kg | 40 | 5 | 3.3 x 1.25 m | $1,800 |
| Grand Aquarium | 18 kg | 80 | 6 | 4.3 x 1.35 m | $6,000 |

  Anything over 18 kg never fits in any tank, so marlin, sailfish, swordfish, sharks, oarfish, mola and every deep monster stay in the sea (27 species can never be kept).
- **🌊 Release to sea:** a grown, tank-bred colour morph (golden, albino or midnight) can be released from the Fish tab: rare fish become more common in its species' home zone, **+1.5% per release, up to +15%** per zone (saved as `aquarium.released`).
- **🧽 Care:** food, cleanliness and happiness bars. Fish eat and foul the water as in-game days pass (more fish, faster): *Fish flakes* are free (+35 food), *Premium pellets* fill the bar (from your stock), *Clean the tank* is free and a *Deep clean* (one kit) also halves the dirt for 3 days. Visitors pay tickets that you *Collect* here.
- **🪸 Decor:** every decoration you own, with *Remove* (it goes to storage) or *Place* (free, when a slot is free). Removed decorations are never bought again.

**The Aquarium Shop** (on the boardwalk between the Fish Market and the Cabin) is a catalogue like the Tackle Shop: **Tanks** (each upgrade), **Decor** (eight decorations: plants, rocks, driftwood, coral, castle, chest, shipwreck, light show; a purchase goes straight into the tank, or into storage when the slots are full), **Care** (*Premium pellets*, 5 feeds for $90; *Deep-clean kit*, $60) and **Book** (*The Aquarist's Handbook*).

**Breeding:** two or more grown fish of one species, kept happy (60%+), can have fry on any day (40% chance per species). Fry are tiny, grow up over a few days (never past the tank's limit) and may be a **colour form** (golden, albino or midnight: 2x, 2x, 3x tickets) that can pass on. Each new species you keep adds 3% to all tickets, and six new achievements cover it (*Fish Keeper*, *Reef Keeper*, *Aquarist*, *Full House*, *Fish Breeder*, *Rare Colour*). A catch that would fit the tank says so in its reveal.

The fish swim in the tank in the world (their real models, sized by weight), the water clouds when it is dirty, and bubbles rise from the air stone. **Records:** the species medals (🥇 gold at 90% of the species' top weight, 🥈 silver at 70%, 🥉 bronze below), catch counts and record weights are under **☰ Menu → 🏆 Records**.

## Harbour Town, its people and the story

Behind the boardwalk, open along its whole length since v6.6.1 (the **🏘️ Harbour Town** gate straight behind the pier remains as a landmark), the island terrace is now a small town you can walk around: a plaza with a well, lamps and a noticeboard, three cottages, **Marta's hut** at the west end and **your restaurant** (named after you) at the east end. Buildings, palms and the well turn see-through when they stand between the camera and you.

**Town Projects (v6.6.0, noticeboard):** late-game investments for the town.
| Project | Cost | What it does |
|---|---|---|
| 📡 Weather Station | $4,000 | A 3-day forecast (each day has an outlook, *Fair*, *Changeable* or *Stormy*, that weights the weather) with the moon, on the Map, the noticeboard and in the bunk sheet |
| 🔥 Pier Smokehouse | $5,500 | A fish that does not fit in your bucket can go **🔥 To the Smokehouse** instead (up to 25 kg, at 90% of its value) as smoked fillets you sell on the noticeboard |
| 🗼 Lighthouse Fast-Travel Slip | $8,000 | **Launch** from the noticeboard: you board your boat already moored at the lighthouse jetty |

**Share codes (v6.6.0, Post Office):** no server: a code is plain text (`PF1-…`) you send in any message app. Write a **bottle note**, or a **catch challenge** from one of your three best records; your friend pastes it under *Open a code*. Notes are kept in the Post Office (last 10); beating a challenge (that species at that weight or more) pays **$250** and 60 XP.

**Map buoys (v6.5.0):** on the Map, press **📍**, pick **⚓ Wreck**, **🐉 Boss** or **⤵️ Drop-off** and tap the sea: up to **3** coloured buoys float there in the world and show on the Map and its list with distance and direction. Remove them from the same bar. Saved as `buoys`.

**Districts (v6.3.0).** The terrace now runs from x -37.6 to +37.6 and climbs a gentle ramp (from 14 to 17 m back) to an **upper terrace** 1.2 m higher. Tap-to-walk finds its way around every building (waypoints joined wherever nothing solid is in the way).
- **Market Square & Artisan Quarter (east):** a paved square with a fish stall, the **📮 Post Office** (Maren) and **🔨 Barnaby's Workshop**; up the lane, the **🦀 tide pool** and the **🍺 Sailors' Rest** tavern on the upper terrace.
- **Lighthouse Hill (west):** a cobbled path past Marta's hut up to **🌿 Talia's greenhouse**, her **herb garden** and the **🔭 Lookout Pavilion** with a telescope and a reading bench.
- **Street lanterns** along the hill path, the upper terrace and the market, and **Rook's winch** on the boardwalk west of the Boatyard.

**Places and what the action button does there:**
| Place | Button | What it does |
|---|---|---|
| 📌 Noticeboard (plaza) | **JOBS** | Today's 3 town jobs, your town reputation |
| 📮 Post Office | **POST** | The same jobs, a **treasure map** ($150, one a day: marks a chest on the Coastal Reef on your Map) and **bottle stamps** ($100 and 30 XP for every 6 bottle messages, up to 6) |
| 🍺 Sailors' Rest | **DICE** (16:00 to 02:00) | *Ship, Captain & Crew* against Rook, Maren or Old Salty, for bait or $10 / $50 / $100 |
| 🦀 Tide pool | **TRAPS** | Up to 3 crab traps ($8 bait each), haul them up from the next day: shore crabs, blue crabs and lobsters become **shellfish** in your restaurant pantry, pearls sell for $80 to $160 |
| 🔨 Workshop | **PAINT** | Hull, trim and pennant colours (12 colours, $40 a coat) for every boat you own |
| 🌿 Greenhouse | **HERBS** | Brew a herbal lure (3 herbs → 5 Garden Worms) and sell sea plants for 25% more than Recycling |
| 🔭 Telescope | **LOOK** | A zoomed view over the sea: drag (or hold ◀ ▶) to pan; keep the view on a feeding frenzy, treasure beam or boss shadow and it is **marked on your Map**. The first look each day can reveal a chest out on the reef and sometimes a boss on the Open Shelf. |

**Town jobs** (3 a day, one at a time; cash, XP and +1 **town reputation**, from *Newcomer* to *Harbour hero*):
- **📦 Cargo & mail runner:** collect a parcel at the Post Office and bring it to the mooring platform, the restaurant, the cabin, Sailors' Rest or (with a boat, +$60) the lighthouse jetty, within 4 in-game hours (10 for the jetty).
- **🧹 Harbour cleanup crew:** pick up 5 pieces of litter (yellow rings) on the boardwalk and the east terrace (**✋ PICK UP**).
- **🏮 Night watch:** light the 6 street lanterns (**🔥 LIGHT**) between 18:00 and 22:00; they glow until morning.
- **🌿 Herb & shell foraging:** gather 5 herbs on Lighthouse Hill or 5 shells around the tide pool; herbs go to Talia's greenhouse.
- **🏗️ Dockhand winch assist:** at the winch, hoist 5 crates: press **HOIST** when the swinging hook is over the green (3 good ones pass; the green shrinks each crate).

**People.** Nine townsfolk live here, each with a day routine (they walk between their spots across the town and along the boardwalk, and go home at night): **👵 Old Marta** (the retired lighthouse keeper), **🧔 Captain Rook** (the Boatyard owner), **🧒 Pip** (a young angler), **👩‍🔬 Ines** (a marine biologist), **👨‍🍳 Chef Lorenzo**, and since v6.3.0 **📮 Maren** (postmistress and cartographer), **🔨 Barnaby** (retired shipwright), **🌿 Talia** (botanist and tide-pool keeper) and **🍺 Old Salty** (tavern keeper). Walk up to someone and press **💬 TALK**. A **❗** over a head means they have a quest for you, a green **❓** that you can hand one in. They also appear on the Map. In rain or a storm each of them opens an umbrella in their own colours.

**Friendship (v6.4.0).** Each townsperson likes you a little more for every finished quest (+3), the first chat of the day (+1), a restaurant craving served (+2), one of Ines' commissions (+2) and a dice win against them (+1). Hearts show in the chat, on the noticeboard and in the Quests list. At **8 points** their **perk** is yours for good:
| Friend | Perk |
|---|---|
| 🧔 Captain Rook | Fuel costs 20% less ($0.40 a unit) |
| 👩‍🔬 Ines | Tells you where and when to find the Catch of the Day (noticeboard) |
| 🧒 Pip | Shouts when a feeding frenzy is within 70 m of your boat (no sonar needed) |
| 👵 Old Marta | Warns you before a storm and on full-moon evenings |
| 👨‍🍳 Chef Lorenzo | Pantry goods cost 15% less |
| 🔨 Barnaby | Boat modules and paint cost 15% less |
| 🌿 Talia | Sea plants sell for 20% more (Recycling and the greenhouse) |
| 📮 Maren | Treasure maps at half price |
| 🍺 Old Salty | Dice wins pay 50% more |

**Ines' commissions:** after her quest *Living Specimens*, Ines asks for one specimen a day: a named fish species from the sea (brought in your bucket, pays 2.5x its value + $40) or a grown **tank-bred colour morph** (golden, albino or midnight) from your aquarium ($320). Each pays XP and +2 friendship.

**Quests** (25, in 6 chapters; chapter 5 *New Neighbours*: Maren's *Letters for the Harbour* and *Messages in Bottles*, Barnaby's *A Fresh Coat* and *Timber from the Tide*; chapter 6 *Tides & Tales*: Talia's *Life in the Tide Pool* and *Herbs of the Hill*, Old Salty's *A Roll of the Dice* and *The Shadow Rumour*, with steps for town jobs, crab traps, dice, boat paint and the telescope): each has steps that advance on their own as you play (catch fish, from the pier or in a zone, by weight, rarity or at night; dive to a depth; find bottle messages; sail somewhere; own a boat; keep species in the aquarium; bring someone a fish from your bucket). When the steps are done, talk to the giver for the reward (cash and XP). The story runs from *Welcome to Harbour Town* through *The Keeper's Light* (repair and relight the lighthouse) and *Rook's Wager* to *The Legend of the Deep*: a Legendary fish landed at night in the Abyssal Trench. The current step shows in a blue pill under the top bar; the full list is in **☰ Menu → 📜 Quests**. Saved as `story` (active steps, completed quests, friendship, flags).

## Your restaurant and cooking

The restaurant at the east end of Harbour Town is **yours**, named after you (*Wayne's Restaurant*, or *Fisherman's Restaurant* without a name). It opens once you do Chef Lorenzo's first quest (bring him any fish). Stand at its door and press **🍝 KITCHEN**: a sheet opens with four tabs.

- **🍳 Cook:** every recipe with what it needs; *Cook* uses the cheapest matching fish from your bucket and the pantry items. Cooking is a short mini-game: **chop** (tap three times when the knife is over a green mark), **sear** (hold the button and let go when the heat is in the green) and **plate** (tap when the arrow points up). It gives 1 to 3 ⭐ (Rare or better fish help). The dish goes in the fridge (up to 30). Once you have cooked a recipe at 3 stars three times, **Cook ×3** appears: three dishes at once at your average stars, using three times the ingredients, without the mini-game.
- **⭐ Cravings:** each day two townsfolk crave a dish, one at lunch and one at dinner (shown on the Fridge tab and the noticeboard). Have that dish in the fridge during that service and they come in and pay **double**, and like you more.
- **🧊 Fridge:** your dishes and what guests pay for them; **Eat** one for a meal buff counted in **charges**, shown in a small orange pill under the top bar (eating another dish replaces it): *faster bites* (bites come 30% sooner) lasts the **next 8 casts**, *steadier line* (line tension builds 15% slower) the **next 5 fish fights**, *longer breath* (20% more air) the **next dive**.
- **☕ Harbour Espresso** (Pantry tab, $25): you read **twice as fast** on a bench for 12 in-game hours (shown in the same pill). **Collect** the takings here.
- **🧺 Pantry:** bread $4, lemon $3, rice $5, potato $3, spices $6, bought 5 at a time.
- **⭐ Upgrades:** *Extra waiters* (more guests per service: $400, then $1,200), *Pro stove* (wider green zones, $800), *Terrace lights* (higher rating, $600).

**Service:** at lunch (11:00 to 14:00) and dinner (17:30 to 21:00), in-game time, guests sit at the three terrace tables and buy dishes from your fridge (best first). Each pays the dish's value x its stars x your rating; the money banks until you collect it. The **rating** (1 to 5) grows with the quality and variety of your dishes, the terrace lights and the number of guests served.

**Recipes** (19) unlock as you cook (after 0, 3, 8, 15, 25 and 40 dishes):

| Dish | Fish | Pantry | Value | Unlocks after |
|---|---|---|---|---|
| 🐟 Grilled Fish | a fish | lemon | $28 | 0 |
| 🍳 Fisherman's Breakfast | a fish | bread, potato | $34 | 0 |
| 🥗 Seaweed Salad | seaweed (Flora) | lemon | $22 | 0 |
| 🍟 Fish & Chips | a fish over 1 kg | potato, bread | $45 | 0 |
| 🍲 Fish Soup | 2 fish | potato | $52 | 3 |
| 🌮 Fish Tacos | 2 fish | bread, spices | $60 | 3 |
| 🧆 Fishcakes | 2 fish | potato, bread | $58 | 3 |
| 🍢 Spiced Kebab | a fish over 2 kg | spices, bread | $70 | 8 |
| 🍣 Sushi Platter | an Uncommon+ fish over 0.5 kg | rice | $95 | 8 |
| 🦞 Crab & Lobster Bisque | a fish | 2 shellfish (from the crab traps), bread | $140 | 8 |
| 🥧 Fish Pie | 2 fish | 2 potato, bread | $80 | 8 |
| 🍽️ Baked Whole Fish | a fish over 3 kg | lemon, spices | $120 | 15 |
| 🥘 Seafood Paella | an Uncommon+ fish and another | 2 rice, spices | $150 | 15 |
| 🍋 Ceviche | a Rare+ fish | 2 lemon | $190 | 15 |
| 🪵 Smoked Fish Board | a fish over 5 kg | 2 bread | $210 | 25 |
| 🦞 Seafood Platter | a Rare+ fish and 2 more | lemon, bread | $320 | 25 |
| 🥩 Steak of the Deep | a fish over 10 kg | spices, potato | $360 | 40 |
| 👑 Golden Feast | an Epic+ fish | rice, spices, lemon | $650 | 40 |
| 🌟 Legend's Banquet | a Legendary fish | rice, spices, lemon, bread, potato | $1800 | 40 |

**Lorenzo's quests:** *Lorenzo's Kitchen* (bring him a fish: the restaurant opens), *First Service* (cook 3 dishes), *A Full House* (serve 10 guests) and *Master Chef* (a 3-star dish of a recipe worth 150 or more). Saved as `kitchen` (pantry, fridge, counters, takings, upgrades, meal charges, espresso) and `playerName`.

## Skill books

Every shop sells one **skill book** (a *📚 Book* tab in the Tackle Shop, Boatyard and Dive Shop catalogues, and in the Fish Market and Recycling sheets and the Aquarium Shop; one copy each, bought with a confirm). The books are defined in one data table, `BOOKS` in `index.html`, so adding one means adding a row and calling `bookBonus(perkId)` where its perk applies.

| Book | Shop | Price | Perk at 310 / 310 pages |
|---|---|---|---|
| ⛵ Offshore Angling Guide | Boatyard | $650 | +40% rare-fish odds when fishing from a boat (added to the bait's rarity bonus) |
| 🎣 Pier & Shore Mastery | Tackle Shop | $400 | +40% rare-fish odds when fishing from the pier |
| 🤿 Deep Water Freediving & Ichthyology | Dive Shop | $900 | +40% underwater breath capacity, +40% rare-fish odds when diving, and the underwater weight guess tightens from +-35% to +-5% |
| 🐟 The Fishmonger's Ledger | Fish Market | $500 | +15% fish sale prices |
| ♻️ Green Harbour Handbook | Recycling | $350 | +50% junk and seaweed recycling prices |
| 🐠 The Aquarist's Handbook | Aquarium Shop | $600 | +30% aquarium visitor ticket income |

**Reading:** sit on a bench (stand still in front of one for two seconds) and the action button says **READ** (or *No books* if you own none). It opens your books with pages read (e.g. *155 / 310 pages*), the percentage and every perk's current and maximum value; finished books can't be chosen. Pick one and the angler reads, with the book in his lap and a purple pill under the top bar showing pages, percent and the time left in the session.
- **310 pages = 21,600 in-game minutes (15 in-game days, since v6.2.0; 44,640 before, and older saves keep the same percentage).** Progress is counted in in-game minutes from the day-night clock (`timeOfDay`), never in real seconds, so it follows game speed and stops while the game is paused.
- **Perks grow every minute:** `bonus = max x minutes read / 21,600`, so 155 / 310 pages gives half the maximum straight away.
- **Harbour Espresso** from your restaurant's pantry doubles the reading speed for 12 in-game hours, and **sleeping in the cabin bunk** reads 30 pages of the selected book.
- **A session lasts 6 in-game hours** (360 minutes, about 5 pages) and then the angler goes back to sitting; press **READ** again for another block. Standing up at any time ends the session and keeps every page read.
- **Weight guess:** a diving target's label shows a range like `~0.9 kg – 1.0 kg`, never an exact weight, even with the finished book. Each fish gets a fixed random offset when it appears, so the range never flickers and the true weight is always inside it. Without the book the margin is +-35%; at 100% it is +-5%.
- **Saved:** each owned book and its minutes read are in the save (`books`), validated on load.

## Sea events

While you are out on a boat, two things can appear (they are never saved):

- **Treasure chests:** about every one to two minutes (up to two at a time) a chest floats 70 to 220 m away in your current zone, marked by a tall golden beam. Sail within a few metres to collect cash (more in deeper zones), bait and XP. They sink after about 2.5 minutes.
- **Boss shadow:** in zone 3 and deeper, roughly every 6 to 10 minutes a huge shadow circles a marked spot (red ring and beam). Cast into the ring and you hook a boss: a Legendary fish of that zone, heavier than normal and worth double, plus a **$500 x zone** bonus and 150 XP. Your rod must be strong enough or the line snaps. It leaves after about 4 minutes.

A pill under the top bar shows the nearest event with its distance and bearing relative to your boat. The secret menu can spawn both for testing.

## Character customisation

Open it from the start screen (**🎨 Customise Look**), the **☰ Menu** (**🎨 Look**) or **Settings → Appearance**.

- **Your name** (up to 16 characters). It names your restaurant in Harbour Town, e.g. *Wayne's Restaurant*; left empty, it is *Fisherman's Restaurant*.
- A live **3D preview** that rotates by itself (a *Stop / Rotate* button) and can be dragged to turn.
- **Harbour Chibi characters** (since v9.0.0): the angler and all nine townsfolk are cute, chunky "gameish" characters, an original Pixel Fishing style. A big round head (about 3.5 heads tall in all), a short rounded body, chunky arms and legs, mitten hands and soft toon shading. The **face is painted**: big glossy eyes in your eye colour with highlights (lashes on the female face), eyebrows in your hair colour, rosy cheeks, a small smile and a button nose. Facial hair and glasses sit on top of it.
- **A real skeleton** (since v4.0.0): hips, spine, chest, neck, head, shoulders, elbows, wrists, hips, knees and ankles under one smooth skinned body, so knees, elbows and shoulders bend like skin. Steps are shorter and a little bouncier on the short legs; feet dangle when sitting on a bench.
- **Male / Female** bodies with different builds. The female body has a natural teardrop-shaped bust (a gentle upper slope and a fuller lower curve) that every top, sweater and coat follows.
- **Bust physics** (since v4.2.0): the bust sits on two soft-tissue bones driven by a damped spring, so it bounces and sways a little with walking, jogging, turning, sitting down, casting and the boat's motion, then settles. Supportive tops (raincoat, hoodie, sweater, fishing vest) hold it firmer and show less of the motion than a T-shirt, tank top, bikini or bare chest.
- Tabs (v9.1.0):
  - **Outfits:** quick presets.
  - **Body:**
    - skin tone (12 swatches or **any colour** from the picker);
    - **sliders** for height, head size and build (slim to round);
    - ears (round, small, pointed).
  - **Face:**
    - **eyes** (round, big, sleepy, almond, dots, sparkle, cat-eye, wide) and eye colour (swatches or any colour);
    - **eyebrows** (normal, thin, bushy, arched, straight, bold slant, worried, none);
    - **mouth** (smile, grin, cat, open, smirk, calm, tongue, toothy, pout, laugh);
    - nose, cheeks (rosy, peach, none), freckles and a beauty mark;
    - face shape, facial hair (incl. sideburns), glasses (round, square, sunglasses).
  - **Hair:**
    - 15 styles, including spiky, afro, twin tails, mohawk, side part and pixie;
    - hair colour (or any colour);
    - a **fringe** (side sweep or full) with its own colour for dyed tips.
  - **Top** and **Bottom:**
    - style, a **pattern** (plain, stripes, checks, waves, colour block; *Classic* keeps the striped sweater and the checked flannel), a main and a **second colour**;
    - new tops: polo, flannel, cardigan, dress;
    - new bottoms: cargo trousers, leggings.
  - **Shoes:** includes high-tops.
  - **Hat:**
    - new hats: captain's cap, bandana, flower crown.
  - **Extras:** scarf, backpack, necklace or rod badge, in any colour.
  - Every colour row ends with a rainbow button that opens your device's colour picker.
- **Expressions:** everyone blinks every few seconds. Your angler looks surprised on a bite, focused in a fight, and happy with a catch or in a chat. The townsfolk smile while you talk to them, and each has a face of their own.
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

## The interface (Tide Glass)

Since v7.0.0 the whole interface uses one frosted-glass look built for phones held in one or two hands:

- **Status bar** (top): one glass strip with your **cash**, the **bucket** meter (the **fuel** meter appears next to it on a boat; it turns amber, then red when you are low on fuel for the trip back), the **weather** and **clock**, and the **☰** menu.
- **Info rail** (under the bar, left): the **zone chip** (zone, distance, return fuel, meal charges), the return-fuel warning when it matters, and the **objective tracker**. The tracker shows only the most urgent line, in this order: the sea radar (treasure, boss, frenzy), a bounty, the current quest, the book you are reading. **+N** opens the others. The live bait camera sits under it.
- **Compass** (under the bar, right): a small heading tape; tap it to look ahead again.
- **Centre:** the bite and leap banners, the station picker and the "press to open" banner, and the **meter dock** with the cast power and the fight's drag and tension meters, all **just above your thumbs** where your eyes already are.
- **Thumb zones:** the thumbstick is bottom left. The big round **action button** is bottom right, coloured by what it does: coral by default, amber to cast or shop, red on a bite, teal while reeling or diving, blue to sail, green for the map and bounties. Its small round helpers (dive, up, down, chum) stack beside it on the inside. **Handedness: Left** mirrors all of it.
- **Menu drawer** (☰): a **profile card** at the top (your name, rank, cash and a bar to the next rank), the **Pause** button, a grid of twelve tiles (Map, Bag, Log, Settings, Career, Records, Look, Sound, View, Filter, Quests, Exit) and a short list of your gear, moon and lens.
- **Sheets:** every menu is a glass bottom sheet on phones (a centred card on wider screens) with the same header and a round **×** close button. Swipe the header down or tap outside to close.
- **Chats:** the speaker's portrait, name and role sit above their words; answers are full-width buttons.
- **Toasts:** a coloured edge says what kind of news it is: amber for warnings, gold for money, green for wins, teal for the rest.
- **Keyboard:** `Tab` stays inside the open sheet, and closing it puts the focus back on the button that opened it.
- **Colours:** deep navy glass panels, teal for "you" and progress, coral for the main action, gold for money, green, amber and red for good, careful and danger.

## Settings

Open **☰ Menu → Settings**. The settings are grouped as **Display**, **Controls**, **Sound & haptics** and **Game**.

- **Text size:** *S*, *M*, *L* or *XL* for the menus, shops, chats, toasts and the info chips (the controls keep their size; that is *Button size*).
- **HUD panels:** *Clear*, *Mid* or *Dark*, how much of the world shows through the glass.
- **Reduce transparency:** solid panels without blur (always on in *Battery saver*, which saves a little power on older phones).
- **Sound effects** on or off (also on the 🔊 button).
- **Haptics** (vibration) on or off, independent of sound.
- **Graphics:** *High* (with soft sun shadows) or *Battery saver* (renders at lower resolution and turns shadows off).
- **Full screen:** on by default; the game enters full screen when you tap *Start*. Turn it off here to stay windowed. (iPhone Safari does not allow full screen for web pages; the installed home-screen app is already full screen.)
- **Handedness:** *Right* or *Left*; left swaps the thumbstick and action button.
- **Thumbstick:** *Fixed*, or *Floating*, where the stick appears under your thumb anywhere in a **square in the bottom corner** (bottom left, or bottom right when left-handed) and the fixed one stays as a faint hint. The rest of the screen stays free for tap-to-walk and looking around.
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
| `pixel_fishing_settings_v1` | Sound, haptics, graphics quality, bucket sort order, handedness, thumbstick mode, button size, HUD fade, full screen, text size, HUD panel opacity, reduce transparency |
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

**Engine (v8.0.0):** three.js **r187** (`three@0.187.0`), loaded by the small loader at the top of `index.html` with a progress count and imported as an ES module from the downloaded bytes; the module is copied into a plain global `THREE` so the game code reads it as before. `legacyLook()` keeps the look the game was tuned for on r128: colour management off, linear output (`outputColorSpace = LinearSRGBColorSpace` on every renderer), textures marked `SRGBColorSpace`, and the light shader chunk patched back to the legacy light maths (intensities x π and the old distance fall-off), so no light needed retuning. WebGL 2 is required (every current phone and browser has it).

**Physics (v8.2.0):** [Rapier](https://rapier.rs) 0.21.0 (`@dimforge/rapier3d-compat`). The loader downloads it next to three.js and starts it (compiles its WebAssembly) before the game. The `Physics` module mirrors every walk collider from the `Colliders` registry into a Rapier world (tall cuboids and cylinders, since walking ignores heights). The angler walks with Rapier's **character controller**, a capsule with the old 0.15 m body margin that slides along walls, benches and corners. The townsfolk are moving cylinders, so you still cannot walk through them. The town's path finding asks Rapier (one shape cast per segment instead of a scan of every collider; building the waypoint graph went from about 20 ms to 6 ms). The fixed pier rails, edges and island limits are unchanged clamps. If Rapier cannot load, or the secret menu's **Debug → Walking physics** is set to built-in, the old collision code runs exactly as before; the debug view of collision boxes also draws what Rapier sees (white lines).

**Rendering budget (v8.0.0):** static props are merged per material look with `ModelKit.mergeStatic` and, where the materials only differ in colour, **baked into vertex colours** (`bakeColor`), so the pier, the town props, the harbour lamps and the buoys are a few dozen draw calls; `ModelKit.mergeSafe` does the same for a prop group but keeps anything that lights up or fades. The angler's and every townsperson's head, hair, face and hat are baked per material after `dress()`, townsfolk drop their finger joints past 9 m from the camera, tiny props (under ~12 cm) cast no sun shadow, the shadow map refreshes every other frame on devices running below ~45 fps, and the shaders are compiled in parallel (`compileAsync`) when the town is first built. Compared with v7.2.0 that is about **30–40% fewer draw calls** (pier 617 → 442, harbour 819 → 507, town square 514 → 359).

The interface (v7.0.0, *Tide Glass*) is styled from design tokens on `:root` (`--ink-*`, `--sea`, `--coral`, `--gold`, `--glass`, `--blur`, `--r-*`, `--text-scale`); a theme block at the end of the stylesheet restyles the components, and line icons come from an inline SVG sprite (`<use href="#i-…">`).

```
index.html                 the game: HTML, CSS and all JavaScript
vendor/three.r187.module.min.js   Three.js r187 as one ES module (bundled with esbuild; jsDelivr / unpkg are fallbacks)
vendor/rapier3d-compat.0.21.0.min.js   Rapier 3D physics 0.21.0 as one ES module, WebAssembly inlined (Apache-2.0)
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
| K | UI: the shop sheet (`ShopUI` cards, tabs, confirm), bucket modal, toolbox, catch reveal, log, gallery, camera filters, bounties, settings, customise |
| L | HUD and button synchronisation (`updateHUD`, the objective tracker `syncTracker`) |
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
- contact-sheet renders of fish, boats, props and characters are reviewed by eye,
- interface changes: screenshots at 375×812 and 812×375 (also left-handed and XL text), an **axe-core** pass (button names, ARIA, colour contrast) over the start screen, HUD, drawer, settings, career, bag, log, map, quests, chat, a shop and the pause screen, and, for pure clean-ups, a **computed-style parity** diff of every element in those states against the previous build (it must come out empty).

## Maintaining this file

**Every update to the game must update this README in the same change:**

1. Update any section the change affects (controls, tables, counts, features).
2. Add an entry at the top of the [Changelog](#changelog) with the date and a short summary.
3. If counts changed (species, bounties, options), update the numbers above.

`CLAUDE.md` repeats this rule for AI-assisted work.

## Changelog

### 2026-11-22, Version 9.1.0: full character customisation (character overhaul, phase 2)

- **Sliders:** height, head size and build. Older saves map their height and build steps onto them.
- **Painted faces:**
  - 8 eye shapes, 8 brow styles and 10 mouths;
  - cheeks, freckles, a beauty mark and three ear shapes;
  - **expressions**: blinking, surprised on a bite, focused in a fight, happy with a catch or in a chat.
- **Hair:** six new styles (spiky, afro, twin tails, mohawk, side part, pixie) and a fringe with its own colour.
- **Clothes:**
  - **patterns** on tops and bottoms (stripes, checks, waves, colour block) with a second colour;
  - new tops: polo, flannel, cardigan, dress;
  - new bottoms: cargo trousers, leggings;
  - new shoes: high-tops;
  - new hats: captain's cap, bandana, flower crown;
  - square glasses and sideburns.
- **Extras:** a new tab for a scarf, backpack, necklace or rod badge.
- **Any colour:** every colour row has a free colour picker next to the swatches (skin, eyes, hair, fringe, every garment, the extra).
- **Townsfolk:** each now has their own face: sleepy Old Marta, freckled Pip, cat-eyed Maren and so on.
- **Saving:** all choices are saved and validated, and older looks load unchanged.

### 2026-11-22, Version 9.0.0: Harbour Chibi characters (character overhaul, phase 1)

- **New look for everyone:** the angler and the nine townsfolk are now chibi characters, an original style.
  - **Body:** a big round head, a short chunky body, mitten hands and toon shading.
  - **Face:** painted on, with big glossy eyes, brows, blush, a smile and a button nose.
  - **Fit:** total height is about 1.5 m, so benches, the rod, the camera and every interaction still fit.
- **Everything you picked still applies:** skin, eyes, hair, face shape, nose, brows, facial hair, glasses, height, build, every top, bottom, shoe and hat. Old saves keep their look; nothing needs converting.
  - **Clothes:** they follow the new body (every garment's heights scale with the shorter torso).
  - **Shoes and hair:** boots are shorter, and long hair, ponytails and braids are trimmed to suit the big head.
- **Animation:** shorter, quicker steps with a little bounce. The first-person eye height, the umbrella grip and the bench sitting pose are adjusted for the new proportions.
- Next: full customisation (sliders, patterns, two colours per garment, expressions), then a new customise screen.

### 2026-11-22, Version 8.2.0: Rapier physics and a loading screen with percentages

- **Rapier physics:** walking now uses Rapier's character controller. The angler slides smoothly along walls, benches and corners instead of being pushed out after overlapping. The townsfolk are solid cylinders in the same world, and the town's path finding uses Rapier queries, building its waypoint graph about 3× faster. The pier rails and island edges work as before.
- **Loading screen:** a big overall **percentage**, and a line with its own percentage for every step: game files, the 3D engine, the physics engine (download, then start-up) and building the harbour. Both engines download side by side.
- **Safety net:** if the physics engine cannot load, the game starts with the built-in collisions (the loading screen says *built-in collisions*). The secret menu's Debug section can switch walking between Rapier and the built-in code, and its collision-box view shows Rapier's own shapes.
- Offline play caches the physics engine too (`PRECACHE`).

### 2026-11-22, Version 8.0.0: three.js r187 and leaner scenes

- **New engine:** three.js **r128 → r187**. It is bundled as one ES module (`vendor/three.r187.module.min.js`); the loader still shows the download progress and falls back to jsDelivr / unpkg. The game looks the same: colour management is kept off, output is linear, textures use `colorSpace`, and the light shader is patched to the legacy light maths. Screenshot comparisons against r128 differ by under 1% at noon, dusk, night and in rain (moving water and characters aside). Removed APIs were updated (`encoding` → `colorSpace`, `PCFSoftShadowMap` → `PCFShadowMap`, the old `skinning` material flag). Browsers without ES-module support get a clear "too old" message. WebGL 2 is now required.
- **Fewer draw calls (about 30–40%):**
  - The 14 park benches and 16 bench lamps (about 250 separate meshes) are merged, and the lamps share one glow material.
  - The harbour lamps and channel buoys are merged except for their glowing parts.
  - Static props that differ only in colour share one draw call through vertex colours.
  - The heads of the angler and the townsfolk are baked per material (28 → 9 draw calls for the angler).
  - Townsfolk skip their finger joints when more than 9 m from the camera.
- **Cheaper shadows:** tiny props no longer cast sun shadows. On devices running below ~45 fps the shadow map refreshes every other frame (always when it moves).
- **Smoother start:** shaders compile in parallel when the town is first built.
- **Floating thumbstick:** it now only listens in a **square in the bottom corner** (bottom right when left-handed), so tap-to-walk and dragging the view work everywhere else.

### 2026-11-22, Version 7.2.0: Tide Glass clean-up and accessibility pass

- **Lighter stylesheet:** 424 old declarations and 36 whole rules that the Tide Glass theme already overrode are gone, along with the old styling of the tracker pills, the action button states and the fuel warning (about 16% less CSS). A computed-style comparison of every element on 11 screens shows the same result as before.
- **Tokens everywhere:** 74 hard-coded colours in inline styles now use the palette tokens (text greys, gold, green, red, teal); only a few one-off tints remain.
- **Contrast:** the dimmest text colour (`--text-3`) is lighter and passes WCAG AA (4.5:1) on all panel colours. An axe-core check of 12 screens finds no contrast, button-name or ARIA problems.
- **Thumbstick:** announced as an image with instructions (and the keyboard alternative) instead of a slider without a value.
- **Blur budget:** frosted glass is only on fixed panels (status bar, chips, compass, toasts, sheets), never on scrolling lists. *Reduce transparency* removes it entirely.

### 2026-11-22, Version 7.1.0: Tide Glass sheets, drawer and chats

- **Drawer:** a profile card (name, rank badge, cash, XP bar and how much XP to the next rank), the twelve buttons as a 3-column tile grid, and a tidier gear list.
- **Sheets:** every menu sheet has the same glass header with a round **×** close button that names what it closes for screen readers.
- **Keyboard:** `Tab` is kept inside the open sheet (focus trap), and focus returns to the button that opened it. On touch the button just loses focus, because `Space` stays the action key.
- **Chats:** a glass speech panel with a round portrait, a gold name and full-width answer rows.
- **Toasts:** coloured by kind (warning, money, win, info).
- **Shop and town sheets, start, loading and pause screens:** the same tokens. Buy buttons are coral, sell buttons gold, and the shop's own colour lines the top of its sheet.

### 2026-11-22, Version 7.0.0: Tide Glass, a new interface for phones

- **New look:** one frosted-glass design system (`:root` tokens: deep navy glass, teal, coral, gold) replaces the mix of retro pixel boxes and slate sheets. It covers buttons, modals, the shop and town sheets, toasts, the start, loading and pause screens, and the side drawer. System sans-serif text, tabular monospace numbers, and line icons from an inline SVG sprite.
- **Status bar:** one rounded strip with cash, bucket or fuel meter, weather, clock and menu. The pause button moved into the menu (opening the menu already pauses; `P` and `Esc` still work).
- **Info rail and tracker:** the zone chip on the left, the compass as a small chip on the right. The radar, bounty, quest and reading pills now share **one tracker slot** that shows the most urgent line, with **+N** to see them all.
- **Meter dock:** the fight's drag and tension meters moved from the top of the screen to just above the thumbs, next to the cast meter. Toasts stay at the top.
- **Thumb zones:** a coral action button whose colour follows the action; the dive, up, down and chum buttons are small glass buttons stacked beside it. Left-handed mode mirrors the whole cluster.
- **New settings:** **Text size** (S to XL), **HUD panels** (Clear, Mid, Dark) and **Reduce transparency** (forced on in Battery saver), and the settings sheet is grouped into Display, Controls, Sound & haptics and Game.

### 2026-11-22, Version 6.8.1: townsfolk umbrellas

- **Townsfolk umbrellas:** in rain or a storm every townsperson opens an umbrella in their own colours (nine palettes), held in the left hand; it folds away again when the weather clears. The angler's umbrella and theirs share one builder (`makeUmbrella` / `placeUmbrella`).

### 2026-11-22, Version 6.8.0: benches, lamps, umbrella, solid townsfolk
- **More benches:** 14 new ones (six more along the boardwalk, two at the plaza, four along the upper terrace, one at the Market Square and one by the tide pool), 16 in all plus the Lookout's. Every bench has a **lamp** whose head glows at night over a soft pool of light (glow, not real lights, to keep phones fast). Benches in the lower town now work too.
- **🪑 SIT** on the action button next to any bench (standing still still sits you down).
- **Reading:** the left hand holds the book, the right index finger points along the line being read.
- **Umbrella:** in rain or a storm the angler opens a red and white umbrella over his head (on foot and not fishing; the right hand keeps the rod).
- **Solid townsfolk:** you can no longer walk through people; they stop and wait when you stand in their way.
- **Performance:** the sky, water and dive colour blends no longer allocate a new colour every frame. Version bumped to **v6.8.0**.

### 2026-11-22, Version 6.7.2: duplicates merged
- **Code:** `recipeFish` is now `recipeFishN(r, 1)`; the Fish Market and Catch of the Day share one seeded random generator (`mulberry32`, the same numbers as before); the dock pump and the Boatyard's fuel tab share one `buyFuel()` (their messages are unchanged).
- **CSS:** `.hud-top`, `.modal-window`, `.modal-header`, `.map-row` and `.sh-summary` were each defined twice; each is now one rule with the same result. No behaviour change. Version bumped to **v6.7.2**.

### 2026-11-22, Version 6.7.1: dead code removed
- Removed code that nothing used:
  - an unused aquarium tank-purchase function (`aquariumBuyTank`);
  - unused helpers `buffOn`, `frontOf` and `readingActive`;
  - unused variables `rideVec`, `_fpHead`, `bowPts`, `prevFwdY`, `ringCount`, `stripeCol` and `setResetBtn`;
  - nine unused variable names on model-builder calls (the calls still run);
  - the CSS rules `.howto` and `#hud-buff-pill`;
  - the sonar pill element, its style, and the line that hid it every frame (it has been empty since the v6.2.1 one-line radar).
- No behaviour change. Version bumped to **v6.7.1**.

### 2026-11-22, Version 6.7.0: a new shop sheet
- **Rewritten shop UI:** one data-driven sheet (`ShopUI`) for every shop, stand and town counter. Render functions only describe content (summary, cards, notes, a main button); the sheet builds it. Catalogues now show every good of a department as a scrollable card (picture, badge, stats, full description, price, one clear button) instead of one page at a time; lists, the aquarium, the restaurant and the town counters use the same cards.
- **Sleek and readable:** a dark glass sheet in the shop's colour, your cash in the header, pill tabs, larger text and 44 px buttons.
- **Accessible:** dialog semantics, a real tab list (arrows, Home / End, 1 to 5), arrow-key movement between buttons, focus kept inside and restored after confirmations, descriptive button labels, a live region announcing purchases, visible focus rings and reduced-motion support.
- **The film camera's code is gone** (model, tracking, styles and its cabin position). Version bumped to **v6.7.0**.

### 2026-11-22, Version 6.6.2: less camera zoom, filters in the drawer, bigger text
- **Stand zoom only where it is used:** standing still near a shop no longer zooms the camera onto it; only the **Bounty Board** (its papers) and the **Aquarium** (its sweep) still do. Shops still frame themselves while their sheet is open.
- **The Director's camera is gone** from the cabin: the camera filters (Normal, 8-Bit CRT, Pixelate, Pocket DMG-01) and **📸 Snap postcard** are now **☰ → 🎬 Filter**.
- **Bigger text** in the shop brochures, the Fish Market / Recycling / restaurant lists and the town sheets (item text about 20% larger; the item picture is a little smaller on short screens to make room). Version bumped to **v6.6.2**.

### 2026-11-22, Version 6.6.1: an open town front, turn round with the stick
- **No more hedges** between the boardwalk and Harbour Town: walk up into town anywhere along the boardwalk (a paved strip and a flush seawall join them). The stone gate stays as a landmark. Tap-to-walk and the townsfolk cross the front near where they are going.
- **Pull the stick down (or `S`) and the angler turns round**, the camera swinging round behind him, then walks that way; let go and pull down again to turn back. Version bumped to **v6.6.1**.

### 2026-11-22, Version 6.6.0: town projects, the Trophy Wall and share codes
- **Town Projects** on the noticeboard: Weather Station ($4,000, 3-day forecast; each day now has a weather outlook), Pier Smokehouse ($5,500, overflow catches become smoked fillets, up to 25 kg) and Lighthouse Fast-Travel Slip ($8,000, launch your boat at the lighthouse jetty).
- **Trophy Wall** above the cabin bunk: mount your heaviest fish over 18 kg or a landed boss (3D replica with species, weight, zone and day). The bunk's button opens a small sheet with Sleep and the Trophy Wall.
- **Share codes** at the Post Office: bottle notes and catch challenges as Base64 text codes, offline.
- Save: `town.proj`, `town.smoke`, `town.wall`, `town.bosses`, `town.recs`, `town.notes`, `town.chal`, validated on load. Version bumped to **v6.6.0**.

### 2026-11-22, Version 6.5.0: rigs, buoys, vents and overhangs
- **Rigs** in the Tackle Shop and the toolbox: Surface Popper (faster bites, jumpers), Weighted Deep Jig (deep water, easier divers) and Chum Buckets (a feeding frenzy off the stern of a stopped boat, 🪣 CHUM or `C`).
- **Map buoys:** drop up to 3 Wreck / Boss / Drop-off buoys on the Map; they float in the world and are listed with distance and bearing.
- **Diving:** thermal vents (lift and +15% air) and reef overhangs with valuable lurkers that flee from a fast approach, from the Coastal Reef out.
- Save: `rig` (owned, equipped, chum) and `buoys`, validated. Version bumped to **v6.5.0**.

### 2026-11-22, Version 6.4.0: friends, cravings and Cook ×3
- **Friendship perks** with all nine townsfolk (8 points each): cheaper fuel, pantry, modules and paint, Catch of the Day tips, frenzy shouts, storm and full-moon warnings, better sea-plant prices, half-price treasure maps and bigger dice wins. Hearts in chats, the noticeboard and the Quests list.
- **VIP cravings** at the restaurant: two a day (lunch and dinner), double pay and friendship when the dish is in the fridge during that service.
- **Ines' commissions:** a species from the sea or a tank-bred colour morph, one a day.
- **Release to sea** for grown colour morphs: +1.5% rare-fish odds in their home zone (up to +15%).
- **Cook ×3** after three 3-star dishes of a recipe.
- Save: `story.friend` (now used for perks), `town.met`, `town.comm`, `town.crave`, `kitchen.stats`, `aquarium.released`, all validated. Version bumped to **v6.4.0**.

### 2026-11-22, Version 6.3.1: side drawer and better performance
- **The menu is a side drawer** that slides in from the right (☰): one large row per button, with **🗺️ Map** first, then Bag, Log, Settings, Career, Records, Look, Sound, **View: first / third person**, Quests and Exit. The Map also opens with `M`.
- **No more MAP on the action button:** when there is nothing to do the button simply hides.
- **Performance:** the static meshes of every town building, palm and the loose terrace props are merged (about **45% fewer draw calls** in the town square, 20% on the boardwalk); the town is not drawn far out at sea (over 210 m) or underwater, the pier not underwater, townsfolk more than 45 m away are not drawn, and High graphics renders at up to 1.5x pixel density instead of 2x. Version bumped to **v6.3.1**.

### 2026-11-22, Version 6.3.0: a bigger Harbour Town
- **Expanded town:** the terrace is wider (to +-37.6 m) with a ramp up to an upper terrace. New **Market Square & Artisan Quarter** (Post Office, Barnaby's Workshop, tide pool, Sailors' Rest) and **Lighthouse Hill** (Talia's greenhouse, herb garden, Lookout Pavilion with telescope and reading bench), street lanterns and Rook's winch. Every new building fades when it blocks the camera and has walk colliders; tap-to-walk now routes around buildings through town waypoints (`townPath`). All places are on the Map.
- **Four new townsfolk:** Maren, Barnaby, Talia and Old Salty, with routines and **8 new quests** (chapters 5 and 6, 25 in all).
- **Town jobs** (3 a day): mail runner, cleanup crew, night watch lanterns, herb & shell foraging, dockhand winch; pay, XP and town reputation.
- **Things to do:** the lookout **telescope** marks frenzies, treasure and boss shadows on the Map; **dice** at Sailors' Rest; **crab traps** in the tide pool (shellfish for the new **Crab & Lobster Bisque**, pearls); **boat paint** (hull, trim, pennant); Talia's herbal lures; the Post Office's treasure maps and bottle stamps.
- New save field `town` (jobs, reputation, traps, paint, herbs, dice record, lanterns), validated on load. Version bumped to **v6.3.0**.

### 2026-11-22, Version 6.2.1: a tidier HUD
- **Less text on screen:** the pills under the top bar are now at most three short lines. The zone line also carries the return fuel (`⛽ 8.2 back`, shown as a separate warning only when fuel is getting low) and the meal charges and espresso as icons (`⚡6 ☕5h`). **One objective pill:** a finished quest first, then a finished bounty, a bounty that just moved (for 6 seconds), otherwise the current quest. **One radar pill:** treasure or boss and the sonar's frenzy as distance and arrow (`🪙 98m ▶ · 📡 34m ▼`). Smaller pill text. Version bumped to **v6.2.1**.

### 2026-11-22, Version 6.2.0: a slower day, meal charges, the bunk
- **A slower clock:** one in-game day now lasts **7 real minutes** (`DAY_SECONDS = 420`, was 3.5 minutes): an in-game hour is 17.5 seconds. Only the time of day slows down; walking, boats, casting and fights run as before. Sun, sky, NPC routines, restaurant service, aquarium care and reading all follow the one clock.
- **Meal buffs use charges** instead of 6 hours: *faster bites* for the next 8 casts, *steadier line* for the next 5 fights, *longer breath* for the next dive, shown in a compact orange pill. A running meal from an older save becomes a full set of charges.
- **🛏️ Sleep** in the cabin bunk from 18:00: fade out, wake at 06:00 on a new day, and read 30 pages of your selected book.
- **Skill books take 15 in-game days** (21,600 minutes, was 44,640); saved progress keeps its percentage. **☕ Harbour Espresso** ($25, restaurant pantry) doubles reading speed for 12 hours.
- New save fields `booksV`, `bookSel`, `kitchen.espresso` and meal charges (`kitchen.buff.n`), all defaulted on load. Version bumped to **v6.2.0**.

### 2026-11-22, Version 6.1.1: steer like a car
- **New on-foot controls** (both views): left / right on the stick turns the angler on the spot to any angle, up / down walks forward / back, and the **camera stays behind him and turns with him**. Dragging on the screen looks around and swings back when you walk; tap-to-walk turns him toward each point first.
- **Slower:** walking up to 2.4 m/s (was 3.3), running 3.8 m/s (was 5.6), backing up at 60%. At the pier tip he still turns to face the sea when you stop steering. Version bumped to **v6.1.1**.

### 2026-11-22, Version 6.1.0: your restaurant and cooking
- **Your name:** a name box in character creation; your restaurant in Harbour Town carries it (*Wayne's Restaurant*, or *Fisherman's Restaurant* when empty), on its sign, its sheet, the banner and the Map.
- **Your restaurant opens** with Chef Lorenzo (his first quest). **KITCHEN** at the door: Cook, Fridge, Pantry and Upgrades.
- **18 recipes** unlocked as you cook, a three-step **cooking mini-game** (chop, sear, plate) for 1 to 3 stars, a fridge of dishes that guests buy at **lunch and dinner** (in-game time), a 1 to 5 rating, takings to collect, upgrades (waiters, stove, terrace lights) and **meal buffs** when you eat a dish.
- **4 new quests** with Lorenzo (17 in all). New save fields `kitchen` and `playerName`. Version bumped to **v6.1.0**.

### 2026-11-21, Version 6.0.0: Harbour Town, its people and a new way to move
- **Harbour Town:** walk through the new gate behind the pier onto the island: a plaza with a well, lamps and a noticeboard, cottages, Marta's hut and Lorenzo's restaurant (opening soon). The island scenery is always shown now; whatever blocks the camera fades out.
- **Five townsfolk** with day and night routines (Marta, Captain Rook, Pip, Ines, Chef Lorenzo). **💬 TALK** to them; a dialogue box with choices pauses the world.
- **Quests:** a 13-quest story in 4 chapters (*Welcome to Harbour Town*, *The Keeper's Light*, *Rook's Wager*, *The Legend of the Deep*) plus side quests, with ❗ / ❓ markers, a HUD pill and a Quests list in the Menu. New save field `story`.
- **Movement overhaul:** camera-relative thumbstick, smooth acceleration and braking, a light push walks (up to 3.3 m/s) and a full push or `Shift` runs (5.6 m/s), **tap the ground or a shop to walk there** (routed through the pier mouth, the stairs, the cabin door and the town gate), and **drag on the screen to orbit the camera** (or look around in first person); tap the compass to face the sea again.
- The Map shows the town and where everyone is. Version bumped to **v6.0.0**.

### 2026-11-21, Version 5.6.0: a real map you can drag and pinch
- **The harbour map is now the actual world seen from straight above** (the paused scene is rendered once from overhead when you open it: the harbour in detail and the sea out to the lighthouse).
- **Navigate it:** drag to move, pinch (or the mouse wheel) to zoom, **＋ / －** buttons, and **⌖** to centre on yourself. Tapping a place in the list below finds it on the map.
- Your arrow and view cone, landmark icons and names, a north arrow and a scale bar are drawn on top. Version bumped to **v5.6.0**.

### 2026-11-21, Version 5.5.0: Aquarium Shop, bigger cabin, harbour map
- **Aquarium Shop** on the boardwalk (between the Fish Market and the Cabin): tank upgrades, decorations, care goods (premium pellets and deep-clean kits) and The Aquarist's Handbook, in a catalogue like the Tackle Shop.
- **The tank grows with each tier** (1.8 m to 4.3 m of glass) and is rebuilt in the Cabin when you upgrade. The **Cabin is wider** (8.4 m) and moved east; the boardwalk now runs to +-27 m.
- **Aquarium view:** the angler is hidden and the camera sweeps slowly along the tank from right to left and back.
- **Decorations stay yours:** removing one stores it; place it again for free from the tank's new *Decor* tab. A purchase with no free slot goes to storage.
- **Harbour map:** wherever the action button would have nothing to do (on the pier or a boat), it becomes **🗺️ MAP**. The map shows the harbour from above, where you are, which way you face, every shop and landmark with what it is for, and how far and in which direction each one is. The lighthouse is shown by distance and direction.
- The camera follows you fully at the far ends of the boardwalk. New save fields `aquarium.stored`, `pellets`, `kits`, `cleanBoost`. Version bumped to **v5.5.0**.

### 2026-11-21, Version 5.4.0: better pier fishing, faster walking
- **No more walking off after a fight:** when the line snaps, the fish escapes or you land a catch while holding the stick (or A/D) to one side, the angler (or the boat) ignores it until you let go.
- **Fights end properly:** a snapped line kicks the rod back, its loose end falls and fades and the bobber sinks; an escaped fish darts away and fades while the empty line is wound in (about a second; walking waits for it).
- **Walking is faster:** 4.2 m/s at full stick (was 3.0), and first-person turning is a little quicker. Version bumped to **v5.4.0**.

### 2026-11-21, Version 5.3.0: rotate toggle, boat-only diving, full bucket
- **Customise:** a *Stop / Rotate* button pauses and resumes the preview's spin (dragging still turns the model).
- **No diving from the pier:** the Dive button only appears on a stopped boat or at the lighthouse jetty.
- **Bag list is compact** (smaller rows, sticky sort bar, two columns on wide screens, fish count in the title) so many more fish fit on screen.
- **Installed app:** the manifest now uses `standalone` instead of `fullscreen`, so the phone's bottom navigation stays available, and the Menu has an **Exit** tile (saves, then closes the window where the browser allows it).
- **Every fish in the bucket is shown:** the pier bucket now holds one mini fish per fish you carry (up to 24), coloured by rarity and sized by weight, in a grid over the opening. Version bumped to **v5.3.0**.

### 2026-11-21, Version 5.2.0: an open book in your hands
- **Reading shows a real open book** held in both hands in front of the chest: cover in the book's colour, page stacks that shift from the right (unread) to the left (read) as you progress.
- **A page turns every time a page is finished** (and once when you open the book): a leaf lifts off the right stack, curls over the spine and settles on the left.
- **First person looks down at the book** while you read, lowered and leaning in over the pages; the view returns to the sea when you stop. Version bumped to **v5.2.0**.

### 2026-11-21, Version 5.1.3: remove aquarium decorations, fewer idle buttons
- **Aquarium decorations can be removed:** owned decorations show a *Remove* button in the Shop tab (with a confirm); the slot frees up. Buying one again costs full price.
- The round action button is also hidden while reading, while ascending in an emergency and while the spear reloads. Version bumped to **v5.1.3**.

### 2026-11-21, Version 5.1.2: no Walk Edge button
- The *Walk Edge* button is hidden everywhere (it did nothing); it only appears beside the seagull, where it still counts the secret-menu taps. Version bumped to **v5.1.2**.

### 2026-11-21, Version 5.1.1: no useless action button
- The round action button is hidden when pressing it would do nothing (no books on a bench, no spear underwater, no boat moored, refuel pump with no boat). The banner still says why. Version bumped to **v5.1.1**.

### 2026-11-21, Version 5.1.0: skill books you read on a bench
- **Six skill books**, one per shop (Boatyard, Tackle Shop, Dive Shop, Fish Market, Recycling, Aquarium), all driven by one `BOOKS` table: rare-fish odds from a boat, from the pier and while diving, breath capacity and a tighter underwater weight guess, fish prices, junk prices and aquarium tickets.
- **Reading on benches:** sit on a bench and press *Read* to pick a book; progress is counted in in-game minutes. A session lasts 6 in-game hours, then the angler sits idle until you press Read again; standing up cancels it and keeps your progress.
- **Perks grow every in-game minute** (bonus = max x minutes read / 44,640), not at the end.
- **Diving targets now show a weight range** (`~0.7 kg – 1.2 kg`) instead of exact numbers, fixed per fish so it never flickers; the Diving book narrows it from +-35% to +-5%.
- New save field `books`. Version bumped to **v5.1.0**.

### 2026-11-21, Version 5.0.0: a working aquarium
- **Aquarium instead of the Trophy Case:** a glass tank in the Cabin with swimming fish (their real models), decorations, bubbles and water that clouds when dirty. A paper sheet with *Fish*, *Add*, *Care* and *Shop* tabs runs it.
- **Size rules:** only fish go in; each tank has a largest fish it can hold (1.5, 4, 9 and 18 kg) and a room limit, and fish over 18 kg never fit in any tank (`aquariumCanHold`). The Add tab says why a fish can't go in.
- **Care and money:** food and cleanliness fall with in-game days, feeding and cleaning restore them, happy fish earn visitor tickets you collect (banked up to about 8 days). Neglect never kills a fish.
- **Breeding and collection:** fry with a chance of golden, albino or midnight forms (more tickets), a small bonus per species kept, four tank tiers, eight decorations and six new achievements (45 in all).
- **Records:** the old trophies list is now **Menu -> Records** (same medals and numbers, no progress lost). New save field `aquarium` (validated in `sanitizeSave`: unknown or oversized fish are dropped).
- Version bumped to **v5.0.0**.

### 2026-11-20, Version 4.10.0: bounties you can actually do
- **Possible contracts only:** the board no longer offers Trench or Rift contracts to a player on the pier, or a 100 kg fish to someone with a bamboo rod. What counts as possible comes from your boat's top zone (the pier is zone 1) and your rod's rated weight (`bountyReach`, `bountyEligible`).
- **Balanced mix:** each board is a spread of contract types and difficulties (easy, medium, stretch) instead of three random picks, and the paper that replaces a claimed one is chosen the same way. A new boat or rod unlocks the next zone's contracts with the next replacement.
- **Old saves:** contracts with no progress that are out of reach are swapped for fitting ones on load; started contracts are kept.
- Version bumped to **v4.10.0**.

### 2026-11-20, Version 4.9.5: head visible in shops in first person
- Opening a shop in first person now shows the angler from outside with his head (it stayed hidden before, as it is in the first-person view). Leaving the shop returns to the first-person view.
- Version bumped to **v4.9.5**.

### 2026-11-20, Version 4.9.4: a clear view of the bounty board
- While the camera is zoomed on the bounty board the angler steps out of the picture (he is back as soon as you move), so he never stands in front of the contract papers.
- Version bumped to **v4.9.4**.

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
- **Diving:** a **🤿 DIVE** button (and `X`) takes you underwater from a slow or stopped boat or the lighthouse jetty (not from the pier). Swim in first person, with air that drains faster with depth, a rated depth per gear tier, a headlamp, a catch bag and an auto-ascent. Running out of air means an emergency ascent and a lost half-bag.
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
