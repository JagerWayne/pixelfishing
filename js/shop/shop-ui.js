/* ShopUI: the builder every shop and town sheet is drawn with. */
import { shopBrowse, shopMoney } from './shop-kinds.js';
import { shopEl, shopPictureFor } from './shop-pictures.js';
import { shopAsk } from './shop-browse.js';

export let ShopUI;

export function init() {
  ShopUI = (() => {
    const thumbs = []; let thumbT = 0;
    function pumpThumbs() {
      thumbT = 0; const job = thumbs.shift(); if (!job) return;
      if (job.img.isConnected) { const url = shopPictureFor(job.it); if (url) { job.img.src = url; job.img.classList.add('on'); } }
      if (thumbs.length) thumbT = setTimeout(pumpThumbs, 16);
    }
    const KIND = { '': 'buy', green: 'buy', buy: 'buy', sell: 'sell', red: 'danger', danger: 'danger', ghost: 'ghost', swatch: 'swatch' };
    const plain = html => { const d = document.createElement('div'); d.innerHTML = html; const n = d.querySelector('.sl-n, .sh-title'); const t = n ? (n.firstChild ? n.firstChild.textContent : n.textContent) : d.textContent; return (t || '').replace(/\s+/g, ' ').trim(); };
    /* a card with actions; shared by the shop sheet and the town sheets (guard: ignore a touch's follow-up click) */
    function makeRow(html, actions, extraCls, guard, keyBase) {
      const r = document.createElement('li'); r.className = 'sh-row ' + (extraCls || '');
      const main = document.createElement('div'); main.className = 'sh-row-main'; main.innerHTML = html; r.appendChild(main);
      const name = plain(html);
      if (actions && actions.length) {
        const box = document.createElement('div'); box.className = 'sh-actions';
        actions.forEach(([label, kind, fn, dis, style, aria], i) => {
          const b = document.createElement('button'); b.type = 'button'; b.className = 'sh-btn ' + (KIND[kind || ''] || 'buy');
          b.textContent = label; b.disabled = !!dis; if (style) b.setAttribute('style', style);
          b.setAttribute('aria-label', aria || (name ? `${String(label).trim()}: ${name}` : String(label).trim()));
          if (keyBase != null) b.dataset.k = keyBase + ':' + i;
          b.addEventListener('click', e => { e.stopPropagation(); if (guard && !guard()) return; fn(b); });
          box.appendChild(b);
        });
        r.appendChild(box);
      }
      return r;
    }
    const guardShop = () => shopBrowse.active && !shopBrowse.pending && performance.now() > (shopBrowse.armedAt || 0);
    function begin() {
      const host = shopEl('shop-rows'), sum = shopEl('shop-summary'), foot = shopEl('shop-foot'), pb = shopEl('shop-sellall');
      clearTimeout(thumbT); thumbT = 0; thumbs.length = 0;
      host.innerHTML = ''; sum.innerHTML = ''; sum.hidden = true; foot.hidden = true; pb.onclick = null;
      let n = 0;
      return {
        host,
        summary(html) { sum.innerHTML = html; sum.hidden = false; },
        head(text, colour) { const h = document.createElement('li'); h.className = 'sh-group'; h.innerHTML = `${colour ? `<i style="background:${colour}" aria-hidden="true"></i>` : ''}<span role="heading" aria-level="3">${text}</span>`; host.appendChild(h); },
        note(html) { const p = document.createElement('li'); p.className = 'sh-note'; p.innerHTML = html; host.appendChild(p); },
        row(html, actions) { const r = makeRow(html, actions, '', guardShop, n++); host.appendChild(r); return r; },
        item(it) {
          const k = n++, r = document.createElement('li'); r.className = 'sh-row sh-item' + (it.can ? '' : ' locked');
          const good = /EQUIPPED|OWNED|INSTALLED|ACTIVE|FINISHED/.test(it.badge || '');
          const price = it.priceText || (it.price != null ? shopMoney(it.price) : '');
          const whyId = `sh-why-${k}`;
          r.innerHTML = `<div class="sh-row-main"><div class="sh-thumb" aria-hidden="true"><img alt=""></div><div class="sh-text">${it.badge ? `<span class="sh-badge ${good ? 'good' : 'bad'}">${good ? '✔ ' : '🔒 '}${it.badge}</span>` : ''}<h3 class="sh-title">${it.title}</h3>${it.stats ? `<p class="sh-sub">${it.stats}</p>` : ''}${it.desc ? `<p class="sh-desc">${it.desc}</p>` : ''}${!it.can && it.note ? `<p class="sh-why" id="${whyId}">${it.note}</p>` : it.note ? `<p class="sh-desc">${it.note}</p>` : ''}</div></div>`;
          const box = document.createElement('div'); box.className = 'sh-actions';
          if (price && it.can) box.insertAdjacentHTML('beforeend', `<span class="sh-price" aria-hidden="true">${price}</span>`);
          const b = document.createElement('button'); b.type = 'button'; b.dataset.k = k + ':0';
          b.className = 'sh-btn ' + (it.verb === 'Sell' ? 'sell' : 'buy');
          b.textContent = it.can ? it.verb : (good ? (it.badge.charAt(0) + it.badge.slice(1).toLowerCase()) : 'Locked');
          b.disabled = !it.can;
          b.setAttribute('aria-label', it.can ? `${it.verb} ${it.title}${price && it.priceText !== 'FREE' ? ' for ' + price : ''}` : `${it.title}: ${it.badge ? it.badge.toLowerCase() : 'not available'}${it.note ? '. ' + it.note : ''}`);
          if (!it.can && it.note) b.setAttribute('aria-describedby', whyId);
          b.addEventListener('click', e => { e.stopPropagation(); if (guardShop()) shopAsk(it); });
          box.appendChild(b); r.appendChild(box); host.appendChild(r);
          thumbs.push({ img: r.querySelector('img'), it }); if (!thumbT) thumbT = setTimeout(pumpThumbs, 20);
          return r;
        },
        primary(label, onClick, disabled, kind) { foot.hidden = false; pb.textContent = label; pb.disabled = !!disabled; pb.className = 'sh-primary ' + (kind || 'sell'); pb.onclick = () => { if (guardShop()) onClick(); }; }
      };
    }
    function announce(text) { const el = shopEl('shop-live'); if (!el) return; el.textContent = ''; setTimeout(() => { el.textContent = text; }, 30); }
    return { begin, makeRow, announce };
  })();
}
