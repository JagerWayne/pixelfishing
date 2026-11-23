/* Harbour Town's plan (v12.0.0): the ground levels, every building (position, size, facing, door, owner, look),
   the streets, trees, benches and lanterns. Builders, colliders, door actions, the map, the townsfolk and the walking
   graph all read it: add or move a building here, never by hand elsewhere. North (-Z) is the sea. */
import { THREE } from '../engine/three.js';

/* the walkable town: open along the boardwalk (zGate .. zIn), x up to +-xMax, z up to zMax; the lower town is level,
   then a slope (rampZ0 .. rampZ1, up by `up`) climbs to the Upper Terrace */
export const ISLAND = { gateHW: 1.3, zGate: 5.8, zIn: 6.8, zMax: 44.4, xMax: 37.6, rampZ0: 27.0, rampZ1: 31.0, up: 1.8 };
/* the ground height of the town at depth z (1.5 in the lower town, 3.3 on the Upper Terrace) */
export const townGround = z => 1.5 + ISLAND.up * Math.min(1, Math.max(0, (z - ISLAND.rampZ0) / (ISLAND.rampZ1 - ISLAND.rampZ0)));
/* keeps the island's hills and sand under the town, blending back to the hills outside it */
export const townFlatten = (x, z, y) => {
  const m = 1 - (1 - THREE.MathUtils.smoothstep(Math.abs(x), 40.5, 48)) * (1 - THREE.MathUtils.smoothstep(z, ISLAND.zMax + 1.5, ISLAND.zMax + 24));
  return THREE.MathUtils.lerp(Math.min(y, townGround(z) - 0.08), y, m);
};

/* facings: which way the front door looks. Models are built with their front on +Z and turned by faceYaw. */
const FACE = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
export const faceYaw = f => ({ N: Math.PI, S: 0, E: Math.PI / 2, W: -Math.PI / 2 })[f || 'N'];
/* a building: w = facade width, d = depth; hx / hz = its half size on the world axes; doorX = door offset along the facade */
function bld(o) {
  const [fx, fz] = FACE[o.face || 'N'], side = fx !== 0, yaw = faceYaw(o.face);
  return Object.assign({ face: 'N', doorX: 0 }, o, { fx, fz, tx: Math.cos(yaw), tz: -Math.sin(yaw), hx: (side ? o.d : o.w) / 2, hz: (side ? o.w : o.d) / 2 });
}

