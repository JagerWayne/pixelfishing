/* Shop tabs, browse mode, the confirm dialog and the sheet's focus trap. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { releaseAllInputs } from '../sim/joystick.js';
import { showToast } from '../ui/toasts.js';
import { SHOP_KINDS, shopBrowse, shopMoney } from './shop-kinds.js';
import { shopEl, updateShopBrowse } from './shop-pictures.js';
import { ShopUI } from './shop-ui.js';
import { shopAskPrimary, shopBodyRender, shopSheetRender } from './shop-sheet.js';
import { updatePrimaryActionButton } from '../ui/install.js';
import { updateHUD } from '../ui/hud.js';

/* ---- state changes ---- */
export function setShopTab(tab, focusTab) {
  if (shopBrowse.tab === tab) return;
  shopBrowse.tab = tab; closeShopConfirm(); shopSheetRender(); sfx.playTick();
  shopEl('shop-body').scrollTop = 0;
  if (focusTab) { const b = shopEl('shop-tab-' + tab); if (b) b.focus(); }
}
let shopReturnFocus = null;
export function enterShopBrowse(kind) {
  if (!SHOP_KINDS[kind] || shopBrowse.active) return;
  const sk = SHOP_KINDS[kind];
  shopBrowse.active = true; shopBrowse.kind = kind; shopBrowse.tab = sk.tabs ? sk.tabs[0][0] : ''; shopBrowse.items = [];
  shared.mode = 'SHOP_BROWSE'; releaseAllInputs();
  shopReturnFocus = document.activeElement;
  document.body.dataset.shopping = '1';
  shopSheetRender(); sfx.playTick();
  ShopUI.announce(`${shopEl('shop-name').textContent} open.`);
  requestAnimationFrame(() => { const f = shopEl('shop-tab-' + shopBrowse.tab) || shopEl('shop-leave'); if (f && shopBrowse.active) f.focus({ preventScroll: true }); });
}
export function leaveShopBrowse() {
  if (!shopBrowse.active) return;
  closeShopConfirm();
  shopBrowse.active = false; shopBrowse.items = [];
  delete document.body.dataset.shopping;
  if (shared.mode === 'SHOP_BROWSE') shared.mode = 'PIER_IDLE';
  if (document.activeElement && shopEl('shop-ui').contains(document.activeElement)) document.activeElement.blur();
  if (shopReturnFocus && shopReturnFocus.isConnected && shopReturnFocus !== document.body) try { shopReturnFocus.focus({ preventScroll: true }); } catch (e) {}
  shopReturnFocus = null;
  updateShopBrowse(0);
  updateHUD(); updatePrimaryActionButton();
}
/* after anything changed (a purchase, a sale, a cheat): redraw, keeping the scroll position and the focused button */
export function refreshShopBrowse() {
  if (!shopBrowse.active) return;
  const body = shopEl('shop-body'), top = body.scrollTop, a = document.activeElement, key = a && a.dataset ? a.dataset.k : null;
  shopBodyRender();
  body.scrollTop = top;
  if (key) {   // the same button, or (bought, now disabled) the next one that can still be used
    const all = [...body.querySelectorAll('button[data-k]')], b = body.querySelector(`[data-k="${key}"]`), i = all.indexOf(b);
    const next = b && !b.disabled ? b : (i >= 0 ? all.slice(i + 1).concat(all.slice(0, i).reverse()).find(x => !x.disabled) : null);
    (next || shopEl('shop-tab-' + shopBrowse.tab) || shopEl('shop-leave')).focus({ preventScroll: true });
  }
}
/* every purchase or sale is confirmed first; focus moves into the question and back afterwards */
let confirmReturn = null;
export function shopAsk(it) {
  if (!it.can) { showToast(it.note || it.badge || 'Not available.'); return; }
  const after = it.price != null && it.verb !== 'Sell' ? shared.state.cash - it.price : shared.state.cash + (it.price || 0);
  shopEl('shop-confirm-title').textContent = it.confirm;
  shopEl('shop-confirm-sub').textContent = it.price != null ? `Cash ${shopMoney(shared.state.cash)} → ${shopMoney(after)}` : '';
  const yes = shopEl('shop-confirm-yes'); yes.textContent = it.verb === 'Sell' ? 'Yes' : it.verb;
  yes.classList.toggle('sell', it.verb === 'Sell');
  confirmReturn = document.activeElement;
  shopBrowse.pending = it; shopBrowse.armedAt = performance.now() + 450;   // ignore the touch's own follow-up click
  shopEl('shop-confirm').classList.add('open');
  requestAnimationFrame(() => yes.focus({ preventScroll: true }));
}
function closeShopConfirm() {
  const was = !!shopBrowse.pending; shopBrowse.pending = null; const c = shopEl('shop-confirm'); if (c) c.classList.remove('open');
  if (was && confirmReturn && confirmReturn.isConnected && shopBrowse.active) confirmReturn.focus({ preventScroll: true });
  confirmReturn = null;
}
function shopConfirmYes() {
  if (performance.now() < (shopBrowse.armedAt || 0)) return;
  const it = shopBrowse.pending; closeShopConfirm();
  if (!it || !it.can) return;
  it.act();
  ShopUI.announce(`${it.verb === 'Sell' ? 'Done' : it.verb}: ${it.title || ''}. Cash ${shopMoney(shared.state.cash)}.`);
  refreshShopBrowse();
}
/* keys while a sheet is open: the game never sees them */
const focusables = root => [...root.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])')].filter(el => !el.disabled && el.offsetParent !== null);
function trapTab(root, e) {
  const f = focusables(root); if (!f.length) return;
  const i = f.indexOf(document.activeElement), n = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i < 0 || i >= f.length - 1 ? 0 : i + 1);
  e.preventDefault(); f[n].focus();
}

