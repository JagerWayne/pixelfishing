/* VFXManager methods: ripples and update, the per-frame particles, ripples and frenzies. */
import { THREE } from '../engine/three.js';
import { chancePerSec } from '../utils.js';

export const vfxUpdateMethods = {
  spawnRipple(pos, color = 0xe0f2fe, maxScale = 2.4) {
  const r = this._ripplePool.find(item => !item.active);
  if (!r) return;
  r.active = true;
  r.mesh.material.color.setHex(color);
  r.mesh.material.opacity = 0.75;
  r.mesh.position.set(pos.x, pos.y + 0.04, pos.z);
  r.mesh.scale.set(1, 1, 1);
  r.mesh.visible = true;
  r.life = 0;
  r.maxLife = 0.85;
  r.maxScale = maxScale;
  },
  // Feeding frenzies (rings and ripples on the water) are only visible with a sonar, while aboard a boat (vfx.frenzyVisible).
  update(dt, anchorPos, getWaveHeightFn, elapsed, zone, rainRate = 0) {
    this.rainMat.opacity = rainRate * 0.65;
    if (rainRate > 0.01) {
      this.rainPoints.position.set(anchorPos.x, 0, anchorPos.z - 12);
      const rArr = this.rainPoints.geometry.attributes.position.array;
      for (let i = 0; i < rArr.length; i += 3) {
        rArr[i + 1] -= (26 + rainRate * 14) * dt;
        rArr[i] -= 2.2 * dt;
        if (rArr[i + 1] < 0) {
          rArr[i + 1] = 32;
          rArr[i] = (Math.random() - 0.5) * 90;
        }
      }
      this.rainPoints.geometry.attributes.position.needsUpdate = true;
    }

    for (const f of this.frenzies) {
      f.mesh.visible = !!this.frenzyVisible || !!f.chum;   // a chummed frenzy shows without a sonar
      f.ttl -= dt;
      if (f.ttl <= 0) {
        this.relocateFrenzy(f);
      }
      f.mesh.position.y = getWaveHeightFn(f.x, f.z, elapsed, zone) + 0.09;
      f.outerRing.rotation.z = elapsed * 0.6;
      f.innerRing.rotation.z = -elapsed * 1.1;
      const pulse = 0.88 + Math.sin(elapsed * 4 + f.zoneId) * 0.14;
      f.innerRing.scale.setScalar(pulse);
      if (this.frenzyVisible && chancePerSec(5, dt)) {
        this.spawnRipple(new THREE.Vector3(f.x + (Math.random() - 0.5) * f.radius, f.mesh.position.y, f.z + (Math.random() - 0.5) * f.radius), 0xfef08a, 1.5);
      }
    }
  for (let i = 0; i < this._particlePool.length; i++) {
      const p = this._particlePool[i];
      if (!p.active) continue;
      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }
      p.vel.y -= p.gravity * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.scale.setScalar(Math.max(0.05, 1 - p.life / p.maxLife));
    }

    for (let i = 0; i < this._ripplePool.length; i++) {
      const r = this._ripplePool[i];
      if (!r.active) continue;
      r.life += dt;
      if (r.life >= r.maxLife) {
        r.active = false;
        r.mesh.visible = false;
        continue;
      }
      const t = r.life / r.maxLife;
      const s = 1 + t * r.maxScale;
      r.mesh.scale.set(s, s, 1);
      r.mesh.material.opacity = (1 - t) * 0.7;
    }

    for (const j of this.jumpers) {
      if (!j.active) {
        j.timer -= dt;
        if (j.timer <= 0) {
          j.active = true;
          j.t = 0;
          const side = Math.random() < 0.5 ? -1 : 1;
          const sx = anchorPos.x + side * (10 + Math.random() * 18);
          const sz = anchorPos.z - (12 + Math.random() * 24);
          const sy = getWaveHeightFn(sx, sz, elapsed, zone);
          j.start.set(sx, sy - 0.3, sz);
          j.end.set(sx + (Math.random() - 0.5) * 4, sy - 0.3, sz - 2.5);
          j.mesh.visible = true;
          this._scratchVec.set(sx, sy, sz);
          this.spawnRipple(this._scratchVec, 0xbce8fc, 1.8);
        }
      } else {
        j.t += dt * 1.15;
        if (j.t >= 1) {
          j.active = false;
          j.mesh.visible = false;
          j.timer = 3.5 + Math.random() * 5.0;
          const wy = getWaveHeightFn(j.end.x, j.end.z, elapsed, zone);
          this._scratchVec.set(j.end.x, wy, j.end.z);
          this.spawnSplash(this._scratchVec, 7, 0xe0f2fe, 1.8);
        } else {
          this._scratchPrev.copy(j.mesh.position);
          j.mesh.position.lerpVectors(j.start, j.end, j.t);
          j.mesh.position.y += Math.sin(j.t * Math.PI) * 1.65;
          j.mesh.lookAt(
            j.mesh.position.x * 2 - this._scratchPrev.x,
            j.mesh.position.y * 2 - this._scratchPrev.y,
            j.mesh.position.z * 2 - this._scratchPrev.z
          );
        }
      }
    }
  },
};