/* look: wall (render), clad (timber tone), accent (door, trims, awning), roof type and colour, floors, extras */
export const TOWN = {
  // the Town Square, with the fountain in the middle and three market stalls round it (v12.1.0)
  square: { x: 0, z: 20, x0: -7.5, x1: 7.5, z0: 14.5, z1: 25.5 },
  well: { x: 0, z: 20, r: 1.7 },
  stalls: [{ x: 4.9, z: 23.6, face: 'N', kind: 'fish', canopy: 0x0284c7 }, { x: 4.9, z: 16.4, face: 'S', kind: 'fruit', canopy: 0x16a34a },
    { x: -3.0, z: 16.2, face: 'S', kind: 'crafts', canopy: 0xdb2777 }],
  board: bld({ x: 3.6, z: 10.7, w: 1.8, d: 0.36, face: 'N', name: 'Notice kiosk' }),
  // the square's two sides: the restaurant (west) and the Post Office (east) face each other
  resto: bld({ x: -11.6, z: 20, w: 6.2, d: 4.2, face: 'E', name: "Lorenzo's", floors: 1, roof: 'flat', wall: 0xf8f5ef, clad: 0xe2b98c, accent: 0xb91c1c, extras: ['glass', 'awning'], landmark: 'resto' }),
  post: bld({ x: 11.6, z: 20, w: 4.8, d: 3.6, face: 'W', name: 'Post Office', floors: 2, roof: 'mono', wall: 0xf8fafc, clad: 0xe8c79f, accent: 0x1d4ed8, landmark: 'post' }),
  // the waterfront: Talia's greenhouse (Garden Quarter, west) and Barnaby's boat shed (Artisan Quarter, east)
  talia: bld({ x: -20, z: 13.8, w: 4.6, d: 3.2, face: 'N', name: "Talia's greenhouse", floors: 1, roof: 'mono', wall: 0xf0fdf4, clad: 0xdcc39a, accent: 0x15803d, extras: ['glass', 'planters'], landmark: 'greenhouse' }),
  garden: { x: -27.6, z: 14.2, w: 4.0 },
  shop: bld({ x: 19.6, z: 13.8, w: 5.2, d: 3.8, face: 'N', name: "Barnaby's Workshop", doorX: -1.5, floors: 1, roof: 'mono', wall: 0xe7e5e4, clad: 0xd4ab80, accent: 0xd97706, extras: ['shedDoor'], landmark: 'boatshed' }),
  pool: { x: 31.0, z: 22.6, r: 2.3 },
  // your plot on the east waterfront (the new cabin arrives in v12.2.0)
  plot: { x: 31.0, z: 13.6, w: 8.6, d: 5.8 },
  // the Upper Terrace: the homes on Terrace Lane, the Sailors' Rest closing the top of Harbour Street, the lookout
  tavern: bld({ x: 0, z: 39.3, w: 7.4, d: 4.6, face: 'N', name: "Sailors' Rest", floors: 2, roof: 'gable', wall: 0xfafaf9, clad: 0xd9a46c, accent: 0x7c2d12, extras: ['deck', 'barrels'], landmark: 'tavern' }),
  rook: bld({ x: -11.6, z: 37.6, w: 3.9, d: 3.2, face: 'N', name: "Rook's house", owner: 'rook', floors: 2, roof: 'flat', wall: 0xf8fafc, clad: 0xcfae8a, accent: 0x1e3a8a, extras: ['solar'] }),
  hut: bld({ x: -21.6, z: 37.6, w: 3.3, d: 2.8, face: 'N', name: "Marta's house", owner: 'marta', floors: 1, roof: 'mono', wall: 0xfef9f2, clad: 0xe0b483, accent: 0x0f766e, extras: ['planters'] }),
  pip: bld({ x: 11.6, z: 37.6, w: 3.6, d: 3.0, face: 'N', name: "Pip's home", owner: 'pip', floors: 2, roof: 'mono', wall: 0xfffbeb, clad: 0xf0c27a, accent: 0xdc2626, extras: ['planters'] }),
  ines: bld({ x: 21.6, z: 37.6, w: 3.8, d: 3.0, face: 'N', name: "Ines' house", owner: 'ines', floors: 1, roof: 'flat', wall: 0xf0f9ff, clad: 0xd6c2a8, accent: 0x0e7490, extras: ['solar', 'planters'] }),
  lookout: { x: -31.6, z: 37.4, r: 1.9 }, lookoutBench: { x: -31.6, z: 38.35 }, scope: { x: -31.6, z: 36.05 },
  winch: { x: -22.8, z: 1.4 }   // on the boardwalk beside the Boatyard (the dockhand job)
};
/* the buildings with walls and a front door, in build order */
export const TOWN_BUILDINGS = ['resto', 'post', 'talia', 'shop', 'tavern', 'rook', 'hut', 'pip', 'ines'];

/* the point in front of a building's door, `out` metres from the facade (0 = on the facade), `lat` to the side */
export function doorOf(b, out = 0.75, lat = 0) {
  return { x: b.x + b.fx * (b.d / 2 + out) + b.tx * (b.doorX + lat), z: b.z + b.fz * (b.d / 2 + out) + b.tz * (b.doorX + lat) };
}
/* is (px, pz) on the door mat area: in front of the door, up to `depth` out and `half` to either side */
export function atDoor(b, px, pz, depth = 1.4, half = 1.1) {
  const o = doorOf(b, 0), rx = px - o.x, rz = pz - o.z;
  const fwd = rx * b.fx + rz * b.fz, lat = rx * b.tx + rz * b.tz;
  return fwd > 0.05 && fwd < depth && Math.abs(lat) < half;
}

