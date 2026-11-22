/* updateDiveSim: the per-frame dive simulation. Kept whole (one long function). */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { camera } from '../render/renderer.js';
import { world } from '../render/lights.js';
import { cheats, joyState, keys } from '../sim/controls-state.js';
import { diveWeightRange, fmtWeightRange } from '../town/reading.js';
import { showToast } from '../ui/toasts.js';
import { updatePrimaryActionButton } from '../ui/install.js';
import { DIVE_FISH_TARGET, bagWeight, dive, diveAirRate, diveChests, diveFish, diveGear, diveInput, diveZoneAt,
  harpoon, seabedY, spearGun } from './dive-state.js';
import { pickLockTarget, stepDiveFish } from './dive-steer.js';
import { swayList, updateSeabedMesh } from './dive-seabed.js';
import { resolveDiveSolids } from './dive-props.js';
import { updateVents } from './dive-cells.js';
import { populateDiveFish, removeDiveFish, updateProps, whale, whaleState } from './dive-fish.js';
import { emitBubbles, gunGroup, updateParticles } from './dive-gear.js';
import { _dvFwd, _dvLook, _dvTmp, diveMuzzle, diveText, fmtAir } from './dive-harpoon.js';
import { updateHarpoon } from './dive-chest.js';
import { endDive } from './dive-start.js';
import { applyDiveEnvironment } from './dive-env.js';

