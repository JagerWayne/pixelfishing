/* VFXManager (class): particle pools, ripples and feeding frenzies. Queries, spawners and the per-frame
   update join from the vfx-spawn and vfx-update method groups. */
import { THREE } from '../engine/three.js';
import { addMethods } from '../utils.js';
import { vfxSpawnMethods } from './vfx-spawn.js';
import { vfxUpdateMethods } from './vfx-update.js';

/* =========================================================================
   SECTION E2: 3D VFX PARTICLE, RIPPLE, FEEDING FRENZIES, WEATHER & JUMPING FISH
   ========================================================================= */
export class VFXManager {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.ripples = [];
		  this.matCache = new Map();
    this.jumpers = [];
    this.frenzies = [];

    this.dropGeo = new THREE.SphereGeometry(0.09, 5, 5);
    this.rippleGeo = new THREE.RingGeometry(0.18, 0.32, 18);
    this.rippleGeo.rotateX(-Math.PI / 2);

this._scratchVec = new THREE.Vector3();
    this._scratchPrev = new THREE.Vector3();
    this._particlePool = [];
    for (let i = 0; i < 160; i++) {
      const m = new THREE.Mesh(this.dropGeo, this.getParticleMat(0xe0f2fe, 0.92));
      m.visible = false;
      this.scene.add(m);
      this._particlePool.push({ mesh: m, vel: new THREE.Vector3(), life: 0, maxLife: 1, gravity: 10, active: false });
    }
    this._ripplePool = [];
    for (let i = 0; i < 40; i++) {
      const m = new THREE.Mesh(this.rippleGeo, new THREE.MeshBasicMaterial({
        color: 0xe0f2fe, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false
      }));
      m.visible = false;
      this.scene.add(m);
      this._ripplePool.push({ mesh: m, life: 0, maxLife: 0.85, maxScale: 2.4, active: false });
    }
		  
    const rainCount = 420;
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPos[i * 3] = (Math.random() - 0.5) * 90;
      rainPos[i * 3 + 1] = Math.random() * 34;
      rainPos[i * 3 + 2] = (Math.random() - 0.5) * 90;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    this.rainMat = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: 0.32,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });
    this.rainPoints = new THREE.Points(rainGeo, this.rainMat);
    this.scene.add(this.rainPoints);

    for (let i = 0; i < 4; i++) {
      const jGroup = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.75, 6),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, flatShading: true })
      );
      body.rotation.x = Math.PI / 2;
      jGroup.add(body);
      jGroup.visible = false;
      this.scene.add(jGroup);
      this.jumpers.push({
        mesh: jGroup,
        active: false,
        timer: 1.5 + i * 2.2,
        t: 0,
        start: new THREE.Vector3(),
        end: new THREE.Vector3()
      });
    }

    const frenzyZones = [
      { zoneId: 1, minX: -3.6, maxX: 3.6, minZ: -29, maxZ: -18.5, radius: 4.5 },
      { zoneId: 2, minX: -18, maxX: 18, minZ: -280, maxZ: -135, radius: 6.5 },
      { zoneId: 3, minX: -26, maxX: 26, minZ: -620, maxZ: -340, radius: 8.0 },
      { zoneId: 4, minX: -34, maxX: 34, minZ: -1400, maxZ: -690, radius: 9.5 },
      { zoneId: 5, minX: -42, maxX: 42, minZ: -2200, maxZ: -1560, radius: 10.5 }
    ];
    frenzyZones.forEach(fz => {
      const fGroup = new THREE.Group();
      const outerRing = new THREE.Mesh(
        new THREE.RingGeometry(fz.radius * 0.72, fz.radius, 28),
        new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false })
      );
      outerRing.rotation.x = -Math.PI / 2;
      const innerRing = new THREE.Mesh(
        new THREE.RingGeometry(fz.radius * 0.25, fz.radius * 0.52, 24),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false })
      );
      innerRing.rotation.x = -Math.PI / 2;
      innerRing.position.y = 0.02;
      fGroup.add(outerRing, innerRing);
      this.scene.add(fGroup);

      const spot = {
        ...fz,
        mesh: fGroup,
        outerRing,
        innerRing,
        x: 0,
        z: -30,
        ttl: 0
      };
      this.relocateFrenzy(spot);
      this.frenzies.push(spot);
    });
  }
}

export function init() {
  addMethods(VFXManager, vfxSpawnMethods, null);
  addMethods(VFXManager, vfxUpdateMethods, null);
}