/* streets: centre lines with widths; stone for the main streets, brick for the lanes */
export const STREETS = [
  { id: 'promenade', kind: 'stone', w: 2.8, pts: [[-36.5, 8.3], [36.5, 8.3]] },
  { id: 'harbour', kind: 'stone', w: 4.0, pts: [[0, 7.0], [0, 14.5]] },
  { id: 'harbourUp', kind: 'stone', w: 4.0, pts: [[0, 25.5], [0, 36.6]] },
  { id: 'garden', kind: 'brick', w: 3.0, pts: [[-7.5, 20], [-33.8, 20]] },
  { id: 'hill', kind: 'brick', w: 2.4, pts: [[-33.8, 20], [-33.6, 27.5], [-32.6, 33.4]] },
  { id: 'market', kind: 'brick', w: 3.0, pts: [[7.5, 20], [33.8, 20]] },
  { id: 'terrace', kind: 'brick', w: 2.8, pts: [[-34.4, 33.4], [34.4, 33.4]] },
  { id: 'gardenLink', kind: 'brick', w: 2.0, pts: [[-20, 9.6], [-20, 11.9]] },
  { id: 'shopLink', kind: 'brick', w: 2.4, pts: [[19.6, 9.6], [19.6, 11.6]] }
];
/* planned planting: palms along the promenade, round-crowned trees along the streets and in the gardens */
export const TREES = [
  ['palm', -33.5, 10.6], ['palm', -14.2, 10.6], ['palm', 13.6, 10.6], ['palm', 25.2, 10.8],
  ['tree', -3.4, 12.2], ['tree', 3.4, 13.4], ['tree', -10.2, 16.2], ['tree', 9.8, 16.0],
  ['tree', -3.6, 28.6], ['tree', 3.6, 28.6], ['tree', -16.6, 23.4], ['tree', 16.6, 23.6],
  ['tree', -27.6, 23.6], ['tree', 24.6, 25.8], ['tree', -16.4, 37.4], ['tree', 6.0, 38.6], ['tree', 16.6, 37.8],
  ['tree', 27.4, 37.6], ['tree', -26.8, 41.4], ['palm', 34.4, 31.6], ['palm', -36.0, 30.6]
];
/* benches (all face north, toward the sea): six on the boardwalk, the rest along the promenade, in the square and on the terrace */
export const EXTRA_BENCHES = [[-12, 5.25], [-17.5, 5.25], [-22.5, 5.25], [6.8, 5.25], [11.5, 5.25], [21, 5.25],
  [-8.6, 10.4], [8.8, 10.4], [-29.4, 10.4], [-4.6, 24.6], [-5.4, 15.6], [27.6, 35.0], [-6.2, 35.0]].map(([x, z]) => ({ x, z }));
/* the street lanterns the night watch lights (job), along the lanes and the terrace */
export const JOB_LANTERNS = [{ x: -14.6, z: 21.8 }, { x: -26.4, z: 21.8 }, { x: 14.6, z: 21.8 }, { x: 25.0, z: 21.8 }, { x: -6.0, z: 31.9 }, { x: 6.2, z: 31.9 }];
/* v12.1.0 street furniture (merged statically; solid things get a collider): planters, flower beds (flat), bins beside
   the town benches, bike racks, the gate bollards, the wayfinding signpost on the square and the bunting over Harbour Street */
export const STREET_PROPS = {
  planters: [[-2.7, 10.2], [-2.7, 13.6], [2.7, 11.8], [-7.0, 9.9], [7.2, 9.9], [-3.5, 26.4], [3.5, 26.4]],
  beds: [[-12.0, 10.6, 3.2], [12.0, 10.6, 3.2], [-24.8, 10.6, 2.6], [17.0, 18.0, 2.4], [-17.0, 18.0, 2.4], [-14.0, 31.9, 3.0], [14.0, 31.9, 3.0]],
  bikeRacks: [[6.2, 9.6], [-8.4, 32.0]],
  bollards: [[-2.2, 7.2], [2.2, 7.2], [-2.9, 7.2], [2.9, 7.2]],
  signpost: { x: 3.6, z: 15.0 },
  bunting: [[-2.4, 14.6], [2.4, 14.6], [-2.4, 25.4], [2.4, 25.4]]
};
/* which part of town a point is in (for "Rook is out, usually at ...") */
export function placeName(x, z) {
  if (z < 0.45) return 'the pier';
  if (z < ISLAND.zGate) return 'the boardwalk';
  const S = TOWN.square;
  if (x > S.x0 && x < S.x1 && z > S.z0 && z < S.z1) return 'the Town Square';
  if (z > ISLAND.rampZ1) return x < -26 ? 'Lighthouse Hill' : 'the Upper Terrace';
  if (z < 11) return 'the promenade';
  return x < 0 ? 'the Garden Quarter' : 'the Artisan Quarter';
}