export function updateDiveSim(rawDt) {
  const dt = rawDt;   // already 0 while paused or in a menu
  const gear = diveGear(), gun = spearGun();
  dive.t += dt;

  /* input */
  let moveX = joyState.x, moveZ = joyState.y;
  if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;
  if (keys['KeyW'] || keys['ArrowUp']) moveZ -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) moveZ += 1;
  moveX = THREE.MathUtils.clamp(moveX, -1, 1); moveZ = THREE.MathUtils.clamp(moveZ, -1, 1);
  const upIn = (diveInput.up || keys['KeyR'] ? 1 : 0) - (diveInput.down || keys['KeyF'] ? 1 : 0);
  if (dive.emergency) { moveX = moveZ = 0; }
  else if (dive.surfacing && (upIn < 0 || Math.abs(moveZ) > 0.4)) dive.surfacing = false;
  dive.yaw -= moveX * 1.9 * dt;

  const speed = gear.speed;
  let wantVy = upIn * speed * 0.8;
  if (dive.emergency) wantVy = 4.2;
  else if (dive.surfacing) wantVy = Math.min(2.8, speed);
  dive.vf += (-moveZ * speed - dive.vf) * (1 - Math.exp(-2.6 * dt));
  dive.vy += (wantVy - dive.vy) * (1 - Math.exp(-3.2 * dt));
  dive.pos.x += -Math.sin(dive.yaw) * dive.vf * dt;
  dive.pos.z += -Math.cos(dive.yaw) * dive.vf * dt;
  dive.pos.y += dive.vy * dt;
  if (resolveDiveSolids(dive.pos, 0.45, 0.4)) dive.vf *= 0.5;

  /* limits: pier / beach, leash, sea floor, surface, rated depth */
  if (dive.pos.z > -3.6) { dive.pos.z = -3.6; dive.vf *= 0.5; }
  const lx = dive.pos.x - dive.startX, lz = dive.pos.z - dive.startZ, lr = Math.hypot(lx, lz);
  if (lr > 150) {
    dive.pos.x = dive.startX + lx / lr * 150; dive.pos.z = dive.startZ + lz / lr * 150;
    if (dive.t - dive.leashWarnT > 6) { dive.leashWarnT = dive.t; showToast('You are too far from your platform — swim back!'); }
  }
  const floorY = seabedY(dive.pos.x, dive.pos.z) + 0.6;
  if (dive.pos.y < floorY) { dive.pos.y = floorY; if (dive.vy < 0) dive.vy = 0; }
  const maxD = cheats.noDepth ? 999 : gear.maxDepth;
  if (-dive.pos.y > maxD) {
    dive.pos.y = -maxD; if (dive.vy < 0) dive.vy = 0;
    if (dive.t - dive.depthWarnT > 4) { dive.depthWarnT = dive.t; sfx.playAirWarn(false); showToast(`⚠️ Rated depth reached (${gear.maxDepth} m). Better dive gear goes deeper.`); }
  }
  if (dive.pos.y > 0.12) { dive.pos.y = 0.12; if (dive.vy > 0) dive.vy = 0; }
  const depth = Math.max(0, -dive.pos.y);
  if (depth > dive.maxDepth) dive.maxDepth = depth;

  /* air */
  if (depth < 0.45) {
    if (gear.tier === 1 && dive.air < dive.airMax) dive.air = Math.min(dive.airMax, dive.air + dive.airMax * 0.3 * dt);
  } else if (!cheats.infAir && !dive.emergency) {
    dive.air -= diveAirRate(depth) * dt;
  }
  if (cheats.infAir) dive.air = dive.airMax;
  const airPct = dive.airMax > 0 ? dive.air / dive.airMax : 1;
  if (!dive.emergency) {
    if (airPct < 0.25 && !dive.warned25) { dive.warned25 = true; sfx.playAirWarn(false); showToast('🫧 Air at 25 % — start heading up!'); }
    if (airPct < 0.1 && !dive.warned10) { dive.warned10 = true; sfx.playAirWarn(true); showToast('🚨 Air nearly gone! Surface NOW (press SURFACE for auto-ascent)'); }
    if (airPct < 0.1 && dt > 0) { dive.airBeep -= dt; if (dive.airBeep <= 0) { dive.airBeep = 1.1; sfx.playAirWarn(true); } }
    if (airPct > 0.3) { dive.warned25 = dive.warned10 = false; }
    if (dive.air <= 0) { dive.emergency = true; dive.surfacing = false; sfx.playAirWarn(true); showToast('🆘 Out of air! Emergency ascent!'); }
  } else if (depth < 0.5) { endDive('air'); return; }
  dive.zone = (zz => { if (zz !== dive.zone) { showToast(`🌊 ${zz.name}`); } return zz; })(diveZoneAt(dive.pos.z));

  /* camera */
  let wantPitch = 0;
  if (upIn) wantPitch = upIn * 0.5;
  else if (dive.lock) wantPitch = THREE.MathUtils.clamp(Math.atan2(dive.lock.pos.y - dive.pos.y, Math.hypot(dive.lock.pos.x - dive.pos.x, dive.lock.pos.z - dive.pos.z)), -0.6, 0.6) * 0.8;
  else if (dive.surfacing || dive.emergency) wantPitch = 0.6;
  dive.pitch += (wantPitch - dive.pitch) * (1 - Math.exp(-3 * dt));
  const cp = Math.cos(dive.pitch);
  const bob = Math.sin(shared.elapsed * 1.7) * 0.03;
  camera.position.set(dive.pos.x, dive.pos.y + bob, dive.pos.z);
  camera.up.set(0, 1, 0);
  _dvFwd.set(-Math.sin(dive.yaw) * cp, Math.sin(dive.pitch), -Math.cos(dive.yaw) * cp);
  _dvLook.copy(camera.position).addScaledVector(_dvFwd, 10);
  camera.lookAt(_dvLook);
  camera.updateMatrixWorld();
  shared.gunKick = Math.max(0, shared.gunKick - dt * 5);
  gunGroup.position.set(0.3 + Math.sin(shared.elapsed * 1.3) * 0.008, -0.27 + Math.sin(shared.elapsed * 1.7) * 0.01, -0.55 + shared.gunKick * 0.12);
  gunGroup.rotation.x = shared.gunKick * 0.12;

  updateSeabedMesh(dive.pos.x, dive.pos.z, false);
  updateProps(dive.pos.x, dive.pos.z, false);
  updateVents(dt);
  swayList.forEach(p => {
    if (p.userData.sway) { p.rotation.z = Math.sin(shared.elapsed * 1.1 + p.userData.phase) * p.userData.sway; p.rotation.x = Math.cos(shared.elapsed * 0.9 + p.userData.phase) * p.userData.sway * 0.7; }
    else if (p.userData.pulse) { const k = 0.85 + 0.15 * Math.sin(shared.elapsed * 2 + p.userData.phase); p.scale.setScalar(k); }
  });

  /* fish */
  if (dt > 0) {
    const spearPos = harpoon.state === 'flying' ? harpoon.pos : null;
    for (let i = diveFish.length - 1; i >= 0; i--) {
      const f = diveFish[i];
      if (f.state !== 'swim') continue;
      stepDiveFish(f, dt, dive.pos, spearPos);
      if (f.pos.distanceTo(dive.pos) > 78) { removeDiveFish(f); continue; }
      f.wig += dt * (3 + f.v * 2.2);
      f.mesh.position.copy(f.pos);
      f.mesh.rotation.set(Math.sin(f.wig * 0.5) * 0.04, -f.h + Math.sin(f.wig) * Math.min(0.2, 0.05 + f.v * 0.04), f.p, 'YZX');
    }
    dive.spawnT = (dive.spawnT || 0) - dt;
    if (dive.spawnT <= 0 && diveFish.length < DIVE_FISH_TARGET()) { populateDiveFish(dive.pos, false); dive.spawnT = 0.5; }
  }

  /* auto-aim lock */
  harpoon.muzzle && diveMuzzle(harpoon.muzzle);
  const lockRange = (gun.tier ? gun.range : 0) * (cheats.autoHit ? 1.4 : 1.05);
  const prevLock = dive.lock;
  dive.lock = gun.tier && !dive.emergency && harpoon.state !== 'return'
    ? pickLockTarget(camera.position, _dvFwd, diveFish, lockRange, cheats.autoHit ? 0.9 : 0.965) : null;
  if (dive.lock && dive.lock !== prevLock) sfx.playSonarPing();
  const lockEl = document.getElementById('dive-lock');
  if (dive.lock) {
    _dvTmp.copy(dive.lock.pos).project(camera);
    if (_dvTmp.z < 1) {
      lockEl.style.display = 'block';
      lockEl.style.left = ((_dvTmp.x * 0.5 + 0.5) * window.innerWidth) + 'px';
      lockEl.style.top = ((-_dvTmp.y * 0.5 + 0.5) * window.innerHeight) + 'px';
      const tooBig = dive.lock.weight > gun.power && !cheats.autoHit;
      lockEl.classList.toggle('bad', tooBig);
      diveText('dive-lock-label', `${dive.lock.item.name} ${fmtWeightRange(diveWeightRange(dive.lock))}${tooBig ? ' • TOO BIG' : ''}`);
    } else lockEl.style.display = 'none';
  } else lockEl.style.display = 'none';

  /* chests */
  let nc = null, ncd = 3.4;
  for (const c of diveChests) {
    if (c.userData.opened) continue;
    const d = c.position.distanceTo(dive.pos);
    if (d < ncd) { ncd = d; nc = c; }
  }
  dive.nearChest = nc;
  diveChests.forEach(c => {
    const target = c.userData.opened ? -1.1 : 0;
    c.userData.lid.rotation.x += (target - c.userData.lid.rotation.x) * Math.min(1, dt * 6);
  });

  /* harpoon, particles, ambient creatures */
  if (dt > 0) updateHarpoon(dt);
  updateParticles(dt, camera.position);
  dive.bubbleT -= dt;
  if (dive.bubbleT <= 0) { dive.bubbleT = 3.5 + Math.random() * 2; emitBubbles(camera.position.x + _dvFwd.x * 0.4, camera.position.y - 0.15, camera.position.z + _dvFwd.z * 0.4, 5, 0.12); sfx.playBubbleBurst(); }
  dive.whaleT -= dt;
  if (dive.whaleT <= 0 && !whale.visible && depth > 3) {
    dive.whaleT = 80 + Math.random() * 80;
    const a = Math.random() * 6.28, dist = 48;
    whaleState.dir.set(-Math.sin(a + 1.57), 0, -Math.cos(a + 1.57));
    const wy = THREE.MathUtils.clamp(dive.pos.y - 2 + Math.random() * 4, seabedY(dive.pos.x, dive.pos.z) + 6, -6);
    whale.position.set(dive.pos.x + Math.sin(a) * dist - whaleState.dir.x * 40, wy, Math.min(-8, dive.pos.z + Math.cos(a) * dist - whaleState.dir.z * 40));
    whale.rotation.y = -Math.atan2(whaleState.dir.z, whaleState.dir.x);
    whaleState.life = 24; whale.visible = true; sfx.playWhaleCall();
  }
  if (whale.visible && dt > 0) {
    whale.position.addScaledVector(whaleState.dir, 3.6 * dt);
    whale.position.y += Math.sin(shared.elapsed * 0.5) * 0.3 * dt;
    whale.rotation.z = Math.sin(shared.elapsed * 0.9) * 0.05;
    whaleState.life -= dt;
    if (whaleState.life <= 0) whale.visible = false;
  }

  applyDiveEnvironment(dt, depth);
  world.chairGroup.visible = false;
  world.fishingLine.visible = false; world.bobberGroup.visible = false;
  sfx.uwDepth = Math.min(1, depth / 60);

  /* HUD (throttled) */
  dive.hudT -= rawDt;
  if (dive.hudT <= 0) {
    dive.hudT = 0.1;
    diveText('dive-depth', `${depth.toFixed(1)} m / ${cheats.noDepth ? '∞' : gear.maxDepth} m`);
    const dBar = document.querySelector('#dive-depth-bar > i'); if (dBar) dBar.style.width = Math.min(100, depth / Math.max(1, cheats.noDepth ? 100 : gear.maxDepth) * 100).toFixed(1) + '%';
    diveText('dive-air-text', cheats.infAir ? '∞' : fmtAir(dive.air));
    const aBar = document.querySelector('#dive-air-bar > i'); if (aBar) aBar.style.width = Math.max(0, airPct * 100).toFixed(1) + '%';
    document.getElementById('dive-air-bar').classList.toggle('low', airPct < 0.25);
    diveText('dive-bag-text', `${bagWeight().toFixed(1)} / ${cheats.bigBag ? '∞' : gear.bagKg} kg`);
    diveText('dive-gun-name', `🔱 ${gun.tier ? gun.name : 'No spear gun'}`);
    const gs = document.getElementById('dive-gun-state');
    const label = gun.tier === 0 ? 'NONE' : harpoon.state === 'ready' ? 'READY' : harpoon.state === 'reload' ? 'RELOADING' : 'FIRED';
    if (gs.textContent !== label) { gs.textContent = label; gs.className = harpoon.state === 'ready' ? 'ready' : 'reload'; }
    document.getElementById('dive-flash').classList.toggle('on', (airPct < 0.1 || dive.emergency) && Math.floor(shared.elapsed * 2.5) % 2 === 0);
  }
  const btnKey = `${harpoon.state}|${dive.nearChest ? 1 : 0}|${gun.tier}|${dive.emergency ? 1 : 0}`;
  if (btnKey !== dive.btnKey) { dive.btnKey = btnKey; updatePrimaryActionButton(); }
}
