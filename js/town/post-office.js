/* The Post Office, the winch job, performance culling, Ines's commissions and friendship perks. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { CATCH_CATALOG, ZONES } from '../data/catalog.js';
import { BOTTLE_MESSAGES } from '../data/bottles-bounties.js';
import { TOWN, TOWN_BUILDINGS, atDoor, placeName } from '../world/layout.js';
import { NPCS } from '../data/townsfolk.js';
import { friendPerk } from '../data/townsfolk.js';
import { world } from '../render/lights.js';
import { vfx } from '../render/previews.js';
import { boatPos } from '../sim/runtime.js';
import { rollWeather } from '../sim/controls-state.js';
import { AQUARIUM_FORMS } from './aquarium.js';
import { CATALOG_INDEX } from '../save/career.js';
import { getMoonPhase } from '../save/queries.js';
import { saveGame } from '../save/save-game.js';
import { SIT_SPOT, SPOTS } from '../sim/spots.js';
import { rebuildPierBucketVisual } from '../boat/terminal.js';
import { showToast } from '../ui/toasts.js';
import { addFriend, openTalk, talkMenu, talkSay } from './talk.js';
import { npcSpotNow, npcState } from './npcs.js';
import { dayRng, town } from './town-state.js';
import { openTownSheet, townClose, townPay, townRefresh, townUI } from './town-nav.js';
import { JOB_KINDS, activeJob, ensureJobs, finishJob } from './town-jobs.js';
import { lightLantern, nearLantern, nearPickup, openJobsSheet, takePickup } from './jobs.js';
import { openScope, openTavern, tavernOpen } from './telescope-dice.js';
import { openGreenhouse, openTraps, openWorkshop } from './traps-workshop.js';
import { relativeBearing } from '../utils.js';
import { seaEvents } from '../fishing/sea-events.js';
import { shopMoney } from '../shop/shop-kinds.js';
import { dive } from '../dive/dive-state.js';

/* ---- the Post Office: jobs, treasure maps and bottle stamps ---- */
const MAP_COST = 150;
function openPostOffice() {
  ensureJobs();
  openTownSheet('📮 POST OFFICE', ({ row, head, note, host }) => {
    const T = town(), found = (shared.state.foundMessages || []).length, stampsDue = Math.min(6, Math.floor(found / 6)) - T.stamps;
    note('Maren runs the counter: parcels to carry, old treasure maps, and a stamp for every six bottle messages you find.');
    head('Counter');
    const mapCost = MAP_COST * (friendPerk('maren') ? 0.5 : 1);
    row(`<span class="sl-n">🗺️ Treasure map<small>Marks a floating chest out on the Coastal Reef on your Map • one a day • ${shopMoney(mapCost)}</small></span>`, [['Buy', '', () => {
      if (shared.state.cash < mapCost || T.mapDay === (shared.state.dayCount || 0)) return;
      const t = seaEvents.sight(true); if (!t) { showToast('🗺️ Maren finds no fresh map today. Try tomorrow.'); return; }
      shared.state.cash = +(shared.state.cash - mapCost).toFixed(2); T.mapDay = shared.state.dayCount || 0; t.spotted = true; townPay(0, 0, '🗺️ A chest is marked on your Map. Sail out to it.'); townRefresh();
    }, shared.state.cash < mapCost || T.mapDay === (shared.state.dayCount || 0)]]);
    row(`<span class="sl-n">📜 Bottle stamps<small>${found} / ${BOTTLE_MESSAGES.length} bottle messages • ${T.stamps} / 6 stamps • each stamp pays $100</small></span>`, [['Claim', '', () => {
      if (stampsDue <= 0) return; T.stamps += stampsDue; townPay(100 * stampsDue, 30 * stampsDue, `📜 ${stampsDue} stamp${stampsDue > 1 ? 's' : ''} from Maren: +${shopMoney(100 * stampsDue)}.`); townRefresh(); }, stampsDue <= 0]]);
    head('Jobs');
    row(`<span class="sl-n">📋 Town jobs<small>The same jobs as the noticeboard in the square.</small></span>`, [['Open', '', () => openJobsSheet('📮 POST OFFICE: TOWN JOBS')]]);
    shared.postRows && shared.postRows({ row, head, note, host });
  });
}
shared.postRows = null;

