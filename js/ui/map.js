/* The harbour map: places, view, zoom and the map sheet. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { CABIN, EXTRA_BENCHES, ISLAND, PLATFORM, RECYCLE, SHORE_SHOPS, TOWN } from '../world/layout.js';
import { restoName } from '../data/recipes.js';
import { renderer, scene } from '../render/renderer.js';
import { world } from '../render/lights.js';
import { boatPos } from '../sim/runtime.js';
import { restoOpen } from '../town/restaurant.js';
import { scopeMarks } from '../town/telescope-dice.js';
import { buoyPlaces } from '../fishing/rigs.js';
import { drawMap, mapLegend } from './map-draw.js';

/* ---- the harbour map ---- */
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
  { icon: '🏘️', name: 'Harbour Town', desc: 'The village square behind the gate, with the well and the noticeboard.', x: ISLAND.plaza.x, z: ISLAND.plaza.z, w: 4.4, d: 4.4, col: '#a8a29e' },
  { icon: '🏮', name: "Marta's hut", desc: 'Home of Marta, the old lighthouse keeper.', x: TOWN.hut.x, z: TOWN.hut.z, w: TOWN.hut.w, d: TOWN.hut.d, col: '#8b5e34' },
  { icon: '⚓', name: "Rook's house", desc: 'Captain Rook lives here when he is not at the Boatyard.', x: TOWN.rook.x, z: TOWN.rook.z, w: TOWN.rook.w, d: TOWN.rook.d, col: '#f8fafc' },
  { icon: '🧒', name: "Pip's home", desc: 'Pip lives here with the family.', x: TOWN.pip.x, z: TOWN.pip.z, w: TOWN.pip.w, d: TOWN.pip.d, col: '#fef3c7' },
  { icon: '🔬', name: "Ines' cottage", desc: 'Ines, the marine biologist, studies the fish of the bay here.', x: TOWN.ines.x, z: TOWN.ines.z, w: TOWN.ines.w, d: TOWN.ines.d, col: '#e0f2fe' },
  { icon: '🍝', name: restoName(), desc: restoOpen() ? 'Your seaside restaurant: cook your catch with Chef Lorenzo and sell the dishes at lunch and dinner.' : 'Your seaside restaurant, waiting for a chef. Talk to Lorenzo.', x: TOWN.resto.x, z: TOWN.resto.z, w: TOWN.resto.w, d: TOWN.resto.d, col: '#dc2626' },
  { icon: '📌', name: 'Noticeboard', desc: 'Town jobs: three new ones every morning, for cash, XP and town reputation.', x: TOWN.board.x, z: TOWN.board.z, w: 1.6, d: 0.4, col: '#a16207' },
  { icon: '🧺', name: 'Market Square', desc: 'The east square, with a fish stall, between the restaurant and the Artisan Quarter.', x: TOWN.market.x, z: TOWN.market.z, w: 4, d: 4, col: '#b8b0a2' },
  { icon: '📮', name: 'Post Office', desc: "Maren's counter: town jobs, treasure maps and stamps for bottle messages.", x: TOWN.post.x, z: TOWN.post.z, w: TOWN.post.w, d: TOWN.post.d, col: '#fef9c3' },
  { icon: '🔨', name: "Barnaby's Workshop", desc: 'Paint the hull, trim and pennant of every boat you own.', x: TOWN.shop.x, z: TOWN.shop.z, w: TOWN.shop.w, d: TOWN.shop.d, col: '#d6b48a' },
  { icon: '🦀', name: 'Tide pool', desc: 'Bait up to 3 crab traps and haul them up the next day.', x: TOWN.pool.x, z: TOWN.pool.z, w: 5, d: 5, col: '#1d7f9f' },
  { icon: '🍺', name: "Sailors' Rest", desc: 'The tavern on the upper terrace: dice with the townsfolk from 16:00.', x: TOWN.tavern.x, z: TOWN.tavern.z, w: TOWN.tavern.w, d: TOWN.tavern.d, col: '#a16207' },
  { icon: '🌿', name: "Talia's greenhouse", desc: 'Herbal lures from hillside herbs; Talia also buys sea plants.', x: TOWN.talia.x, z: TOWN.talia.z, w: TOWN.talia.w, d: TOWN.talia.d, col: '#dcfce7' },
  { icon: '🌱', name: 'Herb garden', desc: "Talia's herb beds on Lighthouse Hill.", x: TOWN.garden.x, z: TOWN.garden.z, w: TOWN.garden.w, d: 3, col: '#16a34a' },
  { icon: '🔭', name: 'Lookout Pavilion', desc: 'A telescope over the bay (spots frenzies, treasure and boss shadows) and a bench for reading.', x: TOWN.lookout.x, z: TOWN.lookout.z, w: 4.2, d: 4.2, col: '#0f766e' },
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
  { x0: -90, x1: 90, z0: -175, z1: 35, ppm: 5.5 },     // wide: the sea out to the lighthouse
  { x0: -42, x1: 42, z0: -14, z1: 26, ppm: 24 }        // detail: the harbour and Harbour Town (v6.3.0: wider town)
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
