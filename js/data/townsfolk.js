/* Data: the townsfolk (NPCS), friendship perks and prices, rigs, buoys, limits and the rarity order. */
import { shared } from '../state.js';
import { TOWN, doorOf } from '../world/layout.js';

export let NPCS;

/* friendship (v6.4.0): points per townsperson in state.story.friend; at FRIEND_PERK points their perk is yours for good */
export const FRIEND_PERK = 8;
export const FRIEND_PERKS = { rook: 'Fuel costs 20% less', ines: 'Tells you where and when to find the Catch of the Day (on the noticeboard)', pip: 'Shouts when a feeding frenzy is near your boat',
  marta: 'Warns you before a storm and on full-moon evenings', lorenzo: 'Pantry goods cost 15% less', barnaby: 'Boat modules and paint cost 15% less',
  talia: 'Sea plants sell for 20% more', maren: 'Treasure maps at half price', salty: 'Dice wins pay 50% more' };
export const friendPts = id => { try { return (shared.state.story && shared.state.story.friend && shared.state.story.friend[id]) || 0; } catch (e) { return 0; } };
export const friendPerk = id => friendPts(id) >= FRIEND_PERK;
export const modCost = m => Math.round(m.cost * (friendPerk('barnaby') ? 0.85 : 1));
export const fuelPrice = () => (friendPerk('rook') ? 0.4 : 0.5);
export const RELEASE_MAX_SAVE = 10;
/* rigs (v6.5.0, Tackle Shop): one on the line at a time, with any bait; chum is used from a stopped boat */
export const RIGS = {
  popper: { id: 'popper', name: 'Surface Popper', icon: '🎯', cost: 220, color: 0xef4444, desc: 'Pops and splashes on the surface: bites come 25% faster and jumpers love it, but bottom-dwellers ignore it.' },
  jig:    { id: 'jig', name: 'Weighted Deep Jig', icon: '⚓', cost: 480, color: 0x94a3b8, desc: 'Sinks fast to the deep water: from the Open Shelf out, bites come 15% sooner and fish that dive pull 20% less on the line.' },
  chum:   { id: 'chum', name: 'Chum Bucket (pack of 3)', icon: '🪣', cost: 140, color: 0x92400e, pack: 3, desc: 'Tip one over the stern of a stopped boat and a feeding frenzy gathers behind you.' }
};
/* map buoys (v6.5.0): up to 3, dropped on the Map, floating in the world */
export const BUOY_KINDS = { wreck: { name: 'Wreck', icon: '⚓', hex: 0xf97316 }, boss: { name: 'Boss', icon: '🐉', hex: 0xef4444 }, drop: { name: 'Drop-off', icon: '⤵️', hex: 0x3b82f6 } };
export const BUOY_MAX = 3;
export const SMOKE_MAX = 25;
export const cleanNote = v => String(v == null ? '' : v).replace(/[\u0000-\u001f<>&"\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 140);
const RARITY_ORDER = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
export const rarityAtLeast = (r, min) => RARITY_ORDER.indexOf(r) >= RARITY_ORDER.indexOf(min);

export function init() {
  NPCS = {
    marta: { name: 'Old Marta', icon: '👵', role: 'Lighthouse keeper',
      look: { eyeShape: 'sleepy', mouth: 'smile', brows: 'worried', marks: 'mole', gender: 'female', skin: 1, hairStyle: 'bun', hairColor: 7, facial: 'none', glasses: 'round', top: 'slicker', topColor: 3, topAccent: 10, bottom: 'skirt', bottomColor: 9, shoes: 'boots', shoeColor: 10, hat: 'none', hatColor: 0, height: 's', build: 'slim' },
      home: doorOf(TOWN.hut, 1.3, 1.45), spots: [{ x: -29.6, z: 35.4 }, { x: -2.6, z: 17.2 }, { x: -25.4, z: 11.8 }],
      chat: ['The sea gives, and the sea takes. Mostly it takes bait.', 'Forty years I kept that light. It still blinks at me every night, like an old friend.', 'Storms come from the north-west here. Watch the sky, not the clock.', 'If you hear singing from the deep at night, keep your line taut.'] },
    rook: { name: 'Captain Rook', icon: '🧔', role: 'Boatyard owner',
      look: { eyeShape: 'almond', mouth: 'smirk', brows: 'bold', gender: 'male', skin: 2, hairStyle: 'short', hairColor: 7, facial: 'beard', glasses: 'none', top: 'sweater', topColor: 1, topAccent: 0, bottom: 'jeans', bottomColor: 10, shoes: 'boots', shoeColor: 10, hat: 'flapcap', hatColor: 1, height: 'l', build: 'broad' },
      home: doorOf(TOWN.rook, 1.3, 1.45), spots: [{ x: -14.4, z: 4.9 }, { x: 1.6, z: 8.6 }, { x: -9.4, z: 4.9 }],
      chat: ['A boat is only as good as the one steering it. Mine are better than that, mind you.', 'Fuel up before you head out. The tow fee hurts more than the fuel.', 'Bigger hulls ride the swell out in the Shelf. Small ones just bounce.', 'I once caught a marlin with a broom handle. Well. Nearly.'] },
    pip: { name: 'Pip', icon: '🧒', role: 'Young angler',
      look: { eyeShape: 'big', mouth: 'grin', marks: 'freckles', gender: 'male', skin: 0, hairStyle: 'wavy', hairColor: 4, facial: 'none', glasses: 'none', top: 'tee', topColor: 2, topAccent: 3, bottom: 'shorts', bottomColor: 1, shoes: 'sneakers', shoeColor: 2, hat: 'cap', hatColor: 3, height: 'xs', build: 'slim' },
      home: doorOf(TOWN.pip, 1.3, 1.45), spots: [{ x: 2.2, z: -5.0 }, { x: -2.4, z: 23.2 }, { x: 2.6, z: 4.9 }],
      chat: ['When I grow up I will catch a fish bigger than Captain Rook!', 'Did you know some fish change colour? Ines told me.', 'I saw a shadow under the pier this big! Well, maybe this big.', 'Mum says I can go out on a boat when I am taller than the bounty board.'] },
    ines: { name: 'Ines', icon: '👩‍🔬', role: 'Marine biologist',
      look: { eyeShape: 'sparkle', mouth: 'smile', brows: 'arched', gender: 'female', skin: 3, hairStyle: 'ponytail', hairColor: 0, facial: 'none', glasses: 'round', top: 'vest', topColor: 5, topAccent: 0, bottom: 'jeans', bottomColor: 1, shoes: 'sneakers', shoeColor: 0, hat: 'bucket', hatColor: 5, height: 'm', build: 'average' },
      home: doorOf(TOWN.ines, 1.3, 1.45), spots: [{ x: 13.5, z: 4.9 }, { x: 28.2, z: 21.4 }, { x: 17.4, z: 4.9 }],
      chat: ['Every species here has a story. Most of them involve eating something smaller.', 'Happy fish breed. Clean water, good food, a little coral.', 'The bottle messages are a record of the bay. I have been collecting copies.', 'Deep fish glow to talk to each other. Imagine what they are saying about us.'] },
    lorenzo: { name: 'Chef Lorenzo', icon: '👨‍🍳', role: 'Chef',
      look: { eyeShape: 'round', mouth: 'teeth', brows: 'arched', cheeks: 'peach', gender: 'male', skin: 1, hairStyle: 'short', hairColor: 0, facial: 'mustache', glasses: 'none', top: 'tee', topColor: 0, topAccent: 2, bottom: 'jeans', bottomColor: 9, shoes: 'sneakers', shoeColor: 10, hat: 'none', hatColor: 0, height: 'm', build: 'broad' },
      home: doorOf(TOWN.resto, 0.8, 1.45), spots: [doorOf(TOWN.resto, 1.0, -1.45), { x: 9.4, z: 4.9 }],
      chat: ['Your restaurant is a boat on dry land: everyone must row together.', 'Fresh fish, a little lemon, nothing else. The secret is: no secret.', 'You catch them, I cook them. A beautiful arrangement.', 'Bring me something rare one day and I will make you a dish to remember.'] },
    maren: { name: 'Maren', icon: '📮', role: 'Postmistress & cartographer',
      look: { eyeShape: 'cat', mouth: 'cat', gender: 'female', skin: 0, hairStyle: 'bun', hairColor: 3, facial: 'none', glasses: 'round', top: 'sweater', topColor: 5, topAccent: 0, bottom: 'skirt', bottomColor: 1, shoes: 'boots', shoeColor: 10, hat: 'none', hatColor: 0, height: 'm', build: 'slim' },
      home: doorOf(TOWN.post, 0.7, 1.45), spots: [doorOf(TOWN.post, 0.7, 1.45), { x: -1.6, z: 8.6 }, { x: 5.6, z: 16.4 }],
      chat: ['Every bottle that washes up has travelled further than most people ever will.', 'My charts say the Shelf drops away past six hundred metres. My knees say I will never check.', 'A parcel for the lighthouse jetty pays double. The sea is not in a hurry, but I am.', 'I draw the coastline from memory. It changes a little every winter.'] },
    barnaby: { name: 'Barnaby', icon: '🔨', role: 'Retired shipwright',
      look: { eyeShape: 'dot', mouth: 'flat', brows: 'bushy', gender: 'male', skin: 2, hairStyle: 'short', hairColor: 8, facial: 'mustache', glasses: 'round', top: 'vest', topColor: 9, topAccent: 1, bottom: 'jeans', bottomColor: 10, shoes: 'boots', shoeColor: 10, hat: 'flapcap', hatColor: 9, height: 'm', build: 'broad' },
      home: doorOf(TOWN.shop, 0.7, 1.45), spots: [doorOf(TOWN.shop, 0.7, 1.45), { x: -26.2, z: 4.0 }, { x: 23.4, z: 8.6 }],
      chat: ['Forty hulls I built. Every one of them still floats, except the ones that sank, which were not my fault.', 'A good coat of paint is half the seaworthiness. The other half is not hitting rocks.', 'Bring me driftwood and I will make you something worth mounting.', 'Rook buys his boats new. I tell him every boat was new once.'] },
    talia: { name: 'Talia', icon: '🌿', role: 'Botanist & tide-pool keeper',
      look: { eyeShape: 'wide', mouth: 'tongue', marks: 'freckles', gender: 'female', skin: 3, hairStyle: 'ponytail', hairColor: 2, facial: 'none', glasses: 'none', top: 'tee', topColor: 3, topAccent: 5, bottom: 'shorts', bottomColor: 3, shoes: 'sneakers', shoeColor: 3, hat: 'bucket', hatColor: 3, height: 's', build: 'slim' },
      home: doorOf(TOWN.talia, 1.3, 1.45), spots: [doorOf(TOWN.talia, 1.3, 1.45), { x: -25.6, z: 16.6 }, { x: 28.0, z: 23.6 }],
      chat: ['Seaweed is not a weed. It is a forest that has learned to swim.', 'Crabs walk sideways because forward was already taken.', 'Rosemary, thyme and a little sea fennel: fish cannot resist my lures.', 'The tide pool is a whole ocean in a bowl. Look closely.'] },
    salty: { name: 'Old Salty', icon: '🍺', role: 'Tavern keeper',
      look: { eyeShape: 'sleepy', mouth: 'smirk', brows: 'bushy', gender: 'male', skin: 1, hairStyle: 'short', hairColor: 7, facial: 'beard', glasses: 'none', top: 'slicker', topColor: 6, topAccent: 10, bottom: 'jeans', bottomColor: 9, shoes: 'boots', shoeColor: 10, hat: 'cap', hatColor: 6, height: 'l', build: 'broad' },
      home: doorOf(TOWN.tavern, 0.9, 1.45), spots: [doorOf(TOWN.tavern, 0.9, 1.45), { x: -8.6, z: 8.6 }, { x: 3.4, z: 17.4 }],
      chat: ['The tavern opens at four. The stories start at five. The truth, around midnight.', 'Big shadows like a storm, they say. Bigger ones like a full moon.', 'Ship, captain, crew, then cargo. Remember the order and you will win my money.', 'I have seen a fish as long as the pier. Well. Half the pier.'] }
  };
}
