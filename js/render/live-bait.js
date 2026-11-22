/* The live bait cam's rig (line, hook, bait, bubbles) and setupLiveBaitPip. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { BAIT_TIERS } from '../data/equipment.js';
import { WorldBuilder } from '../world/world-builder.js';
import { textures } from './lights.js';
import { pipScene } from './previews.js';

export let pipLine;
let pipLineGeo, hookShank, hookCurve;

export const pipRigGroup = new THREE.Group();
const hookMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 });

let pipBaitMesh = new THREE.Group();

export const pipFishHolder = new THREE.Group();

export const pipBubbles = [];
const pipBubbleGeo = new THREE.SphereGeometry(0.032, 6, 6);
const pipBubbleMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.65 });

let pipFishObj = null;
shared.pipFishDirYaw = 0;

export function setupLiveBaitPip(catchObj, baitTier) {
  while (pipFishHolder.children.length > 0) {
    pipFishHolder.remove(pipFishHolder.children[0]);
  }
  pipFishObj = null;

  pipRigGroup.remove(pipBaitMesh);
  pipBaitMesh = WorldBuilder.buildBaitMesh(baitTier);
  pipBaitMesh.position.set(0.05, -0.07, 0);
  pipRigGroup.add(pipBaitMesh);

  if (catchObj && catchObj.item) {
    pipFishObj = WorldBuilder.buildSculptedFishMesh(catchObj.item, textures);
    pipFishObj.scale.setScalar(0.68);
    pipFishObj.position.set(-0.18, 0, 0);
    pipFishHolder.add(pipFishObj);
  }

  pipRigGroup.position.set(0.42, -0.02, 0);
  pipFishHolder.add(pipRigGroup);
  shared.pipFishDirYaw = 0;
  pipFishHolder.rotation.set(0, 0, 0);

  const baitName = BAIT_TIERS[baitTier - 1].name;
  document.getElementById('pip-bait-label').textContent = `BAIT: ${baitName}`;
}

export function init() {
  // Fishing line & J-hook attached directly to the fish's mouth
  pipLineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-0.35, 1.25, 0),
    new THREE.Vector3(0.42, 0.06, 0)
  ]);
  pipLine = new THREE.Line(pipLineGeo, new THREE.LineBasicMaterial({ color: 0xe0f2fe }));
  pipScene.add(pipLine);
  hookShank = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 6), hookMat);
  hookShank.position.set(0, 0.04, 0);
  hookCurve = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 6, 10, Math.PI), hookMat);
  hookCurve.rotation.z = Math.PI;
  hookCurve.position.set(0.075, -0.07, 0);
  pipRigGroup.add(hookShank, hookCurve);
  pipRigGroup.add(pipBaitMesh);
  pipFishHolder.add(pipRigGroup);
  pipScene.add(pipFishHolder);
  for (let i = 0; i < 10; i++) {
    const b = new THREE.Mesh(pipBubbleGeo, pipBubbleMat);
    b.position.set((Math.random() - 0.5) * 1.8, (Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 0.8);
    pipScene.add(b);
    pipBubbles.push({ mesh: b, speed: 0.45 + Math.random() * 0.55 });
  }
}
