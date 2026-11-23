/* World layout: collider layers, the pier, mooring and platform, harbour shops, cabin, island and town,
   benches, job lanterns and boat paints. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';

export let MOOR, PLATFORM, BOAT_TERMINAL, DOCK_PUMP;
/* v12.0.0: the town's plan lives in town-plan.js; re-exported here so the rest of the game imports it from one place */
export { ISLAND, townGround, townFlatten, TOWN, TOWN_BUILDINGS, STREETS, TREES, EXTRA_BENCHES, JOB_LANTERNS, doorOf, atDoor, faceYaw, placeName } from './town-plan.js';
import { ISLAND, townGround } from './town-plan.js';

/* One place for everything solid. Each collider: { kind: 'box' | 'circle', x, z, hx, hz | r, y0, y1, layers, name }.
   Layers: WALK (the angler on the pier), BOAT (hulls), DIVE (the diver, fish and spear). The models register their
   own colliders where they are built, and the walk, boat and dive code all read from here. */
export const COL = { WALK: 1, BOAT: 2, DIVE: 4 };
/* Pier layout (v4.5.0 widened the pier from 4.9 m to 6.9 m). The rails stand at x = +-PIER_HW, the angler walks up
   to +-PIER_WALK, the pilings are at +-PIER_PILE, and everything on the port side (stairs, mooring platform, moored
   boat) is shifted out by PIER_DX compared with the old 2.45 m half-width. */
export const PIER_HW = 3.45, PIER_DX = PIER_HW - 2.45, PIER_WALK = PIER_HW - 0.4, PIER_PILE = PIER_HW - 0.05;
export const PIER_TOOLBOX_X = 2.15, PIER_BUCKET_X = -2.15;
/* Lighthouse jetty (v4.7.0): a wooden jetty on the rocks south-west of the lighthouse, running west from the rock edge
   (root x/z, deck height y, length, half width). A boat berths along its south side, bow to the west. */
export const LH_J = { x: 41.6, y: 1.15, z: -147.3, len: 9.5, hw: 0.85, berthX: 32.5, yaw: Math.PI / 2, reach: 11 };
export function lhBerthPose() { return { x: LH_J.berthX, z: LH_J.z + LH_J.hw + 0.15 + shared.boatHalfWid, yaw: LH_J.yaw }; }
export const DAY_SECONDS = 420;
export const BW_HALF = 27;
/* Shops on the waterfront boardwalk (v4.6.0): backs on the sea rail, fronts facing south (+Z) like the Tackle Shop.
   Centre x/z, width w and depth d of the building; extra = room for the props beside it. */
export const SHORE_SHOPS = {
  boatyard: { x: -16.9, z: 1.2, w: 3.6, d: 2.05, extra: 1.1, s: 0.85, name: 'BOATYARD', icon: '⚓', title: '⚓ BOATYARD: BOATS, MODULES & FUEL', color: '#60a5fa' },
  fish:     { x: 11.4,  z: 1.15, w: 2.5, d: 1.95, extra: 1.0, s: 0.85, name: 'FISH MARKET', icon: '🐟', title: '🐟 FISH MARKET: SELL YOUR FISH', color: '#38bdf8' },
  dive:     { x: -11.9, z: 1.15, w: 3.4, d: 1.95, extra: 1.2, s: 0.85, name: 'DIVE SHOP', icon: '🤿', title: '🤿 DIVE SHOP: DIVE GEAR & SPEAR GUNS', color: '#2dd4bf' },
  aquashop: { x: 15.4, z: 1.15, w: 3.0, d: 1.95, extra: 0.6, s: 0.85, name: 'AQUARIUM SHOP', icon: '🐠', title: '🐠 AQUARIUM SHOP: TANKS, DECOR & CARE', color: '#22d3ee' }
};
export const shopFrontZ = sh => sh.z + sh.d / 2 + (sh.front || 0);
/* Harbour order (v4.9.0), left to right looking from the island: Boatyard, Dive Shop, Tackle Shop, Bounty board,
   [pier], Recycling, Fish Market, Aquarium Shop, Cabin (with the bottle gallery, aquarium and bunk inside; v5.5.0). */
export const RECYCLE = { x: 6.8, w: 4.5, d: 1.3, frontZ: 1.3 };
/* aquarium tanks (v5.0.0; w / h = glass size in metres since v5.5.0); defined early because the world build uses them */
export const AQUARIUM_TANKS = [
  { tier: 1, name: 'Starter Tank', maxW: 1.5, cap: 8, cost: 0, decor: 3, w: 1.8, h: 0.95 },
  { tier: 2, name: 'Reef Tank', maxW: 4, cap: 20, cost: 450, decor: 4, w: 2.4, h: 1.14 },
  { tier: 3, name: 'Display Tank', maxW: 9, cap: 40, cost: 1800, decor: 5, w: 3.3, h: 1.25 },
  { tier: 4, name: 'Grand Aquarium', maxW: 18, cap: 80, cost: 6000, decor: 6, w: 4.3, h: 1.35 }
];
export const CABIN = { x: 22.0, w: 8.4, d: 3.6, doorW: 2.0 };
export const benchGroundY = z => (z > ISLAND.zGate ? townGround(z) : 1.55);
export const JOB_KIND_IDS = ['mail', 'cleanup', 'lantern', 'forage', 'winch'];
export const BOAT_PAINTS = [['Signal red', 0xb91c1c], ['Sunset orange', 0xea580c], ['Sun yellow', 0xeab308], ['Kelp green', 0x15803d], ['Lagoon teal', 0x0f766e],
  ['Harbour blue', 0x1d4ed8], ['Navy', 0x1e293b], ['Royal purple', 0x6d28d9], ['Coral pink', 0xdb2777], ['Pearl white', 0xf1f5f9], ['Charcoal', 0x374151], ['Varnished oak', 0xb45309]];

export function init() {
  MOOR = { boardX: -5.2 - PIER_DX, boatX: -7.6 - PIER_DX, startX: -8.5 - PIER_DX, z: -5.6 };
  /* the low mooring platform (v4.6.0 made it longer toward the sea for the fuel pump): planks from x -3.85 to -6.05
     (shifted by PIER_DX) and from z -4.25 to -8.8; the angler walks x -5.5..-3.97 and z -8.35..-4.65 on it */
  PLATFORM = { zMin: -8.35, zMax: -4.65, xOut: -5.5 - PIER_DX, xIn: -3.97 - PIER_DX, edgeX: -3.9 - PIER_DX, zEnd: -8.8 };
  BOAT_TERMINAL = { x: -4.1 - PIER_DX, z: -8.55, useX: -4.3 - PIER_DX, useZ: -7.95 };
  DOCK_PUMP = { x: -5.72 - PIER_DX, z: -8.5, useX: -5.3 - PIER_DX, useZ: -7.9 };
}
