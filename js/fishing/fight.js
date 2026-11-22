/* Game feel: fish fighting styles, starting a fight, callouts and the fight tick. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { spawnWorldCallout } from '../ui/world-callout.js';
import { vfx } from '../render/previews.js';
import { bobberPos } from '../sim/controls-state.js';
import { leap, startLeap } from './leap.js';
import { endFightFx, triggerCamShake } from '../ui/pause.js';

export let leapBanner, vignetteEl;

/* =========================================================================
   GAME FEEL: fish fighting styles, the leap prompt, the landing moment, the tension vignette and the pause screen
   ========================================================================= */
export const FIGHT_STYLES = {
  passive:  { label: 'DEAD WEIGHT' },
  steady:   { label: '🐟 STEADY' },
  runner:   { label: '⚡ RUNNER' },
  diver:    { label: '⬇ DIVER' },
  jumper:   { label: '🐬 JUMPER' },
  thrasher: { label: '〰 THRASHER' }
};
export function fightStyleFor(c) {
  if (!c || c.item.category !== 'Fish') return 'passive';
  if (c.isBoss) return 'diver';
  const sh = c.item.shape;
  if (sh === 'fish_marlin' || sh === 'fish_slim') return 'jumper';
  if (sh === 'fish_tuna') return 'runner';
  if (sh === 'fish_eel') return 'thrasher';
  if (sh === 'fish_flat' || sh === 'fish_angler' || sh === 'fish_round' || sh === 'fish_spiky') return 'diver';
  return 'steady';
}
export const fight = { style: 'steady', ev: null, evT: 0, evDur: 0, next: 3, dir: 0, held: 0, hint: '', hintCol: '#fde047', qte: false, qteHit: false, dip: 0 };
const FM = { drag: 1, lat: 1, reel: 1, dir: 0, center: false, sink: 0 };

export function startFight(c) {
  endFightFx();
  fight.style = fightStyleFor(c);
  fight.ev = null; fight.evT = 0; fight.hint = ''; fight.dip = 0;
  fight.next = 2.5 + Math.random() * 1.5;
}
export function fightCallout(text, color) { spawnWorldCallout(bobberPos, text, color); }

/* per-frame fight events; returns the multipliers the reel simulation applies */
export function fightTick(dt, calm) {
  FM.drag = 1; FM.lat = 1; FM.reel = 1; FM.dir = 0; FM.center = false; FM.sink = 0;
  fight.dip = Math.max(0, fight.dip - dt * 2.5);
  if (fight.style === 'thrasher') FM.lat = 1.25;
  if (calm || fight.style === 'steady' || fight.style === 'passive' || fight.style === 'thrasher') { fight.hint = ''; return FM; }
  if (!fight.ev) {
    fight.next -= dt;
    if (fight.next <= 0 && shared.reelProgress < 0.92) {
      fight.ev = fight.style === 'runner' ? 'run' : fight.style === 'diver' ? 'dive' : 'leap';
      fight.evT = 0; fight.held = 0; fight.qte = false; fight.qteHit = false;
      if (fight.ev === 'run') {
        fight.evDur = 1.4 + Math.random() * 0.8;
        fight.dir = shared.fishLateralPos >= 0 ? 1 : -1;
        sfx.playFightCue('run'); vfx.spawnSplash(bobberPos, 10, 0xe0f2fe, 2.4);
      } else if (fight.ev === 'dive') {
        fight.evDur = 1.25;
        sfx.playFightCue('dive'); vfx.spawnRipple(bobberPos, 0xe0f2fe, 2.6);
      } else {
        fight.evDur = 1.35;                                   // 0.3 s tell, then the fish is in the air
        vfx.spawnRipple(bobberPos, 0xfef08a, 2.2); sfx.playBubble && sfx.playBubble();
      }
    }
    fight.hint = '';
    return FM;
  }
  fight.evT += dt;
  const t = fight.evT;
  if (fight.ev === 'run') {
    FM.dir = fight.dir; FM.lat = 1.9; FM.drag = 1.3;
    fight.hint = `⚡ IT'S RUNNING ${fight.dir < 0 ? '◀' : '▶'} STEER AGAINST IT!`; fight.hintCol = '#fb923c';
  } else if (fight.ev === 'dive') {
    FM.drag = 1.75; FM.reel = 0.25; FM.center = true; FM.sink = 0.55 * Math.sin(Math.PI * Math.min(1, t / fight.evDur));
    if (shared.isHoldingAction) fight.held += dt;
    fight.hint = '⬇ DIVING! EASE OFF THE REEL'; fight.hintCol = '#38bdf8';
  } else if (fight.ev === 'leap') {
    if (t < 0.3) { fight.hint = '! SOMETHING IS COMING UP !'; fight.hintCol = '#fde047'; }
    else {
      if (!leap.active && !fight.qte && !fight.qteHit) startLeap();
      FM.drag = 0.3; FM.reel = 0.4;                           // in the air the fish barely pulls
      const open = t >= 0.42 && t <= 1.05 && !fight.qteHit;
      if (open !== fight.qte) { fight.qte = open; leapBanner.classList.toggle('show', open); }
      fight.hint = open ? '🐬 TAP NOW: DIP THE ROD!' : fight.hint; fight.hintCol = '#38bdf8';
    }
  }
  if (t >= fight.evDur) finishFightEvent();
  return FM;
}
function finishFightEvent() {
  if (fight.ev === 'dive') {
    if (fight.held / fight.evDur < 0.4) {
      shared.reelProgress = Math.min(0.97, shared.reelProgress + 0.04);
      fightCallout('✓ READ THE DIVE', '#4ade80'); sfx.playFightCue('good');
    }
    fight.next = 4 + Math.random() * 3;
  } else if (fight.ev === 'leap') {
    if (!fight.qteHit) {                                       // missed: the line went slack
      shared.reelProgress = Math.max(0, shared.reelProgress - 0.06);
      shared.tension = 0.1;
      fightCallout('SLACK LINE! -6%', '#fb923c'); sfx.playFightCue('bad'); triggerCamShake(0.12);
    }
    fight.next = 4.5 + Math.random() * 3.5;
  } else {
    fight.next = 3.5 + Math.random() * 2.5;
  }
  fight.ev = null; fight.qte = false; fight.hint = '';
  leapBanner.classList.remove('show');
}

export function init() {
  leapBanner = document.getElementById('leap-banner');
  vignetteEl = document.getElementById('tension-vignette');
}
