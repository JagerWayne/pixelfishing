/* Rebuilding the player's boat model, and the toast stack. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { WorldBuilder } from '../world/world-builder.js';
import { scene } from '../render/renderer.js';
import { textures, world } from '../render/lights.js';
import { replaceSceneMesh } from '../render/previews.js';
import { hasModule } from '../save/queries.js';
import { getCurrentRod } from '../save/save-game.js';
import { rebuildPierBucketVisual } from '../boat/terminal.js';

let toastStack;

export function rebuildPlayerBoatVisual() {
shared.playerBoatMesh = replaceSceneMesh(scene, shared.playerBoatMesh, WorldBuilder.buildBoatMesh(shared.state.boatTier, textures));
  {
    const bb = new THREE.Box3().setFromObject(shared.playerBoatMesh);
    if (isFinite(bb.max.z - bb.min.z) && shared.state.boatTier > 0) {
      shared.boatHalfLen = THREE.MathUtils.clamp((bb.max.z - bb.min.z) / 2, 1.6, 6);
      shared.boatHalfWid = THREE.MathUtils.clamp((bb.max.x - bb.min.x) / 2 * 0.9, 0.8, 1.7);
    }
  }
  shared.boatSpotlight = null;
  if (shared.state.boatTier > 0 && hasModule('spotlight')) {
    const lampHousing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.16, 0.24, 8),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7 })
    );
    lampHousing.rotation.x = Math.PI / 2;
    lampHousing.position.set(0, 1.35, -2.0);
    const spot = new THREE.SpotLight(0xfef08a, 3.2, 48, 0.52, 0.45, 1.2);
    spot.position.set(0, 1.4, -2.0);
    spot.target.position.set(0, 0.2, -16.0);
    shared.playerBoatMesh.add(lampHousing, spot, spot.target);
    shared.boatSpotlight = spot;
  }
  scene.add(shared.playerBoatMesh);
  const rodObj = getCurrentRod();
  world.rodMat.color.setHex(rodObj.color || 0xd97706);
  rebuildPierBucketVisual();
}
/* toast colour by what it says (v7.1.0): warnings amber, money gold, wins green, the rest teal */
function toastKind(t) {
  if (/⚠️|⛈️|🚫|❌|⛔|Not enough|not enough|can't|cannot|Finish the fight|too heavy|snapped|broke|Out of|out of fuel|full!/i.test(t)) return 't-warn';
  if (/💰|🪙|💵|\$\d|Sold|sold|Paid|paid|Earned|earned/.test(t)) return 't-gold';
  if (/✅|🎉|🏅|🏆|⭐|🎊|Unlocked|unlocked|New record|NEW/.test(t)) return 't-ok';
  return 't-info';
}
export function showToast(msg) {
  const text = String(msg);
  const dup = [...toastStack.children].find(t => t.textContent === text && !t.dataset.closing);
  const ttl = 2000 + Math.min(2600, text.length * 32);
  if (dup) {
    clearTimeout(dup._timer);
    dup._timer = setTimeout(() => dropToast(dup), ttl);
    return;
  }
  const el = document.createElement('div');
  el.className = 'toast ' + toastKind(text);
  el.textContent = text;
  toastStack.appendChild(el);
  const live = () => [...toastStack.children].filter(t => !t.dataset.closing);
  while (live().length > 3) dropToast(live()[0], true);
  requestAnimationFrame(() => el.classList.add('show'));
  el._timer = setTimeout(() => dropToast(el), ttl);
}
function dropToast(el, instant) {
  if (!el || el.dataset.closing) return;
  el.dataset.closing = '1';
  clearTimeout(el._timer);
  el.classList.remove('show');
  if (instant) el.remove(); else setTimeout(() => el.remove(), 220);
}

export function init() {
  // Toast queue: up to 3 stacked, repeats refresh the existing toast, duration grows with length.
  toastStack = document.getElementById('toast-stack');

  // Measure the HUD so toasts, banners and meters position themselves without hard-coded pixels.
  (function trackHudSize() {
    const root = document.documentElement;
    const top = document.getElementById('hud-top');
    const ctl = document.getElementById('mobile-controls');
    const apply = () => {
      root.style.setProperty('--hud-top-h', Math.ceil(top.getBoundingClientRect().height) + 'px');
      root.style.setProperty('--controls-h', Math.ceil(ctl.getBoundingClientRect().height) + 'px');
    };
    if (window.ResizeObserver) { const ro = new ResizeObserver(apply); ro.observe(top); ro.observe(ctl); }
    window.addEventListener('resize', apply);
    apply();
  })();
}
