/* Data: the messages in bottles and the bounty contract pool. */

// 36 Unique Depth-Based Collectible Messages (9 per Zone)
export const BOTTLE_MESSAGES = [
  // Zone 1: Shallow Cove & Harbor Shore (1 - 9)
  { id: 1, zones: [1], title: 'Pier Plank #14', text: 'If you are reading this, stop fishing with bread crumbs near the pilings—the mullet just steal it!' },
  { id: 2, zones: [1], title: 'Childhood Wish', text: 'I threw this bottle off the harbor pier on my 8th birthday. Hope whoever finds it catches a giant fish!' },
  { id: 3, zones: [1], title: 'Harbor Keeper Note', text: 'Reminder: The Mayor pays $1,000 for every 100kg of ocean junk recycled at the shop. Keep our bay clean!' },
  { id: 4, zones: [1], title: 'Soggy Recipe', text: 'Grandma’s Grilled Perch: Lemon, sea salt, butter, and patience. Do not overcook over driftwood!' },
  { id: 5, zones: [1], title: 'Lost Tackle Box', text: 'Dropped my lucky brass spinner off the east T-pier during high tide. Reward: one warm cup of chowder.' },
  { id: 6, zones: [1], title: 'Lover’s Tide', text: 'Meet me where the wooden planks meet the sand when the lantern lights up at dusk.' },
  { id: 7, zones: [1], title: 'Seagull Truce', text: 'To the seagulls on piling #3: I will share one sardine if you stop stealing my bait!' },
  { id: 8, zones: [1], title: 'Rookie Angler Log', text: 'Day 1: Hooked an old boot. Day 2: Hooked a tin can. Day 3: Still the best vacation ever.' },
  { id: 9, zones: [1], title: 'Harbor Master’s Ledger', text: 'Tide comes in, tide goes out, and someone always drops their car keys by the bait barrel.' },

  // Zone 2: Coastal Reef (10 - 18)
  { id: 10, zones: [2], title: 'Coral Reef Chart', text: 'Watch your keel past the green buoys! The parrotfish love the coral heads, but Moray Eels fight like dragons.' },
  { id: 11, zones: [2], title: 'Diver’s Warning', text: 'Spotted a shimmering gold-and-cyan feeding frenzy just past the 150m marker. Cast right into the ripples!' },
  { id: 12, zones: [2], title: 'Smuggler’s Tally', text: 'Three crates of spiced rum lost overboard near the reef ledge. If found, drink responsibly.' },
  { id: 13, zones: [2], title: 'Marine Biologist Note', text: 'Specimen #42: The Psychedelic Mandarin only takes live shrimp near outer coral shelves.' },
  { id: 14, zones: [2], title: 'Stranded Skiff', text: 'Ran out of fuel at 240m! Always check your return fuel gauge before chasing snapper schools.' },
  { id: 15, zones: [2], title: 'Sunken Bell', text: 'On calm nights over the Coastal Reef, you can still hear the old ferry bell chiming below.' },
  { id: 16, zones: [2], title: 'Pirate’s P.S.', text: 'Left my favorite tricorne hat somewhere on this reef. If you hook it, wear it with pride.' },
  { id: 17, zones: [2], title: 'Reef Photographer', text: 'The colors beneath the waves here look best through one of the camera filters.' },
  { id: 18, zones: [2], title: 'Grouper’s Cavern', text: 'Weighed a Tiger Grouper at 10.4 kilograms right beside the second orange channel buoy!' },

  // Zone 3: Open Shelf (19 - 27)
  { id: 19, zones: [3], title: 'Bluewater Logbook', text: '450 meters out. A Broadbill Swordfish nearly stripped my entire spool before dawn!' },
  { id: 20, zones: [3], title: 'Storm Chaser’s Note', text: 'When thunderclouds roll over the Open Shelf, electric mackerel rise from the thermocline.' },
  { id: 21, zones: [3], title: 'Merchant Clipper SOS', text: 'Lost rudder in heavy swells off the continental shelf. Crew rescued by trawler; cargo still drifting.' },
  { id: 22, zones: [3], title: 'Celestial Navigator', text: 'Wait for the Full Moon to rise over the shelf—astral marlins glow like purple comets in the wake.' },
  { id: 23, zones: [3], title: 'Marlin Hunter’s Tip', text: 'When a Blue Marlin runs left, lean your stick hard right or your line will snap in seconds!' },
  { id: 24, zones: [3], title: 'Drifting Postcard', text: 'Greetings from the 500m line! Nothing around me but cobalt swells and flying Mahi-Mahi.' },
  { id: 25, zones: [3], title: 'Old Salt’s Wisdom', text: 'A fiberglass skiff gets you to the shelf, but only carbon or titanium will bring a trophy back.' },
  { id: 26, zones: [3], title: 'Sunfish Sighting', text: 'Saw an Oceanic Mola Sunfish as wide as a barn door basking on the midday current.' },
  { id: 27, zones: [3], title: 'Lighthouse Keeper’s Letter', text: 'From the high cliff we watch your little boat bobbing past the 300m buoys. Safe voyage!' },

  // Zone 4: Abyssal Trench (28 - 36)
  { id: 28, zones: [4], title: 'Bathyscaphe Descent', text: 'Depth 900m: Bioluminescent anglerfish are circling our hull lights. Sending this capsule up!' },
  { id: 29, zones: [4], title: 'Trench Expedition #9', text: 'We found living Coelacanths in the abyssal canyon—armored in sapphire scales older than memory.' },
  { id: 30, zones: [4], title: 'Abyssal Whisper', text: 'Do not dangle a glowing lure in the trench unless your winch rod can hold over 100 kilograms.' },
  { id: 31, zones: [4], title: 'Captain Nemo’s Margin', text: 'Beneath 700 meters of black water lies the Trench Leviathan. Only legends return with its scales.' },
  { id: 32, zones: [4], title: 'Voltaic Warning', text: 'During a midnight thunderstorm over the trench, something colossal lit up the sonar like lightning.' },
  { id: 33, zones: [4], title: 'Time Capsule 1894', text: 'Sealed aboard the barque Starlight above the deep trench. May future mariners sail in peace.' },
  { id: 34, zones: [4], title: 'Oarfish Omen', text: 'A 60-kilogram Giant Oarfish surfaced beside our trawler—the silver serpent of deep-sea folklore.' },
  { id: 35, zones: [4], title: 'Cartographer’s Margin', text: 'Here be dragons, gulper eels, and black dragonfish lighting the dark with violet lanterns.' },
  { id: 36, zones: [4], title: 'The Final Coordinate', text: 'You have reached the edge of the known sea. Every cast here writes a new page in the encyclopedia.' }
];

