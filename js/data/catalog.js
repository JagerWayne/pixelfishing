/* Data: dive gear, spear guns, sea zones, weather types and the catch catalogue (every fish, junk and flora). */

/* ---- Diving & spearfishing gear ----
   maxDepth: rated depth (m) · air: seconds of air at the surface (drains faster with depth) · bagKg: catch bag size
   speed: swim speed (m/s) · light: headlamp level.  Spear guns: range (m), speed (m/s), power = heaviest fish (kg) it can land. */
export const DIVE_GEAR = [
  { tier: 0, name: 'No Dive Gear', cost: 0, maxDepth: 0, air: 0, bagKg: 0, speed: 0, light: 0, desc: 'You can only look at the water.' },
  { tier: 1, name: 'Mask, Snorkel & Fins', cost: 140, maxDepth: 4, air: 28, bagKg: 6, speed: 2.4, light: 0, desc: 'Free-diving kit: one breath, shallow dives in the Cove.' },
  { tier: 2, name: 'Wetsuit & Single Tank', cost: 520, maxDepth: 16, air: 170, bagKg: 16, speed: 3.0, light: 0, desc: 'Scuba basics. Reef dives with minutes of air.' },
  { tier: 3, name: 'Twin-Tank Tech Rig', cost: 1650, maxDepth: 32, air: 360, bagKg: 34, speed: 3.5, light: 1, desc: 'Twin tanks and a headlamp for the Open Shelf.' },
  { tier: 4, name: 'Rebreather & Scooter', cost: 4300, maxDepth: 62, air: 780, bagKg: 60, speed: 5.0, light: 2, desc: 'Silent rebreather with a propeller scooter and a strong lamp.' },
  { tier: 5, name: 'Atmospheric Exo-Suit', cost: 9800, maxDepth: 130, air: 1600, bagKg: 140, speed: 6.0, light: 3, desc: 'Armoured pressure suit that reaches the Abyssal Trench floor.' }
];
export const SPEAR_GUNS = [
  { tier: 0, name: 'No Spear', cost: 0, range: 0, speed: 0, power: 0, reload: 0, desc: 'Bare hands.' },
  { tier: 1, name: 'Hand Pole Spear', cost: 60, range: 6, speed: 17, power: 8, reload: 1.5, desc: 'Short and slow. Good for small reef fish up to 8 kg.' },
  { tier: 2, name: 'Band Speargun', cost: 260, range: 11, speed: 25, power: 22, reload: 1.2, desc: 'Rubber-band powered. Lands fish up to 22 kg.' },
  { tier: 3, name: 'Pneumatic Speargun', cost: 820, range: 17, speed: 33, power: 50, reload: 0.9, desc: 'Compressed air, long range, up to 50 kg.' },
  { tier: 4, name: 'CO2 Power Harpoon', cost: 2400, range: 25, speed: 42, power: 120, reload: 0.7, desc: 'Heavy harpoon for big game up to 120 kg.' },
  { tier: 5, name: 'Rail Harpoon', cost: 6200, range: 36, speed: 55, power: 320, reload: 0.5, desc: 'Electromagnetic rail gun. Nothing in the sea is too big.' }
];

export const ZONES = [
  { id: 1, name: 'Shallow Cove', minM: 0, maxM: 100, waterColor: 0x3b8ea5, fogColor: 0x9ecae1, waveAmp: 0.18, waveFreq: 1.6 },
  { id: 2, name: 'Coastal Reef', minM: 100, maxM: 300, waterColor: 0x2c6e85, fogColor: 0x74a9cf, waveAmp: 0.34, waveFreq: 1.3 },
  { id: 3, name: 'Open Shelf', minM: 300, maxM: 650, waterColor: 0x2b547e, fogColor: 0x4b749f, waveAmp: 0.58, waveFreq: 1.05 },
  { id: 4, name: 'Abyssal Trench', minM: 650, maxM: 1500, waterColor: 0x1e2542, fogColor: 0x161d33, waveAmp: 0.92, waveFreq: 0.85 },
  { id: 5, name: 'Mariana Rift', minM: 1500, maxM: 99999, waterColor: 0x0b1733, fogColor: 0x0a1226, waveAmp: 1.15, waveFreq: 0.75 }
];