export function init() {
  shopEl('shop-leave').addEventListener('click', () => leaveShopBrowse());
  shopEl('shop-confirm-no').addEventListener('click', () => { if (performance.now() >= (shopBrowse.armedAt || 0)) closeShopConfirm(); });
  shopEl('shop-confirm-yes').addEventListener('click', shopConfirmYes);
  shopEl('shop-confirm').addEventListener('click', e => { if (e.target.id === 'shop-confirm' && performance.now() >= (shopBrowse.armedAt || 0)) closeShopConfirm(); });
  window.addEventListener('keydown', e => {
    if (!shopBrowse.active) return;
    const t = e.target, onBtn = t && t.tagName === 'BUTTON' && shopEl('shop-ui').contains(t);
    if (shopBrowse.pending) {
      if (e.code === 'Escape') closeShopConfirm();
      else if (e.code === 'Tab') trapTab(shopEl('shop-confirm'), e);
      else if (e.code === 'KeyE' || ((e.code === 'Enter' || e.code === 'Space') && !onBtn)) { e.preventDefault(); shopConfirmYes(); }
      e.stopImmediatePropagation(); return;
    }
    const tabs = [...shopEl('shop-tabs').querySelectorAll('[role="tab"]')], ids = (SHOP_KINDS[shopBrowse.kind].tabs || []).map(x => x[0]), ti = ids.indexOf(shopBrowse.tab);
    if (e.code === 'Escape') leaveShopBrowse();
    else if (e.code === 'Tab') trapTab(shopEl('shop-sheet'), e);
    else if (t && t.getAttribute && t.getAttribute('role') === 'tab' && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.code)) {
      e.preventDefault(); const j = e.code === 'Home' ? 0 : e.code === 'End' ? ids.length - 1 : (ti + (e.code === 'ArrowRight' ? 1 : -1) + ids.length) % ids.length;
      setShopTab(ids[j], true);
    } else if ((e.code === 'ArrowLeft' || e.code === 'ArrowRight') && tabs.length > 1 && !onBtn) { e.preventDefault(); setShopTab(ids[(ti + (e.code === 'ArrowRight' ? 1 : -1) + ids.length) % ids.length], true); }
    else if (e.code === 'ArrowDown' || e.code === 'ArrowUp') {
      e.preventDefault(); const f = focusables(shopEl('shop-sheet')).filter(el => el.getAttribute('role') !== 'tab' || el.tabIndex === 0), i = f.indexOf(document.activeElement);
      const n = i < 0 ? 0 : Math.max(0, Math.min(f.length - 1, i + (e.code === 'ArrowDown' ? 1 : -1))); if (f[n]) { f[n].focus(); f[n].scrollIntoView({ block: 'nearest' }); }
    } else if (/^Digit[1-5]$/.test(e.code)) { const id = ids[+e.code.slice(5) - 1]; if (id) setShopTab(id, true); }
    else if (e.code === 'KeyE' && onBtn) { e.preventDefault(); t.click(); }
    else if (e.code === 'KeyE') { e.preventDefault(); const pb = shopEl('shop-sellall'); if (!shopEl('shop-foot').hidden && !pb.disabled) shopAskPrimary(); else { const f = focusables(shopEl('shop-body'))[0]; if (f) f.focus(); } }
    else if ((e.code === 'Enter' || e.code === 'Space') && !onBtn) { e.preventDefault(); const f = focusables(shopEl('shop-body'))[0]; if (f) f.focus(); }
    e.stopImmediatePropagation();
  }, true);
}
