/* Drawing the harbour map, its buoy bar and its legend. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { BUOY_KINDS, BUOY_MAX } from '../data/townsfolk.js';
import { npcState } from '../town/npcs.js';
import { dropBuoy, forecastText, projOn, removeBuoy } from '../fishing/rigs.js';
import { MAP_PLACES, mapCentre, mapClamp, mapCompass, mapRedraw, mapSize, mapView, mapYou, mapZoomAt } from './map.js';

function renderBuoyBar() {
  const bar = document.getElementById('map-buoy-bar'), hint = document.getElementById('map-hint'); if (!bar) return;
  bar.style.display = mapView.buoyBar ? 'flex' : 'none';
  hint.textContent = mapView.placing ? `Tap the sea to drop the ${BUOY_KINDS[mapView.placing].icon} ${BUOY_KINDS[mapView.placing].name} buoy` : 'Drag to move • pinch to zoom';
  if (!mapView.buoyBar) return;
  const list = (shared.state.buoys || []).map((b, i) => `<button class="pixel-btn red" data-rm="${i}" type="button">${BUOY_KINDS[b.k].icon} ✕</button>`).join('');
  bar.innerHTML = `<span class="mb-l">Drop (${(shared.state.buoys || []).length}/${BUOY_MAX}):</span>` + Object.entries(BUOY_KINDS).map(([k, K]) => `<button class="pixel-btn ${mapView.placing === k ? 'gold' : ''}" data-k="${k}" type="button">${K.icon} ${K.name}</button>`).join('') + (list ? `<span class="mb-l">Remove:</span>${list}` : '');
  bar.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => { mapView.placing = mapView.placing === b.dataset.k ? null : b.dataset.k; renderBuoyBar(); }));
  bar.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => { removeBuoy(+b.dataset.rm); renderBuoyBar(); mapRedraw(); mapLegend(); }));
}
export function drawMap() {
  const { cv, w, h } = mapSize(), dpr = Math.min(2, window.devicePixelRatio || 1);
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const S = mapView.s, X = x => (x - mapView.cx) * S + w / 2, Y = z => (z - mapView.cz) * S + h / 2;
  g.fillStyle = '#0b4a6f'; g.fillRect(0, 0, w, h);
  g.imageSmoothingEnabled = true;
  (mapView.snaps || []).forEach(sn => g.drawImage(sn.cv, X(sn.x0), Y(sn.z0), (sn.x1 - sn.x0) * S, (sn.z1 - sn.z0) * S));
  // landmarks: icon and name on the spot, names only when zoomed in enough to read them
  const places = MAP_PLACES();
  g.textAlign = 'center'; g.textBaseline = 'middle';
  places.forEach(p => {
    const pts = [[p.x, p.z]].concat(p.also ? (Array.isArray(p.also[0]) ? p.also : [p.also]) : []);
    pts.forEach(([x, z]) => {
      const sx = X(x), sy = Y(z); if (sx < -40 || sx > w + 40 || sy < -40 || sy > h + 40) return;
      g.font = '18px sans-serif'; g.fillStyle = '#fff'; g.fillText(p.icon, sx, sy);
      if (S >= 7 || p.far) {
        g.font = 'bold 11px monospace'; const t = p.name.toUpperCase(), tw = g.measureText(t).width + 8;
        g.fillStyle = 'rgba(7,11,20,0.72)'; g.fillRect(sx - tw / 2, sy + 11, tw, 15);
        g.fillStyle = '#f8fafc'; g.fillText(t, sx, sy + 19);
      }
    });
  });
  // the townsfolk where they are right now
  npcState.list.forEach(n => { if (n.hidden) return; const sx = X(n.x), sy = Y(n.z); if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) return; g.fillStyle = 'rgba(56,189,248,0.85)'; g.beginPath(); g.arc(sx, sy, 11, 0, Math.PI * 2); g.fill(); g.font = '14px sans-serif'; g.fillText(n.d.icon, sx, sy + 1); });
  // you: an arrow with a view cone, always on screen (pinned to the edge when you are out of view)
  const me = mapYou(), fx = -Math.sin(me.yaw), fz = -Math.cos(me.yaw), ang = Math.atan2(fz, fx), r = 11;
  const mx = THREE.MathUtils.clamp(X(me.x), 14, w - 14), my = THREE.MathUtils.clamp(Y(me.z), 14, h - 14);
  g.fillStyle = 'rgba(253,224,71,0.28)'; g.beginPath(); g.moveTo(mx, my); g.arc(mx, my, 46, ang - 0.45, ang + 0.45); g.closePath(); g.fill();
  g.save(); g.translate(mx, my); g.rotate(ang + Math.PI / 2);
  g.fillStyle = '#facc15'; g.strokeStyle = '#111827'; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(0, -r); g.lineTo(r * 0.75, r * 0.85); g.lineTo(0, r * 0.4); g.lineTo(-r * 0.75, r * 0.85); g.closePath(); g.fill(); g.stroke(); g.restore();
  g.font = 'bold 11px monospace'; g.fillStyle = '#111827'; g.fillRect(mx - 15, my + 14, 30, 14); g.fillStyle = '#fef9c3'; g.fillText('YOU', mx, my + 21);
  // north arrow and scale bar
  g.fillStyle = 'rgba(7,11,20,0.7)'; g.fillRect(8, 8, 34, 34); g.fillStyle = '#f87171'; g.font = 'bold 13px monospace'; g.fillText('N', 25, 18); g.fillText('▲', 25, 32);
  const steps = [1, 2, 5, 10, 20, 50, 100], m = steps.find(v => v * S >= 60) || 100, bw = m * S;
  g.fillStyle = 'rgba(7,11,20,0.7)'; g.fillRect(w - bw - 24, h - 28, bw + 16, 20);
  g.fillStyle = '#f8fafc'; g.fillRect(w - bw - 16, h - 16, bw, 3); g.font = 'bold 10px monospace'; g.fillText(`${m} m`, w - bw / 2 - 16, h - 22);
}
export function mapLegend() {
  const me = mapYou(), places = MAP_PLACES();
  const rows = places.map(p => { const dx = p.x - me.x, dz = p.z - me.z; return { p, d: Math.hypot(dx, dz), dir: mapCompass(dx, dz) }; }).sort((a, b) => a.d - b.d);
  document.getElementById('map-legend').innerHTML = (projOn('weather') ? `<div style="font-size:12px;color:var(--gold);margin-bottom:6px;">📡 ${forecastText()}</div>` : '') + `<div style="font-size:12px;color:var(--text-2);margin-bottom:6px;">You are facing ${mapCompass(-Math.sin(me.yaw), -Math.cos(me.yaw))}${shared.onBoat ? ', on your boat' : ''}. North is the open sea. Tap a place to find it on the map.</div>` +
    rows.map(({ p, d, dir }) => `<div class="map-row" data-x="${p.x}" data-z="${p.z}"><span class="mi">${p.icon}</span><span><b>${p.name}</b><small>${p.desc}</small></span><span class="md">${d < 2.5 ? 'Here' : `${Math.round(d)} m ${dir}`}</span></div>`).join('');
}

export function init() {
  (function wireMap() {
    const cv = document.getElementById('map-canvas'), P = mapView.ptrs;
    const local = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    let last = null;
    const pair = () => { const [a, b] = [...P.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; };
    cv.addEventListener('pointerdown', e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (err) {} P.set(e.pointerId, local(e)); cv.classList.add('drag'); last = P.size === 2 ? pair() : null; });
    cv.addEventListener('pointermove', e => {
      if (!P.has(e.pointerId)) return;
      const prev = P.get(e.pointerId), now = local(e); P.set(e.pointerId, now);
      if (P.size === 1) { mapView.cx -= (now.x - prev.x) / mapView.s; mapView.cz -= (now.y - prev.y) / mapView.s; mapClamp(); mapRedraw(); }
      else if (P.size === 2) {
        const cur = pair();
        if (last) { mapView.cx -= (cur.mx - last.mx) / mapView.s; mapView.cz -= (cur.my - last.my) / mapView.s; mapZoomAt(cur.mx, cur.my, cur.d / last.d); }
        last = cur;
      }
    });
    const up = e => { P.delete(e.pointerId); last = P.size === 2 ? pair() : null; if (!P.size) cv.classList.remove('drag'); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', e => { e.preventDefault(); const p = local(e); mapZoomAt(p.x, p.y, Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
    const mid = f => { const { w, h } = mapSize(); mapZoomAt(w / 2, h / 2, f); };
    document.getElementById('map-zoom-in').addEventListener('click', () => mid(1.5));
    document.getElementById('map-zoom-out').addEventListener('click', () => mid(1 / 1.5));
    document.getElementById('map-me').addEventListener('click', () => { const me = mapYou(); mapCentre(me.x, me.z); });
    // buoys: 📍 opens a small bar (pick a kind, then tap the sea), with your buoys and a ✕ to remove each
    document.getElementById('map-buoy').addEventListener('click', () => { mapView.buoyBar = !mapView.buoyBar; mapView.placing = null; renderBuoyBar(); });
    let downAt = null;
    cv.addEventListener('pointerdown', e => { downAt = P.size === 1 ? local(e) : null; });
    cv.addEventListener('pointerup', e => {
      if (!mapView.placing || !downAt) return;
      const p = local(e); if (Math.hypot(p.x - downAt.x, p.y - downAt.y) > 8) return;
      const { w, h } = mapSize(), x = mapView.cx + (p.x - w / 2) / mapView.s, z = mapView.cz + (p.y - h / 2) / mapView.s;
      if (dropBuoy(mapView.placing, x, z)) { mapView.placing = null; renderBuoyBar(); mapRedraw(); mapLegend(); }
    });
    document.getElementById('map-legend').addEventListener('click', e => { const r = e.target.closest('.map-row'); if (!r) return; mapCentre(+r.dataset.x, +r.dataset.z); if (mapView.s < 8) mid(8 / mapView.s); });
  })();
}
