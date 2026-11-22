/* Diving: bubbles, particles, light shafts, the dive lamp and the spear gun model. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { camera } from '../render/renderer.js';
import { DM, diveRoot } from './dive-seabed.js';
import { BUB_N, SNOW_BOX, SNOW_N, bubGeo, bubLife, bubPos, bubVel, snowGeo, snowOff, snowPos } from './dive-fish.js';

export let gunSpearTip, tether;

export function emitBubbles(x, y, z, n, spread = 0.18) {
  for (let k = 0; k < n; k++) {
    const i = shared.bubCursor; shared.bubCursor = (shared.bubCursor + 1) % BUB_N;
    bubPos[i * 3] = x + (Math.random() - 0.5) * spread; bubPos[i * 3 + 1] = y + Math.random() * 0.1; bubPos[i * 3 + 2] = z + (Math.random() - 0.5) * spread;
    bubVel[i] = 0.9 + Math.random() * 0.9; bubLife[i] = 3 + Math.random() * 4;
  }
  bubGeo.attributes.position.needsUpdate = true;
}
export function updateParticles(dt, cam) {
  for (let i = 0; i < SNOW_N; i++) {
    const o = i * 3;
    snowOff[o + 1] -= 0.12 * dt; snowOff[o] += Math.sin(shared.elapsed * 0.4 + i) * 0.05 * dt;
    for (let a = 0; a < 3; a++) {
      const c = a === 0 ? cam.x : a === 1 ? cam.y : cam.z, half = (a === 1 ? SNOW_BOX * 0.3 : SNOW_BOX * 0.5);
      if (snowOff[o + a] < c - half) snowOff[o + a] += half * 2; else if (snowOff[o + a] > c + half) snowOff[o + a] -= half * 2;
    }
    snowPos[o] = snowOff[o]; snowPos[o + 1] = Math.min(-0.3, snowOff[o + 1]); snowPos[o + 2] = snowOff[o + 2];
  }
  snowGeo.attributes.position.needsUpdate = true;
  let any = false;
  for (let i = 0; i < BUB_N; i++) {
    if (bubLife[i] <= 0) continue;
    bubLife[i] -= dt; any = true;
    bubPos[i * 3 + 1] += bubVel[i] * dt;
    bubPos[i * 3] += Math.sin(shared.elapsed * 3 + i) * 0.12 * dt;
    if (bubLife[i] <= 0 || bubPos[i * 3 + 1] > 0) { bubLife[i] = 0; bubPos[i * 3 + 1] = 1e4; }
  }
  if (any) bubGeo.attributes.position.needsUpdate = true;
}

/* light shafts from the surface: a few faint additive slabs that follow the diver in shallow water */
export const shafts = new THREE.Group();
export const shaftMat = new THREE.MeshBasicMaterial({ color: 0xbfe9ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });

/* the head lamp rides on the camera (created once at start-up, intensity 0, so lights never recompile) */
export const diveLamp = new THREE.SpotLight(0xdff6ff, 0, 40, 0.5, 0.55, 1.2);

/* the held gun (first-person model, tinted by tier) and the spear that flies */
export const GUN_COLORS = [0x94a3b8, 0x92400e, 0x0e7490, 0x15803d, 0xb45309, 0x7c3aed];
export const gunGroup = new THREE.Group();
export const gunBody = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.5), new THREE.MeshStandardMaterial({ color: 0x0e7490, roughness: 0.5, metalness: 0.3 }));
const gunBarrel = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.9), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.6 }));
const gunGrip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.17, 0.08), new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 }));
shared.gunKick = 0;

export const spearMesh = new THREE.Group();
export const tetherGeo = new THREE.BufferGeometry();

export function init() {
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(1.8 + Math.random() * 2.4, 26), shaftMat);
    s.position.set((Math.random() - 0.5) * 30, -13, (Math.random() - 0.5) * 30);
    s.rotation.set(0, Math.random() * 3.14, 0.12 + Math.random() * 0.08);
    s.userData.ph = Math.random() * 6.28; shafts.add(s);
  }
  shafts.frustumCulled = false;
diveRoot.add(shafts);
  diveLamp.position.set(0.15, -0.08, 0);
  diveLamp.target.position.set(0, 0, -10);
  camera.add(diveLamp);
camera.add(diveLamp.target);
  gunBarrel.position.set(0, 0.03, -0.55);
  gunGrip.position.set(0, -0.13, 0.1);
  gunSpearTip = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.28, 6), DM.steel);
  gunSpearTip.rotation.x = -Math.PI / 2;
gunSpearTip.position.set(0, 0.03, -1.1);
  gunGroup.add(gunBody, gunBarrel, gunGrip, gunSpearTip);
  gunGroup.position.set(0.3, -0.27, -0.55);
  gunGroup.visible = false;
  camera.add(gunGroup);
  (() => {
    const shaftG = new THREE.CylinderGeometry(0.022, 0.022, 1.1, 6); shaftG.rotateX(-Math.PI / 2);
    const tipG = new THREE.ConeGeometry(0.07, 0.3, 6); tipG.rotateX(-Math.PI / 2); tipG.translate(0, 0, -0.68);
    const flG = new THREE.BoxGeometry(0.2, 0.01, 0.2); flG.translate(0, 0, 0.5);
    spearMesh.add(new THREE.Mesh(shaftG, DM.steel), new THREE.Mesh(tipG, DM.steel), new THREE.Mesh(flG, new THREE.MeshStandardMaterial({ color: 0xef4444 })));
    spearMesh.visible = false; diveRoot.add(spearMesh);
  })();
  tetherGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
  tether = new THREE.Line(tetherGeo, new THREE.LineBasicMaterial({ color: 0xe2e8f0 }));
  tether.frustumCulled = false;
tether.visible = false;
diveRoot.add(tether);
}
