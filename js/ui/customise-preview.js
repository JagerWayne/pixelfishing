/* Character customisation: frames, tabs and the live 3D preview. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { ANGLER_OPTS } from '../angler/look-options.js';
import { AnglerFactory } from '../angler/angler-factory.js';
import { AnglerAnimator } from '../angler/animator.js';

export let custModal, CUST_TABS;
let custCanvas;

export const CUST_FRAMES = {   // v9.1.0: framed for the chibi heights (eyes at about 1.2 m)
  outfit: { y: 0.95, z: 3.7, ly: 0.8 },
  body: { y: 0.95, z: 3.7, ly: 0.8 },
  hair: { y: 1.32, z: 1.5, ly: 1.25 },
  face: { y: 1.24, z: 1.15, ly: 1.2 },
  top: { y: 0.95, z: 2.2, ly: 0.85 },
  bottom: { y: 0.5, z: 2.2, ly: 0.42 },
  shoes: { y: 0.28, z: 1.6, ly: 0.1 },
  hat: { y: 1.45, z: 1.65, ly: 1.36 },
  extra: { y: 0.95, z: 2.2, ly: 0.85 }
};
shared.custTab = 'outfit';
export let custRenderer = null;
export let custScene = null;
export let custCam = null;
export let custRig = null;
export let custAnim = null;
shared.custLastT = 0;
shared.custSpin = true;
shared.custYaw = 0;
export let custDragYaw = 0;
export let custDragging = false;
let custLastX = 0;
shared.custLooping = false;
export const custFrame = { y: 0.78, z: 3.5, ly: 0.7 };

export function initCustPreview() {
  if (custRenderer) return;
  custRenderer = new THREE.WebGLRenderer({ canvas: custCanvas, alpha: true, antialias: true });
  custRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  custScene = new THREE.Scene();
  custScene.add(new THREE.HemisphereLight(0xe0f2fe, 0x334155, 1.0));
  const key = new THREE.DirectionalLight(0xfff1d6, 1.15); key.position.set(2, 4, 4); custScene.add(key);
  const rim = new THREE.DirectionalLight(0x7dd3fc, 0.5); rim.position.set(-3, 2, -3); custScene.add(rim);
  custCam = new THREE.PerspectiveCamera(32, 1, 0.1, 30);
  custRig = AnglerFactory.createRig();
  custAnim = new AnglerAnimator(custRig);
  custRig.root.rotation.y = Math.PI;
  custScene.add(custRig.root);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(0.7, 32), new THREE.MeshBasicMaterial({ color: 0x0b2a3c, transparent: true, opacity: 0.6 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = 0.005; custScene.add(floor);
  const pointerDown = e => { custDragging = true; custLastX = e.clientX; custCanvas.setPointerCapture(e.pointerId); };
  custCanvas.addEventListener('pointerdown', pointerDown);
  custCanvas.addEventListener('pointermove', e => { if (!custDragging) return; custDragYaw += (e.clientX - custLastX) * 0.012; custLastX = e.clientX; });
  const end = () => { custDragging = false; };
  custCanvas.addEventListener('pointerup', end); custCanvas.addEventListener('pointercancel', end);
}

export function custResize() {
  if (!custRenderer) return;
  const r = custCanvas.getBoundingClientRect();
  const w = Math.max(120, Math.floor(r.width)), h = Math.max(120, Math.floor(r.height));
  custRenderer.setSize(w, h, false);
  custCam.aspect = w / h; custCam.updateProjectionMatrix();
}

export function init() {
  /* =========================================================================
     CHARACTER CUSTOMISATION SCREEN (live 3D preview, tabs, random + reset)
     ========================================================================= */
  custModal = document.getElementById('modal-customize');
  custCanvas = document.getElementById('cust-canvas');

  CUST_TABS = [
    { id: 'outfit', label: '✨ Outfits', rows: [
      { key: 'preset', label: 'Quick outfits', kind: 'presets', list: [['fisherman', '🎣 Fisherman'], ['angler', '🦺 Vest & overalls'], ['bikini', '👙 Beach: Bikini'], ['shorts', '🩳 Beach: Shorts only'], ['raincoat', '🌧️ Raincoat day']] }] },
    { id: 'body', label: '🧍 Body', rows: [
      { key: 'skin', label: 'Skin tone', kind: 'swatch', list: ANGLER_OPTS.skin, hex: 'skinHex' },
      { key: 'heightK', label: 'Height', kind: 'slider', min: 0.85, max: 1.15, step: 0.01, lo: 'Short', hi: 'Tall' },
      { key: 'headK', label: 'Head size', kind: 'slider', min: 0.9, max: 1.15, step: 0.01, lo: 'Small', hi: 'Big' },
      { key: 'buildK', label: 'Build', kind: 'slider', min: 0, max: 1, step: 0.02, lo: 'Slim', hi: 'Round' },
      { key: 'ears', label: 'Ears', kind: 'chips', list: ANGLER_OPTS.ears }] },
    { id: 'face', label: '🙂 Face', rows: [
      { key: 'eyeShape', label: 'Eyes', kind: 'chips', list: ANGLER_OPTS.eyeShape },
      { key: 'eyes', label: 'Eye colour', kind: 'swatch', list: ANGLER_OPTS.eyes, hex: 'eyeHex' },
      { key: 'brows', label: 'Eyebrows', kind: 'chips', list: ANGLER_OPTS.brows },
      { key: 'mouth', label: 'Mouth', kind: 'chips', list: ANGLER_OPTS.mouth },
      { key: 'nose', label: 'Nose', kind: 'chips', list: ANGLER_OPTS.nose },
      { key: 'cheeks', label: 'Cheeks', kind: 'chips', list: ANGLER_OPTS.cheeks },
      { key: 'marks', label: 'Freckles', kind: 'chips', list: ANGLER_OPTS.marks },
      { key: 'faceShape', label: 'Face shape', kind: 'chips', list: ANGLER_OPTS.faceShape },
      { key: 'facial', label: 'Facial hair', kind: 'chips', list: ANGLER_OPTS.facial },
      { key: 'glasses', label: 'Glasses', kind: 'chips', list: ANGLER_OPTS.glasses }] },
    { id: 'hair', label: '💇 Hair', rows: [
      { key: 'hairStyle', label: 'Style', kind: 'chips', list: ANGLER_OPTS.hairStyle },
      { key: 'hairColor', label: 'Hair colour', kind: 'swatch', list: ANGLER_OPTS.hairColor, hex: 'hairHex' },
      { key: 'fringe', label: 'Fringe', kind: 'chips', list: ANGLER_OPTS.fringe },
      { key: 'fringeColor', label: 'Fringe and tips colour', kind: 'swatch', list: ANGLER_OPTS.hairColor, hex: 'fringeHex', same: true }] },
    { id: 'top', label: '👕 Top', rows: [
      { key: 'top', label: 'Style', kind: 'chips', list: ANGLER_OPTS.top },
      { key: 'topPattern', label: 'Pattern', kind: 'chips', list: [['auto', 'Classic']].concat(ANGLER_OPTS.pattern) },
      { key: 'topColor', label: 'Colour', kind: 'swatch', list: ANGLER_OPTS.colors, hex: 'topHex' },
      { key: 'topAccent', label: 'Second colour', kind: 'swatch', list: ANGLER_OPTS.colors, hex: 'accentHex' }] },
    { id: 'bottom', label: '👖 Bottom', rows: [
      { key: 'bottom', label: 'Style', kind: 'chips', list: ANGLER_OPTS.bottom },
      { key: 'bottomPattern', label: 'Pattern', kind: 'chips', list: ANGLER_OPTS.pattern },
      { key: 'bottomColor', label: 'Colour', kind: 'swatch', list: ANGLER_OPTS.colors, hex: 'bottomHex' },
      { key: 'bottomAccent', label: 'Second colour', kind: 'swatch', list: ANGLER_OPTS.colors, hex: 'bottomAccHex' }] },
    { id: 'shoes', label: '🥾 Shoes', rows: [
      { key: 'shoes', label: 'Style', kind: 'chips', list: ANGLER_OPTS.shoes },
      { key: 'shoeColor', label: 'Colour', kind: 'swatch', list: ANGLER_OPTS.colors, hex: 'shoeHex' }] },
    { id: 'hat', label: '🎩 Hat', rows: [
      { key: 'hat', label: 'Style', kind: 'chips', list: ANGLER_OPTS.hat },
      { key: 'hatColor', label: 'Colour', kind: 'swatch', list: ANGLER_OPTS.colors, hex: 'hatHex' }] },
    { id: 'extra', label: '🎒 Extras', rows: [
      { key: 'accessory', label: 'Accessory', kind: 'chips', list: ANGLER_OPTS.accessory },
      { key: 'extraColor', label: 'Accessory colour', kind: 'swatch', list: ANGLER_OPTS.colors, hex: 'extraHex' }] }
  ];
}
