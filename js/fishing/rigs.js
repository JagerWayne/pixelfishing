/* Rigs and chum, map buoys and the town projects. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { MOOR, lhBerthPose } from '../world/layout.js';
import { BUOY_KINDS, BUOY_MAX, SMOKE_MAX } from '../data/townsfolk.js';
import { scene } from '../render/renderer.js';
import { vfx } from '../render/previews.js';
import { boatPos } from '../sim/runtime.js';
import { dockLighthouse } from '../boat/stations.js';
import { dayOutlook } from '../sim/controls-state.js';
import { MOON_PHASES } from './bounties.js';
import { getCurrentZone, saveGame } from '../save/save-game.js';
import { showToast } from '../ui/toasts.js';
import { handleBoardOrDockToggle } from '../boat/hull.js';
import { town } from '../town/town-state.js';
import { townClose, townPay, townRefresh } from '../town/town-nav.js';
import { shopMoney } from '../shop/shop-kinds.js';
import { dive } from '../dive/dive-state.js';
import { fightStyleFor } from './fight.js';

let PROJECTS;

/* ---- rigs (v6.5.0) ---- */
export const rigState = () => shared.state.rig || (shared.state.rig = { owned: [], eq: null, chum: 0 });
export const rigBiteMult = () => { const e = rigState().eq; return e === 'popper' ? 0.8 : e === 'jig' && getCurrentZone().id >= 3 ? 0.85 : 1; };
export function rigWeight(item) {
  if (rigState().eq !== 'popper' || item.category !== 'Fish') return 1;
  const st = fightStyleFor({ item });
  return st === 'jumper' ? 2.5 : (item.shape === 'fish_flat' || item.shape === 'fish_angler') ? 0.05 : 1;
}
const chumReady = () => shared.onBoat && !dive.active && shared.mode === 'BOAT_DRIVING' && Math.abs(shared.boatVel) < 0.6 && rigState().chum > 0 && shared.state.boatTier > 0;
export function useChum() {
  if (!chumReady()) { if (shared.onBoat && rigState().chum > 0) showToast('🪣 Stop the boat first.'); return; }
  const rg = rigState(), f = vfx.getNearestFrenzy(boatPos); if (!f) return;
  rg.chum--;
  const sp = f.spot, d = shared.boatHalfLen + 5;
  sp.x = boatPos.x + Math.sin(shared.boatYaw) * d; sp.z = Math.min(-20, boatPos.z + Math.cos(shared.boatYaw) * d);
  sp.ttl = 75; sp.chum = true; sp.spotted = false; sp.pipSaid = true; sp.mesh.position.set(sp.x, 0.08, sp.z);
  sfx.playSplash && sfx.playSplash(); vfx.spawnSplash(new THREE.Vector3(sp.x, 0.1, sp.z), 24, 0xfca5a5, 3);
  saveGame(); showToast(`🪣 Chum over the stern: a feeding frenzy gathers behind the boat! (${rg.chum} left)`);
}
export function chumTick() { const v = chumReady() ? '1' : '0'; if (document.body.dataset.chum !== v) document.body.dataset.chum = v; }

