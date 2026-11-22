/* The coast guard rescue, the secret gull, and the story: quest state, validation, steps and events. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { NPCS, rarityAtLeast } from '../data/townsfolk.js';
import { QUEST_BY_ID } from '../data/quests.js';
import { world } from '../render/lights.js';
import { boatPos } from '../sim/runtime.js';
import { CHEAT_GULL, rescueStartPos } from '../sim/controls-state.js';
import { releaseAllInputs } from '../sim/joystick.js';
import { CATALOG_INDEX } from '../save/career.js';
import { isNightTime } from '../save/queries.js';
import { getDistanceMeters, saveGame } from '../save/save-game.js';
import { showToast } from '../ui/toasts.js';
import { updateQuestPill } from './restaurant.js';
import { updateHUD } from '../ui/hud.js';

export function triggerRescueSequence() {
  shared.mode = 'RESCUE_SEQUENCE';
  releaseAllInputs();
  world.bobberGroup.visible = false;
  world.fishingLine.visible = false;
  world.fishShadow.visible = false;
  document.getElementById('live-bait-pip').classList.remove('active');

  shared.rescueTimer = 0;
  rescueStartPos.copy(boatPos);
  shared.rescueFeePaid = Math.min(shared.state.cash, 100);
  shared.state.cash = +(shared.state.cash - shared.rescueFeePaid).toFixed(2);
  shared.state.fuel = 0;
  saveGame();

  sfx.playRescueHorn();
  document.getElementById('rescue-fee-label').textContent =
    shared.rescueFeePaid < 100
      ? `Emergency Tow Fee: $${shared.rescueFeePaid.toFixed(2)} (All available funds)`
      : `Emergency Tow Fee: $100.00`;
  document.getElementById('rescue-overlay').classList.add('open');
  updateHUD();
}

/* =========================================================================
   SECTION J: FISHING MECHANICS & CONTEXTUAL ACTION BUTTON
   ========================================================================= */
export function isNearCheatGull() {
  return !shared.onBoat && shared.mode === 'PIER_IDLE' && Math.hypot(shared.playerX - CHEAT_GULL.x, shared.playerZ - CHEAT_GULL.z) <= CHEAT_GULL.radius;
}

/* =========================================================================
   HARBOUR TOWN PEOPLE AND STORY (v6.0)
   NPCS: the townsfolk (fixed looks on the angler rig, a day routine of spots, home at night).
   QUESTS: the story as data; steps advance from game events (questEvent) or from a regular check (questTick),
   a finished quest is handed in to its giver. Everything lives in state.story (sanitizeStory).
   ========================================================================= */
