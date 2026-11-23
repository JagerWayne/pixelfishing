/* The harbour map: places, view, zoom and the map sheet. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { CABIN, EXTRA_BENCHES, PLATFORM, RECYCLE, SHORE_SHOPS, TOWN, doorOf } from '../world/layout.js';
import { restoName } from '../data/recipes.js';
import { renderer, scene } from '../render/renderer.js';
import { world } from '../render/lights.js';
import { boatPos } from '../sim/runtime.js';
import { restoOpen } from '../town/restaurant.js';
import { scopeMarks } from '../town/telescope-dice.js';
import { buoyPlaces } from '../fishing/rigs.js';
import { drawMap, mapLegend } from './map-draw.js';

/* ---- the harbour map ---- */
const B = (b, icon, desc, col) => ({ icon, name: b.name, desc, x: b.x, z: b.z, w: 2 * b.hx, d: 2 * b.hz, col, door: doorOf(b) });
export const MAP_PLACES = () => [
  { icon: '⚓', name: 'Boatyard', desc: 'Buy boats, boat modules and fuel.', x: SHORE_SHOPS.boatyard.x, z: SHORE_SHOPS.boatyard.z, w: SHORE_SHOPS.boatyard.w, d: SHORE_SHOPS.boatyard.d, col: SHORE_SHOPS.boatyard.color },
  { icon: '🤿', name: 'Dive Shop', desc: 'Dive gear and spear guns for fishing underwater.', x: SHORE_SHOPS.dive.x, z: SHORE_SHOPS.dive.z, w: SHORE_SHOPS.dive.w, d: SHORE_SHOPS.dive.d, col: SHORE_SHOPS.dive.color },
  { icon: '🎣', name: 'Tackle Shop', desc: 'Rods, bait and bigger buckets.', x: -7.6, z: 0.9, w: 2.5, d: 1.8, col: '#ef4444' },
  { icon: '📋', name: 'Bounty Board', desc: 'Contracts that pay a reward for special catches.', x: -4.2, z: 0.6, w: 1.6, d: 0.8, col: '#10b981' },
  { icon: '🪑', name: 'Pier end', desc: 'Cast your line from here. Your catch bucket and bait box are close by.', x: 0, z: -10.3, w: 2.2, d: 0.8, col: '#a16207' },
  { icon: '⛵', name: 'Mooring platform', desc: 'Board your boat, choose a boat at the terminal and refuel at the dock pump.', x: (PLATFORM.xOut + PLATFORM.xIn) / 2, z: (PLATFORM.zMin + PLATFORM.zMax) / 2, w: PLATFORM.xIn - PLATFORM.xOut, d: PLATFORM.zMax - PLATFORM.zMin, col: '#64748b' },
  { icon: '♻️', name: 'Recycling', desc: 'Sell the junk and seaweed you reel in.', x: RECYCLE.x, z: RECYCLE.d / 2, w: RECYCLE.w, d: RECYCLE.d, col: '#22c55e' },
  { icon: '🐟', name: 'Fish Market', desc: 'Sell your fish.', x: SHORE_SHOPS.fish.x, z: SHORE_SHOPS.fish.z, w: SHORE_SHOPS.fish.w, d: SHORE_SHOPS.fish.d, col: SHORE_SHOPS.fish.color },
  { icon: '🐠', name: 'Aquarium Shop', desc: 'Tanks, decorations, fish food and cleaning kits.', x: SHORE_SHOPS.aquashop.x, z: SHORE_SHOPS.aquashop.z, w: SHORE_SHOPS.aquashop.w, d: SHORE_SHOPS.aquashop.d, col: SHORE_SHOPS.aquashop.color },
  { icon: '🏠', name: 'Cabin', desc: 'Your home, with the bottle gallery, your aquarium and the bunk with the Trophy Wall.', x: CABIN.x, z: CABIN.d / 2, w: CABIN.w, d: CABIN.d, col: '#b08a5a' },
  { icon: '📖', name: 'Benches', desc: 'Sit down to rest and read your skill books (press SIT, or stand still in front of one).', x: -4.6, z: 5.2, w: 1.4, d: 0.5, col: '#78350f', also: [[4.6, 5.2], ...EXTRA_BENCHES.map(b => [b.x, b.z])] },
  // v12.0.0: the town from its plan (TOWN); buildings carry their door so a tap leads there
  { icon: '🏘️', name: 'Town Square', desc: 'The heart of Harbour Town: the fountain, the market stall, the restaurant and the Post Office around it.', x: TOWN.square.x, z: TOWN.square.z, w: TOWN.square.x1 - TOWN.square.x0, d: TOWN.square.z1 - TOWN.square.z0, col: '#d6d3cd' },
  B(TOWN.hut, '🗼', 'Home of Marta, the old lighthouse keeper, near the path to Lighthouse Hill. Knock to see if she is in.', '#8b5e34'),
  B(TOWN.rook, '⚓', 'Captain Rook lives here when he is not at the Boatyard. Knock to see if he is in.', '#f8fafc'),
  B(TOWN.pip, '🧒', 'Pip lives here with the family. Knock to see if Pip is in.', '#fef3c7'),
  B(TOWN.ines, '🔬', 'Ines, the marine biologist, studies the fish of the bay here. Knock to see if she is in.', '#e0f2fe'),
  Object.assign(B(TOWN.resto, '🍝', restoOpen() ? 'Your restaurant on the Town Square: cook your catch with Chef Lorenzo and sell the dishes at lunch and dinner.' : 'Your restaurant on the Town Square, waiting for a chef. Talk to Lorenzo.', '#dc2626'), { name: restoName() }),
  B(TOWN.board, '📌', 'The notice kiosk at the harbour gate: three new town jobs every morning, for cash, XP and reputation.', '#a16207'),
  { icon: '🧺', name: 'Market stall', desc: 'A fish stall on the Town Square.', x: TOWN.market.x, z: TOWN.market.z, w: 2, d: 1, col: '#0e7490' },
  B(TOWN.post, '📮', "Maren's counter on the Town Square: town jobs, treasure maps and stamps for bottle messages.", '#fef9c3'),
  B(TOWN.shop, '🔨', 'The boat shed on the waterfront: paint the hull, trim and pennant of every boat you own.', '#d6b48a'),
  { icon: '🦀', name: 'Tide pool', desc: 'At the end of Market Lane: bait up to 3 crab traps and haul them up the next day.', x: TOWN.pool.x, z: TOWN.pool.z, w: 5, d: 5, col: '#1d7f9f' },
  B(TOWN.tavern, '🍺', 'The tavern at the top of Harbour Street: dice with the townsfolk from 16:00.', '#a16207'),
  B(TOWN.talia, '🌿', 'Herbal lures from the garden herbs; Talia also buys sea plants.', '#dcfce7'),
  { icon: '🌱', name: 'Herb garden', desc: "Talia's herb beds in the Garden Quarter.", x: TOWN.garden.x, z: TOWN.garden.z, w: TOWN.garden.w, d: 3, col: '#16a34a' },
  { icon: '🔭', name: 'Lookout Pavilion', desc: 'On Lighthouse Hill: a telescope over the bay (spots frenzies, treasure and boss shadows) and a bench for reading.', x: TOWN.lookout.x, z: TOWN.lookout.z, w: 4.2, d: 4.2, col: '#0f766e' },
  { icon: '🏡', name: 'Your plot', desc: 'Your plot on the east waterfront, where your new cabin will stand.', x: TOWN.plot.x, z: TOWN.plot.z, w: TOWN.plot.w, d: TOWN.plot.d, col: '#4f9a3c' },
  { icon: '🏗️', name: 'Winch', desc: "Rook's dock winch beside the Boatyard: the dockhand job is done here.", x: TOWN.winch.x, z: TOWN.winch.z, w: 1, d: 1, col: '#f59e0b' },
  { icon: '🗼', name: 'Lighthouse', desc: 'Out at sea in the Coastal Reef, with a small jetty you can dock at and fish from.', x: 52, z: -150, far: true },
  ...scopeMarks(),
  ...buoyPlaces()
];
export function mapCompass(dx, dz) {
  const a = (Math.atan2(dx, -dz) * 180 / Math.PI + 360) % 360;
  return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(a / 45) % 8];
}
/* The map is the real world seen from straight above: on opening, the paused scene is rendered once through an
   orthographic camera into two pictures (the harbour in detail, the sea out to the lighthouse wide), then the map
   pans (drag) and zooms (pinch, wheel, buttons) over those pictures with the overlays drawn on top. */
