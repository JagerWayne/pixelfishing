/* Finishing a quest, and the townsfolk in the world: models, umbrellas, markers, routes and finger detail. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { AnglerFactory } from '../angler/angler-factory.js';
import { AnglerAnimator } from '../angler/animator.js';
import { ISLAND, townGround } from '../world/layout.js';
import { NPCS } from '../data/townsfolk.js';
import { QUESTS, QUEST_BY_ID } from '../data/quests.js';
import { Physics } from '../engine/physics.js';
import { camera, renderer, scene } from '../render/renderer.js';
import { world } from '../render/lights.js';
import { boatPos, isRaining, makeUmbrella, placeUmbrella } from '../sim/runtime.js';
import { addXp, bumpStat } from '../save/career.js';
import { saveGame } from '../save/save-game.js';
import { showToast } from '../ui/toasts.js';
import { questAvailable, questReady, story } from './story.js';
import { addFriend, talk } from './talk.js';
import { updateQuestPill } from './restaurant.js';
import { planRoute } from '../sim/tap-walk.js';
import { shopMoney } from '../shop/shop-kinds.js';
import { updateHUD } from '../ui/hud.js';

export function questFinish(id) {
  const q = QUEST_BY_ID[id], S = story(); if (!questReady(id)) return;
  delete S.active[id]; S.done.push(id);
  const r = q.reward || {};
  if (r.cash) { shared.state.cash = +(shared.state.cash + r.cash).toFixed(2); bumpStat('earned', r.cash); }
  if (r.xp) addXp(r.xp);
  if (r.flag) S.flags[r.flag] = true;
  addFriend(q.giver, 3);
  sfx.playCatchFanfare(false); saveGame(); updateHUD(); updateQuestPill();
  showToast(`🏅 ${q.title} complete! +${shopMoney(r.cash || 0)}${r.xp ? `, +${r.xp} XP` : ''}`);
}

/* ---- the townsfolk in the world ---- */
export const npcState = { built: false, list: [] };
export const NPC_R = 0.3;
const NPC_UMBRELLAS = [[0x1d4ed8, 0xfacc15], [0x16a34a, 0xf8fafc], [0x7c3aed, 0xfde68a], [0xea580c, 0x1f2937], [0x0f766e, 0xf8fafc], [0xdb2777, 0xf8fafc], [0x334155, 0xfacc15], [0xca8a04, 0x7c2d12], [0x0369a1, 0xf8fafc]];
const npcMarkerTex = {};
function npcMarker(ch, color) {
  if (!npcMarkerTex[ch]) {
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    g.fillStyle = '#111827'; g.beginPath(); g.arc(32, 32, 28, 0, Math.PI * 2); g.fill();
    g.fillStyle = color; g.beginPath(); g.arc(32, 32, 24, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#111827'; g.font = 'bold 40px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 32, 35);
    npcMarkerTex[ch] = new THREE.CanvasTexture(c);
  }
  return npcMarkerTex[ch];
}
function buildNpcs() {
  npcState.built = true;
  Object.entries(NPCS).forEach(([id, d]) => {
    const look = AnglerFactory.sanitizeLook(Object.assign(AnglerFactory.defaultLook(d.look.gender), d.look), d.look.gender);
    const rig = AnglerFactory.createRig(); AnglerFactory.dress(rig, look);
    const g = new THREE.Group(); g.add(rig.root); scene.add(g);
    const mk = new THREE.Sprite(new THREE.SpriteMaterial({ map: npcMarker('!', '#facc15'), depthTest: false, transparent: true })); mk.scale.set(0.42, 0.42, 1); mk.renderOrder = 20; mk.visible = false; g.add(mk);
    const start = npcSpotNow(d);
    const pal = NPC_UMBRELLAS[npcState.list.length % NPC_UMBRELLAS.length], umb = makeUmbrella(pal[0], pal[1]); g.add(umb.g);   // their own umbrella for rainy days (v6.8.1)
    npcState.list.push({ id, d, rig, g, mk, umb, anim: new AnglerAnimator(rig), x: start.x, z: start.z, yaw: Math.PI, pts: [], goal: null, hidden: false, talk: 0 });
  });
}
export function npcSpotNow(d) {
  const t = shared.state.timeOfDay;
  if (t < 0.27 || t > 0.8) return d.home;
  return d.spots[Math.floor((t - 0.27) / 0.12) % d.spots.length];
}
const npcGround = z => z > ISLAND.rampZ0 ? townGround(z) : z > ISLAND.zGate ? THREE.MathUtils.lerp(1.55, 1.5, THREE.MathUtils.clamp((z - ISLAND.zGate) / 1.0, 0, 1)) : 1.55;
export function updateNpcs(dt) {
  if (!world || shared.onBoat && !npcState.built) return;
  if (!npcState.built) { buildNpcs(); if (renderer.compileAsync) renderer.compileAsync(scene, camera).catch(() => {}); }   // v8.0.0: warm the shaders up in parallel
  const night = shared.state.timeOfDay < 0.27 || shared.state.timeOfDay > 0.8;
  npcState.list.forEach(n => {
    const spot = npcSpotNow(n.d);
    if (!n.goal || n.goal.x !== spot.x || n.goal.z !== spot.z) {   // a new place to be: plan the walk there (across the town front and the pier mouth)
      n.goal = spot; n.pts = planRoute({ x: spot.x, z: spot.z }, { x: n.x, z: n.z }); n.hidden = false;
    }
    let speed = 0;
    const blocked = n.pts.length && !shared.onBoat && (() => { const p = n.pts[0], dd = Math.hypot(p.x - n.x, p.z - n.z) || 1, nx = n.x + (p.x - n.x) / dd * 0.35, nz = n.z + (p.z - n.z) / dd * 0.35; return Math.hypot(shared.playerX - nx, shared.playerZ - nz) < NPC_R + 0.3; })();
    if (n.talk > 0) n.talk -= dt;
    else if (n.pts.length && dt > 0 && !blocked) {   // (waits while you stand in the way)
      const p = n.pts[0], dx = p.x - n.x, dz = p.z - n.z, dd = Math.hypot(dx, dz), step = 1.35 * dt;
      if (dd <= step) { n.x = p.x; n.z = p.z; n.pts.shift(); } else { n.x += dx / dd * step; n.z += dz / dd * step; n.yaw = Math.atan2(-dx, -dz); }
      speed = 1.35;
    }
    if (!n.pts.length && night && Math.hypot(n.x - n.d.home.x, n.z - n.d.home.z) < 0.2) n.hidden = true;   // gone indoors for the night
    // stand still facing the angler when close, otherwise face where you are going (or the sea)
    const near = Math.hypot(shared.playerX - n.x, shared.playerZ - n.z);
    if (!speed && near < 3.5 && !shared.onBoat) n.yaw = Math.atan2(-(shared.playerX - n.x), -(shared.playerZ - n.z));
    n.g.visible = !n.hidden && !(n.farAway = Math.hypot((shared.onBoat ? boatPos.x : shared.playerX) - n.x, (shared.onBoat ? boatPos.z : shared.playerZ) - n.z) > 45);   // v6.3.1: far townsfolk are not drawn
    n.g.position.set(n.x, npcGround(n.z), n.z);
    Physics.npc(n, NPC_R);   // v8.2.0: the townsperson's cylinder follows them (off while hidden)
    const dy = Math.atan2(Math.sin(n.yaw - n.g.rotation.y), Math.cos(n.yaw - n.g.rotation.y));
    n.g.rotation.y += dy * (dt > 0 ? 1 - Math.exp(-8 * dt) : 0);
    const far = Math.hypot((shared.onBoat ? boatPos.x : shared.playerX) - n.x, (shared.onBoat ? boatPos.z : shared.playerZ) - n.z) > 40;
    let hands = null;   // an umbrella in the left hand while it rains
    n.umb.w += ((isRaining() && !n.hidden ? 1 : 0) - n.umb.w) * (dt > 0 ? 1 - Math.exp(-4 * dt) : 0);
    if (n.umb.w > 0.02 && !far) { n.g.updateMatrixWorld(true); hands = { L: placeUmbrella(n.umb, n.g, n.rig.dims.hScale), R: null }; }
    else n.umb.g.visible = false;
    if (!n.hidden && !far) n.anim.update({ dt, elapsed: shared.elapsed, speed, idleAllowed: true, hands, handBlend: hands ? n.umb.w : 0, expr: talk.npc === n && document.getElementById('modal-talk').classList.contains('open') ? 'happy' : 'open' });
    // ! a quest to offer, ? a quest to hand in
    const ready = Object.keys(story().active).some(id => QUEST_BY_ID[id].giver === n.id && questReady(id));
    const offer = QUESTS.some(q => q.giver === n.id && questAvailable(q));
    n.mk.visible = !n.hidden && (ready || offer);
    if (n.mk.visible) { n.mk.material.map = npcMarker(ready ? '?' : '!', ready ? '#4ade80' : '#facc15'); n.mk.position.set(0, 2.25 + Math.sin(shared.elapsed * 3) * 0.05, 0); }
  });
}
/* after a long skip (sleeping) everyone is simply where the clock says */
export function npcSnap() {
  npcState.list.forEach(n => { const sp = npcSpotNow(n.d); n.x = sp.x; n.z = sp.z; n.pts = []; n.goal = sp; });
}
export function npcNear() {
  if (shared.onBoat || shared.mode !== 'PIER_IDLE' || !npcState.built) return null;
  let best = null, bd = 1.45;
  npcState.list.forEach(n => { if (n.hidden) return; const d = Math.hypot(shared.playerX - n.x, shared.playerZ - n.z); if (d < bd) { bd = d; best = n; } });
  return best;
}
