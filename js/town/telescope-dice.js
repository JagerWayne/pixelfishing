/* The lookout telescope and the tavern dice game. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { BAIT_TIERS, sfx } from '../data/equipment.js';
import { TOWN, townGround } from '../world/layout.js';
import { friendPerk } from '../data/townsfolk.js';
import { camera } from '../render/renderer.js';
import { vfx } from '../render/previews.js';
import { releaseAllInputs } from '../sim/joystick.js';
import { saveGame } from '../save/save-game.js';
import { showToast } from '../ui/toasts.js';
import { questEvent } from './story.js';
import { addFriend } from './talk.js';
import { town } from './town-state.js';
import { openTownSheet, townPay, townRefresh } from './town-nav.js';
import { mapCompass } from '../ui/map.js';
import { seaEvents } from '../fishing/sea-events.js';
import { shopMoney } from '../shop/shop-kinds.js';
import { updateHUD } from '../ui/hud.js';

/* ---- the lookout telescope: sweep the sea, spot frenzies, treasure beams and boss shadows; they go on the Map ---- */
export const scope = { on: false, yaw: 0, auto: true, idle: 0, dir: 1, hold: 0, dwell: new Map(), fov: 13 };
export function openScope() {
  if (scope.on) return;
  const T = town(), day = shared.state.dayCount || 0;
  if (T.scopeDay !== day) { T.scopeDay = day; seaEvents.sight(); saveGame(); }
  scope.on = true; scope.yaw = 0; scope.auto = true; scope.idle = 0; scope.dwell.clear();
  releaseAllInputs(); document.body.dataset.scope = '1';
  document.getElementById('scope-ui').classList.add('open');
  showToast('🔭 Drag to look around. Hold the view on something to mark it on your Map.');
}
export function closeScope() { if (!scope.on) return; scope.on = false; document.body.dataset.scope = '0'; document.getElementById('scope-ui').classList.remove('open'); shared.camLookInit = false; }
const scopeTargets = () => [
  ...seaEvents.treasures.map(t => ({ o: t, icon: '🪙', name: 'Treasure chest' })),
  ...(seaEvents.boss ? [{ o: seaEvents.boss, icon: '🐉', name: 'Boss shadow' }] : []),
  ...vfx.frenzies.map(f => ({ o: f, icon: '🔥', name: 'Feeding frenzy' }))
];
export function updateScope(rawDt) {
  if (!scope.on) return;
  if (scope.hold) { scope.yaw += scope.hold * rawDt * 0.6; scope.auto = false; scope.idle = 0; }
  else if (!scope.auto) { scope.idle += rawDt; if (scope.idle > 3) scope.auto = true; }
  if (scope.auto) { scope.yaw += scope.dir * rawDt * 0.12; if (Math.abs(scope.yaw) > 1.2) scope.dir = -Math.sign(scope.yaw); }
  scope.yaw = THREE.MathUtils.clamp(scope.yaw, -1.5, 1.5);
  const S = TOWN.scope, ey = townGround(S.z) + 1.55;
  camera.position.set(S.x, ey, S.z + 0.25);
  camera.lookAt(S.x - Math.sin(scope.yaw) * 100, ey - 2.2, S.z - Math.cos(scope.yaw) * 100);
  camera.fov = scope.fov; camera.updateProjectionMatrix();
  scopeTargets().forEach(({ o, icon, name }) => {
    if (o.spotted) return;
    const dx = o.x - S.x, dz = o.z - S.z, d = Math.hypot(dx, dz); if (d > 700) return;
    const a = Math.atan2(-dx, -dz), off = Math.abs(Math.atan2(Math.sin(a - scope.yaw), Math.cos(a - scope.yaw)));
    const w = (scope.dwell.get(o) || 0) + (off < 0.07 ? rawDt : -rawDt);
    scope.dwell.set(o, Math.max(0, w));
    if (w > 0.7) { o.spotted = true; questEvent('scope', {}); sfx.playCatchFanfare(false); showToast(`🔭 ${icon} ${name} spotted ${Math.round(d)} m ${mapCompass(dx, dz)}: marked on your Map.`); }
  });
}
/* spotted sea events, for the Map and its list */
export const scopeMarks = () => scopeTargets().filter(t => t.o.spotted).map(t => ({ icon: t.icon, name: `${t.name} (spotted)`, desc: 'Seen through the lookout telescope. Sail out before it is gone.', x: t.o.x, z: t.o.z, far: true }));

