/* Character customisation: the preview loop (framing, front or back view, expression preview) and the option rows
   of the current tab. Changes go through custChange (customise-history.js) so they can be undone. */
import { shared } from '../state.js';
import { AnglerFactory } from '../angler/angler-factory.js';
import { applyAnglerGender, dressAngler } from '../save/defaults.js';
import { CUST_FRAMES, CUST_TABS, custAnim, custCam, custDragYaw, custDragging, custFrame, custModal, custRenderer,
  custResize, custRig, custScene, initCustPreview } from './customise-preview.js';
import { custChange, custCommit, custForget, custHistory, custRandomRow, custRemember } from './customise-history.js';
import { custRowExtras } from './customise-tools.js';

export let custTabsEl;
/* what the preview shows: an expression to try, and the back instead of the front */
export const custPreview = { expr: 'open', back: false, yawBack: 0 };

function custLoop() {
  if (!custModal.classList.contains('open')) { shared.custLooping = false; return; }
  requestAnimationFrame(custLoop);
  if (!custDragging && shared.custSpin) shared.custYaw += 0.008;
  custPreview.yawBack += ((custPreview.back ? Math.PI : 0) - custPreview.yawBack) * 0.15;
  custRig.root.rotation.y = Math.PI + shared.custYaw + custDragYaw + custPreview.yawBack;
  { const now = performance.now() / 1000; const cdt = shared.custLastT ? Math.min(0.05, now - shared.custLastT) : 0.016; shared.custLastT = now; if (custAnim) custAnim.update({ dt: cdt, elapsed: now, speed: 0, idleAllowed: true, expr: custPreview.expr }); }
  const f = CUST_FRAMES[shared.custView] || CUST_FRAMES.body;
  custFrame.y += (f.y - custFrame.y) * 0.12; custFrame.z += (f.z - custFrame.z) * 0.12; custFrame.ly += (f.ly - custFrame.ly) * 0.12;
  custCam.position.set(0, custFrame.y, custFrame.z);
  custCam.lookAt(0, custFrame.ly, 0);
  custRenderer.render(custScene, custCam);
}

const redressSoon = (() => { let tm = 0; return (ms) => { clearTimeout(tm); tm = setTimeout(() => { dressAngler(); if (custRig) AnglerFactory.dress(custRig, shared.state.look); }, ms); }; })();
const btn = (cls, text, aria, onClick) => {
  const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = text;
  if (aria) b.setAttribute('aria-label', aria);
  b.addEventListener('click', onClick); return b;
};

