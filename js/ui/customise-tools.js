/* Character customisation: the tab bar, the preview tools (undo, redo, random, reset, spin, back view, expressions),
   the name box, the colour picker and look-code rows, keyboard shortcuts, and the buttons that open the screen. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { AnglerFactory } from '../angler/angler-factory.js';
import { cleanName } from '../data/recipes.js';
import { CUST_TABS, custModal, custResize } from './customise-preview.js';
import { custPreview, custRefresh, custTabsEl, openCustomize, syncHistoryButtons } from './customise.js';
import { custChange, custCommit, custRedo, custRemember, custUndo, lookToShare } from './customise-history.js';
import { copyText, decodeShare, encodeShare } from '../town/trophy-wall.js';
import { showToast } from './toasts.js';
import { updateHUD } from './hud.js';
import { saveGame } from '../save/save-game.js';

const RAINBOW = 'conic-gradient(#f43f5e, #fbbf24, #4ade80, #22d3ee, #6366f1, #f43f5e)';
const keepKeys = el => ['keydown', 'keyup', 'keypress'].forEach(t => el.addEventListener(t, e => e.stopPropagation()));   // typing never reaches the game

/* row builders used by custRefresh for the rows that need more than buttons */
export const custRowExtras = {
  /* any colour at all, from the system colour picker (one undo step per pick) */
  picker(row, look, redressSoon) {
    const pk = document.createElement('label');
    pk.className = 'cust-swatch cust-pick' + (look[row.hex] ? ' active' : '');
    pk.title = 'Pick any colour';
    const cur = look[row.hex] || (row.list[look[row.key]] || '#888888');
    pk.innerHTML = `<input type="color" value="${cur}" aria-label="${row.label}: pick any colour">`;
    pk.style.background = look[row.hex] || RAINBOW;
    const ci = pk.querySelector('input'); let started = false;
    ci.addEventListener('input', () => {
      if (!started) { custRemember(); started = true; syncHistoryButtons(); }
      shared.state.look[row.hex] = ci.value.toLowerCase(); pk.style.background = ci.value; redressSoon(80);
    });
    ci.addEventListener('change', () => { started = false; custCommit(); });
    return pk;
  },
  /* the name box (Body tab): saved as you type, never part of undo */
  name(line) {
    line.className = 'cust-name-row';
    line.innerHTML = '<input id="cust-name" type="text" maxlength="16" autocomplete="off" spellcheck="false" placeholder="Type your name" enterkeyhint="done" aria-label="Your name">';
    const ni = line.firstChild; ni.value = shared.state.playerName || '';
    keepKeys(ni);
    ni.addEventListener('keydown', e => { if (e.key === 'Enter') ni.blur(); });
    ni.addEventListener('input', () => { shared.state.playerName = cleanName(ni.value); saveGame(); });
    ni.addEventListener('blur', () => { ni.value = shared.state.playerName || ''; });
    return line;
  },
  /* look codes: copy yours, or paste a friend's and wear it */
  share(line) {
    line.className = 'cust-share';
    line.innerHTML = `<div class="cust-hint cust-note">Send your look to a friend: they paste the code here, or at the Post Office.</div>
      <button type="button" class="pixel-btn" id="cust-code-make">📋 Copy my look code</button>
      <textarea id="cust-code" class="town-in" rows="3" placeholder="PF1-..." aria-label="Look code" spellcheck="false"></textarea>
      <button type="button" class="pixel-btn gold" id="cust-code-wear">👕 Wear this look</button>`;
    const ta = line.querySelector('#cust-code'); keepKeys(ta);
    line.querySelector('#cust-code-make').addEventListener('click', () => {
      const code = encodeShare({ t: 'look', l: lookToShare(shared.state.look), from: cleanName(shared.state.playerName) });
      ta.value = code; copyText(code);
    });
    line.querySelector('#cust-code-wear').addEventListener('click', () => {
      const o = decodeShare(ta.value);
      if (!o || o.t !== 'look') { showToast('👕 That is not a look code.'); return; }
      custChange(() => { shared.state.look = o.look; shared.state.anglerGender = o.look.gender; });
      showToast(`👕 Wearing ${o.from ? o.from + "'s" : 'the'} look. Undo brings yours back.`);
    });
    return line;
  },
};

function setExpr(expr) {
  custPreview.expr = expr;
  document.querySelectorAll('.cust-faces [data-expr]').forEach(b => { const on = b.dataset.expr === expr; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
}

export function init() {
  CUST_TABS.forEach(t => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pixel-btn tab-btn'; b.dataset.tab = t.id; b.textContent = t.label;
    b.setAttribute('role', 'tab');
    b.addEventListener('click', () => { shared.custTab = t.id; shared.custView = t.frame; custRefresh(); });
    custTabsEl.appendChild(b);
  });
  const on = (id, fn) => document.getElementById(id).addEventListener('click', fn);
  on('cust-undo', custUndo);
  on('cust-redo', custRedo);
  on('cust-random', () => { custChange(() => { shared.state.look = AnglerFactory.randomLook(shared.state.look.gender); }); sfx.playCoin(); });
  on('cust-reset', () => custChange(() => { shared.state.look = AnglerFactory.defaultLook(shared.state.look.gender); }));
  on('cust-spin', e => {
    shared.custSpin = !shared.custSpin;
    e.currentTarget.textContent = shared.custSpin ? '⏸' : '▶'; e.currentTarget.setAttribute('aria-label', shared.custSpin ? 'Stop turning' : 'Turn round');
  });
  on('cust-back', e => {
    custPreview.back = !custPreview.back;
    e.currentTarget.setAttribute('aria-pressed', String(custPreview.back));
    e.currentTarget.setAttribute('aria-label', custPreview.back ? 'Front view' : 'Back view');
  });
  document.querySelectorAll('.cust-faces [data-expr]').forEach(b => b.addEventListener('click', () => setExpr(b.dataset.expr)));
  // Ctrl/Cmd+Z undoes, Ctrl+Shift+Z or Ctrl+Y redoes (not while typing)
  document.addEventListener('keydown', e => {
    if (!custModal.classList.contains('open') || !(e.ctrlKey || e.metaKey) || /INPUT|TEXTAREA/.test(e.target.tagName) && e.target.type !== 'range') return;
    const k = e.key.toLowerCase();
    if (k === 'z' && !e.shiftKey) { e.preventDefault(); custUndo(); }
    else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); custRedo(); }
  });
  on('cust-close', () => { custModal.classList.remove('open'); setExpr('open'); updateHUD(); });
  [['btn-start-customize', true], ['btn-drawer-customize', false], ['set-customize', false]].forEach(([id, stop]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', e => {
      if (stop) e.stopPropagation();
      document.getElementById('modal-settings').classList.remove('open');
      sfx.init(); openCustomize();
    });
  });
  window.addEventListener('resize', () => { if (custModal.classList.contains('open')) custResize(); });
}
