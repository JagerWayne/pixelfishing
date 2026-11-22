/* The shop sheet: header, tabs, body, lists and the sell or collect prompts. */
import { shared } from '../state.js';
import { BUCKET_TIERS } from '../data/equipment.js';
import { SHORE_SHOPS } from '../world/layout.js';
import { aquariumCollect } from '../town/aquarium-care.js';
import { CATALOG_INDEX } from '../save/career.js';
import { catchOfDay, marketFor, marketMult, sellValue } from '../fishing/market.js';
import { ITEM_ICONS } from '../save/save-game.js';
import { showToast } from '../ui/toasts.js';
import { restoRender } from '../town/resto-sheet.js';
import { SHOP_KINDS, SKIPS, SKIP_OF, isFishEntry, isJunkEntry, sellBucketEntry, sellBucketWhere, shopBrowse, shopMoney } from './shop-kinds.js';
import { shopItems } from './shop-items.js';
import { shopEl } from './shop-pictures.js';
import { ShopUI } from './shop-ui.js';
import { aquaRender } from './books-aquarium.js';
import { setShopTab, shopAsk } from './shop-browse.js';

/* ---- the sheet: header, departments (tabs) and the body ---- */
export function shopSheetRender() {
  const sk = SHOP_KINDS[shopBrowse.kind], sheet = shopEl('shop-sheet');
  const accent = (SHORE_SHOPS[shopBrowse.kind] && SHORE_SHOPS[shopBrowse.kind].color) || { tackle: '#ef4444', fish: '#38bdf8', recycle: '#22c55e', aqua: '#22d3ee', resto: '#dc2626' }[shopBrowse.kind] || '#fbbf24';
  sheet.style.setProperty('--sh-accent', accent);
  const m = /^(\S+)\s+(.*)$/.exec(sk.title) || [null, '', sk.title];
  shopEl('shop-icon').textContent = m[1]; shopEl('shop-name').textContent = m[2].split(':')[0];
  const tabs = shopEl('shop-tabs'); tabs.innerHTML = '';
  (sk.tabs || []).forEach(([id, label]) => {
    const b = document.createElement('button'); b.type = 'button'; b.id = 'shop-tab-' + id; b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', String(id === shopBrowse.tab)); b.setAttribute('aria-controls', 'shop-body'); b.tabIndex = id === shopBrowse.tab ? 0 : -1;
    b.textContent = label; b.addEventListener('click', () => setShopTab(id, true)); tabs.appendChild(b);
  });
  tabs.hidden = (sk.tabs || []).length < 2;
  shopEl('shop-body').setAttribute('aria-labelledby', (sk.tabs || []).length ? 'shop-tab-' + shopBrowse.tab : 'shop-name');
  shopBodyRender();
}
function shopCashRender() { const c = shopEl('shop-cash'); if (c) c.textContent = shopMoney(shared.state.cash); }
export function shopBodyRender() {
  shopCashRender();
  const sk = SHOP_KINDS[shopBrowse.kind];
  if (shopBrowse.tab === 'books' || !sk.list) catalogueRender();
  else if (sk.list === 'aqua') aquaRender();
  else if (sk.list === 'resto') restoRender();
  else shopListRender();
}
/* a catalogue department: every good of the tab as a card (the pictures are rendered one by one, then cached) */
function catalogueRender() {
  const U = ShopUI.begin(); shopBrowse.items = shopItems(shopBrowse.kind, shopBrowse.tab);
  if (!shopBrowse.items.length) U.note('Nothing here yet.');
  shopBrowse.items.forEach(it => U.item(it));
}
/* the bucket list for the Fish Market (fish) and Recycling (junk, by skip) */
function shopListRows() {
  const sk = SHOP_KINDS[shopBrowse.kind], pred = sk.list === 'fish' ? isFishEntry : isJunkEntry;
  const rows = shared.state.bucket.filter(pred);
  return { rows, total: rows.reduce((s, e) => s + sellValue(e), 0), kg: rows.reduce((s, e) => s + e.weight, 0), pred };
}
function shopListRender() {
  const sk = SHOP_KINDS[shopBrowse.kind], L = shopListRows(), cod = catchOfDay(), U = ShopUI.begin();
  const fish = sk.list === 'fish';
  if (fish) {
    const mk = marketFor(shared.state.dayCount || 0), nm = ids => ids.map(id => `${CATALOG_INDEX[id].name} x${mk.mult[id].toFixed(1)}`).join(', ');
    U.summary(`<b>${L.rows.length} fish</b> • ${L.kg.toFixed(1)} kg in your ${BUCKET_TIERS[shared.state.bucketTier - 1].name} • worth <b>${shopMoney(L.total)}</b><br>🔥 Hot: ${nm(mk.hot)}<br>📉 Glut: ${nm(mk.glut)}<br>⭐ Catch of the Day: <b>${cod.name}</b> pays x3`);
  } else {
    const eco = (shared.state.junkRecycledKg || 0) % 100;
    U.summary(`<b>${L.rows.length} piece${L.rows.length === 1 ? '' : 's'}</b> of junk and seaweed • ${L.kg.toFixed(1)} kg • worth <b>${shopMoney(L.total)}</b><br>🏛️ The Mayor pays $1,000 for every 100 kg recycled: ${eco.toFixed(1)} / 100 kg<div class="eco" role="progressbar" aria-label="Recycled towards the Mayor's award" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(eco)}"><i style="width:${Math.min(100, eco)}%"></i></div>`);
  }
  const addRow = entry => {
    const m = marketMult(entry.id), v = sellValue(entry);
    U.row(`<img src="${ITEM_ICONS[entry.id] || ''}" alt=""><span class="sl-n">${entry.name}${entry.id === cod.id ? ' ⭐' : ''}<small>${entry.weight.toFixed(2)} kg${m > 1.1 ? ' • ▲ hot' : m < 0.9 && isFishEntry(entry) ? ' • ▼ glut' : ''}</small></span><span class="sl-p">${shopMoney(v)}</span>`,
      [[fish ? 'Sell' : 'Recycle', 'sell', () => shopAskSell(entry, fish), false, null, `${fish ? 'Sell' : 'Recycle'} ${entry.name}, ${entry.weight.toFixed(2)} kilograms, for ${shopMoney(v)}`]]);
  };
  if (!L.rows.length) U.note(fish ? 'No fish in your bucket. Cast a line, then come back to sell your catch.' : 'No junk or seaweed in your bucket. Fish some up and bring it here.');
  else if (fish) L.rows.slice().sort((a, b) => sellValue(b) - sellValue(a)).forEach(addRow);
  else ['flora', 'metal', 'other'].forEach(k => {
    const g = L.rows.filter(e => SKIP_OF(e) === k); if (!g.length) return;
    U.head(`${SKIPS[k][1]} ${SKIPS[k][0]} skip (${g.length})`, SKIPS[k][2]);
    g.slice().sort((a, b) => sellValue(b) - sellValue(a)).forEach(addRow);
  });
  U.primary(L.rows.length ? `${fish ? 'Sell all fish' : 'Recycle all'} for ${shopMoney(L.total)}` : (fish ? 'No fish to sell' : 'Nothing to recycle'), shopAskAll, !L.rows.length);
}
function shopAskSell(entry, fish) {
  const v = sellValue(entry);
  shopAsk({ title: entry.name, confirm: `${fish ? 'Sell' : 'Recycle'} ${entry.name} (${entry.weight.toFixed(2)} kg) for ${shopMoney(v)}?`, price: v, verb: 'Sell', can: true,
    act: () => { const i = shared.state.bucket.indexOf(entry); if (i >= 0) { sellBucketEntry(i); showToast(`${fish ? 'Sold' : 'Recycled'} ${entry.name} for ${shopMoney(v)}`); } } });
}
export function aquaAskCollect() {
  const aq = shared.state.aquarium; if (aq.tickets < 1) return;
  shopAsk({ title: 'visitor tickets', confirm: `Collect ${shopMoney(aq.tickets)} in visitor tickets?`, price: aq.tickets, verb: 'Sell', can: true, act: aquariumCollect });
}
export function shopAskPrimary() { const pb = shopEl('shop-sellall'); if (!shopEl('shop-foot').hidden && !pb.disabled && pb.onclick) pb.onclick(); }
function shopAskAll() {
  const sk = SHOP_KINDS[shopBrowse.kind], fish = sk.list === 'fish', L = shopListRows();
  if (!L.rows.length) return;
  shopAsk({ title: fish ? 'all your fish' : 'all your junk', confirm: `${fish ? 'Sell all' : 'Recycle all'} ${L.rows.length} ${fish ? 'fish' : 'pieces'} for ${shopMoney(L.total)}?`, price: L.total, verb: 'Sell', can: true,
    act: () => sellBucketWhere(L.pred, fish ? 'Sold' : 'Recycled') });
}