/* ---- Sailors' Rest: "Ship, Captain & Crew" dice against the townsfolk ---- */
const DICE_OPP = [['rook', 'Captain Rook'], ['maren', 'Maren'], ['salty', 'Old Salty']];
const dice = { phase: 'pick', opp: 0, wager: 10, me: null, them: null, msg: '' };
export const tavernOpen = () => shared.state.timeOfDay >= 16 / 24 || shared.state.timeOfDay < 2 / 24;
function sccNew() { return { ship: false, cap: false, crew: false, cargo: null, rolls: 3, last: [] }; }
function sccRoll(g) {
  const n = g.ship && g.cap && g.crew ? 2 : 5 - (g.ship ? 1 : 0) - (g.cap ? 1 : 0) - (g.crew ? 1 : 0);
  const v = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 6)); g.last = v.slice(); g.rolls--;
  if (g.ship && g.cap && g.crew) { g.cargo = v[0] + v[1]; return; }
  const take = f => { const i = v.indexOf(f); if (i < 0) return false; v.splice(i, 1); return true; };
  if (!g.ship && take(6)) g.ship = true;
  if (g.ship && !g.cap && take(5)) g.cap = true;
  if (g.ship && g.cap && !g.crew && take(4)) g.crew = true;
  if (g.ship && g.cap && g.crew) g.cargo = v.length >= 2 ? v[0] + v[1] : null;
}
const sccScore = g => (g.ship && g.cap && g.crew && g.cargo ? g.cargo : 0);
const sccText = g => `${g.ship ? '⛵' : '·'} ${g.cap ? '🧑‍✈️' : '·'} ${g.crew ? '👥' : '·'}${g.cargo ? ` • cargo ${g.cargo}` : ''}`;
const dieFaces = v => v.map(n => `<span class="die">${n}</span>`).join('');
function diceStart() {
  const w = dice.wager;
  if (w > 0 && shared.state.cash < w) { showToast('🎲 Not enough cash for that bet.'); return; }
  if (w > 0) { shared.state.cash = +(shared.state.cash - w).toFixed(2); updateHUD(); }
  dice.me = sccNew(); dice.them = sccNew(); dice.phase = 'play'; dice.msg = ''; sccRoll(dice.me); sfx.playTick(); townRefresh();
}
function diceStand() {
  const t = dice.them; while (t.rolls > 0 && (sccScore(t) < 8)) sccRoll(t);
  const a = sccScore(dice.me), b = sccScore(t), name = DICE_OPP[dice.opp][1], T = town(), w = dice.wager;
  T.dice.played++; dice.phase = 'done';
  if (a > b) {
    T.dice.won++; questEvent('dice', { won: true }); addFriend(DICE_OPP[dice.opp][0], 1);
    const win = Math.round(w * (friendPerk('salty') ? 1.5 : 1));
    if (w > 0) { townPay(w + win, 4, null); dice.msg = `You win ${shopMoney(win)}! ${name} pays up.`; }
    else { const tier = Math.max(2, Math.min(4, shared.state.baitTier || 2)); shared.state.baitStock[tier] = (shared.state.baitStock[tier] || 0) + 5; if (shared.state.baitTier === tier) shared.state.baitCount = shared.state.baitStock[tier]; townPay(0, 4, null); dice.msg = `You win 5 ${BAIT_TIERS[tier - 1].name}!`; }
  } else if (a === b) { if (w > 0) { shared.state.cash = +(shared.state.cash + w).toFixed(2); updateHUD(); } dice.msg = 'A draw: the bets go back.'; saveGame(); }
  else { dice.msg = `${name} wins this one.`; saveGame(); }
  townRefresh();
}
export function openTavern() {
  if (!tavernOpen()) { showToast("🍺 Sailors' Rest opens at 16:00."); return; }
  dice.phase = 'pick';
  openTownSheet("🍺 SAILORS' REST: SHIP, CAPTAIN & CREW", ({ row, head, note, host }) => {
    const T = town();
    note('Roll five dice, three rolls. You need a 6 (ship), then a 5 (captain), then a 4 (crew); the other two dice are your cargo. Highest cargo wins.');
    if (dice.phase === 'pick') {
      head('Play against');
      row(`<span class="sl-n">${DICE_OPP.map(([, n], i) => (i === dice.opp ? `<b>▶ ${n}</b>` : n)).join(' • ')}</span>`, [['Next', '', () => { dice.opp = (dice.opp + 1) % DICE_OPP.length; townRefresh(); }]]);
      head('Bet');
      row(`<span class="sl-n">${dice.wager ? shopMoney(dice.wager) : 'For bait (free)'}<small>Played ${T.dice.played} • won ${T.dice.won}</small></span>`,
        [[`Bait`, '', () => { dice.wager = 0; townRefresh(); }], ['$10', '', () => { dice.wager = 10; townRefresh(); }], ['$50', '', () => { dice.wager = 50; townRefresh(); }], ['$100', '', () => { dice.wager = 100; townRefresh(); }]]);
      row('<span class="sl-n">Ready?</span>', [['🎲 Roll', '', diceStart, dice.wager > shared.state.cash]]);
    } else {
      const g = dice.me, all = g.ship && g.cap && g.crew;
      head('Your roll');
      host.insertAdjacentHTML('beforeend', `<div class="dice-row">${dieFaces(g.last)}</div><p class="town-note">${sccText(g)} • ${g.rolls} roll${g.rolls === 1 ? '' : 's'} left</p>`);
      if (dice.phase === 'play') {
        const btns = [];
        if (g.rolls > 0) btns.push([all ? 'Roll cargo again' : '🎲 Roll', '', () => { sccRoll(g); sfx.playTick(); if (g.rolls <= 0) diceStand(); else townRefresh(); }]);
        btns.push([all ? 'Stand' : g.rolls > 0 ? 'Give up' : 'Finish', all ? '' : 'red', diceStand]);
        row(`<span class="sl-n">${all ? `Cargo ${g.cargo}. Keep it or roll the two cargo dice again.` : 'Find the ship, captain and crew.'}</span>`, btns);
      } else {
        const t = dice.them;
        head(`${DICE_OPP[dice.opp][1]}`);
        host.insertAdjacentHTML('beforeend', `<div class="dice-row">${dieFaces(t.last)}</div><p class="town-note">${sccText(t)}</p>`);
        row(`<span class="sl-n">${dice.msg}</span>`, [['Again', '', () => { dice.phase = 'pick'; townRefresh(); }]]);
      }
    }
  });
}
