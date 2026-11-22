/* Character customisation: the preview loop, the option rows, opening the screen and its buttons. */
import { shared } from '../state.js';
import { AnglerFactory } from '../angler/angler-factory.js';
import { dressAngler } from '../save/defaults.js';
import { CUST_FRAMES, CUST_TABS, custAnim, custCam, custDragYaw, custDragging, custFrame, custModal, custRenderer,
  custResize, custRig, custScene, initCustPreview } from './customise-preview.js';
import { saveGame } from '../save/save-game.js';

export let custTabsEl;

function custLoop() {
  if (!custModal.classList.contains('open')) { shared.custLooping = false; return; }
  requestAnimationFrame(custLoop);
  if (!custDragging && shared.custSpin) shared.custYaw += 0.008;
  custRig.root.rotation.y = Math.PI + shared.custYaw + custDragYaw;
  { const now = performance.now() / 1000; const cdt = shared.custLastT ? Math.min(0.05, now - shared.custLastT) : 0.016; shared.custLastT = now; if (custAnim) custAnim.update({ dt: cdt, elapsed: now, speed: 0, idleAllowed: true }); }
  const f = CUST_FRAMES[shared.custTab] || CUST_FRAMES.body;
  custFrame.y += (f.y - custFrame.y) * 0.12; custFrame.z += (f.z - custFrame.z) * 0.12; custFrame.ly += (f.ly - custFrame.ly) * 0.12;
  custCam.position.set(0, custFrame.y, custFrame.z);
  custCam.lookAt(0, custFrame.ly, 0);
  custRenderer.render(custScene, custCam);
}

export function custRefresh() {
  dressAngler();
  if (custRig) AnglerFactory.dress(custRig, shared.state.look);
  const female = shared.state.look.gender === 'female';
  document.getElementById('cust-gender-male').classList.toggle('green', !female);
  document.getElementById('cust-gender-female').classList.toggle('green', female);
  const host = document.getElementById('cust-options');
  host.innerHTML = '';
  const tab = CUST_TABS.find(t => t.id === shared.custTab) || CUST_TABS[0];
  tab.rows.forEach(row => {
    const wrap = document.createElement('div');
    wrap.className = 'cust-row';
    wrap.innerHTML = `<div class="cust-label">${row.label}</div>`;
    if (row.kind === 'slider') {   // v9.1.0: a labelled range input that rebuilds the preview as it moves
      const v = Number.isFinite(shared.state.look[row.key]) ? shared.state.look[row.key] : (row.min + row.max) / 2;
      const sl = document.createElement('div'); sl.className = 'cust-slider';
      sl.innerHTML = `<span>${row.lo}</span><input type="range" min="${row.min}" max="${row.max}" step="${row.step}" value="${v}" aria-label="${row.label}"><span>${row.hi}</span>`;
      const inp = sl.querySelector('input'); let tm = 0;
      inp.addEventListener('input', () => { shared.state.look[row.key] = Number(inp.value); clearTimeout(tm); tm = setTimeout(() => { dressAngler(); if (custRig) AnglerFactory.dress(custRig, shared.state.look); }, 60); });
      inp.addEventListener('change', () => { saveGame(); });
      wrap.appendChild(sl); host.appendChild(wrap); return;
    }
    const line = document.createElement('div');
    line.className = row.kind === 'swatch' ? 'cust-swatches' : 'chip-row';
    if (row.same) {   // "same as the hair" swatch
      const b0 = document.createElement('button'); b0.type = 'button';
      b0.className = 'cust-swatch cust-same' + (shared.state.look[row.key] === -1 && !shared.state.look[row.hex] ? ' active' : '');
      b0.textContent = '='; b0.setAttribute('aria-label', `${row.label}: same as the hair`);
      b0.onclick = () => { shared.state.look[row.key] = -1; delete shared.state.look[row.hex]; saveGame(); custRefresh(); };
      line.appendChild(b0);
    }
    (row.list || []).forEach((entry, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      if (row.kind === 'presets') {
        b.className = 'pixel-btn';
        b.textContent = entry[1];
        b.onclick = () => { shared.state.look = AnglerFactory.applyPreset(shared.state.look, entry[0]); saveGame(); custRefresh(); };
      } else if (row.kind === 'swatch') {
        b.className = 'cust-swatch' + (shared.state.look[row.key] === i && !(row.hex && shared.state.look[row.hex]) ? ' active' : '');
        b.style.background = entry; b.setAttribute('aria-label', `${row.label} ${i + 1}`);
        b.onclick = () => { shared.state.look[row.key] = i; if (row.hex) delete shared.state.look[row.hex]; saveGame(); custRefresh(); };
      } else {
        b.className = 'pixel-btn' + (shared.state.look[row.key] === entry[0] ? ' active gold' : '');
        b.textContent = entry[1];
        if (row.key === 'hairStyle' && AnglerFactory.blockedHair(shared.state.look.hat).includes(entry[0])) {
          b.disabled = true; b.title = 'Not available with this hat';
        }
        b.onclick = () => {
          shared.state.look[row.key] = entry[0];
          shared.state.look = AnglerFactory.sanitizeLook(shared.state.look, shared.state.look.gender); // a hat that clashes with the hair switches the hair
          saveGame(); custRefresh();
        };
      }
      line.appendChild(b);
    });
    if (row.kind === 'swatch' && row.hex) {   // v9.1.0: any colour at all, from the system colour picker
      const pk = document.createElement('label'); pk.className = 'cust-swatch cust-pick' + (shared.state.look[row.hex] ? ' active' : '');
      pk.title = 'Pick any colour';
      const cur = shared.state.look[row.hex] || (row.list[shared.state.look[row.key]] || '#888888');
      pk.innerHTML = `<input type="color" value="${cur}" aria-label="${row.label}: pick any colour">`;
      pk.style.background = shared.state.look[row.hex] || 'conic-gradient(#f43f5e, #fbbf24, #4ade80, #22d3ee, #6366f1, #f43f5e)';
      const ci = pk.querySelector('input'); let tm = 0;
      ci.addEventListener('input', () => { shared.state.look[row.hex] = ci.value.toLowerCase(); pk.style.background = ci.value; clearTimeout(tm); tm = setTimeout(() => { dressAngler(); if (custRig) AnglerFactory.dress(custRig, shared.state.look); }, 80); });
      ci.addEventListener('change', () => { saveGame(); custRefresh(); });
      line.appendChild(pk);
    }
    wrap.appendChild(line);
    if (row.key === 'hairStyle' && shared.state.look.hat !== 'none') {
      const note = document.createElement('div');
      note.className = 'cust-hint'; note.style.textAlign = 'left'; note.style.marginTop = '6px';
      note.textContent = 'Some hair styles are unavailable while wearing a hat. Choose "None" for the hat to use them.';
      wrap.appendChild(note);
    }
    host.appendChild(wrap);
  });
  document.querySelectorAll('#cust-tabs .tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === shared.custTab));
}

export function openCustomize() {
  initCustPreview();
  custModal.classList.add('open');
  { const ni = document.getElementById('cust-name'); ni.value = shared.state.playerName || ''; }
  custResize();
  custRefresh();
  if (!shared.custLooping) { shared.custLooping = true; requestAnimationFrame(custLoop); }
}

export function init() {
  custTabsEl = document.getElementById('cust-tabs');
}
