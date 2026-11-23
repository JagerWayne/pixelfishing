/* The Trophy Wall, the bunk and the share codes. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { ZONES } from '../data/catalog.js';
import { CABIN, ISLAND, townGround } from '../world/layout.js';
import { cleanNote } from '../data/townsfolk.js';
import { cleanName } from '../data/recipes.js';
import { WorldBuilder } from '../world/world-builder.js';
import { textures, world } from '../render/lights.js';
import { BOOKS } from './books.js';
import { selectedBook } from './reading.js';
import { CATALOG_INDEX } from '../save/career.js';
import { saveGame } from '../save/save-game.js';
import { BED, bedTime, sleepTillMorning } from '../sim/spots.js';
import { showToast } from '../ui/toasts.js';
import { town } from './town-state.js';
import { openTownSheet, townClose, townPay, townRefresh } from './town-nav.js';
import { forecastText, projOn } from '../fishing/rigs.js';
import { dressAngler } from '../save/defaults.js';
import { lookFromShare } from '../ui/customise-history.js';

/* ---- the Trophy Wall above the cabin bunk (v6.6.0): mount your heaviest fish over 18 kg or a boss you landed ---- */
const TROPHY_MIN = 18;
function trophyCandidates() {
  const T = town(), out = [];
  Object.entries(shared.state.speciesStats || {}).forEach(([id, st]) => {
    const it = CATALOG_INDEX[id]; if (!it || it.category !== 'Fish' || !(st.maxWeight > TROPHY_MIN)) return;
    const r = T.recs[id]; out.push({ id, w: +st.maxWeight.toFixed(2), zone: r ? r.zone : (it.zones || [1])[0], day: r ? r.day : -1, boss: false });
  });
  T.bosses.forEach(b => out.push(Object.assign({}, b)));
  return out.sort((a, b) => b.w - a.w).slice(0, 12);
}
const trophyLabel = t => `${t.boss ? '👑 ' : ''}${CATALOG_INDEX[t.id].name} • ${t.w.toFixed(1)} kg • ${ZONES[t.zone - 1].name}${t.day >= 0 ? ` • day ${t.day + 1}` : ''}`;
export let trophyMesh = null;
export function syncTrophyWall() {
  const cab = world && world.cabin; if (!cab) return;
  if (trophyMesh) { cab.remove(trophyMesh); trophyMesh = null; }
  const t = town().wall; if (!t) return;
  const g = new THREE.Group(), K = WorldBuilder.propKit(textures);
  K.box(g, 0.06, 0.85, 1.7, K.darkWood, 0, 0, 0); K.box(g, 0.04, 0.7, 1.55, K.wood, -0.04, 0, 0);
  const fish = WorldBuilder.buildSculptedFishMesh(CATALOG_INDEX[t.id], textures), bb = new THREE.Box3().setFromObject(fish), sz = bb.getSize(new THREE.Vector3());
  fish.scale.setScalar(1.3 / Math.max(sz.x, 0.01)); fish.rotation.y = -Math.PI / 2; fish.position.set(-0.16, 0.08, 0); g.add(fish);
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 64; const c2 = cv.getContext('2d');
  c2.fillStyle = '#3b2410'; c2.fillRect(0, 0, 512, 64); c2.fillStyle = '#fde68a'; c2.font = 'bold 24px monospace'; c2.textAlign = 'center'; c2.textBaseline = 'middle';
  c2.fillText(trophyLabel(t).replace('👑 ', 'BOSS: '), 256, 32, 500);
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.19), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv) })); lab.rotation.y = -Math.PI / 2; lab.position.set(-0.07, -0.33, 0); g.add(lab);
  g.position.set(CABIN.w / 2 - 0.16, 1.95, BED.z - CABIN.z); cab.add(g); trophyMesh = g;
}
export function openBunk() {
  openTownSheet('🛏️ BUNK & TROPHY WALL', ({ row, head, note }) => {
    const T = town();
    row(`<span class="sl-n">💤 Turn in for the night<small>${bedTime() ? `Sleep until 06:00${selectedBook() ? ` and read ${BED.pages} pages of ${BOOKS[selectedBook()].title}` : ''}` : 'Too early: after 18:00'}</small></span>`, [['Sleep', '', () => { townClose(); sleepTillMorning(); }, !bedTime()]]);
    if (projOn('weather')) note(`📡 ${forecastText()}`);
    head('🏆 Trophy Wall');
    note(T.wall ? `Mounted: ${trophyLabel(T.wall)}` : `Mount your heaviest fish over ${TROPHY_MIN} kg, or a boss you landed, on the plaque above the bunk.`);
    const cands = trophyCandidates();
    if (!cands.length) note('Nothing big enough yet.');
    cands.forEach(c => row(`<span class="sl-n">${trophyLabel(c)}</span>`, [['Mount', '', () => { T.wall = c; saveGame(); syncTrophyWall(); sfx.playCoin(); showToast(`🏆 Mounted: ${CATALOG_INDEX[c.id].name}`); townRefresh(); }, !!T.wall && T.wall.id === c.id && T.wall.w === c.w]]));
  });
}

