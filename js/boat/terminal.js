/* Refuelling, docking at the pier, the bucket stand visual, the boat spotlight and the boat terminal. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { BOAT_TIERS, sfx } from '../data/equipment.js';
import { MOOR, PIER_BUCKET_X, PIER_WALK } from '../world/layout.js';
import { fuelPrice } from '../data/townsfolk.js';
import { WorldBuilder } from '../world/world-builder.js';
import { scene } from '../render/renderer.js';
import { textures, world } from '../render/lights.js';
import { replaceSceneMesh, vfx } from '../render/previews.js';
import { getCurrentBoat, getDistanceMeters, saveGame } from '../save/save-game.js';
import { buyFuel } from '../sim/spots.js';
import { rebuildPlayerBoatVisual, showToast } from '../ui/toasts.js';
import { updateHUD } from '../ui/hud.js';

export function refuelAtPump() {
  if (shared.state.boatTier === 0) { showToast('⛽ No boat moored here yet: buy one at the Boatyard.'); return; }
  const boat = getCurrentBoat(), missing = Math.max(0, boat.maxFuel - shared.state.fuel);
  if (missing <= 0.1) { showToast(`⛽ ${boat.name}: the tank is already full.`); return; }
  const bought = buyFuel(missing);
  if (!bought) { showToast(`⛽ Not enough cash for fuel ($${fuelPrice().toFixed(2)} a unit).`); return; }
  const { units, cost } = bought;
  shared.state.boatFuel[shared.state.boatTier] = shared.state.fuel;
  sfx.playCoin(); sfx.vibrate(20);
  saveGame(); updateHUD();
  showToast(`⛽ Filled the ${boat.name}: +${units.toFixed(0)}u for $${cost.toFixed(2)}${shared.state.fuel < boat.maxFuel - 0.1 ? ' (all you could afford)' : ''}.`);
}

export function isAtPierWaterEdge() {
  // Only the far tip of the pier is a fishing spot; the sides are railed off.
  return !shared.onBoat && shared.playerZ <= -10.39 && Math.abs(shared.playerX) <= PIER_WALK + 0.05;
}

export function canDockAtPier() {
  return shared.onBoat && shared.mode === 'BOAT_DRIVING' && getDistanceMeters() <= 15;
}

export function rebuildPierBucketVisual() {
shared.pierBucketMesh = replaceSceneMesh(scene, shared.pierBucketMesh, WorldBuilder.buildPierBucketMesh(shared.state.bucketTier, shared.state.bucket, textures));
  shared.pierBucketMesh.position.set(PIER_BUCKET_X, 1.56, -7.6);
  shared.pierBucketMesh.rotation.y = 0.28;
  // the bucket's walk collider grows with the model: measured from the upgrade that is on the pier now
  shared.pierBucketMesh.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(shared.pierBucketMesh);
  if (isFinite(bb.min.x) && world.bucketCollider) {
    const c = world.bucketCollider;
    c.x = (bb.min.x + bb.max.x) / 2; c.z = (bb.min.z + bb.max.z) / 2;
    c.hx = Math.max(0.3, (bb.max.x - bb.min.x) / 2); c.hz = Math.max(0.3, (bb.max.z - bb.min.z) / 2);
  }
}

shared.boatSpotlight = null;
/* ---- Boat terminal: pick which owned boat is moored at the platform ---- */
export const BOAT_ICONS = { 1: '🛶', 2: '🚤', 3: '🚢', 4: '🛥️' };
export function openBoatTerminal() {
  renderBoatTerminal();
  document.getElementById('modal-boats').classList.add('open');
  sfx.playSonarPing && sfx.playSonarPing();
}
function renderBoatTerminal() {
  const host = document.getElementById('boat-terminal-list');
  host.innerHTML = '';
  BOAT_TIERS.filter(b => b.tier > 0).forEach(b => {
    const owned = shared.state.ownedBoats.includes(b.tier), active = shared.state.boatTier === b.tier;
    const fuel = active ? shared.state.fuel : (shared.state.boatFuel[b.tier] ?? b.maxFuel);
    const pct = Math.round(100 * fuel / b.maxFuel);
    const card = document.createElement('div');
    card.className = `shop-card ${active ? 'equipped' : ''}`;
    if (!owned) card.style.opacity = '0.5';
    card.innerHTML = `
            <div>
              <div class="card-title"><span>${BOAT_ICONS[b.tier]} ${b.name}</span><span style="color:${owned ? 'var(--ok)' : 'var(--text-2)'};">${active ? 'MOORED' : owned ? 'OWNED' : '$' + b.cost.toLocaleString()}</span></div>
              <div class="card-stats">Top speed: <b>${b.speed} m/s</b> • Reaches: <b>Zone ${b.maxZone}</b><br/>${owned
                ? `Fuel: <b>${fuel.toFixed(0)} / ${b.maxFuel}</b> <span style="display:inline-block; width:70px; height:7px; background:#0f172a; border:1px solid #475569; vertical-align:middle;"><span style="display:block; height:100%; width:${pct}%; background:${pct > 30 ? 'var(--ok)' : 'var(--danger)'};"></span></span>`
                : 'Not owned yet: buy it at the Tackle Shop.'}</div>
            </div>`;
    const btn = document.createElement('button');
    btn.className = active ? 'pixel-btn green' : 'pixel-btn gold';
    btn.textContent = active ? 'In use' : owned ? 'Use this boat' : 'Locked';
    btn.disabled = active || !owned;
    if (owned && !active) btn.onclick = () => selectBoat(b.tier);
    card.appendChild(btn);
    host.appendChild(card);
  });
}
function selectBoat(tier) {
  if (shared.onBoat || !shared.state.ownedBoats.includes(tier) || shared.state.boatTier === tier) return;
  if (shared.state.boatTier > 0) shared.state.boatFuel[shared.state.boatTier] = shared.state.fuel;
  shared.state.boatTier = tier;
  shared.state.fuel = Math.min(BOAT_TIERS[tier].maxFuel, shared.state.boatFuel[tier] ?? BOAT_TIERS[tier].maxFuel);
  rebuildPlayerBoatVisual();
  saveGame();
  updateHUD();
  renderBoatTerminal();
  sfx.playCoin();
  vfx.spawnSplash(new THREE.Vector3(MOOR.boatX, 0.1, -5.6), 18, 0xe0f2fe, 3);
  showToast(`${BOAT_ICONS[tier]} ${BOAT_TIERS[tier].name} is now moored at the platform.`);
}
