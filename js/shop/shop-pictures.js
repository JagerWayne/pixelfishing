/* Shop pictures (each good rendered once) and the stand camera while a shop is open. */
import { THREE } from '../engine/three.js';
import { WorldBuilder } from '../world/world-builder.js';
import { camera } from '../render/renderer.js';
import { textures } from '../render/lights.js';
import { STAND_VIEWS, _standLook, _standPos, aquaPan } from '../save/save-game.js';
import { standCameraPose } from '../sim/spots.js';
import { SHOP_KINDS, shopBrowse } from './shop-kinds.js';

/* ---- pictures: each good's 3D model rendered once to a small image (own offscreen renderer, cached) ---- */
const shopPic = { renderer: null, scene: null, cam: null, cache: {} };
export function shopPictureFor(it) {
  const ck = it.key + ':' + (it.key === 'fish' ? it.data.item.id : it.id);
  if (shopPic.cache[ck] !== undefined) return shopPic.cache[ck];
  let url = '';
  try {
    if (!shopPic.renderer) {
      const cv = document.createElement('canvas'); cv.width = cv.height = 320;
      shopPic.renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: false, preserveDrawingBuffer: true });
      shopPic.renderer.setPixelRatio(1); shopPic.renderer.setSize(320, 320, false);
      shopPic.scene = new THREE.Scene(); shopPic.scene.background = new THREE.Color(0xf4e6bf);
      shopPic.scene.add(new THREE.HemisphereLight(0xffffff, 0xa89b80, 1.2));
      const dl = new THREE.DirectionalLight(0xffffff, 1.5); dl.position.set(2.5, 4, 3.5); shopPic.scene.add(dl);
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.05, 28), new THREE.MeshStandardMaterial({ color: 0xd6c08e, roughness: 0.9 })); plate.position.y = -0.03; shopPic.scene.add(plate);
      shopPic.cam = new THREE.PerspectiveCamera(30, 1, 0.05, 40);
    }
    const model = WorldBuilder.buildShopItem(it.key, it.data, textures);
    model.rotation.y = -0.5; shopPic.scene.add(model); model.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(model), sz = bb.getSize(new THREE.Vector3()), mid = bb.getCenter(new THREE.Vector3());
    const span = Math.max(sz.x, sz.y * 1.05, sz.z, 0.5), dist = span / (2 * Math.tan(THREE.MathUtils.degToRad(15))) * 1.18 + sz.z * 0.5;
    shopPic.cam.position.set(mid.x + dist * 0.2, mid.y + dist * 0.28, mid.z + dist * 0.95); shopPic.cam.lookAt(mid.x, mid.y - sz.y * 0.04, mid.z);
    shopPic.renderer.render(shopPic.scene, shopPic.cam);
    url = shopPic.renderer.domElement.toDataURL('image/png');
    shopPic.scene.remove(model);
    model.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose && m.dispose()); });
  } catch (err) { url = ''; }
  shopPic.cache[ck] = url;
  return url;
}

/* ---- the stand zoom stays on the shop; the picture is pushed up so the sheet does not cover it ---- */
export const _shPos = new THREE.Vector3(), _shLook = new THREE.Vector3();
export function shopCameraPose() {
  const st = STAND_VIEWS.find(v => v.id === SHOP_KINDS[shopBrowse.kind].stand); if (!st) return;
  standCameraPose(st); _shPos.copy(_standPos); _shLook.copy(_standLook);
}
export function updateShopBrowse(dt) {
  if (shopBrowse.active) {
    if (shopBrowse.kind === 'aqua') aquaPan.phase += dt * Math.PI * 2 / 18;   // the tank view keeps sweeping under the sheet
    const w = window.innerWidth, h = window.innerHeight, off = h > 520 ? 0.2 : 0.08;
    camera.setViewOffset(w, h, 0, Math.round(h * off), w, h); shopBrowse.viewOff = true;
  } else if (shopBrowse.viewOff) { camera.clearViewOffset(); shopBrowse.viewOff = false; }
}

/* =========================================================================
   SHOP SHEET (v6.7.0): one data-driven, accessible sheet for every shop and stand (the town counters share its rows).
   A sheet's content is only described through the builder, never by touching the DOM:
     const U = ShopUI.begin();                     clears the body (keeps scroll and focus on a refresh)
     U.summary(html)                               the info card on top (optional)
     U.head(text, colour) / U.note(html)           a group heading / a line of text in the list
     U.row(html, actions)                          a card: html (an <img> and a .sl-n block), actions [[label, kind, onClick, disabled, style, ariaLabel]]
     U.item(it)                                    a catalogue card from shopItems(): picture, badge, stats, description, price, action
     U.primary(label, onClick, disabled, kind)     the big button at the bottom
   kinds: 'buy' (default, also 'green' / ''), 'sell', 'danger' (also 'red'), 'ghost', 'swatch'.
   Accessibility: the sheet is a modal dialog; the departments are a real tablist (arrows, Home / End, 1-5); arrow up /
   down move between buttons; focus stays inside and comes back after a confirmation; Esc closes; every button says
   what it acts on; results are announced in a live region; buttons are at least 44 px; reduced motion is respected.
   ========================================================================= */
export const shopEl = id => document.getElementById(id);
