/* The reading list and the aquarium sheet. */
import { shared } from '../state.js';
import { ZONES } from '../data/catalog.js';
import { AQUARIUM_DECOR, AQUARIUM_FORMS, AQUARIUM_MAX_W, aquaBankCap, aquaHappy, aquaIncome, aquaTankOf, aquaUsed,
  aquariumAdd, aquariumCanHold, aquariumTakeOut } from '../town/aquarium.js';
import { aquaDecorOwned, aquariumClean, aquariumFeed, aquariumPlaceDecor, aquariumRelease, aquariumRemoveDecor,
  releaseBonus } from '../town/aquarium-care.js';
import { BOOKS, BOOK_PAGES, bookOwned, bookPages, bookPerkText, bookProgress } from '../town/books.js';
import { startReading } from '../town/reading.js';
import { CATALOG_INDEX } from '../save/career.js';
import { ITEM_ICONS } from '../save/save-game.js';
import { shopBrowse, shopMoney } from './shop-kinds.js';
import { ShopUI } from './shop-ui.js';
import { aquaAskCollect } from './shop-sheet.js';
import { refreshShopBrowse, shopAsk } from './shop-browse.js';
import { updateHUD } from '../ui/hud.js';

/* ---- the reading list on a bench ---- */
export function openBooksModal() {
  const host = document.getElementById('books-list'); host.innerHTML = '';
  const owned = Object.keys(BOOKS).filter(bookOwned);
  if (!owned.length) host.innerHTML = '<p style="color:var(--text-2); text-align:center;">No books yet. Every shop sells one.</p>';
  owned.forEach(id => {
    const b = BOOKS[id], pr = bookProgress(id), done = pr >= 1, card = document.createElement('div');
    card.className = `shop-card ${done ? 'equipped' : ''}`;
    card.innerHTML = `<div><div class="card-title"><span>${b.icon} ${b.title}</span><span style="color:var(--gold);">${(pr * 100).toFixed(1)}%</span></div>
            <div class="card-stats"><b>${bookPages(id).toFixed(1)} / ${BOOK_PAGES} pages</b>${done ? ' • Finished' : ''}<br>${b.perks.map(p => bookPerkText(b, p)).join('<br>')}</div>
            <div class="bar-wrap" style="height:8px; margin-top:6px;"><div class="bar-fill" style="width:${(pr * 100).toFixed(1)}%; background:var(--ok);"></div></div></div>`;
    const btn = document.createElement('button'); btn.className = done ? 'pixel-btn' : 'pixel-btn green'; btn.disabled = done;
    btn.textContent = done ? 'Finished' : 'Read';
    btn.onclick = () => { document.getElementById('modal-books').classList.remove('open'); startReading(id); updateHUD(); };
    card.appendChild(btn); host.appendChild(card);
  });
  document.getElementById('modal-books').classList.add('open');
}

