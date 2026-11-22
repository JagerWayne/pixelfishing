/* The WebGL renderer, scene, camera, screen shader presets and the post-processing target. */
import { THREE } from '../engine/three.js';
import { sfx } from '../data/equipment.js';
import { showToast } from '../ui/toasts.js';

export let mainCanvas, renderer, postUniforms;
let snapBtn;

export const scene = new THREE.Scene();

export const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.2, 650);

export const SHADER_PRESETS = [
  { id: 'none', mode: 0, label: 'Normal', desc: 'Clean, natural 3D coastal optics with crisp retro textures.' },
  { id: 'crt', mode: 1, label: '8-Bit CRT Monitor', desc: 'Curved arcade glass, RGB phosphor shift & scanlines.' },
  { id: 'pixel', mode: 2, label: 'Pixelate', desc: 'Low-res pixel grid mosaic with posterized retro colors.' },
  { id: 'gameboy', mode: 8, label: 'Pocket DMG-01', desc: 'Classic 4-shade olive-green handheld LCD with dithering and dark outlines so boats, rails and fish stay readable against the sea.' }
];

export let renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat
});

export const postScene = new THREE.Scene();
export const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

export function init() {
  /* =========================================================================
     SECTION F: MOBILE-OPTIMIZED THREE.JS RENDERING PIPELINE & VFX SHADERS
     ========================================================================= */
mainCanvas = document.getElementById('game-canvas');
  renderer = new THREE.WebGLRenderer({
    canvas: mainCanvas,
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance'
  });

  snapBtn = document.getElementById('btn-snap-postcard');
  if (snapBtn) {
    snapBtn.addEventListener('click', () => {
      sfx.playCoin();
      const card = document.createElement('canvas');
      const pad = 24;
      const footerH = 64;
      card.width = mainCanvas.width + pad * 2;
      card.height = mainCanvas.height + pad + footerH;
      const ctx = card.getContext('2d');
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(0, 0, card.width, card.height);
      ctx.drawImage(mainCanvas, pad, pad);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.strokeRect(pad, pad, mainCanvas.width, mainCanvas.height);
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 22px "Courier New", monospace';
      const zoneLabel = document.getElementById('hud-zone')?.textContent || 'Pixel Fishing';
      const lensLabel = document.getElementById('hud-vfx-label')?.textContent || 'Standard Lens';
      ctx.fillText(`PIXEL FISHING — ${zoneLabel} [${lensLabel}]`, pad, card.height - 24);
      const link = document.createElement('a');
      link.download = `pixel-fishing-postcard-${Date.now()}.png`;
      link.href = card.toDataURL('image/png');
      link.click();
      if (typeof showToast === 'function') showToast('📸 Postcard saved to Downloads!');
    });
  }
  scene.background = new THREE.Color(0x9ecae1);
  scene.fog = new THREE.FogExp2(0x9ecae1, 0.0022);
  postUniforms = {
    tDiffuse: { value: renderTarget.texture },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uTime: { value: 0 },
    uMode: { value: 0 }
  };
}
