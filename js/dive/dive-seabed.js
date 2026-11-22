/* Diving: the underwater root group, the seabed mesh and its colours, prop cells and solids. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { settings } from '../core/settings.js';
import { WorldBuilder } from '../world/world-builder.js';
import { camera, scene } from '../render/renderer.js';
import { world } from '../render/lights.js';
import { seabedNoise, seabedY } from './dive-state.js';

export let DM, DG;
let seabedGeo, seabedBaseXZ, seabedMesh, SB_PALETTE;

/* ---- N3: underwater visuals (everything lives under one root group that is hidden unless you are diving) ---- */
export const diveRoot = new THREE.Group();
export const mk = (geo, mat, px = 0, py = 0, pz = 0, sx = 1, sy = 1, sz = 1) => {
  const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); m.scale.set(sx, sy, sz); return m;
};

/* seabed: one grid that follows the diver and is re-shaped by the pure height function (so it never "swims") */
const SB_N = 56, SB_SIZE = 140, SB_STEP = SB_SIZE / SB_N;
shared.seabedKeyX = 1e9;
      shared.seabedKeyZ = 1e9;
const _sbCol = new THREE.Color(), _sbPatch = new THREE.Color(0x6f9a58);
function seabedColor(wx, wz, depth, out) {
  let i = 1;
  while (i < SB_PALETTE.length - 1 && depth > SB_PALETTE[i][0]) i++;
  const a = SB_PALETTE[i - 1], b = SB_PALETTE[i];
  const t = THREE.MathUtils.clamp((depth - a[0]) / (b[0] - a[0]), 0, 1);
  out.copy(a[1]).lerp(b[1], t);
  const patch = Math.sin(wx * 0.045 + 1.3) * Math.sin(wz * 0.057);
  if (patch > 0.5 && depth < 24) out.lerp(_sbPatch, Math.min(0.7, (patch - 0.5) * 2.2));
  const n = 0.88 + 0.2 * seabedNoise(wx * 1.7, wz * 1.7);
  out.multiplyScalar(n);
}
export function updateSeabedMesh(cx, cz, force) {
  const kx = Math.round(cx / SB_STEP), kz = Math.round(cz / SB_STEP);
  if (!force && kx === shared.seabedKeyX && kz === shared.seabedKeyZ) return;
  shared.seabedKeyX = kx; shared.seabedKeyZ = kz;
  const ox = kx * SB_STEP, oz = kz * SB_STEP;
  const pos = seabedGeo.attributes.position, col = seabedGeo.attributes.color;
  for (let i = 0; i < pos.count; i++) {
    const wx = ox + seabedBaseXZ[i * 3], wz = oz + seabedBaseXZ[i * 3 + 2];
    const y = seabedY(wx, wz);
    pos.setY(i, y);
    seabedColor(wx, wz, -y, _sbCol);
    col.setXYZ(i, _sbCol.r, _sbCol.g, _sbCol.b);
  }
  pos.needsUpdate = true; col.needsUpdate = true;
  seabedMesh.position.set(ox, 0, oz);
}

/* seabed props: a hashed 7 m grid. Cells enter and leave as you swim; shared geometry keeps it cheap. */
export const CELL = 7;
export const propCells = new Map();
export const swayList = [];
export const ventList = [];
export const lurkDone = new Set();
export const diveOpened = new Set();
shared.propKeyI = 1e9;
      shared.propKeyJ = 1e9;
export const propRadius = () => (settings.quality === 'low' ? 3 : 5);
/* Solid things under the water, as vertical cylinders {x, z, r, y0, y1}: seabed rocks, coral, wrecks and chests (per cell,
   dropped with the cell) plus the pier pilings, lighthouse rocks and buoys (taken from the boat colliders). The diver, the
   fish and the spear all use them, so nothing swims or flies through a rock or a wreck. */