export function defaultStory() { return { active: {}, done: [], friend: {}, flags: {} }; }
export function sanitizeStory(src) {
  const st = defaultStory();
  if (!src || typeof src !== 'object') return st;
  st.done = [...new Set((Array.isArray(src.done) ? src.done : []).filter(id => QUEST_BY_ID[id]))];
  if (src.active && typeof src.active === 'object') Object.entries(src.active).forEach(([id, a]) => {
    const q = QUEST_BY_ID[id]; if (!q || st.done.includes(id) || !a || typeof a !== 'object') return;
    const s = Math.max(0, Math.min(q.steps.length, Math.floor(Number(a.s) || 0)));
    st.active[id] = { s, n: Math.max(0, Math.floor(Number(a.n) || 0)), seen: Array.isArray(a.seen) ? a.seen.filter(x => CATALOG_INDEX[x]).slice(0, 50) : [] };
  });
  if (src.friend && typeof src.friend === 'object') Object.keys(NPCS).forEach(k => { const v = Number(src.friend[k]); if (Number.isFinite(v)) st.friend[k] = Math.max(0, Math.min(99, Math.floor(v))); });
  if (src.flags && typeof src.flags === 'object') ['lit', 'legend', 'resto'].forEach(f => { if (src.flags[f]) st.flags[f] = true; });
  return st;
}
export const story = () => shared.state.story || (shared.state.story = defaultStory());
export const questReady = id => { const a = story().active[id]; return !!a && a.s >= QUEST_BY_ID[id].steps.length; };
export const questAvailable = q => !story().done.includes(q.id) && !story().active[q.id] && q.needs.every(n => story().done.includes(n));
export function questStepText(id) {
  const q = QUEST_BY_ID[id], a = story().active[id]; if (!a) return '';
  if (a.s >= q.steps.length) return `Return to ${NPCS[q.giver].name}`;
  const st = q.steps[a.s], n = st.n || 0;
  return st.text + (n > 1 ? ` (${a.n}/${n})` : '');
}
export function questAdvance(id) {
  const q = QUEST_BY_ID[id], a = story().active[id]; if (!a) return;
  a.s++; a.n = 0; a.seen = [];
  if (a.s >= q.steps.length) { showToast(`📜 ${q.title}: done! Return to ${NPCS[q.giver].name}.`); sfx.playCoin(); }
  else showToast(`📜 ${q.title}: ${q.steps[a.s].text}`);
  saveGame(); updateQuestPill();
}
export function questEvent(type, data) {
  const S = story();
  Object.keys(S.active).forEach(id => {
    const q = QUEST_BY_ID[id], a = S.active[id]; if (!q || a.s >= q.steps.length) return;
    const st = q.steps[a.s];
    if (type === 'catch' && st.t === 'catch') {
      const it = data.item, cat = st.cat || 'Fish';
      if (it.category !== cat) return;
      if (st.where === 'pier' && data.onBoat) return;
      if (st.where === 'boat' && !data.onBoat) return;
      if (st.zoneMin && (data.zoneObj ? data.zoneObj.id : 1) < st.zoneMin) return;
      if (st.minW && data.weight < st.minW) return;
      if (st.rarityMin && !rarityAtLeast(it.rarity, st.rarityMin)) return;
      if (st.night && !isNightTime()) return;
      if (st.distinct) { if (a.seen.includes(it.id)) return; a.seen.push(it.id); }
      a.n++; if (a.n >= (st.n || 1)) questAdvance(id); else { saveGame(); updateQuestPill(); }
    } else if (type === 'dive' && st.t === 'dive' && data.depth >= st.depth) questAdvance(id);
    else if (type === 'bottle' && st.t === 'bottle') { a.n++; if (a.n >= st.n) questAdvance(id); else { saveGame(); updateQuestPill(); } }
    else if (type === 'talk' && st.t === 'talk' && data.npc === st.npc) questAdvance(id);
    else if (type === 'cook' && st.t === 'cook' && (!st.stars || data.stars >= st.stars) && (!st.minValue || data.recipe.value >= st.minValue)) { a.n++; if (a.n >= (st.n || 1)) questAdvance(id); else { saveGame(); updateQuestPill(); } }
    else if (type === 'serve' && st.t === 'serve') { a.n++; if (a.n >= st.n) questAdvance(id); else saveGame(); }
    else if (['job', 'trap', 'dice', 'scope', 'paint'].includes(type) && st.t === type && (!st.kind || st.kind === data.kind)) { a.n++; if (a.n >= (st.n || 1)) questAdvance(id); else { saveGame(); updateQuestPill(); } }
  });
}
shared.questTickT = 0;
export function questTick(dt) {
  shared.questTickT -= dt; if (shared.questTickT > 0) return; shared.questTickT = 0.5;
  const S = story(), px = shared.onBoat ? boatPos.x : shared.playerX, pz = shared.onBoat ? boatPos.z : shared.playerZ;
  Object.keys(S.active).forEach(id => {
    const q = QUEST_BY_ID[id], a = S.active[id]; if (!q || a.s >= q.steps.length) return;
    const st = q.steps[a.s];
    if (st.t === 'visit' && Math.hypot(px - st.x, pz - st.z) <= st.r && (!st.night || isNightTime())) questAdvance(id);
    else if (st.t === 'far' && getDistanceMeters() >= st.m) questAdvance(id);
    else if (st.t === 'own' && (shared.state.ownedBoats || []).length >= st.boat) questAdvance(id);
    else if (st.t === 'aquarium' && new Set(shared.state.aquarium.fish.map(f => f.id)).size >= st.species) questAdvance(id);
  });
}