export const BOUNTY_POOL = [
  { id: 'b_minnows', title: 'Pier Fry Order', desc: 'Catch 3 Fish in Shallow Cove (Zone 1)', type: 'zone_fish', zone: 1, target: 3, rewardCash: 45, rewardBaitTier: 2, rewardBaitQty: 5 },
  { id: 'b_cleanup', title: 'Harbor Cleanup Drive', desc: 'Catch 3 Junk or Flora items anywhere', type: 'junk', target: 3, rewardCash: 60, rewardBaitTier: 2, rewardBaitQty: 5 },
  { id: 'b_heavy_cove', title: 'Shoreline Lunker', desc: 'Land a fish weighing at least 2.0 kg', type: 'min_weight', minW: 2.0, target: 1, rewardCash: 75, rewardBaitTier: 3, rewardBaitQty: 3 },
  { id: 'b_reef_haul', title: 'Reef Chef Special', desc: 'Catch 3 Fish in Coastal Reef (Zone 2)', type: 'zone_fish', zone: 2, target: 3, rewardCash: 160, rewardBaitTier: 3, rewardBaitQty: 5 },
  { id: 'b_rare_hunter', title: 'Rare Specimen Bounty', desc: 'Land 2 Rare, Epic, or Legendary catches', type: 'rare_plus', target: 2, rewardCash: 240, rewardBaitTier: 3, rewardBaitQty: 5 },
  { id: 'b_shelf_sport', title: 'Bluewater Sportfisher', desc: 'Catch 2 Fish in Open Shelf (Zone 3)', type: 'zone_fish', zone: 3, target: 2, rewardCash: 380, rewardBaitTier: 4, rewardBaitQty: 4 },
  { id: 'b_abyss_exped', title: 'Abyssal Research', desc: 'Land 1 Fish from Abyssal Trench (Zone 4)', type: 'zone_fish', zone: 4, target: 1, rewardCash: 750, rewardBaitTier: 4, rewardBaitQty: 6 },
  { id: 'b_herring_run', title: 'Herring Run', desc: 'Catch 5 Fish in Shallow Cove (Zone 1)', type: 'zone_fish', zone: 1, target: 5, rewardCash: 70, rewardBaitTier: 2, rewardBaitQty: 5 },
  { id: 'b_tidy_up', title: 'Big Beach Cleanup', desc: 'Catch 6 Junk or Flora items anywhere', type: 'junk', target: 6, rewardCash: 120, rewardBaitTier: 2, rewardBaitQty: 8 },
  { id: 'b_rift_pioneer', title: 'Rift Pioneer', desc: 'Land 1 Fish from the Mariana Rift (Zone 5)', type: 'zone_fish', zone: 5, target: 1, rewardCash: 1500, rewardBaitTier: 4, rewardBaitQty: 8 },
  { id: 'b_rift_giant', title: 'Rift Heavyweight', desc: 'Land a fish weighing at least 100 kg', type: 'min_weight', minW: 100.0, target: 1, rewardCash: 2500, rewardBaitTier: 4, rewardBaitQty: 10 },
  { id: 'b_reef_lunker', title: 'Reef Heavyweight', desc: 'Land a fish weighing at least 8.0 kg', type: 'min_weight', minW: 8.0, target: 1, rewardCash: 300, rewardBaitTier: 3, rewardBaitQty: 4 },
  { id: 'b_shelf_haul', title: 'Open Shelf Haul', desc: 'Catch 4 Fish in Open Shelf (Zone 3)', type: 'zone_fish', zone: 3, target: 4, rewardCash: 520, rewardBaitTier: 4, rewardBaitQty: 4 },
  { id: 'b_trophy_case', title: 'Trophy Case', desc: 'Land 4 Rare, Epic, or Legendary catches', type: 'rare_plus', target: 4, rewardCash: 480, rewardBaitTier: 4, rewardBaitQty: 3 },
  { id: 'b_trench_pair', title: 'Trench Double Header', desc: 'Catch 2 Fish in Abyssal Trench (Zone 4)', type: 'zone_fish', zone: 4, target: 2, rewardCash: 1100, rewardBaitTier: 4, rewardBaitQty: 6 },
  { id: 'b_titan', title: 'Titan Hunter', desc: 'Land a fish weighing at least 40.0 kg', type: 'min_weight', minW: 40.0, target: 1, rewardCash: 1500, rewardBaitTier: 4, rewardBaitQty: 8 }
];