/* ---- the winch: hoist 5 crates, press when the swinging hook is over the green ---- */
function openWinch() {
  const a = activeJob(); if (!a || a.kind !== 'winch') return;
  const W = { t: 0, crate: 0, good: 0, last: performance.now(), x: 0, speed: 1.6, msg: 'Press HOIST when the hook is over the green.' };
  openTownSheet('🏗️ DOCKHAND WINCH', ({ host, row }) => {
    host.insertAdjacentHTML('beforeend', `<div class="winch-bar"><div class="winch-zone" id="winch-zone"></div><div class="winch-hook" id="winch-hook"></div></div><p class="town-note" id="winch-msg">${W.msg}</p>`);
    row(`<span class="sl-n" id="winch-count">Crate ${W.crate + 1} / 5 • ${W.good} hoisted</span>`, [['⬆ HOIST', '', () => {
      const zw = 0.26 - W.crate * 0.03, ok = Math.abs(W.x - 0.5) < zw / 2; W.crate++; if (ok) W.good++;
      sfx.playTick(); document.getElementById('winch-msg').textContent = ok ? '✅ Up she goes!' : '❌ It swung off. Next crate.';
      document.getElementById('winch-count').textContent = `Crate ${Math.min(5, W.crate + 1)} / 5 • ${W.good} hoisted`;
      if (W.crate >= 5) { cancelAnimationFrame(townUI.raf); setTimeout(() => { townClose(); if (W.good >= 3) finishJob(true); else showToast(`🏗️ Only ${W.good} crates up. Try again: the job is still yours.`); }, 600); }
    }]]);
    const tick = now => {
      const dt = Math.min(0.05, (now - W.last) / 1000); W.last = now; W.t += dt * (W.speed + W.crate * 0.35); W.x = 0.5 + Math.sin(W.t) * 0.48;
      const hk = document.getElementById('winch-hook'), zn = document.getElementById('winch-zone'); if (!hk) return;
      const zw = 0.26 - W.crate * 0.03; zn.style.left = `${(0.5 - zw / 2) * 100}%`; zn.style.width = `${zw * 100}%`; hk.style.left = `${W.x * 100}%`;
      townUI.raf = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(townUI.raf); townUI.raf = requestAnimationFrame(tick);
  });
}

/* ---- the places: action button entries (first match wins) ---- */
/* v12.0.0: every door action uses the plan's door (atDoor); on foot only */
const inFront = t => !shared.onBoat && atDoor(t, shared.playerX, shared.playerZ);
/* knocking: a townsperson at home opens the door for a chat; otherwise you hear where they usually are */
function knock(b) {
  const n = npcState.list.find(q => q.id === b.owner), who = NPCS[b.owner];
  if (n && !n.hidden && Math.hypot(n.x - n.d.home.x, n.z - n.d.home.z) < 2.4) { openTalk(n); return; }
  const spot = n ? npcSpotNow(n.d) : null;
  showToast(`🚪 ${who.name} is out${spot ? `, usually at ${placeName(spot.x, spot.z)} now` : ''}.`);
}

/* v6.3.1 performance: the town is not drawn far out at sea or underwater, and the pier not underwater (fog hides them anyway) */
export function perfCull() {
  if (!world) return;
  const far = shared.onBoat && Math.hypot(boatPos.x, boatPos.z) > 210, under = !!dive.active && shared.mode === 'DIVING';
  if (world.islandScenery) world.islandScenery.visible = !(far || under);
  if (world.pierGroup) world.pierGroup.visible = !under;
}
/* Ines' specimen commissions (v6.4.0, after her quest Living Specimens): one a day, a species from the sea or a
   tank-bred colour morph from your aquarium. Pays well and +2 friendship. */
function inesCommission() {
  const T = town(), day = shared.state.dayCount || 0;
  if (!T.comm && T.commDay !== day) {
    const r = dayRng(day * 13 + 1);
    if (r() < 0.35) T.comm = { kind: 'morph', form: ['golden', 'albino', 'midnight'][Math.floor(r() * 3)] };
    else { const pool = CATCH_CATALOG.filter(c => c.category === 'Fish' && !c.fullMoonOnly && !c.stormOnly && c.zones.some(z => z <= Math.max(2, (shared.state.stats && shared.state.stats.maxZone) || 1)) && c.rarity !== 'Legendary'); T.comm = { kind: 'species', id: pool[Math.floor(r() * pool.length)].id }; }
    saveGame();
  }
  return T.comm;
}
export function inesTalk() {
  const c = inesCommission(); if (!c) return false;
  const T = town();
  if (c.kind === 'species') {
    const it = CATALOG_INDEX[c.id], f = shared.state.bucket.find(e => e.id === c.id), pay = Math.round(it.value * 2.5 + 40);
    if (f) { talkSay([`A ${it.name}! Exactly the specimen I needed.`], [{ label: `Give ${it.name} (+${shopMoney(pay)})`, cls: 'green', fn: () => { const i = shared.state.bucket.indexOf(f); if (i >= 0) shared.state.bucket.splice(i, 1); rebuildPierBucketVisual(); T.comm = null; T.commDay = shared.state.dayCount || 0; addFriend('ines', 2); townPay(pay, 30, `🔬 Commission done: +${shopMoney(pay)}.`); talkMenu(); } }, { label: 'Not now' }]); return true; }
    talkSay([`My commission today: a ${it.name}, from ${it.zones.map(z => ZONES[z - 1].name).join(' or ')}. Bring it to me in your bucket and I will pay ${shopMoney(pay)}.`], [{ label: 'I will look' }]); return true;
  }
  const form = c.form, F = AQUARIUM_FORMS[form], aq = shared.state.aquarium, i = aq.fish.findIndex(f => f.form === form && !f.g), pay = 320;
  if (i >= 0) { const f = aq.fish[i]; talkSay([`A ${F.name} ${CATALOG_INDEX[f.id].name} from your tank? Perfect for my study.`], [{ label: `Give it (+${shopMoney(pay)})`, cls: 'green', fn: () => { aq.fish.splice(i, 1); T.comm = null; T.commDay = shared.state.dayCount || 0; addFriend('ines', 2); townPay(pay, 50, `🔬 Commission done: +${shopMoney(pay)}.`); talkMenu(); } }, { label: 'Not now' }]); return true; }
  talkSay([`My commission: a grown ${F.name} colour morph, bred in your aquarium. Happy fish in pairs have fry, and some come out ${F.name.toLowerCase()}. I pay ${shopMoney(pay)}.`], [{ label: 'I will try' }]); return true;
}
/* Pip's perk: a shout when a frenzy is near the boat; Marta's: storm and full-moon warnings */
const perkState = { moonDay: -1, stormWarned: false };
export function friendPerkTick() {
  if (shared.onBoat && friendPerk('pip')) vfx.frenzies.forEach(f => { if (f.pipSaid) return; const d = Math.hypot(boatPos.x - f.x, boatPos.z - f.z); if (d < 70) { f.pipSaid = true; showToast(`🧒 Pip: "A feeding frenzy, ${Math.round(d)} m ${relativeBearing(f.x - boatPos.x, f.z - boatPos.z).toLowerCase()}!"`); } });
  if (friendPerk('marta')) {
    const day = shared.state.dayCount || 0;
    if (perkState.moonDay !== day && shared.state.timeOfDay > 0.66 && shared.state.timeOfDay < 0.75 && getMoonPhase().isFull) { perkState.moonDay = day; showToast('👵 Marta: "Full moon tonight, dear. The glowing ones will be up."'); }
    if (shared.weatherTimer < 25 && shared.pendingWeather === null) { shared.pendingWeather = rollWeather(); if (shared.pendingWeather === 'STORM' && shared.state.weather !== 'STORM') showToast('👵 Marta: "A storm is coming. Get the boat in, or get ready for the electric ones."'); }
  }
}

export function init() {
  SPOTS.unshift(
    { id: 'pickup', icon: '✋', label: 'PICK UP', cls: 'bounty', color: ['#facc15', '#fef08a'], near: () => nearPickup() >= 0, prox: () => { const a = activeJob(); return `${JOB_KINDS[a.kind].icon} ${a.kind === 'cleanup' ? 'LITTER' : a.variant === 'shells' ? 'A SHELL' : 'HERBS'} • ${a.n} / ${a.need}`; }, press: takePickup },
    { id: 'lantern', icon: '🔥', label: 'LIGHT', cls: 'bounty', color: ['#f59e0b', '#fde68a'], near: () => nearLantern() >= 0, prox: () => `🏮 STREET LANTERN • ${activeJob().n} / ${activeJob().need} LIT`, press: lightLantern },
    { id: 'winch', icon: '🏗️', label: 'WINCH', cls: 'shop', color: ['#f59e0b', '#fde68a'], near: () => { const a = activeJob(); return !!a && a.kind === 'winch' && Math.hypot(shared.playerX - TOWN.winch.x, shared.playerZ - (TOWN.winch.z + 0.9)) < 1.2; }, prox: () => '🏗️ WINCH • HOIST 5 CRATES FOR ROOK', press: openWinch }
  );
  SPOTS.push(
    ...TOWN_BUILDINGS.filter(id => TOWN[id].owner).map(id => ({ id: 'knock-' + id, icon: '🚪', label: 'KNOCK', cls: 'shop', color: ['#94a3b8', '#e2e8f0'],
      near: () => inFront(TOWN[id]), prox: () => `🚪 ${TOWN[id].name.toUpperCase()} • KNOCK ON THE DOOR`, press: () => knock(TOWN[id]) })),
    { id: 'scope', icon: '🔭', label: 'LOOK', cls: 'shop', color: ['#38bdf8', '#bae6fd'], near: () => Math.hypot(shared.playerX - TOWN.scope.x, shared.playerZ - (TOWN.scope.z + 0.75)) < 0.6, prox: () => '🔭 TELESCOPE • SPOT FRENZIES, TREASURE AND BOSS SHADOWS', press: openScope },
    { id: 'board', icon: '📌', label: 'JOBS', cls: 'bounty', color: ['#34d399', '#a7f3d0'], near: () => inFront(TOWN.board), prox: () => { ensureJobs(); const n = town().jobs.list.filter(j => j.status === 'open').length; return `📌 NOTICEBOARD • ${n} JOB${n === 1 ? '' : 'S'} TODAY`; }, press: () => openJobsSheet() },
    { id: 'post', icon: '📮', label: 'POST', cls: 'shop', color: ['#60a5fa', '#bfdbfe'], near: () => inFront(TOWN.post), prox: () => '📮 POST OFFICE • JOBS, TREASURE MAPS, BOTTLE STAMPS', press: openPostOffice },
    { id: 'tavern', icon: '🎲', label: 'DICE', cls: 'shop', color: ['#f59e0b', '#fde68a'], near: () => inFront(TOWN.tavern), prox: () => (tavernOpen() ? "🍺 SAILORS' REST • SHIP, CAPTAIN & CREW" : "🍺 SAILORS' REST • OPENS AT 16:00"), useless: () => !tavernOpen(), press: openTavern },
    { id: 'traps', icon: '🦀', label: 'TRAPS', cls: 'shop', color: ['#fb923c', '#fed7aa'], near: () => { const d = Math.hypot(shared.playerX - TOWN.pool.x, shared.playerZ - TOWN.pool.z); return d > TOWN.pool.r && d < TOWN.pool.r + 1.4; }, prox: () => { const T = town(), ready = T.traps.filter(t => t && (shared.state.dayCount || 0) > t.day).length; return `🦀 TIDE POOL • ${ready ? ready + ' TRAP' + (ready > 1 ? 'S' : '') + ' READY' : 'CRAB TRAPS'}`; }, press: openTraps },
    { id: 'workshop', icon: '🎨', label: 'PAINT', cls: 'shop', color: ['#d97706', '#fde68a'], near: () => inFront(TOWN.shop), prox: () => "🔨 BARNABY'S WORKSHOP • BOAT PAINT", press: openWorkshop },
    SIT_SPOT,
    { id: 'greenhouse', icon: '🌿', label: 'HERBS', cls: 'shop', color: ['#22c55e', '#bbf7d0'], near: () => inFront(TOWN.talia), prox: () => "🌿 TALIA'S GREENHOUSE • LURES, SEA PLANTS", press: openGreenhouse }
  );
}