function rowControls(row, tab, look) {
  const line = document.createElement('div');
  line.className = row.kind === 'swatch' ? 'cust-swatches' : 'chip-row';
  if (row.kind === 'slider') {   // a labelled range input that rebuilds the preview as it moves (one undo step per drag)
    const v = Number.isFinite(look[row.key]) ? look[row.key] : (row.min + row.max) / 2;
    line.className = 'cust-slider';
    line.innerHTML = `<span>${row.lo}</span><input type="range" min="${row.min}" max="${row.max}" step="${row.step}" value="${v}" aria-label="${row.label}"><span>${row.hi}</span>`;
    const inp = line.querySelector('input'); let started = false;
    inp.addEventListener('input', () => { if (!started) { custRemember(); started = true; syncHistoryButtons(); } shared.state.look[row.key] = Number(inp.value); redressSoon(60); });
    inp.addEventListener('change', () => { started = false; custCommit(); });
    return line;
  }
  if (row.kind === 'gender') {
    [['male', '🧔 Male'], ['female', '👩 Female']].forEach(([g, label]) => {
      const b = btn('pixel-btn' + (look.gender === g ? ' active gold' : ''), label, `Starting look: ${label.slice(2).trim()}`, () => custChange(() => applyAnglerGender(g, false)));
      b.setAttribute('aria-pressed', String(look.gender === g)); line.appendChild(b);
    });
    return line;
  }
  if (row.kind === 'presets') {
    row.list.forEach(([id, label]) => line.appendChild(btn('pixel-btn', label, `Wear the ${label.replace(/^\S+\s/, '')} outfit`, () => custChange(() => { shared.state.look = AnglerFactory.applyPreset(shared.state.look, id); }))));
    return line;
  }
  if (row.kind === 'share') return custRowExtras.share(line);
  if (row.kind === 'name') return custRowExtras.name(line);
  if (row.same) {   // "same as the hair" swatch
    line.appendChild(btn('cust-swatch cust-same' + (look[row.key] === -1 && !look[row.hex] ? ' active' : ''), '=', `${row.label}: same as the hair`,
      () => custChange(L => { L[row.key] = -1; delete L[row.hex]; })));
  }
  row.list.forEach((entry, i) => {
    if (row.kind === 'swatch') {
      const on = look[row.key] === i && !(row.hex && look[row.hex]);
      const b = btn('cust-swatch' + (on ? ' active' : ''), '', `${row.label}: colour ${i + 1}`, () => custChange(L => { L[row.key] = i; if (row.hex) delete L[row.hex]; }));
      b.style.background = entry; b.setAttribute('aria-pressed', String(on)); line.appendChild(b);
      return;
    }
    const on = look[row.key] === entry[0];
    const b = btn('pixel-btn' + (on ? ' active gold' : ''), entry[1], `${row.label}: ${entry[1]}`, () => custChange(L => { L[row.key] = entry[0]; }));
    b.setAttribute('aria-pressed', String(on));
    if (row.key === 'hairStyle' && AnglerFactory.blockedHair(look.hat).includes(entry[0])) { b.disabled = true; b.title = 'Not available with this hat'; }
    line.appendChild(b);
  });
  if (row.kind === 'swatch' && row.hex) line.appendChild(custRowExtras.picker(row, look, redressSoon));
  return line;
}

export function custRefresh() {
  dressAngler();
  if (custRig) AnglerFactory.dress(custRig, shared.state.look);
  const look = shared.state.look, host = document.getElementById('cust-options');
  const tab = CUST_TABS.find(t => t.id === shared.custTab) || CUST_TABS[0];
  host.innerHTML = '';
  tab.rows.forEach(row => {
    const wrap = document.createElement('div');
    wrap.className = 'cust-row';
    const head = document.createElement('div'); head.className = 'cust-row-head';
    head.innerHTML = `<div class="cust-label">${row.label}</div>`;
    if (row.kind === 'chips' || row.kind === 'swatch' || row.kind === 'slider') head.appendChild(btn('cust-dice', '🎲', `Random ${row.label.toLowerCase()}`, () => custRandomRow(row)));
    wrap.appendChild(head);
    wrap.appendChild(rowControls(row, tab, look));
    if (row.note) wrap.insertAdjacentHTML('beforeend', `<div class="cust-hint cust-note">${row.note}</div>`);
    if (row.key === 'hairStyle' && look.hat !== 'none') wrap.insertAdjacentHTML('beforeend', '<div class="cust-hint cust-note">Some hair styles are unavailable while wearing a hat. Choose "None" for the hat to use them.</div>');
    // touching a row frames its part of the character
    wrap.addEventListener('pointerdown', () => { shared.custView = row.frame || tab.frame; });
    wrap.addEventListener('focusin', () => { shared.custView = row.frame || tab.frame; });
    host.appendChild(wrap);
  });
  document.querySelectorAll('#cust-tabs .tab-btn').forEach(b => { const on = b.dataset.tab === shared.custTab; b.classList.toggle('active', on); b.setAttribute('aria-selected', String(on)); });
  syncHistoryButtons();
}

export function syncHistoryButtons() {
  const u = document.getElementById('cust-undo'), r = document.getElementById('cust-redo');
  if (u) u.disabled = !custHistory.undo.length;
  if (r) r.disabled = !custHistory.redo.length;
}

export function openCustomize() {
  initCustPreview();
  custForget();
  custModal.classList.add('open');
  shared.custView = (CUST_TABS.find(t => t.id === shared.custTab) || CUST_TABS[0]).frame;
  custResize();
  custRefresh();
  if (!shared.custLooping) { shared.custLooping = true; requestAnimationFrame(custLoop); }
}

export function init() {
  custTabsEl = document.getElementById('cust-tabs');
}
