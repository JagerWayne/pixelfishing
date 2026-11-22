/* Skill books: the books, buying, perks and the book held while reading on a bench. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { world } from '../render/lights.js';
import { restState } from '../sim/controls-state.js';
import { saveGame } from '../save/save-game.js';
import { showToast } from '../ui/toasts.js';
import { updateHUD } from '../ui/hud.js';

/* =========================================================================
   SKILL BOOKS (v5.1.0): one book per shop. Buy it, sit on a bench and read: 310 pages = 21,600 in-game minutes (15 days, v6.2.0). Every minute read raises each of the book's perks at once, linearly: bonus = max x minutes / 21,600.
   Harbour Espresso (restaurant pantry) doubles the reading speed for 12 in-game hours; sleeping in the cabin bunk reads 30 pages of the selected book (state.bookSel).
   A reading session lasts at most 360 in-game minutes. All time comes from the in-game clock (timeOfDay).
   Add a book by adding it to BOOKS (title, shop, price, perks) and calling bookBonus(perkId) where the perk applies.
   ========================================================================= */
export const BOOK_MINUTES = 15 * 24 * 60, BOOK_PAGES = 310, BOOK_SESSION_MIN = 6 * 60, BOOKS_V = 2;
export const WEIGHT_GUESS = { base: 0.35, min: 0.05 };
export const BOOKS = {
  boat:     { id: 'boat', shop: 'boatyard', icon: '⛵', color: 0x1d4ed8, title: 'Offshore Angling Guide', cost: 650, desc: 'Reading the sea from a deck: where the big ones run, and what to put on the hook.',
              perks: [{ id: 'boatRare', label: 'Rare-fish odds when fishing from a boat', max: 0.40, kind: 'pct' }] },
  pier:     { id: 'pier', shop: 'tackle', icon: '🎣', color: 0xb45309, title: 'Pier & Shore Mastery', cost: 400, desc: 'Casting from solid planks: tides, shadows and the patience that lands the rarer fish.',
              perks: [{ id: 'pierRare', label: 'Rare-fish odds when fishing from the pier', max: 0.40, kind: 'pct' }] },
  dive:     { id: 'dive', shop: 'dive', icon: '🤿', color: 0x0f766e, title: 'Deep Water Freediving & Ichthyology', cost: 900, desc: 'Breathing, finning and fish: breath control, spotting the good ones, and judging a fish by eye.',
              perks: [{ id: 'breath', label: 'Underwater breath capacity', max: 0.40, kind: 'pct' }, { id: 'diveRare', label: 'Rare-fish odds when diving', max: 0.40, kind: 'pct' }, { id: 'weightEst', label: 'Weight guess accuracy', max: 1, kind: 'est' }] },
  ledger:   { id: 'ledger', shop: 'fish', icon: '🐟', color: 0x0369a1, title: "The Fishmonger's Ledger", cost: 500, desc: 'Bargaining, grading and the market mood: how to get the best price for a catch.',
              perks: [{ id: 'fishPrice', label: 'Fish sale prices', max: 0.15, kind: 'pct' }] },
  green:    { id: 'green', shop: 'recycle', icon: '♻️', color: 0x16a34a, title: 'Green Harbour Handbook', cost: 350, desc: "What the scrapyards pay for: sorting junk and seaweed so nothing is wasted.",
              perks: [{ id: 'junkPrice', label: 'Junk and seaweed recycling prices', max: 0.50, kind: 'pct' }] },
  aquarist: { id: 'aquarist', shop: 'aquashop', icon: '🐠', color: 0x7c3aed, title: "The Aquarist's Handbook", cost: 600, desc: 'Water, feed and display: what makes visitors pay to look at your tank.',
              perks: [{ id: 'aquaTickets', label: 'Aquarium visitor ticket income', max: 0.30, kind: 'pct' }] }
};
export const SHOP_BOOK = { tackle: 'pier', boatyard: 'boat', dive: 'dive', fish: 'ledger', recycle: 'green', aquashop: 'aquarist' };
export const reading = { id: null, left: 0, saveT: 0, pillMin: -1 };
export const bookOwned = id => !!(shared.state.books && shared.state.books[id] && shared.state.books[id].owned);
export const bookMinutes = id => (bookOwned(id) ? shared.state.books[id].minutes : 0);
export const bookProgress = id => Math.min(1, bookMinutes(id) / BOOK_MINUTES);
export const bookPages = id => bookMinutes(id) * BOOK_PAGES / BOOK_MINUTES;
/* the active bonus of one perk right now: max x minutes read / 21,600 (0 if the book is not owned) */
export function bookBonus(perkId) {
  let v = 0;
  for (const id in BOOKS) BOOKS[id].perks.forEach(p => { if (p.id === perkId) v += p.max * bookProgress(id); });
  return v;
}
export function bookPerkText(b, p) {
  const cur = p.max * bookProgress(b.id);
  if (p.kind === 'est') { const m = WEIGHT_GUESS.base - (WEIGHT_GUESS.base - WEIGHT_GUESS.min) * bookProgress(b.id); return `${p.label}: guess within +-${(m * 100).toFixed(1)}% (from +-${WEIGHT_GUESS.base * 100}% to +-${WEIGHT_GUESS.min * 100}%)`; }
  return `${p.label}: +${(cur * 100).toFixed(1)}% (max +${(p.max * 100).toFixed(0)}%)`;
}
export function buyBook(id) {
  const b = BOOKS[id]; if (!b || bookOwned(id) || shared.state.cash < b.cost) return false;
  shared.state.cash = +(shared.state.cash - b.cost).toFixed(2);
  if (!shared.state.books) shared.state.books = {};
  shared.state.books[id] = { owned: true, minutes: 0 };
  sfx.playCoin(); saveGame(); updateHUD();
  showToast(`📚 Bought ${b.title}`);
  return true;
}
export function sanitizeBooks(src, ver) {
  const out = {};
  if (!src || typeof src !== 'object') return out;
  const k = ver === BOOKS_V ? 1 : BOOK_MINUTES / 44640;   // saves before v6.2.0 counted 44,640 minutes per book: keep the same progress
  Object.keys(BOOKS).forEach(id => {
    const e = src[id]; if (!e || typeof e !== 'object' || !e.owned) return;
    const m = Number(e.minutes) * k;
    out[id] = { owned: true, minutes: Number.isFinite(m) ? Math.min(BOOK_MINUTES, Math.max(0, m)) : 0 };
  });
  return out;
}
/* a spot on a bench, settled in */
export const benchSeated = () => !shared.onBoat && shared.mode === 'PIER_IDLE' && !!restState.spot && restState.spot.kind === 'bench' && restState.w > 0.6;
export let readProp = null;
/* an open book held in both hands: two page stacks (thick on the right while unread, thick on the left once read)
   and one leaf that flips over each time a page is finished */
