/* The post quad, the camera filter preview, viewport resizing, the sun, moon and sky lights, sun shadows,
   the textures and the world build. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { settings } from '../core/settings.js';
import { PixelTextureFactory } from './texture-factory.js';
import { AnglerAnimator } from '../angler/animator.js';
import { COL } from '../world/layout.js';
import { Colliders } from '../data/recipes.js';
import { WorldBuilder } from '../world/world-builder.js';
import { camera, postScene, postUniforms, renderTarget, renderer, scene } from './renderer.js';
import { postMaterial } from './post.js';

export let camPreviewCanvas, camPreviewCtx, textures, world, walkColliders, anglerAnim;
let postQuad, SUN_DIR;

export function resizeViewport() {
  const w = window.visualViewport ? window.visualViewport.width : window.innerWidth;
  const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, settings.quality === 'low' ? 1 : 1.5);   // v6.3.1: 1.5 is plenty for pixel art and much lighter than 2
  camera.fov = w < h ? 62 : 52;
  camera.aspect = w / Math.max(1, h);
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  renderer.setPixelRatio(dpr);
  const rw = Math.max(1, Math.floor(w * dpr));
  const rh = Math.max(1, Math.floor(h * dpr));
  renderTarget.setSize(rw, rh);
  postUniforms.uResolution.value.set(rw, rh);
}

export const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.95);

export const sunLight = new THREE.DirectionalLight(0xfef3c7, 1.15);
export function applyShadowQuality() {
  const on = settings.quality !== 'low';
  if (renderer.shadowMap.enabled === on && sunLight.castShadow === on) return;
  renderer.shadowMap.enabled = on;
  sunLight.castShadow = on;
  scene.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.needsUpdate = true; }); });
}
const _shadowFocus = new THREE.Vector3();
let shadowMarkT = 0;
/* v8.0.0: on a phone that runs below ~45 fps the shadow map is redrawn every other frame (and always when its
   focus moves); faster devices keep redrawing it every frame */
const shadowPace = { last: 0, avg: 16, flip: false };
export function updateSunShadow(dt, fx, fz, diving) {
  if (!renderer.shadowMap.enabled) return;
  sunLight.castShadow = !diving && sunLight.intensity > 0.05;
  const now = performance.now(), fdt = Math.min(100, now - (shadowPace.last || now)); shadowPace.last = now;
  shadowPace.avg += (fdt - shadowPace.avg) * 0.05; shadowPace.flip = !shadowPace.flip;
  const fxs = Math.round(fx * 4) / 4, fzs = Math.round(fz * 4) / 4, moved = fxs !== _shadowFocus.x || fzs !== _shadowFocus.z;
  renderer.shadowMap.needsUpdate = moved || shadowPace.avg < 22 || shadowPace.flip;
  // snap the focus to a coarse grid so the shadow edges do not crawl as you move
  _shadowFocus.set(fxs, 0, fzs);
  sunLight.target.position.copy(_shadowFocus);
  sunLight.position.copy(_shadowFocus).addScaledVector(SUN_DIR, 60);
  // things that are rebuilt (angler outfit, boat, bucket, trophy mounts) get their caster flag back twice a second
  shadowMarkT -= dt;
  if (shadowMarkT <= 0) {
    shadowMarkT = 0.5;
    [world.anglerGroup, shared.playerBoatMesh, shared.pierBucketMesh, world.aquarium && world.aquarium.userData.decorGroup].forEach(g => {
      if (g) g.traverse(o => { if (o.isMesh && !o.castShadow && !(o.material && o.material.transparent)) { o.castShadow = true; o.receiveShadow = true; } });
    });
  }
}

export const moonLight = new THREE.DirectionalLight(0x93c5fd, 0.0);

export function init() {
  postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMaterial);
  postScene.add(postQuad);

  // Live Camera Lens Preview Canvas inside Director's Camera Modal
  camPreviewCanvas = document.getElementById('camera-live-preview');
  camPreviewCtx = camPreviewCanvas ? camPreviewCanvas.getContext('2d') : null;
  resizeViewport();
  window.addEventListener('resize', resizeViewport);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', resizeViewport);
  }
  scene.add(hemiLight);
  sunLight.position.set(28, 45, 22);
  scene.add(sunLight);
  scene.add(sunLight.target);
  /* Soft sun shadows (High graphics only): one shadow map that follows the player or the boat, so the stands, the
     angler and the boat ground themselves on the deck and the water's edge. Battery saver switches them off. */
  SUN_DIR = new THREE.Vector3(28, 45, 22).normalize();
  sunLight.shadow.mapSize.set(1024, 1024);
  sunLight.shadow.bias = -0.0006;
  sunLight.shadow.normalBias = 0.02;
  Object.assign(sunLight.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 5, far: 120 });
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  moonLight.position.set(-28, 38, -24);
  scene.add(moonLight);

  textures = PixelTextureFactory.createAllTextures();
  world = WorldBuilder.buildWorld(scene, textures);
  /* v8.0.0: tiny static props (under ~12 cm) stop casting sun shadows: at 3 cm per shadow texel they were specks,
     and each one was an extra draw call in the shadow pass. The angler is left alone. */
  { const _ws = new THREE.Vector3(); let off = 0;
    scene.traverse(o => {
      if (!o.isMesh || !o.castShadow || o.isSkinnedMesh) return;
      let p = o; while (p && p !== world.anglerGroup) p = p.parent; if (p) return;
      if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
      if (o.geometry.boundingSphere.radius * o.getWorldScale(_ws).x < 0.06) { o.castShadow = false; off++; }
    });
    world.smallCastersOff = off; }
  walkColliders = Colliders.of(COL.WALK);
  anglerAnim = new AnglerAnimator(world.anglerRig);
}
