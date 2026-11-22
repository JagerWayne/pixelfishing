/* Character customisation: every change goes through custChange, which remembers the look before it for Undo and
   Redo (the last 20 changes), plus a random value for one row and the look codes (PF1- share codes of a look). */
import { shared } from '../state.js';
import { AnglerFactory } from '../angler/angler-factory.js';
import { saveGame } from '../save/save-game.js';
import { custRefresh } from './customise.js';

const LIMIT = 20;
export const custHistory = { undo: [], redo: [] };
const snap = () => JSON.stringify(shared.state.look);
const tidy = () => { shared.state.look = AnglerFactory.sanitizeLook(shared.state.look, shared.state.look.gender); };

/* call before a change that is applied bit by bit (a slider drag, the colour picker); custChange does it itself */
export function custRemember() {
  const s = snap();
  if (custHistory.undo[custHistory.undo.length - 1] !== s) custHistory.undo.push(s);
  if (custHistory.undo.length > LIMIT) custHistory.undo.shift();
  custHistory.redo.length = 0;
}

/* one change: remember, change, validate (a hat that clashes with the hair switches the hair), save, redraw */
export function custChange(fn) {
  custRemember();
  fn(shared.state.look);
  tidy();
  saveGame();
  custRefresh();
}

/* the end of a change applied bit by bit (custRemember was called when it started) */
export function custCommit() { tidy(); saveGame(); custRefresh(); }

function step(from, to) {
  if (!from.length) return;
  to.push(snap());
  shared.state.look = JSON.parse(from.pop());
  tidy();
  shared.state.anglerGender = shared.state.look.gender;
  saveGame();
  custRefresh();
}
export const custUndo = () => step(custHistory.undo, custHistory.redo);
export const custRedo = () => step(custHistory.redo, custHistory.undo);
export function custForget() { custHistory.undo.length = 0; custHistory.redo.length = 0; }

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
/* a random value for one row, never the one it already has */
export function custRandomRow(row) {
  custChange(L => {
    if (row.kind === 'slider') {
      const n = Math.round((row.max - row.min) / row.step);
      let v = L[row.key];
      for (let t = 0; t < 8 && Math.abs(v - L[row.key]) < row.step * 3; t++) v = +(row.min + Math.floor(Math.random() * (n + 1)) * row.step).toFixed(3);
      L[row.key] = v;
    } else if (row.kind === 'swatch') {
      const ids = row.list.map((_, i) => i).filter(i => i !== L[row.key]);
      L[row.key] = pick(ids);
      if (row.hex) delete L[row.hex];
    } else if (row.kind === 'chips') {
      let ids = row.list.map(e => e[0]);
      if (row.key === 'hairStyle') ids = ids.filter(id => !AnglerFactory.blockedHair(L.hat).includes(id));
      const others = ids.filter(id => id !== L[row.key]);
      L[row.key] = pick(others.length ? others : ids);
    }
  });
}

/* look codes keep only what differs from the starting look, so they stay short */
export function lookToShare(look) {
  const def = AnglerFactory.defaultLook(look.gender), l = { gender: look.gender };
  Object.keys(look).forEach(k => { if (k !== 'gender' && JSON.stringify(look[k]) !== JSON.stringify(def[k])) l[k] = look[k]; });
  return l;
}
export function lookFromShare(l) {
  if (!l || typeof l !== 'object' || Array.isArray(l)) return null;
  const g = l.gender === 'female' ? 'female' : 'male';
  return AnglerFactory.sanitizeLook(Object.assign(AnglerFactory.defaultLook(g), l, { gender: g }), g);
}
