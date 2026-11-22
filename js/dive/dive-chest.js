/* Diving: the harpoon flight and opening chests. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { vfx } from '../render/previews.js';
import { cheats } from '../sim/controls-state.js';
import { addXp, bumpStat } from '../save/career.js';
import { checkAchievements } from '../fishing/market.js';
import { saveGame } from '../save/save-game.js';
import { showToast } from '../ui/toasts.js';
import { updateHUD } from '../ui/hud.js';
import { dive, diveFish, harpoon, seabedY, spearGun } from './dive-state.js';
import { segmentHitsSphere } from './dive-steer.js';
import { diveOpened } from './dive-seabed.js';
import { pointInDiveSolid } from './dive-props.js';
import { emitBubbles, spearMesh, tetherGeo } from './dive-gear.js';
import { _dvLook, _dvNeg, _dvQuat, _dvTmp, diveMuzzle, finishHarpoon, onSpearHit, startHarpoonReturn } from './dive-harpoon.js';

export function updateHarpoon(dt) {
  const gun = spearGun();
  diveMuzzle(harpoon.muzzle);
  if (harpoon.state === 'reload') {
    harpoon.reloadT -= dt;
    if (harpoon.reloadT <= 0) { harpoon.state = 'ready'; sfx.playTone({ freq: 620, endFreq: 820, type: 'square', duration: 0.06, vol: 0.05 }); }
  }
  if (harpoon.state === 'flying') {
    const steps = Math.max(1, Math.ceil(gun.speed * dt / 0.6));
    const h = dt / steps;
    for (let s = 0; s < steps && harpoon.state === 'flying'; s++) {
      harpoon.prev.copy(harpoon.pos);
      const tg = harpoon.target;
      if (cheats.autoHit && tg && tg.state === 'swim') {
        _dvTmp.copy(tg.pos).sub(harpoon.pos).normalize().multiplyScalar(gun.speed);
        harpoon.vel.lerp(_dvTmp, Math.min(1, 9 * h));
        harpoon.vel.setLength(gun.speed);
      }
      harpoon.pos.addScaledVector(harpoon.vel, h);
      harpoon.travelled += gun.speed * h;
      for (const f of diveFish) {
        if (f.state !== 'swim') continue;
        if (segmentHitsSphere(harpoon.prev, harpoon.pos, f.pos, f.radius * (cheats.autoHit ? 1.8 : 1) + 0.14)) { onSpearHit(f); break; }
      }
      if (harpoon.state !== 'flying') break;
      if (pointInDiveSolid(harpoon.pos)) { emitBubbles(harpoon.pos.x, harpoon.pos.y, harpoon.pos.z, 4, 0.2); startHarpoonReturn(); break; }
      if (harpoon.pos.y < seabedY(harpoon.pos.x, harpoon.pos.z) + 0.05 || harpoon.pos.y > -0.02 || harpoon.travelled > gun.range) {
        emitBubbles(harpoon.pos.x, harpoon.pos.y, harpoon.pos.z, 3, 0.2);
        startHarpoonReturn();
      }
    }
  } else if (harpoon.state === 'return') {
    _dvTmp.copy(harpoon.muzzle).sub(harpoon.pos);
    const d = _dvTmp.length();
    if (d < 1.1) finishHarpoon();
    else {
      _dvTmp.multiplyScalar(1 / d);
      harpoon.vel.copy(_dvTmp).multiplyScalar(-1);   // the tip still points away from you
      harpoon.pos.addScaledVector(_dvTmp, Math.min(d, 34 * dt));
      if (harpoon.hit) sfx.playSpearReel();
    }
  }
  if (harpoon.state === 'flying' || harpoon.state === 'return') {
    _dvLook.copy(harpoon.vel).normalize();
    if (_dvLook.lengthSq() > 0.5) { _dvQuat.setFromUnitVectors(_dvNeg, _dvLook); spearMesh.quaternion.copy(_dvQuat); }
    spearMesh.position.copy(harpoon.pos);
    const f = harpoon.hit;
    if (f) {
      f.pos.copy(harpoon.pos).addScaledVector(_dvLook, 0.5 + f.len * 0.3);
      f.mesh.position.copy(f.pos);
      f.mesh.rotation.set(0, -Math.atan2(_dvLook.z, _dvLook.x), Math.asin(THREE.MathUtils.clamp(_dvLook.y, -1, 1)), 'YZX');
      f.mesh.rotation.x = Math.sin(shared.elapsed * 22) * 0.35;
    }
    const a = tetherGeo.attributes.position;
    a.setXYZ(0, harpoon.muzzle.x, harpoon.muzzle.y, harpoon.muzzle.z); a.setXYZ(1, harpoon.pos.x, harpoon.pos.y, harpoon.pos.z);
    a.needsUpdate = true;
  }
}

export function diveOpenChest(c) {
  if (c.userData.opened) return;
  c.userData.opened = true; diveOpened.add(c.userData.key);
  const depth = Math.max(0, -dive.pos.y);
  const cash = Math.round((25 + depth * 5) * (0.7 + Math.random() * 0.8) * (1 + dive.zone.id * 0.35));
  shared.state.cash = +(shared.state.cash + cash).toFixed(2);
  bumpStat('earned', cash); bumpStat('diveChests'); addXp(12 + dive.zone.id * 4);
  sfx.playCoin(); sfx.playBubbleBurst();
  const w = c.getWorldPosition(new THREE.Vector3()); w.y += 0.5;
  vfx.spawnSparkles(w, 18, 0xfacc15);
  emitBubbles(w.x, w.y, w.z, 10, 0.5);
  showToast(`🧰 Sunken chest! +$${cash.toLocaleString()}`);
  saveGame(); updateHUD(); checkAchievements();
}
