/* Reading progress, the reading pill, and the underwater weight estimates. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { restState } from '../sim/controls-state.js';
import { BOOKS, BOOK_MINUTES, BOOK_PAGES, BOOK_SESSION_MIN, WEIGHT_GUESS, benchSeated, bookMinutes, bookOwned,
  bookPages, bookProgress, readProp, reading, setReadProp } from './books.js';
import { saveGame } from '../save/save-game.js';
import { showToast } from '../ui/toasts.js';
import { isAnyModalOpen } from '../utils.js';
import { syncTracker } from '../ui/tracker.js';

/* per frame (dt is 0 while paused): place the book in front of the chest, update the stacks and the turning leaf */
export function updateReadBook(dt, seatY) {
  if (!readProp || !readProp.visible || !reading.id) return;
  const U = readProp.userData, pr = bookProgress(reading.id), pg = Math.floor(bookPages(reading.id));
  if (pg > U.lastPage) { U.pending += pg - U.lastPage; U.lastPage = pg; }
  if (U.flip < 0 && U.pending > 0) { U.pending = Math.min(U.pending - 1, 1); U.flip = 0; }
  readProp.position.set(0, seatY + 0.38, -0.6); readProp.rotation.set(1.17, 0, 0);
  const rt = 0.004 + 0.034 * (1 - pr), lt = 0.004 + 0.034 * pr;
  U.right.scale.y = rt; U.right.position.y = rt / 2; U.left.scale.y = lt; U.left.position.y = lt / 2;
  if (U.flip >= 0) {
    U.flip = Math.min(1, U.flip + dt / 0.9);
    const e = U.flip * U.flip * (3 - 2 * U.flip), a = Math.PI * e;
    U.leaf.visible = U.flip < 1; U.leaf.rotation.z = a; U.leaf.position.y = rt + (lt - rt) * e + 0.002;
    U.tip.rotation.z = -0.7 * Math.sin(a);
    if (U.flip >= 1) { U.flip = -1; U.leaf.visible = false; sfx.playTick(); }
  }
}
export function startReading(id) {
  if (!bookOwned(id) || bookProgress(id) >= 1 || !benchSeated()) return false;
  setReadProp(id);
  reading.id = id; reading.left = BOOK_SESSION_MIN; reading.saveT = 0; reading.pillMin = -1; shared.state.bookSel = id;
  showToast(`📖 Reading ${BOOKS[id].title}`);
  return true;
}
export function stopReading(why) {
  if (!reading.id) return;
  const b = BOOKS[reading.id];
  reading.id = null; reading.left = 0; setReadProp(null);
  saveGame(); updateReadPill();
  if (why) showToast(why.replace('{b}', b.title));
}
/* called with the in-game minutes that just passed (from the day-night clock, so it is 0 while paused) */
export function updateReading(dMin) {
  if (!reading.id) return;
  if (!benchSeated() && !(restState.spot && restState.spot.kind === 'bench' && isAnyModalOpen())) { stopReading('📖 Stopped reading {b}.'); return; }
  if (dMin <= 0) return;
  const id = reading.id, e = shared.state.books[id], clock = Math.min(dMin, reading.left);
  e.minutes = Math.min(BOOK_MINUTES, e.minutes + clock * readSpeed()); reading.left -= clock; reading.saveT += clock;
  if (reading.saveT >= 30) { reading.saveT = 0; saveGame(); }
  if (e.minutes >= BOOK_MINUTES - 1e-6) { e.minutes = BOOK_MINUTES; stopReading('🎉 Finished {b}!'); sfx.playCatchFanfare(false); return; }
  if (reading.left <= 1e-6) { stopReading('📖 Done reading for now. Press Read to continue.'); return; }
  updateReadPill();
}
export function updateReadPill() {
  const el = document.getElementById('hud-read-pill'); if (!el) return;
  if (!reading.id) { el.style.display = 'none'; reading.pillMin = -1; syncTracker(); return; }
  const b = BOOKS[reading.id], m = Math.floor(bookMinutes(reading.id)), left = Math.ceil(reading.left);
  if (m === reading.pillMin) return; reading.pillMin = m;
  el.style.display = 'block';
  el.textContent = `📖 ${readSpeed() > 1 ? '☕ ' : ''}${b.title}: ${bookPages(reading.id).toFixed(1)} / ${BOOK_PAGES} pages (${(bookProgress(reading.id) * 100).toFixed(1)}%) • ${Math.floor(left / 60)}h ${String(left % 60).padStart(2, '0')}m left`;
  syncTracker();
}
/* Harbour Espresso: twice the reading speed while it lasts (in-game minutes in state.kitchen.espresso) */
const readSpeed = () => (shared.state.kitchen && shared.state.kitchen.espresso > 0 ? 2 : 1);
/* the book the bunk reads at night: the one last opened on a bench, else the first unfinished one */
export function selectedBook() {
  if (shared.state.bookSel && bookOwned(shared.state.bookSel) && bookProgress(shared.state.bookSel) < 1) return shared.state.bookSel;
  return Object.keys(BOOKS).find(id => bookOwned(id) && bookProgress(id) < 1) || null;
}
/* read pages without a bench (the bunk): returns the pages actually read */
export function readPages(id, pages) {
  if (!id || !bookOwned(id)) return 0;
  const e = shared.state.books[id], before = e.minutes;
  e.minutes = Math.min(BOOK_MINUTES, e.minutes + pages * BOOK_MINUTES / BOOK_PAGES);
  return (e.minutes - before) * BOOK_PAGES / BOOK_MINUTES;
}
/* the diving book's weight guess: a fixed range per fish (a stored seed, never re-rolled), always shown as a range */
export function diveWeightRange(f) {
  const m = WEIGHT_GUESS.base - (WEIGHT_GUESS.base - WEIGHT_GUESS.min) * bookProgress('dive');
  if (f.estU === undefined) f.estU = Math.random();
  const w = f.weight;
  return [w * (1 - m * (0.4 + 0.6 * f.estU)), w * (1 + m * (0.4 + 0.6 * (1 - f.estU)))];
}
export function fmtWeightRange(r) { const d = (r[1] - r[0]) < 0.2 || r[1] < 2 ? 2 : 1; return `~${r[0].toFixed(d)} kg – ${r[1].toFixed(d)} kg`; }
