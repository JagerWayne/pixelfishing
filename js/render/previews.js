/* The compass, the collider debug view, the VFX manager, boat and bucket meshes, and the catch and
   live-bait preview renderers. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { AnglerFactory } from '../angler/angler-factory.js';
import { COL } from '../world/layout.js';
import { Colliders } from '../data/recipes.js';
import { Physics } from '../engine/physics.js';
import { VFXManager } from './vfx.js';
import { camera, scene } from './renderer.js';
import { applyShadowQuality, world } from './lights.js';
import { diveSolids } from '../dive/dive-seabed.js';

export let compass, vfx, previewRenderer, pipRenderer;
let previewCanvas, pipCanvas;

/* Debug view (secret menu): every collider as a wireframe. Green = walking, orange = boats, cyan = diving
   (including the seabed rocks, coral, wrecks and chests around you when it is switched on). */
let colliderView = null;
export function toggleColliderView() {
  if (colliderView) { scene.remove(colliderView); colliderView.traverse(o => { if (o.geometry) o.geometry.dispose(); }); colliderView = null; return false; }
  colliderView = new THREE.Group();
  const mats = { 1: 0x22c55e, 2: 0xf97316, 4: 0x22d3ee };
  const add = (c, layer) => {
    const y0 = layer === COL.WALK ? Math.max(c.y0, 1.5) : (c.y0 < -100 ? -6 : c.y0), y1 = layer === COL.WALK ? Math.min(c.y1, 3.6) : (c.y1 > 100 ? 3 : c.y1);
    const hgt = Math.max(0.2, y1 - y0);
    const geo = c.kind === 'box' ? new THREE.BoxGeometry(c.hx * 2, hgt, c.hz * 2) : new THREE.CylinderGeometry(c.r, c.r, hgt, 16, 1, true);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: mats[layer], wireframe: true, depthTest: false, transparent: true, opacity: 0.85 }));
    m.position.set(c.x, (y0 + y1) / 2, c.z); m.renderOrder = 20; colliderView.add(m);
  };
  Colliders.list.forEach(c => [COL.WALK, COL.BOAT, COL.DIVE].forEach(l => { if (c.layers & l) add(c, l); }));
  if (typeof diveSolids !== 'undefined') diveSolids.forEach(sd => add({ kind: 'circle', x: sd.x, z: sd.z, r: sd.r, y0: sd.y0, y1: sd.y1 }, COL.DIVE));
  if (Physics.on) {   // v8.2.0: what Rapier itself sees, as white lines at walking height
    const buf = Physics.debugLines(), pos = new Float32Array(buf.vertices);
    for (let i = 1; i < pos.length; i += 3) pos[i] = THREE.MathUtils.clamp(pos[i], -0.2, 0.2) + 2.2;   // flatten the tall walls to a band
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xffffff, depthTest: false, transparent: true, opacity: 0.9 }));
    lines.renderOrder = 21; colliderView.add(lines);
  }
  scene.add(colliderView);
  return true;
}

shared.playerBoatMesh = new THREE.Group();
shared.pierBucketMesh = new THREE.Group();

export function replaceSceneMesh(parent, oldObj, newObj) {
  if (oldObj) {
    parent.remove(oldObj);
    AnglerFactory.dispose(oldObj);
  }
  if (newObj) parent.add(newObj);
  return newObj;
}
export const previewScene = new THREE.Scene();
export const previewCam = new THREE.PerspectiveCamera(42, 180 / 135, 0.1, 20);
const pDir = new THREE.DirectionalLight(0xffffff, 1.4);
shared.previewFishObj = null;
export const pipScene = new THREE.Scene();
export const pipCam = new THREE.PerspectiveCamera(44, 176 / 112, 0.1, 20);
const pipDir = new THREE.DirectionalLight(0xe0f2fe, 1.3);

export function init() {
  /* Compass: a tape of headings for the way the camera looks. North is straight out to sea (-Z), so the island
     and the pier lie to the South. 120 degrees are visible across the tape. */
  compass = (() => {
    const el = document.getElementById('hud-compass');
    const degEl = document.getElementById('hud-compass-deg');
    const marks = [];
    const NAMES = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SW', 270: 'W', 315: 'NW' };
    for (let d = 0; d < 360; d += 15) {
      const node = document.createElement(NAMES[d] != null ? 'span' : 'div');
      if (NAMES[d] != null) { node.className = 'cmp-mark' + (d % 90 === 0 ? ' card' : '') + (d === 0 ? ' north' : ''); node.textContent = NAMES[d]; }
      else node.className = 'cmp-tick';
      el.appendChild(node); marks.push({ d, node });
    }
    const dir = new THREE.Vector3();
    let last = null;
    return {
      update() {
        camera.getWorldDirection(dir);
        if (Math.hypot(dir.x, dir.z) < 1e-3) return;
        const heading = (THREE.MathUtils.radToDeg(Math.atan2(dir.x, -dir.z)) + 360) % 360;
        const h = Math.round(heading) % 360;
        if (h === last) return;
        last = h;
        const w = el.clientWidth || 200, ppd = w / 120;
        marks.forEach(m => {
          let delta = ((m.d - heading + 540) % 360) - 180;
          const vis = Math.abs(delta) <= 62;
          m.node.style.display = vis ? '' : 'none';
          if (vis) m.node.style.left = `${w / 2 + delta * ppd}px`;
        });
        degEl.textContent = `${h}°`;
      }
    };
  })();
  vfx = new VFXManager(scene);
  scene.add(shared.playerBoatMesh);
  scene.add(shared.pierBucketMesh);
  // everything solid-looking can receive the sun's shadow (merged pier meshes already do)
  scene.traverse(o => { if (o.isMesh && o.material && o.material.isMeshStandardMaterial && !o.material.transparent) o.receiveShadow = true; });
  applyShadowQuality();
  scene.add(world.anglerGroup);
  	  
  // 3D Catch Preview Renderer
  previewCanvas = document.getElementById('catch-preview-canvas');
  previewRenderer = new THREE.WebGLRenderer({ canvas: previewCanvas, alpha: true, antialias: true });
  previewRenderer.setSize(180, 135, false);
  previewCam.position.set(0, 0.35, 2.35);
  previewScene.add(new THREE.AmbientLight(0xffffff, 1.2));
  pDir.position.set(2, 3, 4);
  previewScene.add(pDir);

  // 3D Underwater Live Bait Cam PiP Renderer
  pipCanvas = document.getElementById('pip-bait-canvas');
  pipRenderer = new THREE.WebGLRenderer({ canvas: pipCanvas, alpha: false, antialias: true });
  pipRenderer.setSize(176, 112, false);
  pipScene.background = new THREE.Color(0x06243b);
  pipScene.fog = new THREE.FogExp2(0x06243b, 0.18);
  pipCam.position.set(0, 0.05, 2.25);

  pipScene.add(new THREE.HemisphereLight(0x7dd3fc, 0x04111f, 1.1));
  pipDir.position.set(1.5, 3, 2);
  pipScene.add(pipDir);
}
