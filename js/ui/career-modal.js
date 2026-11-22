/* Keyboard focus helpers and opening the career modal. */
import { sfx } from '../data/equipment.js';
import { renderCareer } from '../town/aquarium-world.js';
import { updateHUD } from './hud.js';

/* Modal behaviour shared by every sheet: dialog roles, tap outside, swipe down, focus return */
/* Keyboard navigation (v7.1.0): Tab stays inside the open sheet, and closing a sheet returns focus to what opened it */
const kbNav = { on: false };
const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* Market board in the shop: today's hot and glutted fish and the time to the next prices */
/* Career screen: rank, counters and achievements */
export function openCareerModal() {
  renderCareer();
  document.getElementById('modal-career').classList.add('open');
}

export function init() {
  window.addEventListener('keydown', e => { if (e.key === 'Tab' || e.key === 'Enter') kbNav.on = true; }, true);
  window.addEventListener('pointerdown', () => { kbNav.on = false; }, true);
  window.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const open = [...document.querySelectorAll('.modal-backdrop.open')].pop();
    if (!open) return;
    const box = open.querySelector('.modal-window, #talk-box') || open;
    const f = [...box.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null);
    if (!f.length) { e.preventDefault(); box.focus && box.focus(); return; }
    const first = f[0], last = f[f.length - 1], cur = document.activeElement;
    if (!box.contains(cur)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
    else if (e.shiftKey && cur === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && cur === last) { e.preventDefault(); first.focus(); }
  }, true);
  (function enhanceModals() {
    let n = 0;
    document.querySelectorAll('.modal-backdrop').forEach(back => {
      if (back.id === 'modal-catch') return;
      const win = back.querySelector('.modal-window');
      const closeBtn = back.querySelector('[data-close], .modal-header .pixel-btn.red');
      if (!win) return;
      const title = back.querySelector('.modal-title');
      if (title && !title.id) title.id = 'mt-' + (++n);
      // v7.1.0: one close pattern, a round × that names what it closes
      if (closeBtn && closeBtn.closest('.modal-header') && /^\s*close\s*$/i.test(closeBtn.textContent)) {
        closeBtn.classList.add('g-close');
        closeBtn.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-close"/></svg>';
        closeBtn.setAttribute('aria-label', 'Close ' + (title ? title.textContent.replace(/[^\p{L}\p{N} '&-]/gu, '').trim().toLowerCase() : 'menu'));
      }
      win.setAttribute('role', 'dialog');
      win.setAttribute('aria-modal', 'true');
      if (title) win.setAttribute('aria-labelledby', title.id);
      win.tabIndex = -1;
      const dismiss = () => { if (closeBtn) closeBtn.click(); else { back.classList.remove('open'); updateHUD(); } };
      back.addEventListener('pointerdown', e => { back._downOnBackdrop = e.target === back; });
      back.addEventListener('click', e => { if (e.target === back && back._downOnBackdrop) dismiss(); });
      // swipe down on the header or handle
      let startY = null, dy = 0;
      const grab = back.querySelectorAll('.modal-header, .sheet-handle');
      grab.forEach(g => {
        g.addEventListener('pointerdown', e => {
          if (e.target.closest('button')) return;
          startY = e.clientY; dy = 0; g.setPointerCapture(e.pointerId);
        });
        g.addEventListener('pointermove', e => {
          if (startY === null) return;
          dy = Math.max(0, e.clientY - startY);
          win.classList.add('dragging');
          win.style.transform = `translateY(${dy}px)`;
        });
        const end = () => {
          if (startY === null) return;
          startY = null; win.classList.remove('dragging'); win.style.transform = '';
          if (dy > 80) dismiss();
          dy = 0;
        };
        g.addEventListener('pointerup', end);
        g.addEventListener('pointercancel', end);
      });
      // focus in on open, back to the opener on close
      let opener = null, wasOpen = false;
      new MutationObserver(() => {
        const open = back.classList.contains('open');
        if (open && !wasOpen) { opener = document.activeElement; setTimeout(() => win.focus({ preventScroll: true }), 30); }
        if (!open && wasOpen) {
          win.style.transform = '';
          // keyboard users get their place back; on touch the opener just loses focus (Space is the action key)
          if (opener && opener.focus && document.contains(opener)) { try { if (kbNav.on && opener.offsetParent && !document.querySelector('.modal-backdrop.open')) opener.focus({ preventScroll: true }); else opener.blur(); } catch {} }
          opener = null;
        }
        wasOpen = open;
      }).observe(back, { attributes: true, attributeFilter: ['class'] });
    });
  })();

  /* Light tick + buzz on every UI button (never on the action button, joystick or cheat counting) */
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest && e.target.closest('button, .tab-btn');
    if (!b || b.disabled || b.closest('#btn-primary-action, #virtual-joystick, #joy-zone')) return;
    if (b.id === 'btn-primary-action') return;
    sfx.init(); sfx.playTick();
  }, { passive: true });
}