export const diveSolids = [];
shared.diveStatic = [];
export function addDiveSolid(key, x, z, r, y0, y1) { diveSolids.push({ key, x, z, r, y0, y1 }); }
export function addSolidFromObject(key, obj, shrink) {
  obj.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(obj);
  const r = Math.max(b.max.x - b.min.x, b.max.z - b.min.z) * 0.5 * shrink;
  addDiveSolid(key, (b.min.x + b.max.x) / 2, (b.min.z + b.max.z) / 2, r, b.min.y, b.max.y);
}
export function addWreckSolids(key, w) {
  const a = w.rotation.y, c = Math.cos(a), sn = Math.sin(a), base = w.position.y;
  [[-3.4, 1.75], [-1.7, 1.75], [0, 1.75], [1.7, 1.75], [3.4, 1.75], [5.0, 1.3]].forEach(([lx, r]) =>
    addDiveSolid(key, w.position.x + lx * c, w.position.z - lx * sn, r, base - 0.5, base + 2.6));
}

export function init() {
  diveRoot.visible = false;
  scene.add(diveRoot);
  if (!camera.parent) scene.add(camera);
  world.oceanMat.side = THREE.DoubleSide;

  DM = {
    rock: new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.95, flatShading: true }),
    rockDark: new THREE.MeshStandardMaterial({ color: 0x3f4756, roughness: 0.95, flatShading: true }),
    kelp: new THREE.MeshStandardMaterial({ color: 0x2f8f4e, roughness: 0.8, flatShading: true }),
    kelpDeep: new THREE.MeshStandardMaterial({ color: 0x1f6b57, roughness: 0.8, flatShading: true }),
    grass: new THREE.MeshStandardMaterial({ color: 0x6aa84f, roughness: 0.85, flatShading: true, side: THREE.DoubleSide }),
    tube: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7, flatShading: true }),
    stalk: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8, flatShading: true }),
    orb: new THREE.MeshBasicMaterial({ color: 0x67e8f9 }),
    orb2: new THREE.MeshBasicMaterial({ color: 0xf0abfc }),
    wood: new THREE.MeshStandardMaterial({ color: 0x7c4a21, roughness: 0.85, flatShading: true }),
    woodOld: new THREE.MeshStandardMaterial({ color: 0x4a3626, roughness: 0.95, flatShading: true }),
    gold: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35, metalness: 0.6, emissive: 0x6b4e00, emissiveIntensity: 0.6 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.35, metalness: 0.75 }),
    whale: new THREE.MeshStandardMaterial({ color: 0x2b3a55, roughness: 0.8, flatShading: true }),
    coral: [0xf472b6, 0xfb923c, 0xc084fc, 0xf87171, 0xfacc15, 0x2dd4bf].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, flatShading: true }))
  };
  DG = {
    rock: WorldBuilder.buildRock(1, 3.7, 0xffffff, 1).geometry,
    blob: new THREE.IcosahedronGeometry(1, 0),
    kelpBlade: new THREE.BoxGeometry(0.16, 1, 0.05),
    grass: new THREE.ConeGeometry(0.07, 1, 4),
    branch: new THREE.CylinderGeometry(0.07, 0.12, 1, 5),
    tube: new THREE.CylinderGeometry(0.16, 0.2, 1, 7, 1, true),
    stalk: new THREE.CylinderGeometry(0.03, 0.05, 1, 5),
    orb: new THREE.SphereGeometry(0.16, 8, 6),
    box: new THREE.BoxGeometry(1, 1, 1)
  };
  seabedGeo = new THREE.PlaneGeometry(SB_SIZE, SB_SIZE, SB_N, SB_N);
  seabedGeo.rotateX(-Math.PI / 2);
  seabedBaseXZ = Float32Array.from(seabedGeo.attributes.position.array);
  seabedGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(seabedGeo.attributes.position.count * 3), 3));
  seabedMesh = new THREE.Mesh(seabedGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }));
  seabedMesh.frustumCulled = false;
  diveRoot.add(seabedMesh);
  SB_PALETTE = [[0, 0xdcc88f], [8, 0xbaa677], [20, 0x8f8567], [40, 0x5a6275], [70, 0x363c55], [110, 0x1d2238]].map(([d, h]) => [d, new THREE.Color(h)]);
}