export const WEATHER_TYPES = [
  { id: 'CLEAR', label: '☀️ Clear', waveMult: 1.0, skyDim: 1.0, fogDensity: 0.0022, rainRate: 0 },
  { id: 'OVERCAST', label: '☁️ Overcast', waveMult: 1.18, skyDim: 0.78, fogDensity: 0.0028, rainRate: 0 },
  { id: 'RAIN', label: '🌧️ Rain', waveMult: 1.38, skyDim: 0.62, fogDensity: 0.0036, rainRate: 0.55 },
  { id: 'STORM', label: '⛈️ Storm', waveMult: 1.72, skyDim: 0.44, fogDensity: 0.0046, rainRate: 1.0 }
];

export const CATCH_CATALOG = [
  { id: 'sw_lettuce', name: 'Slimy Sea Lettuce', category: 'Flora', rarity: 'Flora', zones: [1, 2], minW: 0.2, maxW: 0.5, value: 2, color: '#4ade80', accent: '#166534', shape: 'seaweed', desc: 'Translucent green fronds clinging to your hook.' },
  { id: 'sw_kelp', name: 'Tangled Kelp Ribbon', category: 'Flora', rarity: 'Flora', zones: [1, 2, 3], minW: 0.5, maxW: 1.2, value: 4, color: '#3f6212', accent: '#84cc16', shape: 'seaweed', desc: 'Long rubbery brown-green kelp blade.' },
  { id: 'sw_bladder', name: 'Bubble Bladderwrack', category: 'Flora', rarity: 'Flora', zones: [1, 2], minW: 0.3, maxW: 0.8, value: 3, color: '#65a30d', accent: '#bef264', shape: 'seaweed', desc: 'Poppable air-filled coastal seaweed.' },
  { id: 'sw_abyssal', name: 'Glowing Abyssal Moss', category: 'Flora', rarity: 'Uncommon', zones: [3, 4, 5], minW: 0.4, maxW: 1.0, value: 12, color: '#2dd4bf', accent: '#a5f3fc', shape: 'seaweed', desc: 'Bioluminescent deep-trench algae prized by alchemists.' },

  { id: 'jk_boot', name: 'Waterlogged Old Boot', category: 'Junk', rarity: 'Junk', zones: [1, 2, 3], minW: 1.1, maxW: 1.8, value: 1, color: '#78350f', accent: '#451a03', shape: 'boot', desc: 'A classic angler rite of passage. Size 11, left foot.' },
  { id: 'jk_can', name: 'Rusty Tin Can', category: 'Junk', rarity: 'Junk', zones: [1, 2], minW: 0.3, maxW: 0.6, value: 1, color: '#94a3b8', accent: '#b45309', shape: 'can', desc: 'Corroded sardine tin. Ironic.' },
  { id: 'jk_bottle', name: 'Shattered Glass Bottle', category: 'Junk', rarity: 'Junk', zones: [1, 2, 3], minW: 0.4, maxW: 0.9, value: 2, color: '#34d399', accent: '#d1fae5', shape: 'bottle', desc: 'Sea-frosted green glass bottle without a map inside.' },
  { id: 'jk_msg_bottle', name: 'Message in a Bottle', category: 'Junk', rarity: 'Uncommon', zones: [1, 2, 3, 4, 5], isMessageBottle: true, minW: 0.5, maxW: 1.1, value: 8, color: '#2dd4bf', accent: '#fef08a', shape: 'bottle', desc: 'A corked sea-glass bottle containing a weathered parchment scroll.' },
  { id: 'jk_anchor', name: 'Barnacle-Crusted Anchor', category: 'Junk', rarity: 'Junk', zones: [1, 2, 3, 4, 5], minW: 8.5, maxW: 14.0, value: 15, color: '#475569', accent: '#f472b6', shape: 'anchor', desc: 'Dead-weight iron fluke anchor! Snaps beginner rods.' },
  { id: 'jk_hat', name: 'Soggy Pirate Hat', category: 'Junk', rarity: 'Uncommon', zones: [2, 3, 4, 5], minW: 0.5, maxW: 0.9, value: 18, color: '#1e293b', accent: '#facc15', shape: 'hat', desc: 'Water-stained tricorne with tarnished gold trim.' },
  { id: 'jk_box', name: 'Locked Sunken Strongbox', category: 'Junk', rarity: 'Rare', zones: [2, 3, 4, 5], minW: 4.0, maxW: 7.5, value: 65, color: '#92400e', accent: '#fbbf24', shape: 'box', desc: 'Salt-encrusted oak coffer rattling with old silver.' },

  // Zone 1: Shallow Cove
  { id: 'f_minnow', name: 'Sunlit Minnow', category: 'Fish', rarity: 'Common', zones: [1], minW: 0.2, maxW: 0.6, value: 6, color: '#fde047', accent: '#38bdf8', shape: 'fish_slim', desc: 'Darting golden-flanked fry common around wooden pilings.' },
  { id: 'f_sardine', name: 'Silver Sardine', category: 'Fish', rarity: 'Common', zones: [1], minW: 0.3, maxW: 0.9, value: 9, color: '#e2e8f0', accent: '#3b82f6', shape: 'fish_slim', desc: 'Mirror-scaled schooling fish shimmering in shallow sunlight.' },
  { id: 'f_perch', name: 'Striped Perch', category: 'Fish', rarity: 'Common', zones: [1], minW: 0.6, maxW: 1.8, value: 16, color: '#f97316', accent: '#1e293b', shape: 'fish_standard', desc: 'Feisty barred panfish that puts up a lively tug.' },
  { id: 'f_flounder', name: 'Coastal Flounder', category: 'Fish', rarity: 'Uncommon', zones: [1], minW: 1.0, maxW: 2.8, value: 24, color: '#b45309', accent: '#fef3c7', shape: 'fish_flat', desc: 'Camouflaged sandy-bottom flatfish.' },
  { id: 'f_mullet', name: 'Harbor Mullet', category: 'Fish', rarity: 'Common', zones: [1], minW: 0.8, maxW: 2.1, value: 14, color: '#cbd5e1', accent: '#64748b', shape: 'fish_slim', desc: 'Silvery coastal jumper often seen leaping near the pier.' },
  { id: 'f_seabream', name: 'Gilt-Head Bream', category: 'Fish', rarity: 'Uncommon', zones: [1], minW: 1.1, maxW: 2.6, value: 26, color: '#94a3b8', accent: '#facc15', shape: 'fish_standard', desc: 'Prized shoreline table fish with a golden brow stripe.' },
  { id: 'f_pipefish', name: 'Emerald Pipefish', category: 'Fish', rarity: 'Rare', zones: [1], minW: 0.3, maxW: 0.8, value: 34, color: '#10b981', accent: '#a7f3d0', shape: 'fish_eel', desc: 'Slender seagrass-dwelling cousin of the seahorse.' },
  { id: 'f_seabass', name: 'Speckled Sea Bass', category: 'Fish', rarity: 'Rare', zones: [1], minW: 1.8, maxW: 3.4, value: 42, color: '#334155', accent: '#38bdf8', shape: 'fish_standard', desc: 'Ambush hunter patrolling the shadow of the pier pilings.' },

  // Zone 2: Coastal Reef
  { id: 'f_snapper', name: 'Copper Snapper', category: 'Fish', rarity: 'Common', zones: [2], minW: 1.8, maxW: 4.5, value: 42, color: '#ef4444', accent: '#fed7aa', shape: 'fish_standard', desc: 'Rosy reef predator prized by coastal kitchens.' },
  { id: 'f_puffer', name: 'Pufferfish', category: 'Fish', rarity: 'Uncommon', zones: [2], minW: 1.2, maxW: 3.0, value: 38, color: '#facc15', accent: '#78350f', shape: 'fish_round', desc: 'Spiny blowfish that inflates into a prickly sphere when hooked.' },
  { id: 'f_lionfish', name: 'Reef Lionfish', category: 'Fish', rarity: 'Rare', zones: [2], minW: 2.0, maxW: 5.2, value: 55, color: '#dc2626', accent: '#ffffff', shape: 'fish_spiky', desc: 'Ornate venomous coral dweller with fan-like pectoral fins.' },
  { id: 'f_moray', name: 'Moray Eel', category: 'Fish', rarity: 'Rare', zones: [2], minW: 3.5, maxW: 8.5, value: 75, color: '#4d7c0f', accent: '#fef08a', shape: 'fish_eel', desc: 'Muscular reef serpent that thrashes wildly on the line.' },
  { id: 'f_parrotfish', name: 'Rainbow Parrotfish', category: 'Fish', rarity: 'Common', zones: [2], minW: 2.2, maxW: 5.4, value: 48, color: '#06b6d4', accent: '#f472b6', shape: 'fish_standard', desc: 'Beak-mouthed coral grazer painted in tropical pastels.' },
  { id: 'f_grouper', name: 'Tiger Grouper', category: 'Fish', rarity: 'Uncommon', zones: [2], minW: 4.5, maxW: 10.5, value: 68, color: '#92400e', accent: '#fbbf24', shape: 'fish_tuna', desc: 'Heavy-bodied reef lurker that dives straight for coral caves.' },
  { id: 'f_trigger', name: 'Clown Triggerfish', category: 'Fish', rarity: 'Rare', zones: [2], minW: 1.9, maxW: 4.8, value: 64, color: '#1e1b4b', accent: '#facc15', shape: 'fish_round', desc: 'Bold polka-dotted reef fighter with lockable dorsal spines.' },
  { id: 'f_mandarin', name: 'Psychedelic Mandarin', category: 'Fish', rarity: 'Epic', zones: [2], minW: 0.9, maxW: 2.2, value: 95, color: '#2563eb', accent: '#fb923c', shape: 'fish_spiky', desc: 'Electric-blue and tangerine jewel of the outer reef.' },

  // Zone 3: Open Shelf
  { id: 'f_mahi', name: 'Mahi-Mahi', category: 'Fish', rarity: 'Uncommon', zones: [3], minW: 6.0, maxW: 16.0, value: 115, color: '#22c55e', accent: '#facc15', shape: 'fish_standard', desc: 'Brilliant neon-green and gold acrobatic pelagics.' },
  { id: 'f_barracuda', name: 'Silver Barracuda', category: 'Fish', rarity: 'Uncommon', zones: [3], minW: 5.0, maxW: 14.0, value: 105, color: '#cbd5e1', accent: '#0f172a', shape: 'fish_slim', desc: 'Torpedo-shaped ambush hunter with razor teeth.' },
  { id: 'f_tuna', name: 'Yellowfin Tuna', category: 'Fish', rarity: 'Rare', zones: [3], minW: 8.0, maxW: 22.0, value: 140, color: '#1d4ed8', accent: '#facc15', shape: 'fish_tuna', desc: 'High-speed oceanic powerhouse with sickle-shaped yellow fins.' },
  { id: 'f_marlin', name: 'Blue Marlin', category: 'Fish', rarity: 'Epic', zones: [3], minW: 18.0, maxW: 34.0, value: 260, color: '#2563eb', accent: '#93c5fd', shape: 'fish_marlin', desc: 'Spear-billed cobalt titan of the open blue shelf.' },
  { id: 'f_wahoo', name: 'Striped Wahoo', category: 'Fish', rarity: 'Uncommon', zones: [3], minW: 7.5, maxW: 19.0, value: 128, color: '#0284c7', accent: '#e0f2fe', shape: 'fish_slim', desc: 'Blistering-fast blue-water sprinter with cobalt tiger bars.' },
  { id: 'f_swordfish', name: 'Broadbill Swordfish', category: 'Fish', rarity: 'Rare', zones: [3], minW: 15.0, maxW: 30.0, value: 195, color: '#334155', accent: '#94a3b8', shape: 'fish_marlin', desc: 'Gladiator of the pelagic thermocline with a flat slashing bill.' },
  { id: 'f_sailfish', name: 'Atlantic Sailfish', category: 'Fish', rarity: 'Epic', zones: [3], minW: 14.0, maxW: 28.0, value: 245, color: '#4f46e5', accent: '#38bdf8', shape: 'fish_marlin', desc: 'Flag-finned acrobat capable of tail-walking across swells.' },
  { id: 'f_sunfish', name: 'Oceanic Mola Sunfish', category: 'Fish', rarity: 'Epic', zones: [3], minW: 20.0, maxW: 34.5, value: 285, color: '#94a3b8', accent: '#fef08a', shape: 'fish_flat', desc: 'Bizarre disc-shaped gentle giant basking near shelf currents.' },

  // Zone 4: Abyssal Trench
  { id: 'f_angler', name: 'Anglerfish', category: 'Fish', rarity: 'Rare', zones: [4], minW: 12.0, maxW: 28.0, value: 320, color: '#4c1d95', accent: '#38bdf8', shape: 'fish_angler', desc: 'Nightmarish deep-sea ambusher dangling a glowing esca lure.' },
  { id: 'f_oarfish', name: 'Giant Oarfish', category: 'Fish', rarity: 'Epic', zones: [4], minW: 30.0, maxW: 65.0, value: 580, color: '#e2e8f0', accent: '#f43f5e', shape: 'fish_eel', desc: 'Serpentine silver sea-ribbon crowned with a crimson crest.' },
  { id: 'f_coelacanth', name: 'Abyssal Coelacanth', category: 'Fish', rarity: 'Legendary', zones: [4], minW: 45.0, maxW: 95.0, value: 950, color: '#1e3a8a', accent: '#67e8f9', shape: 'fish_tuna', desc: 'Living fossil armored in sapphire scales from the trench floor.' },
  { id: 'f_viperfish', name: 'Sloane Viperfish', category: 'Fish', rarity: 'Rare', zones: [4], minW: 8.0, maxW: 19.0, value: 290, color: '#0f172a', accent: '#22d3ee', shape: 'fish_slim', desc: 'Needle-fanged midnight predator lined with photophore lights.' },
  { id: 'f_gulper', name: 'Pelican Gulper Eel', category: 'Fish', rarity: 'Rare', zones: [4], minW: 14.0, maxW: 32.0, value: 350, color: '#1e1b4b', accent: '#f472b6', shape: 'fish_eel', desc: 'Whip-tailed abyssal swallower with a glowing pink tail tip.' },
  { id: 'f_goblin', name: 'Abyssal Goblin Shark', category: 'Fish', rarity: 'Epic', zones: [4], minW: 35.0, maxW: 72.0, value: 640, color: '#be185d', accent: '#fbcfe8', shape: 'fish_marlin', desc: 'Prehistoric rose-skinned trench shark with a blade-like snout.' },
  { id: 'f_dragonfish', name: 'Black Dragonfish', category: 'Fish', rarity: 'Epic', zones: [4], minW: 16.0, maxW: 38.0, value: 490, color: '#090d16', accent: '#a855f7', shape: 'fish_eel', desc: 'Velvet-black bioluminescent hunter emitting eerie violet light.' },
  { id: 'f_riftlamprey', name: 'Rift Lamprey King', category: 'Fish', rarity: 'Rare', zones: [5], minW: 20.0, maxW: 45.0, value: 420, color: '#14532d', accent: '#86efac', shape: 'fish_eel', desc: 'Sucker-mouthed rift predator that glows faintly green in the dark.' },
  { id: 'f_hadalangler', name: 'Hadal Anglerking', category: 'Fish', rarity: 'Epic', zones: [5], minW: 50.0, maxW: 110.0, value: 820, color: '#3b0764', accent: '#f0abfc', shape: 'fish_angler', glowing: true, desc: 'Crushing-depth ambusher whose lure lights up the whole rift wall.' },
  { id: 'f_sabrefish', name: 'Crystal Sabrefish', category: 'Fish', rarity: 'Epic', zones: [5], minW: 60.0, maxW: 120.0, value: 900, color: '#0ea5e9', accent: '#e0f2fe', shape: 'fish_marlin', desc: 'Glass-clear hunter with a blade-like bill that flashes like ice.' },
  { id: 'f_voidtuna', name: 'Void Bluefin', category: 'Fish', rarity: 'Legendary', zones: [5], minW: 120.0, maxW: 210.0, value: 1900, color: '#111827', accent: '#38bdf8', shape: 'fish_tuna', desc: 'A black, star-flecked giant that swims where light has never reached.' },
  { id: 'f_magmaeel', name: 'Magma Ribbon', category: 'Fish', rarity: 'Legendary', zones: [5], minW: 140.0, maxW: 230.0, value: 2100, color: '#7f1d1d', accent: '#fdba74', shape: 'fish_eel', glowing: true, desc: 'A glowing ember-red serpent that lives beside the rift vents.' },
  { id: 'f_marianatitan', name: 'Mariana Titan', category: 'Fish', rarity: 'Legendary', zones: [5], minW: 180.0, maxW: 260.0, value: 2600, color: '#0b1020', accent: '#facc15', shape: 'fish_tuna', desc: 'The undisputed ruler of the Mariana Rift, armoured in black and gold.' },
  { id: 'f_leviathan', name: 'Trench Leviathan', category: 'Fish', rarity: 'Legendary', zones: [4], minW: 60.0, maxW: 115.0, value: 1250, color: '#312e81', accent: '#fde047', shape: 'fish_tuna', desc: 'Colossal armored sovereign of the deepest ocean abyss.' },

  // FULL MOON EXCLUSIVE GLOWING FISH
  { id: 'fm_moonglow', name: 'Moonglow Lanternfish', category: 'Fish', rarity: 'Rare', zones: [1, 2], fullMoonOnly: true, glowing: true, minW: 1.2, maxW: 3.2, value: 145, color: '#38bdf8', accent: '#fef08a', shape: 'fish_slim', desc: '🌕 FULL MOON EXCLUSIVE: Radiates liquid silver-cyan starlight beneath the waves.' },
  { id: 'fm_lunarray', name: 'Lunar Ghost Ray', category: 'Fish', rarity: 'Epic', zones: [2, 3], fullMoonOnly: true, glowing: true, minW: 6.5, maxW: 15.0, value: 340, color: '#67e8f9', accent: '#e0f2fe', shape: 'fish_flat', desc: '🌕 FULL MOON EXCLUSIVE: Translucent bioluminescent ray that glides only under a Full Moon.' },
  { id: 'fm_celestial', name: 'Celestial Koi', category: 'Fish', rarity: 'Epic', zones: [1, 2, 3], fullMoonOnly: true, glowing: true, minW: 4.0, maxW: 11.0, value: 420, color: '#facc15', accent: '#38bdf8', shape: 'fish_standard', desc: '🌕 FULL MOON EXCLUSIVE: Mythic golden-haloed koi drawn to lunar tides.' },
  { id: 'fm_astralmarlin', name: 'Astral Starlight Marlin', category: 'Fish', rarity: 'Legendary', zones: [3, 4], fullMoonOnly: true, glowing: true, minW: 25.0, maxW: 68.0, value: 1450, color: '#c084fc', accent: '#fef08a', shape: 'fish_marlin', desc: '🌕 FULL MOON EXCLUSIVE: Constellations shimmer across its glowing amethyst flanks.' },

  // THUNDERSTORM EXCLUSIVE ELECTRIC FISH
  { id: 'st_ray', name: 'Storm Surge Ray', category: 'Fish', rarity: 'Rare', zones: [1, 2], stormOnly: true, glowing: true, minW: 2.5, maxW: 6.8, value: 165, color: '#38bdf8', accent: '#facc15', shape: 'fish_flat', desc: '⛈️ STORM EXCLUSIVE: Crackles with static arcs when thunder rolls across the bay.' },
  { id: 'st_mackerel', name: 'Thunderhead Mackerel', category: 'Fish', rarity: 'Rare', zones: [2, 3], stormOnly: true, glowing: true, minW: 4.5, maxW: 12.5, value: 230, color: '#6366f1', accent: '#fef08a', shape: 'fish_slim', desc: '⛈️ STORM EXCLUSIVE: Lightning-fast pelagic hunter drawn to choppy squalls.' },
  { id: 'st_moray', name: 'Tempest Moray', category: 'Fish', rarity: 'Epic', zones: [2, 3, 4], stormOnly: true, glowing: true, minW: 12.0, maxW: 29.0, value: 480, color: '#7c3aed', accent: '#67e8f9', shape: 'fish_eel', desc: '⛈️ STORM EXCLUSIVE: Voltage-charged reef serpent that surfaces in torrential rain.' },
  { id: 'st_kraken', name: 'Voltaic Kraken', category: 'Fish', rarity: 'Legendary', zones: [3, 4], stormOnly: true, glowing: true, minW: 42.0, maxW: 105.0, value: 1550, color: '#1e1b4b', accent: '#facc15', shape: 'fish_angler', desc: '⛈️ STORM EXCLUSIVE: Mythic bio-electric titan awakened only by tempest lightning.' },

  // --- Content update: new species ---
  // Zone 1: Shallow Cove
  { id: 'f_herring', name: 'Harbor Herring', category: 'Fish', rarity: 'Common', zones: [1], minW: 0.3, maxW: 1.0, value: 10, color: '#94a3b8', accent: '#38bdf8', shape: 'fish_slim', desc: 'Silver schooling baitfish that boils the surface near the pilings at dawn.' },
  { id: 'f_seahorse', name: 'Dwarf Seahorse', category: 'Fish', rarity: 'Rare', zones: [1], minW: 0.1, maxW: 0.3, value: 58, color: '#fbbf24', accent: '#f97316', shape: 'fish_slim', desc: 'A tiny upright drifter that clings to seagrass with its curled tail.' },
  // Zone 2: Coastal Reef
  { id: 'f_clownfish', name: 'Reef Clownfish', category: 'Fish', rarity: 'Uncommon', zones: [2], minW: 0.2, maxW: 0.7, value: 44, color: '#f97316', accent: '#f8fafc', shape: 'fish_round', desc: 'Bold orange-and-white banded fish that shelters among stinging anemones.' },
  { id: 'f_angelfish', name: 'Emperor Angelfish', category: 'Fish', rarity: 'Rare', zones: [2], minW: 1.0, maxW: 2.8, value: 78, color: '#1d4ed8', accent: '#facc15', shape: 'fish_round', desc: 'Regal blue reef dweller striped in electric yellow.' },
  { id: 'st_thundereel', name: 'Thunder Eel', category: 'Fish', rarity: 'Epic', zones: [2, 3], stormOnly: true, minW: 4.0, maxW: 9.5, value: 215, color: '#475569', accent: '#fde047', shape: 'fish_eel', desc: '⛈️ STORM EXCLUSIVE: Crackles with static as it thrashes up through the squall.' },
  // Zone 3: Open Shelf
  { id: 'f_skipjack', name: 'Skipjack Tuna', category: 'Fish', rarity: 'Common', zones: [3], minW: 4.0, maxW: 9.0, value: 88, color: '#1e3a8a', accent: '#e2e8f0', shape: 'fish_tuna', desc: 'Fast striped tuna that herds baitfish in tight, roiling schools.' },
  { id: 'f_cobia', name: 'Open-Water Cobia', category: 'Fish', rarity: 'Uncommon', zones: [3], minW: 8.0, maxW: 20.0, value: 120, color: '#57534e', accent: '#e7e5e4', shape: 'fish_standard', desc: 'Powerful dark-backed brawler that follows rays and turtles.' },
  { id: 'fm_opah', name: 'Moonlit Opah', category: 'Fish', rarity: 'Epic', zones: [3], fullMoonOnly: true, glowing: true, minW: 25.0, maxW: 45.0, value: 335, color: '#f43f5e', accent: '#fde68a', shape: 'fish_round', desc: '🌕 FULL MOON EXCLUSIVE: A huge crimson disc spangled with silver moons.' },
  // Zone 4: Abyssal Trench
  { id: 'f_lanternfish', name: 'Trench Lanternfish', category: 'Fish', rarity: 'Common', zones: [4], minW: 0.3, maxW: 1.0, value: 60, color: '#0e7490', accent: '#22d3ee', shape: 'fish_slim', glowing: true, desc: 'Rows of tiny photophores make this fish a drifting constellation.' },
  { id: 'f_blobfish', name: 'Pale Blobfish', category: 'Fish', rarity: 'Uncommon', zones: [4], minW: 3.0, maxW: 8.0, value: 165, color: '#fda4af', accent: '#fb7185', shape: 'fish_round', desc: 'Looks far gloomier out of the crushing deep than it ever did in it.' },
  { id: 'f_ghostshark', name: 'Ghost Shark', category: 'Fish', rarity: 'Epic', zones: [4], minW: 20.0, maxW: 45.0, value: 525, color: '#cbd5e1', accent: '#94a3b8', shape: 'fish_tuna', desc: 'Pale cartilaginous wanderer with huge dark eyes and a whip-like tail.' },
  { id: 'fm_ribbonserpent', name: 'Moon Ribbon Serpent', category: 'Fish', rarity: 'Legendary', zones: [4], fullMoonOnly: true, glowing: true, minW: 80.0, maxW: 140.0, value: 1400, color: '#a78bfa', accent: '#fef08a', shape: 'fish_eel', desc: '🌕 FULL MOON EXCLUSIVE: A shimmering ribbon of living starlight coiled in the trench.' }
];