/* ---- the aquarium sheet: Fish | Add | Care | Decor ---- */
export function aquaRender() {
  const aq = shared.state.aquarium, tab = shopBrowse.tab, U = ShopUI.begin();
  const t = aquaTankOf(aq), used = aquaUsed(aq), happy = aquaHappy(aq), inc = aquaIncome(aq);
  const bar = (v, c, label) => `<span class="bar" role="img" aria-label="${label} ${Math.round(v)}%"><i style="width:${Math.round(v)}%;background:${c}"></i></span>`;
  U.summary(`<b>${t.name}</b> • ${aq.fish.length} fish • room ${used.toFixed(1)} / ${t.cap} • biggest fish ${t.maxW} kg<br>🍤 Food ${bar(aq.food, '#f59e0b', 'Food')} 🧽 Clean ${bar(aq.clean, '#22d3ee', 'Clean')} 😊 Happy ${bar(happy, happy < 35 ? '#ef4444' : '#22c55e', 'Happy')}<br>🎟️ ${shopMoney(aq.tickets)} waiting • ${shopMoney(inc)} a day • the bank holds ${shopMoney(aquaBankCap(aq))}${happy < 35 ? '<br>😟 The fish are unhappy and earn nothing: feed them and clean the tank.' : ''}`);
  const mk = U.row, msg = U.note;
  const icon = id => `<img src="${ITEM_ICONS[id] || ''}" alt="">`;
  if (tab === 'fish') {
    if (!aq.fish.length) msg('The tank is empty. Catch a small fish, keep it in your bucket and add it on the Add tab. Big fish will not fit.');
    aq.fish.forEach(f => {
      const it = CATALOG_INDEX[f.id], form = AQUARIUM_FORMS[f.form] || AQUARIUM_FORMS.normal;
      const seaGood = f.form !== 'normal' && !f.g, hz = (it.zones || [1])[0];
      mk(`${icon(f.id)}<span class="sl-n">${form.name ? form.name + ' ' : ''}${it.name}<small>${f.w.toFixed(2)} kg • worth ${shopMoney(f.v)}${f.g ? ' • growing' : ''}${form.mult > 1 ? ' • x' + form.mult + ' tickets' : ''}${seaGood ? ` • release to sea: +1.5% rare fish in ${ZONES[hz - 1].name}` : ''}</small></span>`,
        [['Bucket', 'ghost', () => shopAsk({ title: it.name, confirm: `Take ${it.name} (${f.w.toFixed(2)} kg) out of the tank and back into your bucket?`, price: null, verb: 'Take out', can: true, act: () => { const j = aq.fish.indexOf(f); if (j >= 0) aquariumTakeOut(j); } })],
         [seaGood ? 'Release to sea' : 'Release', seaGood ? 'buy' : 'danger', () => shopAsk({ title: it.name, confirm: seaGood ? `Release your ${form.name} ${it.name} to the sea? Rare fish become a little more common in ${ZONES[hz - 1].name} (now +${(releaseBonus(hz) * 100).toFixed(1)}%, up to +15%).` : `Release ${it.name} into the sea? It will not come back.`, price: null, verb: 'Release', can: true, act: () => { const j = aq.fish.indexOf(f); if (j >= 0) aquariumRelease(j); } })]]);
    });
  } else if (tab === 'add') {
    const fish = shared.state.bucket.filter(e => e.category === 'Fish');
    if (!fish.length) msg('No fish in your bucket. Small fish (up to ' + AQUARIUM_MAX_W + ' kg) can go in the tank.');
    fish.forEach(e => {
      const c = aquariumCanHold(e, aq);
      mk(`${icon(e.id)}<span class="sl-n">${e.name}<small>${Number(e.weight).toFixed(2)} kg • ${c.ok ? 'fits the tank' : c.reason}</small></span>`,
        [['Add', '', () => shopAsk({ title: e.name, confirm: `Put ${e.name} (${Number(e.weight).toFixed(2)} kg) in your aquarium?`, price: null, verb: 'Add', can: true, act: () => aquariumAdd(e) }), !c.ok]]);
    });
  } else if (tab === 'care') {
    mk(`<span class="sl-n">🍤 Fish flakes<small>Free. Food +35.</small></span>`, [['Feed', '', () => { aquariumFeed(false); ShopUI.announce('Fed the fish.'); refreshShopBrowse(); }]]);
    mk(`<span class="sl-n">🥫 Premium pellets<small>Fills the food bar. ${aq.pellets} left${aq.pellets ? '' : ' (sold at the Aquarium Shop)'}.</small></span>`, [['Feed', '', () => { aquariumFeed(true); ShopUI.announce('Fed premium pellets.'); refreshShopBrowse(); }, aq.pellets < 1]]);
    mk(`<span class="sl-n">🧽 Clean the tank<small>Free. Scrubs the glass and the water.</small></span>`, [['Clean', '', () => { aquariumClean(false); ShopUI.announce('Tank cleaned.'); refreshShopBrowse(); }]]);
    mk(`<span class="sl-n">🧴 Deep clean<small>Spotless, and the tank stays clean twice as long for 3 days. ${aq.kits} kit${aq.kits === 1 ? '' : 's'} left${aq.cleanBoost ? ` • active: ${aq.cleanBoost} day${aq.cleanBoost === 1 ? '' : 's'}` : ''}.</small></span>`, [['Use', '', () => { aquariumClean(true); ShopUI.announce('Deep clean done.'); refreshShopBrowse(); }, aq.kits < 1]]);
    mk(`<span class="sl-n">🐣 Breeding<small>Two or more happy fish of one species can have fry now and then (maybe a rare colour). ${aq.bred} hatched, ${aq.forms.length} colour form${aq.forms.length === 1 ? '' : 's'} so far.</small></span>`);
    U.primary(aq.tickets >= 1 ? `Collect ${shopMoney(aq.tickets)}` : 'Nothing to collect yet', aquaAskCollect, aq.tickets < 1);
  } else if (tab === 'decor') {
    const owned = AQUARIUM_DECOR.filter(d => aquaDecorOwned(d.id)), full = aq.decor.length >= t.decor;
    msg(`${aq.decor.length} / ${t.decor} slots used.`);
    if (!owned.length) msg('No decorations yet. The Aquarium Shop sells them.');
    owned.forEach(d => {
      const on = aq.decor.includes(d.id);
      mk(`<span class="sl-n">${d.icon} ${d.name}<small>+${d.charm} charm • ${on ? 'in the tank' : 'stored'}</small></span>`,
        [on ? ['Remove', 'ghost', () => { aquariumRemoveDecor(d.id); refreshShopBrowse(); }] : ['Place', '', () => { aquariumPlaceDecor(d.id); refreshShopBrowse(); }, full]]);
    });
  }
}
