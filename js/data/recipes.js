/* Names, the restaurant's pantry, recipes and buffs, the collider registry (Colliders) and the physics
   switch (PHYS). */
import { shared } from '../state.js';
import { CABIN } from '../world/layout.js';
import { Physics } from '../engine/physics.js';

export let RECIPE_BY_ID;

/* the player's name (character creation) names the restaurant: "Wayne's Restaurant" */
export const cleanName = v => String(v == null ? '' : v).replace(/[\u0000-\u001f<>&"\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16);
export const restoName = () => { const n = cleanName(shared.state.playerName); return n ? `${n}'s Restaurant` : "Fisherman's Restaurant"; };
export const PANTRY = { bread: { name: 'Bread', icon: '🍞', cost: 4 }, lemon: { name: 'Lemon', icon: '🍋', cost: 3 }, rice: { name: 'Rice', icon: '🍚', cost: 5 },
  potato: { name: 'Potato', icon: '🥔', cost: 3 }, spices: { name: 'Spices', icon: '🌶️', cost: 6 }, shellfish: { name: 'Shellfish', icon: '🦀', cost: 0, trap: true } };
/* fish: one requirement per fish needed ({ minW, rarityMin, cat }); at: dishes cooked before it unlocks */
export const RECIPES = [
  { id: 'grilled', name: 'Grilled Fish', icon: '🐟', fish: [{}], pantry: { lemon: 1 }, value: 28, at: 0, buff: 'bite' },
  { id: 'breakfast', name: "Fisherman's Breakfast", icon: '🍳', fish: [{}], pantry: { bread: 1, potato: 1 }, value: 34, at: 0, buff: 'line' },
  { id: 'salad', name: 'Seaweed Salad', icon: '🥗', fish: [{ cat: 'Flora' }], pantry: { lemon: 1 }, value: 22, at: 0, buff: 'breath' },
  { id: 'chips', name: 'Fish & Chips', icon: '🍟', fish: [{ minW: 1 }], pantry: { potato: 1, bread: 1 }, value: 45, at: 0, buff: 'line' },
  { id: 'soup', name: 'Fish Soup', icon: '🍲', fish: [{}, {}], pantry: { potato: 1 }, value: 52, at: 3, buff: 'breath' },
  { id: 'tacos', name: 'Fish Tacos', icon: '🌮', fish: [{}, {}], pantry: { bread: 1, spices: 1 }, value: 60, at: 3, buff: 'bite' },
  { id: 'cakes', name: 'Fishcakes', icon: '🧆', fish: [{}, {}], pantry: { potato: 1, bread: 1 }, value: 58, at: 3, buff: 'line' },
  { id: 'kebab', name: 'Spiced Kebab', icon: '🍢', fish: [{ minW: 2 }], pantry: { spices: 1, bread: 1 }, value: 70, at: 8, buff: 'bite' },
  { id: 'sushi', name: 'Sushi Platter', icon: '🍣', fish: [{ rarityMin: 'Uncommon', minW: 0.5 }], pantry: { rice: 1 }, value: 95, at: 8, buff: 'breath' },
  { id: 'bisque', name: 'Crab & Lobster Bisque', icon: '🦞', fish: [{}], pantry: { shellfish: 2, bread: 1 }, value: 140, at: 8, buff: 'line' },
  { id: 'pie', name: 'Fish Pie', icon: '🥧', fish: [{}, {}], pantry: { potato: 2, bread: 1 }, value: 80, at: 8, buff: 'line' },
  { id: 'baked', name: 'Baked Whole Fish', icon: '🍽️', fish: [{ minW: 3 }], pantry: { lemon: 1, spices: 1 }, value: 120, at: 15, buff: 'bite' },
  { id: 'paella', name: 'Seafood Paella', icon: '🥘', fish: [{ rarityMin: 'Uncommon' }, {}], pantry: { rice: 2, spices: 1 }, value: 150, at: 15, buff: 'line' },
  { id: 'ceviche', name: 'Ceviche', icon: '🍋', fish: [{ rarityMin: 'Rare' }], pantry: { lemon: 2 }, value: 190, at: 15, buff: 'bite' },
  { id: 'smoked', name: 'Smoked Fish Board', icon: '🪵', fish: [{ minW: 5 }], pantry: { bread: 2 }, value: 210, at: 25, buff: 'breath' },
  { id: 'platter', name: 'Seafood Platter', icon: '🦞', fish: [{ rarityMin: 'Rare' }, {}, {}], pantry: { lemon: 1, bread: 1 }, value: 320, at: 25, buff: 'line' },
  { id: 'steak', name: 'Steak of the Deep', icon: '🥩', fish: [{ minW: 10 }], pantry: { spices: 1, potato: 1 }, value: 360, at: 40, buff: 'line' },
  { id: 'feast', name: 'Golden Feast', icon: '👑', fish: [{ rarityMin: 'Epic' }], pantry: { rice: 1, spices: 1, lemon: 1 }, value: 650, at: 40, buff: 'bite' },
  { id: 'banquet', name: "Legend's Banquet", icon: '🌟', fish: [{ rarityMin: 'Legendary' }], pantry: { rice: 1, spices: 1, lemon: 1, bread: 1, potato: 1 }, value: 1800, at: 40, buff: 'breath' }
];
/* a meal gives charges, used up by actions (v6.2.0): casts for bites, fights for the line, a dive for breath */
export const BUFFS = { bite: { name: 'Faster bites', icon: '⚡', n: 8, unit: ['cast', 'casts'], what: '+30% bite speed' },
  line: { name: 'Steadier line', icon: '🧵', n: 5, unit: ['fight', 'fights'], what: '-15% line tension' },
  breath: { name: 'Longer breath', icon: '🫧', n: 1, unit: ['dive', 'dives'], what: '+20% air' } };
export const buffLabel = (t, n) => `${BUFFS[t].icon} ${BUFFS[t].name}: ${n} ${BUFFS[t].unit[n === 1 ? 0 : 1]}`;
export const ESPRESSO = { cost: 25, minutes: 720 };
export const RESTO_UP = [
  { id: 'tables', name: 'Extra waiters', icon: '🧑‍🍳', levels: [{ v: 2, cost: 0 }, { v: 4, cost: 400 }, { v: 6, cost: 1200 }], desc: 'More waiters serve more guests at each service.' },
  { id: 'stove', name: 'Pro stove', icon: '🔥', levels: [{ v: 0, cost: 0 }, { v: 1, cost: 800 }], desc: 'Wider sweet spots in the kitchen: better dishes come easier.' },
  { id: 'lights', name: 'Terrace lights', icon: '💡', levels: [{ v: 0, cost: 0 }, { v: 1, cost: 600 }], desc: 'A string of lights over the terrace: guests rate the place higher.' }
];
export const DISH_MAX = 30;

export const Colliders = {
  list: [],
  box(name, x, z, hx, hz, layers, y0 = -400, y1 = 400) { const c = { kind: 'box', name, x, z, hx, hz, y0, y1, layers }; this.list.push(c); Physics.add(c); return c; },
  circle(name, x, z, r, layers, y0 = -400, y1 = 400) { const c = { kind: 'circle', name, x, z, r, y0, y1, layers }; this.list.push(c); Physics.add(c); return c; },
  of(layer) { return this.list.filter(c => c.layers & layer); }
};

/* =========================================================================
   PHYSICS (v8.2.0): Rapier, mirrored from the Colliders registry
   The registry stays the one API: every WALK collider registered there also becomes a Rapier collider (a tall
   cuboid or cylinder, because walking ignores heights). The angler moves with Rapier's character controller (a
   capsule of radius BODY = the old collision margin), the townsfolk are moving cylinders, and the town's path
   finding asks Rapier instead of scanning every collider. Without Rapier (it failed to load) or with
   PHYS.walk = 'legacy' (secret menu, Debug) the built-in collision code runs exactly as before.
   ========================================================================= */
export const PHYS = { walk: 'rapier' };

export function init() {
  RECIPE_BY_ID = Object.fromEntries(RECIPES.map(r => [r.id, r]));
  CABIN.galleryX = CABIN.x - 2.75;
CABIN.aquaX = CABIN.x + 1.0;
}