/* ---- share codes (v6.6.0, Post Office): bottle notes and catch challenges as text codes, no server ---- */
const CODE_PREFIX = 'PF1-';
export const encodeShare = o => CODE_PREFIX + btoa(unescape(encodeURIComponent(JSON.stringify(o))));
export function decodeShare(code) {
  try {
    const s = String(code || '').trim(); if (!s.startsWith(CODE_PREFIX) || s.length > 2000) return null;
    const o = JSON.parse(decodeURIComponent(escape(atob(s.slice(CODE_PREFIX.length)))));
    if (!o || typeof o !== 'object') return null;
    if (o.t === 'note') { const m = cleanNote(o.m); return m ? { t: 'note', m, from: cleanName(o.from) } : null; }
    if (o.t === 'look') { const look = lookFromShare(o.l); return look ? { t: 'look', look, from: cleanName(o.from) } : null; }   // v11.0.0
    if (o.t === 'chal' && CATALOG_INDEX[o.id] && CATALOG_INDEX[o.id].category === 'Fish') { const w = Number(o.w); return Number.isFinite(w) && w > 0 && w < 5000 ? { t: 'chal', id: o.id, w: +w.toFixed(2), from: cleanName(o.from) } : null; }
  } catch (e) { return null; }
  return null;
}
export function shareCatchCheck(c) {
  const T = shared.state.town; if (!T || !T.chal || c.item.id !== T.chal.id || c.weight < T.chal.w) return;
  const from = T.chal.from || 'a friend'; T.chal = null; T.chalDone++;
  townPay(250, 60, `🎯 Challenge beaten! You out-fished ${from}: +$250.`);
}
export const copyText = t => {
  const no = () => showToast('📋 Select the code and copy it.');
  try { navigator.clipboard.writeText(t).then(() => showToast('📋 Code copied.'), no); } catch (e) { no(); }
};

export const townLift = () => (!shared.onBoat && shared.playerZ > ISLAND.rampZ0 ? townGround(shared.playerZ) - 1.5 : 0);

export function init() {
  shared.postRows = ({ row, head, note, host }) => {
    const T = town(), me = cleanName(shared.state.playerName) || 'An angler';
    head('✉️ Share codes');
    note('Make a code, send it to a friend in any message app, and they paste it here. No internet needed by the game. Look codes from Customise open here too.');
    const r1 = row('<span class="sl-n">✉️ Bottle note<small>Write a message for a friend to find.</small></span><input class="town-in" id="share-note" maxlength="140" placeholder="Your message">', [['Make code', '', () => {
      const m = cleanNote(document.getElementById('share-note').value); if (!m) { showToast('✉️ Write something first.'); return; }
      const code = encodeShare({ t: 'note', m, from: me }); document.getElementById('share-out').value = code; copyText(code);
    }]]);
    const best = Object.entries(shared.state.speciesStats || {}).filter(([id, st]) => CATALOG_INDEX[id] && CATALOG_INDEX[id].category === 'Fish' && st.maxWeight > 0).sort((a, b) => b[1].maxWeight - a[1].maxWeight).slice(0, 3);
    if (best.length) row(`<span class="sl-n">🎯 Catch challenge<small>Dare a friend to beat one of your records.</small></span>`, best.map(([id, st]) => [`${CATALOG_INDEX[id].name} ${st.maxWeight.toFixed(1)} kg`, '', () => { const code = encodeShare({ t: 'chal', id, w: +st.maxWeight.toFixed(2), from: me }); document.getElementById('share-out').value = code; copyText(code); }]));
    host.insertAdjacentHTML('beforeend', '<textarea class="town-in" id="share-out" rows="2" readonly placeholder="Your code appears here"></textarea>');
    row('<span class="sl-n">📥 Open a code<small>Paste a code from a friend.</small></span><textarea class="town-in" id="share-in" rows="2" placeholder="PF1-..."></textarea>', [['Open', '', () => {
      const o = decodeShare(document.getElementById('share-in').value); if (!o) { showToast('📥 That code does not work.'); return; }
      if (o.t === 'note') { T.notes.push({ m: o.m, from: o.from }); if (T.notes.length > 10) T.notes.shift(); saveGame(); showToast(`✉️ A note from ${o.from || 'a friend'}: "${o.m}"`); }
      else if (o.t === 'look') { shared.state.look = o.look; shared.state.anglerGender = o.look.gender; dressAngler(); saveGame(); showToast(`👕 You are wearing ${o.from ? o.from + "'s" : 'the'} look. Change it any time in Customise.`); }
      else { T.chal = { id: o.id, w: o.w, from: o.from }; saveGame(); showToast(`🎯 Challenge from ${o.from || 'a friend'}: land a ${CATALOG_INDEX[o.id].name} of ${o.w} kg or more.`); }
      townRefresh();
    }]]);
    if (T.chal) note(`🎯 Active challenge from ${T.chal.from || 'a friend'}: a ${CATALOG_INDEX[T.chal.id].name} of ${T.chal.w} kg or more ($250). ${T.chalDone} beaten so far.`);
    if (T.notes.length) { head('Received notes'); T.notes.slice().reverse().forEach(n => note(`✉️ <b>${n.from || 'Someone'}</b>: ${n.m}`)); }
  };
}