const MAP_SNAPS = [
  { x0: -90, x1: 90, z0: -175, z1: 48, ppm: 5.5 },     // wide: the sea out to the lighthouse
  { x0: -42, x1: 42, z0: -14, z1: 47, ppm: 24 }        // detail: the harbour and Harbour Town (v12.0.0: the deeper town)
];
export const mapView = { cx: 0, cz: 0, s: 14, snaps: null, ptrs: new Map(), raf: 0 };
function mapSnapshot() {
  const maxT = Math.min(4096, renderer.capabilities.maxTextureSize || 2048);
  const keep = { fog: scene.fog, bg: scene.background, sky: world.skyGroup.visible, isl: world.islandScenery ? world.islandScenery.visible : null, rt: renderer.getRenderTarget() };
  scene.fog = null; scene.background = new THREE.Color(0x0b4a6f); world.skyGroup.visible = false;
  if (world.islandScenery) world.islandScenery.visible = true;
  const out = MAP_SNAPS.map(sn => {
    const ww = sn.x1 - sn.x0, hh = sn.z1 - sn.z0, k = Math.min(1, maxT / (Math.max(ww, hh) * sn.ppm));
    const W = Math.round(ww * sn.ppm * k), H = Math.round(hh * sn.ppm * k);
    const cam = new THREE.OrthographicCamera(-ww / 2, ww / 2, hh / 2, -hh / 2, 1, 400);
    cam.position.set((sn.x0 + sn.x1) / 2, 200, (sn.z0 + sn.z1) / 2); cam.up.set(0, 0, -1); cam.lookAt(cam.position.x, 0, cam.position.z);
    const rt = new THREE.WebGLRenderTarget(W, H, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
    renderer.setRenderTarget(rt); renderer.render(scene, cam);
    const px = new Uint8Array(W * H * 4); renderer.readRenderTargetPixels(rt, 0, 0, W, H, px); rt.dispose();
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d'), img = g.createImageData(W, H);
    for (let y = 0; y < H; y++) img.data.set(px.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4);   // GL rows run bottom-up
    g.putImageData(img, 0, 0);
    return { ...sn, cv };
  });
  renderer.setRenderTarget(keep.rt);
  scene.fog = keep.fog; scene.background = keep.bg; world.skyGroup.visible = keep.sky;
  if (world.islandScenery && keep.isl !== null) world.islandScenery.visible = keep.isl;
  return out;
}
export const mapYou = () => ({ x: shared.onBoat ? boatPos.x : shared.playerX, z: shared.onBoat ? boatPos.z : shared.playerZ, yaw: shared.onBoat ? shared.boatYaw : world.anglerGroup.rotation.y });
export function mapSize() { const cv = document.getElementById('map-canvas'); return { cv, w: Math.max(200, cv.clientWidth || 360), h: Math.max(200, cv.clientHeight || 360) }; }
export function mapClamp() {
  const { w, h } = mapSize(), W = MAP_SNAPS[0];
  const sMin = Math.min(w / (W.x1 - W.x0), h / (W.z1 - W.z0));
  mapView.s = THREE.MathUtils.clamp(mapView.s, sMin, 60);
  const hx = w / 2 / mapView.s, hz = h / 2 / mapView.s;
  mapView.cx = (W.x1 - W.x0) / 2 <= hx ? (W.x0 + W.x1) / 2 : THREE.MathUtils.clamp(mapView.cx, W.x0 + hx, W.x1 - hx);
  mapView.cz = (W.z1 - W.z0) / 2 <= hz ? (W.z0 + W.z1) / 2 : THREE.MathUtils.clamp(mapView.cz, W.z0 + hz, W.z1 - hz);
}
export function mapRedraw() { if (mapView.raf) return; mapView.raf = requestAnimationFrame(() => { mapView.raf = 0; drawMap(); }); }
export function mapZoomAt(sx, sy, f) {   // zoom by f keeping the world point under the screen point (sx, sy) in place
  const { w, h } = mapSize(), wx = mapView.cx + (sx - w / 2) / mapView.s, wz = mapView.cz + (sy - h / 2) / mapView.s;
  mapView.s *= f; mapClamp();
  mapView.cx = wx - (sx - w / 2) / mapView.s; mapView.cz = wz - (sy - h / 2) / mapView.s; mapClamp(); mapRedraw();
}
export function mapCentre(x, z) { mapView.cx = x; mapView.cz = z; mapClamp(); mapRedraw(); }
export function openMapModal() {
  document.getElementById('modal-map').classList.add('open');
  requestAnimationFrame(() => {
    try { mapView.snaps = mapSnapshot(); } catch (e) { mapView.snaps = null; }
    const me = mapYou(); mapView.s = 14; mapCentre(me.x, me.z); drawMap();
    mapLegend();
  });
}
