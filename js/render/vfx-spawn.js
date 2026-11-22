/* VFXManager methods: frenzy queries, pooled particle materials, splashes, sparkles and wakes. */
import { THREE } from '../engine/three.js';

export const vfxSpawnMethods = {
  relocateFrenzy(spot) {
    spot.x = spot.minX + Math.random() * (spot.maxX - spot.minX);
    spot.z = spot.minZ + Math.random() * (spot.maxZ - spot.minZ);
    spot.ttl = 45 + Math.random() * 40;
    spot.spotted = false; spot.pipSaid = false; spot.chum = false;   // a frenzy that moves needs spotting again
    spot.mesh.position.set(spot.x, 0.08, spot.z);
  },

  isPointInFrenzy(pos) {
    for (const f of this.frenzies) {
      if (Math.hypot(pos.x - f.x, pos.z - f.z) <= f.radius * 1.1) {
        return f;
      }
    }
    return null;
  },

  getNearestFrenzy(pos) {
    let best = null;
    let bestDist = Infinity;
    for (const f of this.frenzies) {
      const d = Math.hypot(pos.x - f.x, pos.z - f.z);
      if (d < bestDist) {
        bestDist = d;
        best = f;
      }
    }
    return best ? { spot: best, dist: bestDist } : null;
  },

  getParticleMat(color, opacity = 0.9) {
    const key = `${color}_${opacity}`;
    let mat = this.matCache.get(key);
    if (!mat) {
      mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
      this.matCache.set(key, mat);
    }
    return mat;
  },

  _acquireParticle(mat) {
  const p = this._particlePool.find(item => !item.active);
  if (!p) return null;
  p.active = true;
  p.mesh.material = mat;
  p.mesh.visible = true;
  return p;
  },

  spawnSplash(pos, count = 14, color = 0xe0f2fe, spread = 3.2) {
  const mat = this.getParticleMat(color, 0.92);
  for (let i = 0; i < count; i++) {
    const p = this._acquireParticle(mat);
    if (!p) break;
    p.mesh.position.set(pos.x, pos.y + 0.08, pos.z);
    p.mesh.scale.setScalar(1);
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.4 + Math.random() * 0.8) * spread;
    p.vel.set(Math.cos(angle) * speed, 2.4 + Math.random() * 3.0, Math.sin(angle) * speed);
    p.life = 0;
    p.maxLife = 0.45 + Math.random() * 0.25;
    p.gravity = 11;
  }
  this.spawnRipple(pos, color, 2.6);
  },

  spawnSparkles(pos, count = 16, color = 0xfef08a) {
  const mat = this.getParticleMat(color, 1.0);
  for (let i = 0; i < count; i++) {
    const p = this._acquireParticle(mat);
    if (!p) break;
    p.mesh.scale.setScalar(0.8);
    p.mesh.position.copy(pos);
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.2 + Math.random() * 2.5;
    p.vel.set(Math.cos(angle) * speed, 1.8 + Math.random() * 2.6, Math.sin(angle) * speed);
    p.life = 0;
    p.maxLife = 0.55 + Math.random() * 0.3;
    p.gravity = 3.5;
  }
  },

  spawnWake(pos, yaw, speedFactor = 1) {
  const p = this._acquireParticle(this.getParticleMat(0xf0f9ff, 0.65));
  if (!p) return;
  const sideOffset = (Math.random() - 0.5) * 1.1;
  p.mesh.position.set(pos.x + Math.cos(yaw) * sideOffset, pos.y + 0.05, pos.z - Math.sin(yaw) * sideOffset);
  p.mesh.scale.setScalar(0.9 + Math.random() * 0.7);
  p.vel.set((Math.random() - 0.5) * 0.9, 0.35 + Math.random() * 0.45 * speedFactor, (Math.random() - 0.5) * 0.9);
  p.life = 0;
  p.maxLife = 0.55;
  p.gravity = 1.8;
  },
};