function buildReadBook() {
  const g = new THREE.Group(), U = g.userData;
  const lines = document.createElement('canvas'); lines.width = lines.height = 64; { const c = lines.getContext('2d'); c.fillStyle = '#f6efd9'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#a89c80'; for (let y = 8; y < 60; y += 5) c.fillRect(8, y, 48, 1.5); }
  const pageMat = new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(lines), roughness: 0.9 }), coverMat = new THREE.MeshStandardMaterial({ roughness: 0.7 });
  const half = side => {
    const h = new THREE.Group(); h.rotation.z = -side * 0.12; g.add(h);
    const cv = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.008, 0.22), coverMat); cv.position.set(side * 0.07, -0.004, 0);
    const pgs = new THREE.Mesh(new THREE.BoxGeometry(0.128, 1, 0.2), pageMat); pgs.position.x = side * 0.066;
    h.add(cv, pgs); return pgs;
  };
  U.cover = coverMat; U.right = half(1); U.left = half(-1);
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.22), coverMat); spine.position.y = -0.006; g.add(spine);
  const leaf = new THREE.Group(), s1 = new THREE.Mesh(new THREE.BoxGeometry(0.066, 0.0025, 0.196), pageMat), s2g = new THREE.Group(), s2 = new THREE.Mesh(new THREE.BoxGeometry(0.066, 0.0025, 0.196), pageMat);
  s1.position.x = 0.033; s2.position.x = 0.033; s2g.position.x = 0.066; s2g.add(s2); leaf.add(s1, s2g); leaf.visible = false; g.add(leaf);
  U.leaf = leaf; U.tip = s2g; U.flip = -1; U.lastPage = 0; U.pending = 0;
  world.anglerGroup.add(g); return g;
}
export function setReadProp(id) {
  if (!id) { if (readProp) readProp.visible = false; return; }
  if (!readProp) readProp = buildReadBook();
  readProp.userData.cover.color.setHex(BOOKS[id].color);
  readProp.userData.lastPage = Math.floor(bookPages(id)); readProp.userData.flip = 0; readProp.userData.pending = 0;   // opening the book turns a leaf too
  readProp.visible = true;
}
