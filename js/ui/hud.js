/* updateHUD: the status bar, meters, chips and the drawer's profile card. */
import { shared } from '../state.js';
import { RIGS } from '../data/townsfolk.js';
import { cleanName } from '../data/recipes.js';
import { vfx } from '../render/previews.js';
import { boatPos } from '../sim/runtime.js';
import { RANKS, rankIndexFor } from '../save/career.js';
import { getMoonPhase, getWeatherObj, hasModule, isFullMoonNight } from '../save/queries.js';
import { estimateReturnFuelNeeded, getBucketCapacity, getBucketWeight, getCurrentBait, getCurrentBoat, getCurrentRod,
  getCurrentZone, getDistanceMeters } from '../save/save-game.js';
import { updateBuffPill, updateQuestPill } from '../town/restaurant.js';
import { rigState } from '../fishing/rigs.js';
import { relativeBearing } from '../utils.js';
import { seaEvents } from '../fishing/sea-events.js';
import { updateLogNewDot } from './log-modal.js';
import { updatePrimaryActionButton } from './install.js';
import { syncTracker, updateBountyPill } from './tracker.js';

export function updateHUD() {
  updateQuestPill(); updateBountyPill(); updateBuffPill();
  updateLogNewDot();
  document.getElementById('hud-cash').textContent = `$${shared.state.cash.toFixed(2)}`;
  { const wl = getWeatherObj().label; const sp = wl.indexOf(' ');
    document.getElementById('hud-weather').innerHTML = `<span class="w-ic">${wl.slice(0, sp)}</span><span class="w-tx">${wl.slice(sp)}</span>`; }

  const bWeight = getBucketWeight();
  const bCap = getBucketCapacity();
  document.getElementById('hud-bucket').textContent = `${bWeight.toFixed(1)}/${bCap % 1 === 0 ? bCap : bCap.toFixed(1)}kg`;
  const bPct = Math.min(100, (bWeight / bCap) * 100);
  const bBar = document.getElementById('hud-bucket-bar');
  bBar.style.width = `${bPct}%`;
  bBar.style.backgroundColor = bPct > 85 ? '#f87171' : '#2dd4bf';

  const boat = getCurrentBoat();
  const fuelWrap = document.getElementById('hud-fuel-bar-wrap');
  const fuelWarn = document.getElementById('hud-fuel-warning');
  const fuelTextEl = document.getElementById('hud-fuel-text');
  if (shared.state.boatTier === 0) {
    document.getElementById('hud-fuel').textContent = '0/0';
    if (fuelTextEl) fuelTextEl.textContent = 'None (Pier)';
    fuelWrap.style.display = 'none';
    fuelWarn.style.display = 'none';
  } else {
    document.getElementById('hud-fuel').textContent = `${Math.round(shared.state.fuel)}/${boat.maxFuel}`;
    if (fuelTextEl) fuelTextEl.textContent = `${boat.name} (${shared.state.fuel.toFixed(1)}u)`;
    fuelWrap.style.display = 'inline-flex';
    const fPct = Math.max(0, Math.min(100, (shared.state.fuel / boat.maxFuel) * 100));
    const fBar = document.getElementById('hud-fuel-bar');
    fBar.style.width = `${fPct}%`;

    const returnNeeded = estimateReturnFuelNeeded();
    const zoneFuel = document.getElementById('hud-zone-fuel');
    zoneFuel.textContent = '';
    if (shared.onBoat && getDistanceMeters() > 15) {
      fuelWarn.style.display = 'block';
      fuelWarn.textContent = `Return Fuel Needed: ${returnNeeded.toFixed(1)}`;
      if (shared.state.fuel <= returnNeeded * 1.05) {
        fuelWarn.className = 'fuel-warning fuel-danger';
        fBar.style.backgroundColor = '#ef4444';
        fuelWrap.classList.add('fuel-alert');
      } else if (shared.state.fuel <= returnNeeded * 1.45) {
        fuelWarn.className = 'fuel-warning fuel-amber';
        fBar.style.backgroundColor = '#f59e0b';
        fuelWrap.classList.remove('fuel-alert');
      } else {   // plenty of fuel: just a short note on the status line, no separate warning
        fuelWarn.className = 'fuel-warning fuel-safe';
        fuelWarn.style.display = 'none';
        zoneFuel.textContent = `⛽ ${returnNeeded.toFixed(1)} back`;
        fBar.style.backgroundColor = '#4ade80';
        fuelWrap.classList.remove('fuel-alert');
      }
    } else {
      fuelWarn.style.display = 'none';
      fuelWrap.classList.remove('fuel-alert');
      fBar.style.backgroundColor = fPct < 25 ? '#f59e0b' : '#4ade80';
    }
  }

  // one radar pill (v6.2.1): the nearest treasure or boss and, with a sonar, the nearest frenzy, each as distance + arrow
  const evPill = document.getElementById('hud-event-pill');
  const arrow = (dx, dz) => relativeBearing(dx, dz).split(' ').pop();
  const nearEv = shared.onBoat ? seaEvents.nearest(boatPos) : null, radar = [];
  if (nearEv) radar.push(`${nearEv.kind === 'boss' ? '🐉' : '🪙'} ${Math.round(nearEv.dist)}m ${arrow(nearEv.x - boatPos.x, nearEv.z - boatPos.z)}`);
  if (hasModule('sonar') && shared.state.boatTier > 0 && shared.onBoat) {
    const nearest = vfx.getNearestFrenzy(boatPos);
    radar.push(nearest ? `📡 ${Math.round(nearest.dist)}m ${arrow(nearest.spot.x - boatPos.x, nearest.spot.z - boatPos.z)}` : '📡 …');
  }
  if (radar.length) {
    evPill.style.display = 'inline-flex';
    evPill.classList.toggle('boss', !!nearEv && nearEv.kind === 'boss');
    document.getElementById('hud-event-text').textContent = radar.join('  ·  ');
  } else {
    evPill.style.display = 'none';
  }
  syncTracker();

  document.getElementById('hud-rank').textContent = RANKS[rankIndexFor(shared.state.xp || 0)].name;
  { // the drawer's profile header (v7.1.0)
    const ri = rankIndexFor(shared.state.xp || 0), cur = RANKS[ri], nxt = RANKS[ri + 1], xp = shared.state.xp || 0;
    const pct = nxt ? Math.max(0, Math.min(100, (xp - cur.xp) / (nxt.xp - cur.xp) * 100)) : 100;
    document.getElementById('mp-name').textContent = cleanName(shared.state.playerName) || 'Angler';
    document.getElementById('mp-rank').textContent = `${ri + 1}. ${cur.name}`;
    document.getElementById('mp-cash').textContent = `$${shared.state.cash.toFixed(2)}`;
    document.getElementById('mp-xp-bar').style.width = `${pct}%`;
    document.getElementById('mp-xp').setAttribute('aria-valuenow', String(Math.round(pct)));
    document.getElementById('mp-next').textContent = nxt ? `${Math.max(0, Math.ceil(nxt.xp - xp)).toLocaleString()} XP to ${nxt.name}` : 'Top rank reached';
  }
  const rod = getCurrentRod();
  document.getElementById('hud-rod').textContent = `${rod.name} (${rod.maxWeight}kg)${shared.state.hasLiveBaitCam ? ' 📹' : ''}`;

  const bait = getCurrentBait();
  const curStock = shared.state.baitStock[shared.state.baitTier] || 0;
  document.getElementById('hud-bait').textContent = (bait.infinite
    ? `${bait.name} (∞)`
    : `${bait.name} (${curStock}x)`) + (rigState().eq ? ` + ${RIGS[rigState().eq].name}` : '');

  const hrs = Math.floor(shared.state.timeOfDay * 24) % 24;
  const mins = Math.floor((shared.state.timeOfDay * 24 * 60) % 60);
  document.getElementById('hud-time').textContent = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  const moon = getMoonPhase();
  document.getElementById('hud-moon').textContent = isFullMoonNight()
    ? `${moon.icon} FULL!`
    : `${moon.icon}`;

  const zone = getCurrentZone();
  const dist = getDistanceMeters();
  document.getElementById('hud-zone').textContent = `${zone.id}. ${zone.name}`;
  document.getElementById('hud-dist').textContent = `${dist} m`;
  const ecoMod = (shared.state.junkRecycledKg || 0) % 100;
  document.getElementById('hud-eco').textContent = `♻️ ${ecoMod.toFixed(1)}/100kg`;

  updatePrimaryActionButton();
}