/* ---- map buoys (v6.5.0): dropped on the Map, floating at sea, listed with distance and bearing ---- */
const buoyMeshes = [];
function syncBuoys() {
  buoyMeshes.forEach(m => scene.remove(m)); buoyMeshes.length = 0;
  (shared.state.buoys || []).forEach(b => {
    const K = BUOY_KINDS[b.k], g = new THREE.Group(), M = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, flatShading: true });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 0.6, 10), M(K.hex)); body.position.y = 0.2; g.add(body);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.1, 10), M(0xf8fafc)); band.position.y = 0.32; g.add(band);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 6), M(0x334155)); pole.position.y = 1.5; g.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.42), new THREE.MeshBasicMaterial({ color: K.hex, side: THREE.DoubleSide })); flag.position.set(0.36, 2.35, 0); g.add(flag);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: K.hex })); lamp.position.y = 2.65; g.add(lamp);
    g.position.set(b.x, 0, b.z); g.userData.ph = b.x * 0.3; scene.add(g); buoyMeshes.push(g);
  });
}
export function updateBuoys() {
  if (buoyMeshes.length === 0 && (shared.state.buoys || []).length) syncBuoys();
  const under = !!dive.active;
  buoyMeshes.forEach(g => { g.visible = !under; g.position.y = Math.sin(shared.elapsed * 1.3 + g.userData.ph) * 0.08; g.rotation.z = Math.sin(shared.elapsed * 0.9 + g.userData.ph) * 0.05; });
}
export const buoyPlaces = () => (shared.state.buoys || []).map(b => ({ icon: BUOY_KINDS[b.k].icon, name: `${BUOY_KINDS[b.k].name} buoy`, desc: 'Your own marker, dropped on the Map.', x: b.x, z: b.z, far: true }));
export function dropBuoy(k, x, z) {
  if (!shared.state.buoys) shared.state.buoys = [];
  if (shared.state.buoys.length >= BUOY_MAX) { showToast(`📍 You have ${BUOY_MAX} buoys already: remove one first.`); return false; }
  if (z > -4) { showToast('📍 Buoys go on the water.'); return false; }
  shared.state.buoys.push({ k, x: +x.toFixed(1), z: +z.toFixed(1) }); syncBuoys(); saveGame(); sfx.playTick();
  showToast(`📍 ${BUOY_KINDS[k].name} buoy dropped.`); return true;
}
export function removeBuoy(i) { shared.state.buoys.splice(i, 1); syncBuoys(); saveGame(); }
export const projOn = id => !!(shared.state.town && shared.state.town.proj && shared.state.town.proj[id]);
export const smokeFits = c => projOn('smoke') && c && c.item && c.item.category === 'Fish' && !c.bottleMessage && town().smoke.kg + c.weight <= SMOKE_MAX + 1e-6;
export function forecastText(days = 4) {
  const d0 = shared.state.dayCount || 0;
  return Array.from({ length: days }, (_, i) => { const o = dayOutlook(d0 + i), m = MOON_PHASES[(d0 + i) % MOON_PHASES.length]; return `${['Today', 'Tomorrow', 'Day ' + (d0 + 3), 'Day ' + (d0 + 4)][i]}: ${o.icon} ${o.name} ${m.icon}`; }).join(' • ');
}
function launchFromLighthouse() {
  if (!projOn('slip') || shared.state.boatTier === 0 || shared.onBoat || shared.mode !== 'PIER_IDLE') { if (!shared.state.boatTier) showToast('🗼 You need a boat first.'); return; }
  townClose();
  shared.playerX = MOOR.boardX; shared.playerZ = -5.6; handleBoardOrDockToggle();
  if (!shared.onBoat) return;
  const b = lhBerthPose(); boatPos.x = b.x; boatPos.z = b.z; shared.boatYaw = b.yaw; shared.boatVel = 0; shared.boatSide = 0;
  dockLighthouse(); shared.camLookInit = false;
}
export function projectRows({ row, head, note }) {
  const T = town();
  head('🏗️ Town projects');
  PROJECTS.forEach(pj => {
    const done = T.proj[pj.id];
    row(`<span class="sl-n">${pj.icon} ${pj.name}<small>${pj.desc}${done ? ' • BUILT' : ` • ${shopMoney(pj.cost)}`}</small></span>`,
      done ? [] : [['Fund', '', () => { if (shared.state.cash < pj.cost) return; shared.state.cash = +(shared.state.cash - pj.cost).toFixed(2); T.proj[pj.id] = true; townPay(0, 200, `${pj.icon} ${pj.name} built! Thank you from Harbour Town.`); sfx.playCatchFanfare(false); townRefresh(); }, shared.state.cash < pj.cost]]);
  });
  if (T.proj.weather) note(`📡 Forecast: ${forecastText()}`);
  if (T.proj.smoke) row(`<span class="sl-n">🔥 Smoked fillets<small>${T.smoke.kg.toFixed(1)} / ${SMOKE_MAX} kg in the smokehouse • worth ${shopMoney(T.smoke.value)}</small></span>`, [['Sell', '', () => { const v = T.smoke.value; if (v <= 0) return; T.smoke = { kg: 0, value: 0 }; townPay(v, 0, `🔥 Sold the smoked fillets for ${shopMoney(v)}.`); townRefresh(); }, T.smoke.value <= 0]]);
  if (T.proj.slip) row('<span class="sl-n">🗼 Fast-travel slip<small>Your moored boat is waiting at the lighthouse jetty.</small></span>', [['Launch', '', launchFromLighthouse, !shared.state.boatTier]]);
}

export function init() {
  /* ---- Town Projects (v6.6.0, noticeboard): gold sinks that change how you play ---- */
  PROJECTS = [
    { id: 'weather', icon: '📡', name: 'Weather Station', cost: 4000, desc: 'A 3-day forecast of the weather outlook and the moon on the Map, the noticeboard and by the cabin bunk.' },
    { id: 'smoke', icon: '🔥', name: 'Pier Smokehouse', cost: 5500, desc: `Fish that do not fit in your bucket go to the smokehouse instead (up to ${SMOKE_MAX} kg) as smoked fillets you sell here.` },
    { id: 'slip', icon: '🗼', name: 'Lighthouse Fast-Travel Slip', cost: 8000, desc: 'Launch your moored boat straight from the lighthouse jetty, from the noticeboard.' }
  ];
}
