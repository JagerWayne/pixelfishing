/* updateSimulation: the per-frame world simulation (walking, boats, fishing, camera, town).
   Kept whole in one file (one long function). */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { settings } from '../core/settings.js';
import { sfx } from '../data/equipment.js';
import { ZONES } from '../data/catalog.js';
import { LIGHT_TUNING } from '../render/model-kit.js';
import { BW_HALF, DAY_SECONDS, ISLAND, MOOR, PIER_DX, PIER_WALK, PLATFORM, lhBerthPose, townGround } from '../world/layout.js';
import { PHYS } from '../data/recipes.js';
import { Physics } from '../engine/physics.js';
import { spawnWorldCallout } from '../ui/world-callout.js';
import { camera, scene } from '../render/renderer.js';
import { anglerAnim, hemiLight, moonLight, sunLight, updateSunShadow, walkColliders, world } from '../render/lights.js';
import { vfx } from '../render/previews.js';
import { STAND_IDLE_DELAY, boatPos, camLookCur, ensureUmbrella, isRaining, placeUmbrella, standFocus, umbrella } from './runtime.js';
import { _rqA, _rqB, _rwA, _rwB, boatCastYaw, currentRideSpot, lhDock, rideX, spotQuat, spotWorld, spotYaw,
  updateStationPicker } from '../boat/stations.js';
import { MOVE, WALK_SPEED, _phMove, bobberPos, bobberVel, camOrbit, cheats, findRestSpot, joyState, keys,
  rescueStartPos, restState, revTurn, rollWeather, walkVel } from './controls-state.js';
import { MOVE_KEYS, moveLatched } from './joystick.js';
import { readProp, reading } from '../town/books.js';
import { updateReadBook, updateReading } from '../town/reading.js';
import { bumpStat } from '../save/career.js';
import { getMoonPhase, getWeatherObj, hasModule, isFullMoonNight, isNightTime } from '../save/queries.js';
import { _standLook, _standPos, aquaPan, currentStandView, getCurrentBoat, getCurrentRod, getCurrentZone,
  getDistanceMeters, saveGame } from '../save/save-game.js';
import { dayRollover, standCameraPose } from './spots.js';
import { isAtPierWaterEdge } from '../boat/terminal.js';
import { showToast } from '../ui/toasts.js';
import { BUMP_TEXT, resolveBoatCollisions, updateBoatControl } from '../boat/handling.js';
import { hullMo, updateHullMotion } from '../boat/hull.js';
import { questTick, triggerRescueSequence } from '../town/story.js';
import { NPC_R, npcState, updateNpcs } from '../town/npcs.js';
import { updateRestoSign } from '../town/restaurant.js';
import { updateRestaurant } from '../town/cooking.js';
import { updateRestoProps } from '../town/resto-sheet.js';
import { camDrag, tapMarker, updateTownFade } from './tap-walk.js';
import { townClock, townJobTick } from '../town/town-jobs.js';
import { updateTownProps } from '../town/jobs.js';
import { scope } from '../town/telescope-dice.js';
import { friendPerkTick, perfCull } from '../town/post-office.js';
import { chumTick, updateBuoys } from '../fishing/rigs.js';
import { syncTrophyWall, townLift, trophyMesh } from '../town/trophy-wall.js';
import { updateFightEnd } from '../fishing/hook.js';
import { cancelFishing, snapLine } from '../fishing/catch.js';
import { chancePerSec, isAnyModalOpen } from '../utils.js';
import { updateAquarium } from '../ui/trophies.js';
import { updateBountyPapers, updateCabinFade } from '../fishing/bounty-board.js';
import { shopBrowse } from '../shop/shop-kinds.js';
import { _shLook, _shPos, shopCameraPose, updateShopBrowse } from '../shop/shop-pictures.js';
import { updatePrimaryActionButton } from '../ui/install.js';
import { updateHUD } from '../ui/hud.js';
import { TINT, ZONE_SKY_MOOD, _skyCol1, _skyCol2, _skyCol3, currentFogColor, currentWaterColor, getWaveHeight,
  updateFirstPersonCamera } from './sky.js';
import { dive } from '../dive/dive-state.js';
import { updateDive } from '../dive/dive-controls.js';
import { FIGHT_STYLES, fight, fightTick } from '../fishing/fight.js';
import { beginLanding } from '../fishing/leap.js';
import { _camV1, _camV2, _camV3, _fightFwd, _fightRight, _fightTgt, setTensionVignette, triggerCamShake } from '../ui/pause.js';

export function updateSimulation(dt) {
  shared.elapsed += dt;
  updateBountyPapers(dt);
  updateShopBrowse(dt);
  updateCabinFade(dt);
  updateAquarium(dt);
  updateNpcs(dt); questTick(dt); updateRestoProps(); updateRestoSign(); townJobTick(); updateTownProps(); friendPerkTick(); chumTick(); updateBuoys();
  if (!trophyMesh && shared.state.town && shared.state.town.wall) syncTrophyWall();
  perfCull();   // v6.3.1: what cannot be seen is not drawn
  updateTownFade(dt);
  updateStationPicker(false);
  const zone = getCurrentZone();
  const weather = getWeatherObj();

  // Weather Cycle Progression
  shared.weatherTimer -= dt;
  if (shared.weatherTimer <= 0) {
    shared.weatherTimer = 85 + Math.random() * 75;
    const nextWeather = shared.pendingWeather || rollWeather(); shared.pendingWeather = null;   // Marta may already know (her perk)

    if (nextWeather !== shared.state.weather) {
      shared.state.weather = nextWeather;
      saveGame();
      const wObj = getWeatherObj();
      showToast(
        nextWeather === 'STORM'
          ? '⛈️ THUNDERSTORM WARNING! Rare electric fish are surfacing!'
          : `Weather shifted to ${wObj.label}`
      );
      if (nextWeather === 'STORM') sfx.playThunder();
      updateHUD();
    }
  }

  if (shared.state.weather === 'STORM') {
    shared.nextLightningTimer -= dt;
    if (shared.nextLightningTimer <= 0) {
      shared.nextLightningTimer = 6 + Math.random() * 11;
      shared.lightningFlash = 1.0;
      sfx.playThunder();
    }
  }
  shared.lightningFlash = Math.max(0, shared.lightningFlash - dt * 3.8);

  sfx.updateAmbient(dt, weather.id, !shared.onBoat || getDistanceMeters() < 60);

  // Advance Day-Night Cycle
  const prevFullMoon = isFullMoonNight();
  shared.state.timeOfDay += dt / DAY_SECONDS;
  updateReading(dt / DAY_SECONDS * 1440);   // in-game minutes that just passed (0 while paused)
  updateRestaurant(dt / DAY_SECONDS * 1440);
  townClock(dt / DAY_SECONDS * 1440);
  if (shared.state.timeOfDay >= 1.0) { shared.state.timeOfDay -= 1.0; dayRollover(); }
  if (!prevFullMoon && isFullMoonNight()) {
    showToast('🌕 FULL MOON RISEN! Rare Glowing Fish are now active!');
    sfx.playCatchFanfare(false);
  }

  const sunAngle = (shared.state.timeOfDay - 0.25) * Math.PI * 2;
  const sunHeight = Math.sin(sunAngle);
  const dayFactor = THREE.MathUtils.smoothstep(sunHeight, -0.25, 0.35);

  const anchorZ = shared.onBoat ? boatPos.z : -12;
  world.skyGroup.position.set(0, 0, anchorZ);
  world.sunOrb.position.set(Math.cos(sunAngle) * 260, sunHeight * 230, -340);
  world.sunOrb.visible = sunHeight > -0.15 && weather.id === 'CLEAR';

  const moonAngle = sunAngle + Math.PI;
  const moonHeight = Math.sin(moonAngle);
  world.moonGroup.position.set(Math.cos(moonAngle) * 250, moonHeight * 220, -340);
  world.moonGroup.visible = moonHeight > -0.15 && weather.id !== 'STORM';

  const moonPhase = getMoonPhase();
  world.moonShadow.position.x = moonPhase.shadowOffset;
  world.moonHalo.material.opacity = moonPhase.isFull ? (0.28 + Math.sin(shared.elapsed * 2.5) * 0.08) : 0.12;
  world.starMat.opacity = Math.max(0, (1 - dayFactor) * 0.9 * (weather.id === 'CLEAR' ? 1 : 0.2));
  const lanternGlow = (1 - dayFactor) * (LIGHT_TUNING.nightGlow + Math.sin(shared.elapsed * 7) * 0.25);
  world.lanternLights.forEach((l, idx) => {
    l.intensity = Math.max(0, lanternGlow + Math.sin(shared.elapsed * 6.5 + idx * 1.7) * 0.2 * (1 - dayFactor)) * (l.userData.k || 1);
  });
  world.standGlows.forEach(g => { g.mat.opacity = (1 - dayFactor) * LIGHT_TUNING.poolOpacity * g.k; });
  if (world.lighthouseBeacon) world.lighthouseBeacon.update(shared.elapsed, camera, 1 - dayFactor);
  if (shared.boatSpotlight) {
    shared.boatSpotlight.intensity = (isNightTime() || weather.id === 'STORM') ? 3.8 : 0.0;
  }

  const twilightFactor = Math.max(0, 1 - Math.abs(sunHeight) * 4.5);
  sunLight.intensity = dayFactor * 1.15 * weather.skyDim + shared.lightningFlash * 2.8;
  updateSunShadow(dt, shared.onBoat ? boatPos.x : shared.playerX, shared.onBoat ? boatPos.z : shared.playerZ, shared.mode === 'DIVING');
  sunLight.color.setHex(shared.lightningFlash > 0.2 ? 0xe0f2fe : (twilightFactor > 0.35 ? 0xe08e55 : 0xfef3c7));
  moonLight.intensity = (1 - dayFactor) * (moonPhase.isFull ? 0.72 : 0.36) * weather.skyDim;
  hemiLight.intensity = (0.32 + dayFactor * 0.65) * weather.skyDim + shared.lightningFlash * 1.4;

  // Far out the water turns deep blue, but by day the sky stays a daylight sky: each zone only tints it a little
  // (the darkest zone colours only show at night and in bad weather).
  const zoneMood = ZONE_SKY_MOOD[zone.id - 1] || 0;
  const targetWater = _skyCol1.setHex(zone.waterColor).lerp(_skyCol2.setHex(ZONES[2].waterColor), zone.id >= 4 ? dayFactor * 0.45 : 0)
    .multiplyScalar((0.36 + dayFactor * 0.64) * weather.skyDim);
  if (moonPhase.isFull && dayFactor < 0.4) {
    targetWater.lerp(TINT.fullMoon, 0.2);
  }
  const targetSky = _skyCol3.setHex(ZONES[0].fogColor).lerp(_skyCol2.setHex(zone.fogColor), zoneMood + (1 - dayFactor) * zoneMood)
    .multiplyScalar((0.10 + dayFactor * 0.90) * weather.skyDim);
  if (twilightFactor > 0.25 && weather.id === 'CLEAR') {
    targetSky.lerp(TINT.dusk, twilightFactor * 0.35);
  }
  if (shared.lightningFlash > 0.1) {
    targetSky.lerp(TINT.lightning, shared.lightningFlash * 0.65);
  }

  currentWaterColor.lerp(targetWater, dt * 3.0);
  currentFogColor.lerp(targetSky, dt * 3.0);
  world.oceanMat.color.copy(currentWaterColor);
  scene.background.copy(currentFogColor);
  scene.fog.color.copy(currentFogColor);
  scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, weather.fogDensity, dt * 2.0);

  const centerZ = shared.onBoat ? boatPos.z - 310 : -340;
  world.oceanMesh.position.z = centerZ;

  // Update GPU Vertex Shader Wave Uniforms
  world.waveUniforms.uTime.value = shared.elapsed;
  world.waveUniforms.uWaveAmp.value = zone.waveAmp * weather.waveMult;
  world.waveUniforms.uWaveFreq.value = zone.waveFreq;
  world.waveUniforms.uCenterZ.value = centerZ;

  world.buoys.forEach((b, idx) => {
    b.position.y = getWaveHeight(b.position.x, b.position.z, shared.elapsed, zone);
    b.rotation.z = Math.sin(shared.elapsed * 1.8 + idx) * 0.11;
    b.rotation.x = Math.cos(shared.elapsed * 1.5 + idx) * 0.10;
    if (b.userData && b.userData.beaconLight) {
      const pulse = 0.65 + 0.35 * Math.sin(shared.elapsed * 3.8 + b.userData.phase);
      b.userData.beaconLight.intensity = b.userData.baseIntensity * pulse;
      b.userData.halo.scale.setScalar(0.85 + pulse * 0.45);
      b.userData.halo.material.opacity = 0.18 + pulse * 0.28;
    }
  });

  if (shared.mode === 'RESCUE_SEQUENCE') {
    shared.rescueTimer += dt;
    const pct = Math.min(1, shared.rescueTimer / 3.0);
    document.getElementById('rescue-progress-bar').style.width = `${pct * 100}%`;

    boatPos.lerpVectors(rescueStartPos, _camV1.set(MOOR.startX, 0, -9.0), pct);
    shared.boatYaw = 0;
    world.rescueBoat.visible = true;
    world.rescueBoat.position.set(boatPos.x - 2.4, getWaveHeight(boatPos.x, boatPos.z, shared.elapsed, zone), boatPos.z + 1.5);

    if (pct >= 1) {
      world.rescueBoat.visible = false;
      document.getElementById('rescue-overlay').classList.remove('open');
      shared.onBoat = false;
      shared.mode = 'PIER_IDLE';
      shared.playerX = MOOR.boardX;
      shared.playerZ = -5.6;
      updateHUD();
      showToast(`Towed back to Mooring Platform! Paid $${shared.rescueFeePaid.toFixed(2)} rescue fee.`);
    }
  }

  // Pier Walking vs. Boat Driving
  let walkDX = 0;
  let walkDZ = 0;
  if (!shared.onBoat) {
    shared.playerBoatMesh.visible = shared.state.boatTier > 0;
    if (shared.state.boatTier > 0) {
      shared.playerBoatMesh.position.set(MOOR.boatX, getWaveHeight(MOOR.boatX, -5.6, shared.elapsed, zone), -5.6);
      shared.playerBoatMesh.rotation.set(Math.sin(shared.elapsed * 1.8) * 0.04, 0.0, Math.cos(shared.elapsed * 1.5) * 0.05);
    }

    shared.pierMoveInput = 0;
    if (!(shared.mode === 'PIER_IDLE' && !isAnyModalOpen())) { walkVel.x = 0; walkVel.z = 0; if (shared.autoWalk && shared.mode !== 'PIER_IDLE') { shared.autoWalk = null; tapMarker.visible = false; } }
    if (shared.mode === 'PIER_IDLE' && !isAnyModalOpen()) {
      let moveX = joyState.x;
      let moveZ = joyState.y;
      if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;
      if (keys['KeyW'] || keys['ArrowUp']) moveZ -= 1;
      if (keys['KeyS'] || keys['ArrowDown']) moveZ += 1;
      if (moveLatched()) { moveX = 0; moveZ = 0; }
      moveX = THREE.MathUtils.clamp(moveX, -1, 1);
      moveZ = THREE.MathUtils.clamp(moveZ, -1, 1);
      const usingKeys = MOVE_KEYS.some(k => keys[k]);
      let stickMag = Math.min(1, Math.hypot(moveX, moveZ));
      if (stickMag > 0.08) shared.autoWalk = null;   // any manual input takes over from tap-to-walk
      shared.pierMoveInput = stickMag;
      let speedGoal = usingKeys ? (keys['ShiftLeft'] || keys['ShiftRight'] ? MOVE.run : MOVE.walk)
        : (stickMag < MOVE.runAt ? MOVE.walk * stickMag / MOVE.runAt : MOVE.run);
      {
        // steer like a car (both views): left / right turns on the spot, up / down walks forward / backward
        const turnIn = Math.sign(moveX) * Math.pow(Math.abs(moveX), 1.4);
        shared.playerYaw -= turnIn * MOVE.turn * dt;
        if (Math.abs(turnIn) > 0.05) camOrbit.steerT = 0.6;
        let walk = -moveZ;
        // v6.6.1: pulling back turns the angler round (and the camera with him), then he walks that way
        if (moveZ < 0.2) revTurn.on = false;
        else if (!revTurn.on && moveZ > 0.45 && Math.abs(moveX) < 0.75) { revTurn.on = true; revTurn.yaw = shared.playerYaw + Math.PI; }
        if (revTurn.on) {
          revTurn.yaw -= turnIn * MOVE.turn * dt;   // steering still works while turned round
          const d = Math.atan2(Math.sin(revTurn.yaw - shared.playerYaw), Math.cos(revTurn.yaw - shared.playerYaw));
          shared.playerYaw += THREE.MathUtils.clamp(d, -MOVE.uturn * dt, MOVE.uturn * dt);
          walk = Math.abs(d) < 0.7 ? moveZ : 0;
          camOrbit.steerT = 0.6;
        }
        moveX = -Math.sin(shared.playerYaw) * walk;
        moveZ = -Math.cos(shared.playerYaw) * walk;
        stickMag = Math.abs(walk);
        speedGoal = usingKeys ? speedGoal : (stickMag < MOVE.runAt ? MOVE.walk * stickMag / MOVE.runAt : MOVE.run);
        if (walk < 0) speedGoal *= MOVE.back;   // (only when backing straight down is not a turn: never with the stick since v6.6.1)
      }
      camOrbit.steerT = Math.max(0, camOrbit.steerT - dt);
      if (shared.autoWalk && stickMag <= 0.08) {   // tap-to-walk: head for the next point of the route
        const tp = shared.autoWalk.pts[0], dx = tp.x - shared.playerX, dz = tp.z - shared.playerZ, d = Math.hypot(dx, dz);
        if (d < (shared.autoWalk.pts.length > 1 ? 0.45 : 0.22)) { shared.autoWalk.pts.shift(); if (!shared.autoWalk.pts.length) { shared.autoWalk = null; tapMarker.visible = false; } }
        else {
          // turn toward the point (on the spot if it is behind), then walk forward
          const diff = Math.atan2(Math.sin(Math.atan2(-dx, -dz) - shared.playerYaw), Math.cos(Math.atan2(-dx, -dz) - shared.playerYaw));
          shared.playerYaw += THREE.MathUtils.clamp(diff, -5 * dt, 5 * dt);
          const fwd = Math.max(0, (Math.cos(diff) - 0.4) / 0.6);
          moveX = -Math.sin(shared.playerYaw) * fwd; moveZ = -Math.cos(shared.playerYaw) * fwd; speedGoal = Math.min(MOVE.auto, d * 4 + 0.6) * fwd; stickMag = 1;
          shared.autoWalk.stuck = (shared.autoWalk.lastD - d < 0.02 * dt * 60) ? shared.autoWalk.stuck + dt : 0; shared.autoWalk.lastD = d;
          if (shared.autoWalk.stuck > 0.9) { shared.autoWalk = null; tapMarker.visible = false; }
        }
        shared.pierMoveInput = shared.autoWalk ? 1 : 0;
      }
      { // smooth start and stop: the velocity eases toward the stick's direction and speed
        const m = Math.hypot(moveX, moveZ), gx = m > 1e-4 ? moveX / m * speedGoal : 0, gz = m > 1e-4 ? moveZ / m * speedGoal : 0;
        const speeding = gx * gx + gz * gz > walkVel.x * walkVel.x + walkVel.z * walkVel.z;
        const k = 1 - Math.exp(-(speeding ? MOVE.accel : MOVE.brake) * dt);
        walkVel.x += (gx - walkVel.x) * k; walkVel.z += (gz - walkVel.z) * k;
        if (Math.abs(walkVel.x) < 0.01 && Math.abs(walkVel.z) < 0.01 && m < 1e-4) { walkVel.x = 0; walkVel.z = 0; }
        moveX = walkVel.x / WALK_SPEED; moveZ = walkVel.z / WALK_SPEED;
      }

      const prevX = shared.playerX;
      const prevZ = shared.playerZ;
      // Small invisible border at the farthest end of the pier (Z = -10.59) so the fisherman doesn't step onto the very tip
      // walking pace: about 3 m/s at full stick (a brisk walk); diagonals are no faster than straight lines
      let nextZ = THREE.MathUtils.clamp(shared.playerZ + moveZ * WALK_SPEED * dt, -10.59, ISLAND.zMax);
      // v6.6.1: the boardwalk opens onto the town along its whole width; past the boardwalk's ends the terrace edge stops you
      if (nextZ < ISLAND.zIn && shared.playerZ >= ISLAND.zIn && Math.abs(shared.playerX) > BW_HALF - 0.7) nextZ = ISLAND.zIn;

      const onDock = shared.playerX < -PIER_WALK - 0.02 && shared.playerZ < 0.4;   // on the stairs or the mooring platform
      const getPierXBounds = zVal => {
        if (zVal > ISLAND.zIn - 1e-3) return [-ISLAND.xMax, ISLAND.xMax];                 // Harbour Town
        if (zVal > ISLAND.zGate + 1e-3) return [-(BW_HALF - 0.7), BW_HALF - 0.7];       // the open town front (v6.6.1)
        if (zVal >= 0.45) return [-(BW_HALF - 0.7), BW_HALF - 0.7];
        // stairs and mooring platform (port side): past the foot of the stairs only the platform itself is walkable
        if (onDock) return zVal < -6.55 ? [PLATFORM.xOut, PLATFORM.xIn] : [PLATFORM.xOut, PIER_WALK];
        if (zVal <= -4.65 && zVal >= -6.55) return [PLATFORM.xOut, PIER_WALK];   // the stair opening in the port rail
        return [-PIER_WALK, PIER_WALK];
      };

      // Stop at the boardwalk sea-edge railing BEFORE narrowing X to the pier width; otherwise a step across
      // Z = 0.45 clamps X to the pier and snaps the player sideways into the middle of the pier.
      if (nextZ < 0.45 && Math.abs(shared.playerX) > PIER_WALK && shared.playerZ >= 0.40) nextZ = 0.45;

      // On the stairs / mooring platform (port side of the pier, below the boardwalk): stop at its ends
      // BEFORE narrowing X to the pier width, otherwise a step past the platform edge snaps the player
      // sideways onto the pier.
      if (onDock) {
        // on the treads: between the stringers; on the platform: its whole (longer) length
        nextZ = THREE.MathUtils.clamp(nextZ, shared.playerX < PLATFORM.edgeX ? PLATFORM.zMin : -6.55, PLATFORM.zMax);
      }

      const [initMinX, initMaxX] = getPierXBounds(nextZ);
      let nextX = THREE.MathUtils.clamp(shared.playerX + moveX * WALK_SPEED * dt, initMinX, initMaxX);

      // Prevent walking across the side railing gap onto the boat stairs before Z = -4.65
      // (only on the pier deck itself; the boardwalk at Z >= 0.45 is wide open so players can reach the shop)
      if (nextX < -PIER_WALK && nextZ > -4.65 && nextZ < 0.45) {
        if (prevX >= -PIER_WALK + 0.01) nextX = -PIER_WALK;
        else nextZ = -4.65;
      }
      if (nextX < -PIER_WALK && nextZ < -6.55 && !onDock) nextX = -PIER_WALK;   // the port rail past the stair opening

      // Solid collision against the boardwalk sea-edge railings (Z = 0.12, |X| > 2.05)
      if (nextZ < 0.45 && Math.abs(nextX) > PIER_WALK && prevZ >= 0.40) {
        nextZ = 0.45;
      }

      // Solid objects on the pier: every WALK collider from the registry. Boxes resolve along the side the player came
      // from (so you slide along them instead of being snapped across); circles push straight out.
      const BODY = 0.15;   // extra room for the angler's body on top of each collider
      const insideAny = (px, pz) => walkColliders.some(c => c.kind === 'box'
        ? Math.abs(px - c.x) < c.hx + BODY - 1e-3 && Math.abs(pz - c.z) < c.hz + BODY - 1e-3
        : Math.hypot(px - c.x, pz - c.z) < c.r + BODY - 1e-3);
      // v8.2.0: Rapier's character controller slides the angler along colliders and townsfolk. The built-in
      // push-out below still runs without Rapier, with PHYS.walk = 'legacy', or to free an angler who starts inside a collider.
      let rapierMoved = false;
      if (Physics.on && PHYS.walk === 'rapier' && !insideAny(prevX, prevZ)) {
        Physics.moveCharacter(prevX, prevZ, nextX - prevX, nextZ - prevZ, _phMove);
        nextX = prevX + _phMove.x; nextZ = prevZ + _phMove.z; rapierMoved = true;
      }
      if (!rapierMoved) for (const c of walkColliders) {
        if (c.kind === 'box') {
          const hx = c.hx + BODY, hz = c.hz + BODY, dx = nextX - c.x, dz = nextZ - c.z;
          if (Math.abs(dx) >= hx || Math.abs(dz) >= hz) continue;
          const cameFromSide = Math.abs(prevX - c.x) >= hx, cameFromEnd = Math.abs(prevZ - c.z) >= hz;
          let resolveX;
          if (cameFromSide && !cameFromEnd) resolveX = true;
          else if (cameFromEnd && !cameFromSide) resolveX = false;
          else resolveX = (hx - Math.abs(dx)) < (hz - Math.abs(dz));
          // never push sideways through the pier rail: if leaving by X would cross the walkable edge, leave by Z
          const outX = c.x + (Math.sign(dx) || Math.sign(prevX - c.x) || 1) * hx;
          const [bMinX, bMaxX] = getPierXBounds(nextZ);
          if (resolveX && (outX < bMinX - 1e-3 || outX > bMaxX + 1e-3)) resolveX = false;
          if (resolveX) nextX = outX;
          else nextZ = c.z + (Math.sign(dz) || Math.sign(prevZ - c.z) || 1) * hz;
        } else {
          const dx = nextX - c.x, dz = nextZ - c.z, d = Math.hypot(dx, dz), m = c.r + BODY;
          if (d < m && d > 1e-4) { nextX = c.x + dx / d * m; nextZ = c.z + dz / d * m; }
        }
      }

      // v6.8.0: the townsfolk are solid too (a circle each); they stop and wait rather than walk through you
      if (npcState.built && !rapierMoved) for (const n of npcState.list) {
        if (n.hidden) continue;
        const dx = nextX - n.x, dz = nextZ - n.z, d = Math.hypot(dx, dz), m = NPC_R + BODY;
        if (d < m && d > 1e-4) { nextX = n.x + dx / d * m; nextZ = n.z + dz / d * m; }
      }

      // Two colliders close together can push the angler back and forth into each other; if the result still
      // overlaps any of them, stay where you were (the previous spot was always clear).
      if (insideAny(nextX, nextZ) && !insideAny(prevX, prevZ)) {
        if (!insideAny(nextX, prevZ)) nextZ = prevZ;
        else if (!insideAny(prevX, nextZ)) nextX = prevX;
        else { nextX = prevX; nextZ = prevZ; }
      }

      const [finalMinX, finalMaxX] = getPierXBounds(nextZ);
      shared.playerZ = THREE.MathUtils.clamp(nextZ, -10.59, ISLAND.zMax);
      shared.playerX = THREE.MathUtils.clamp(nextX, finalMinX, finalMaxX);

      walkDX = shared.playerX - prevX;
      walkDZ = shared.playerZ - prevZ;
      if (dt > 0) {   // blocked by a wall or rail: the velocity follows what really happened, so it does not pile up
        const ax = walkDX / dt, az = walkDZ / dt;
        if (Math.abs(ax) < Math.abs(walkVel.x)) walkVel.x = ax;
        if (Math.abs(az) < Math.abs(walkVel.z)) walkVel.z = az;
      }
      updatePrimaryActionButton();
    }

    // Smooth vertical elevation down the wooden boat stairs (-2.55 -> -3.85) onto the mooring platform (Y = 0.71)
    let playerY = shared.playerZ > ISLAND.rampZ0 ? townGround(shared.playerZ) : shared.playerZ > ISLAND.zGate ? THREE.MathUtils.lerp(1.55, 1.5, THREE.MathUtils.clamp((shared.playerZ - ISLAND.zGate) / 1.0, 0, 1)) : 1.55;
    if (shared.playerX < -2.55 - PIER_DX && shared.playerZ <= -4.35 && shared.playerZ >= PLATFORM.zEnd) {
      const stairT = THREE.MathUtils.clamp((-2.55 - PIER_DX - shared.playerX) / 1.30, 0, 1);
      playerY = THREE.MathUtils.lerp(1.55, 0.71, stairT);
    }

    world.anglerGroup.position.set(shared.playerX, playerY, shared.playerZ);
    const walkSpeed = Math.hypot(walkDX, walkDZ);
    // Rest spots: stand still for 2 s next to a bench seat or the railing and the angler sits down or leans on the rail.
    // Only the visual model moves toward the seat / rail; the walking position (and so every collision) stays put.
    {
      const still = shared.mode === 'PIER_IDLE' && (!isAnyModalOpen() || (restState.spot && document.getElementById('modal-books').classList.contains('open'))) && walkSpeed < 0.002 && shared.pierMoveInput < 0.15 && !isAtPierWaterEdge() && playerY > 1.45;   // (1.5 is the town's ground, lower is the dock stairs)
      if (!still) { restState.idle = 0; restState.spot = null; }
      else { restState.idle += dt; if (!restState.spot && restState.idle >= 2) restState.spot = findRestSpot(shared.playerX, shared.playerZ); }
      if (restState.spot) restState.last = restState.spot;
      restState.w += ((restState.spot ? 1 : 0) - restState.w) * (1 - Math.exp(-(restState.spot ? 4 : 7) * dt));
      const sp = restState.last;
      if (sp && restState.w > 0.001) {
        world.anglerGroup.position.x += (sp.x - shared.playerX) * restState.w;
        world.anglerGroup.position.z += (sp.z - shared.playerZ) * restState.w;
      }
    }
    // Stand auto-zoom: stand still in front of a stand for STAND_IDLE_DELAY seconds, no key press needed.
    // While a menu is open the current view is kept; any movement input releases it at once.
    if (!isAnyModalOpen()) {
      const here = shared.mode === 'PIER_IDLE' ? currentStandView() : null;
      const moving = walkSpeed > 0.002 || shared.pierMoveInput > 0.15;
      if (here && !moving) {
        standFocus.idle += dt;
        if (standFocus.idle >= STAND_IDLE_DELAY) standFocus.stand = here;
        if (standFocus.stand && standFocus.stand.pan) aquaPan.phase += dt * Math.PI * 2 / 18; else aquaPan.phase = 0;   // 9 s per sweep
      } else {
        standFocus.idle = 0;
        standFocus.stand = null;
      }
    }
    let targetYaw = shared.playerYaw;
    if (restState.spot) {
      targetYaw = restState.spot.yaw;   // face the sea from the bench or over the rail
    } else if (isAtPierWaterEdge() && camOrbit.steerT <= 0 && walkSpeed < 0.001) {
      targetYaw = 0;   // at the pier tip, face the sea while you are not steering
    }
    const angleDiff = Math.atan2(Math.sin(targetYaw - shared.playerYaw), Math.cos(targetYaw - shared.playerYaw));
    shared.playerYaw += angleDiff * Math.min(1, dt * 12);
    world.anglerGroup.rotation.set(0, shared.playerYaw, 0);
  } else {
    standFocus.idle = 0; standFocus.stand = null;
    shared.playerBoatMesh.visible = true;
    const boat = getCurrentBoat();

    if (shared.mode === 'BOAT_DRIVING' && !isAnyModalOpen()) {
      updateBoatControl(dt, boat);

      const stepDist = Math.hypot(shared.boatVel, shared.boatSide) * dt;
      if (stepDist > 0.001) {
        bumpStat('metersSailed', stepDist);
        const dx = (-Math.sin(shared.boatYaw) * shared.boatVel + Math.cos(shared.boatYaw) * shared.boatSide) * dt;
        const dz = (-Math.cos(shared.boatYaw) * shared.boatVel - Math.sin(shared.boatYaw) * shared.boatSide) * dt;
        const speedBefore = shared.boatVel;
        const steps = Math.max(1, Math.ceil(stepDist / 0.4));
        let hit = null, into = 0;
        for (let i = 0; i < steps; i++) {
          boatPos.x += dx / steps;
          boatPos.z += dz / steps;
          const c = resolveBoatCollisions();
          if (c.hit && c.into > into) { hit = c.hit; into = c.into; }
        }
        if (hit) {
          if (shared.elapsed - shared.lastBumpAt > 0.9 && speedBefore * into > 1.5) {
            shared.lastBumpAt = shared.elapsed;
            sfx.playBump();
            showToast(BUMP_TEXT[hit] || '💥 Bump!');
          }
          shared.boatVel *= 1 - 0.6 * Math.min(1, into);
          shared.boatSide *= 0.4;
          hullMo.rv += 0.6 * Math.min(1, into) * Math.sign(Math.random() - 0.5); triggerCamShake(0.1 * Math.min(1, into));
        }

        if (chancePerSec(36, dt)) {
          const sternWake = boatPos.clone().add(new THREE.Vector3(Math.sin(shared.boatYaw) * 2.4, 0, Math.cos(shared.boatYaw) * 2.4));
          vfx.spawnWake(sternWake, shared.boatYaw, Math.abs(shared.boatVel) / 14);
        }
        // fuel is only burned while the engine is driving; coasting is free
        const hadFuel = shared.state.fuel > 0;
        if (!cheats.freeFuel && shared.boatPowered) shared.state.fuel = Math.max(0, shared.state.fuel - stepDist * boat.burnRate);
        if (hadFuel && shared.state.fuel <= 0) showToast('⛽ Out of fuel! Drifting...');
        shared.boatSaveT += dt;
        if (shared.boatSaveT > 2 || (hadFuel && shared.state.fuel <= 0)) { shared.boatSaveT = 0; saveGame(); }   // not every frame
        updateHUD();
      }
      // out of fuel and far from the pier: the tow starts once the boat has coasted to a stop
      if (shared.state.fuel <= 0 && !cheats.freeFuel && !lhDock.on && Math.abs(shared.boatVel) < 0.4 && getDistanceMeters() > 15) {
        shared.boatVel = 0; shared.boatSide = 0;
        triggerRescueSequence();
      }
      updatePrimaryActionButton();
    } else {
      shared.boatVel = THREE.MathUtils.lerp(shared.boatVel, 0, Math.min(1, dt * 1.5));   // fishing / in a menu: the boat drifts to a stop
      shared.boatSide = THREE.MathUtils.lerp(shared.boatSide, 0, Math.min(1, dt * 2));
      shared.boatTurnRate = THREE.MathUtils.lerp(shared.boatTurnRate, 0, Math.min(1, dt * 2));
      if (dt > 0) { shared.boatYaw += shared.boatTurnRate * dt; boatPos.x += (-Math.sin(shared.boatYaw) * shared.boatVel + Math.cos(shared.boatYaw) * shared.boatSide) * dt; boatPos.z += (-Math.cos(shared.boatYaw) * shared.boatVel - Math.sin(shared.boatYaw) * shared.boatSide) * dt; if (Math.abs(shared.boatVel) > 0.05) resolveBoatCollisions(); }
    }

    if (lhDock.on) {   // moored: ease into the berth and stay put
      const bp = lhBerthPose(), kk = 1 - Math.exp(-2.2 * dt);
      boatPos.x += (bp.x - boatPos.x) * kk; boatPos.z += (bp.z - boatPos.z) * kk;
      shared.boatYaw += Math.atan2(Math.sin(bp.yaw - shared.boatYaw), Math.cos(bp.yaw - shared.boatYaw)) * kk;
      shared.boatVel = 0; shared.boatSide = 0; shared.boatTurnRate = 0;
    }
    if (zone.id > (shared.state.stats.maxZone || 1)) shared.state.stats.maxZone = zone.id;
    updateHullMotion(dt, boat, zone);
    boatPos.y = hullMo.heave;
    shared.playerBoatMesh.position.copy(boatPos);
    shared.playerBoatMesh.rotation.order = 'YXZ';
    shared.playerBoatMesh.rotation.set(hullMo.pitch, shared.boatYaw, hullMo.roll);

    // the rider is carried by the hull: he sits or stands at the boat's ride spot and tilts, banks and bobs with it
    // He moves between the helm and the stations over about 0.4 s; both ends follow the hull while he is on his way.
    const ride = currentRideSpot();
    shared.playerBoatMesh.updateMatrixWorld(true);
    if (rideX.to !== ride) { rideX.from = rideX.to || ride; rideX.to = ride; rideX.t = rideX.from === ride ? 1 : 0; }
    rideX.t = Math.min(1, rideX.t + dt / 0.4);
    const re = rideX.t * rideX.t * (3 - 2 * rideX.t);
    spotWorld(rideX.from, _rwA); spotWorld(rideX.to, _rwB);
    world.anglerGroup.position.lerpVectors(_rwA, _rwB, re);
    if (rideX.t < 1) world.anglerGroup.position.y += Math.sin(re * Math.PI) * 0.12;   // a little step
    spotQuat(rideX.from, _rqA); spotQuat(rideX.to, _rqB);
    world.anglerGroup.quaternion.copy(_rqA).slerp(_rqB, re);
    { const ya = spotYaw(rideX.from), yb = spotYaw(rideX.to); shared.rideYawAbs = ya + Math.atan2(Math.sin(yb - ya), Math.cos(yb - ya)) * re; }
  }

  // Animated Rod Show / Stow & 4-Segment Dynamic Bending
  const shouldShowRod = ((shared.mode === 'BOAT_DRIVING' && !shared.boatStationActive) || shared.mode === 'RESCUE_SEQUENCE') ? false : (shared.onBoat || isAtPierWaterEdge() || (shared.mode !== 'PIER_IDLE' && shared.mode !== 'SHOP_BROWSE'));
  const targetRodVis = shouldShowRod ? 1.0 : 0.0;
  shared.rodVisProgress = THREE.MathUtils.lerp(shared.rodVisProgress, targetRodVis, Math.min(1, dt * 9.5));
  const easedRodVis = shared.rodVisProgress * shared.rodVisProgress * (3 - 2 * shared.rodVisProgress);
  world.rodPivot.visible = easedRodVis > 0.02;
  world.rodPivot.scale.setScalar(Math.max(0.01, easedRodVis));
  const stowOffsetPitch = (1 - easedRodVis) * 1.15;

  let bendAmount = 0;
  let lateralBend = 0;

  if (shared.mode === 'CASTING') {
    shared.castCharge += shared.castDir * dt * 1.15;
    if (shared.castCharge >= 1.0) {
      shared.castCharge = 1.0;
      shared.castDir = -1;
    } else if (shared.castCharge <= 0.0) {
      shared.castCharge = 0.0;
      shared.castDir = 1;
    }
    const pct = Math.round(shared.castCharge * 100);
    const inSweet = pct >= 72 && pct <= 88;
    document.getElementById('cast-power-bar').style.width = `${pct}%`;
    const castLabelEl = document.getElementById('cast-power-label');
    castLabelEl.textContent = inSweet ? `★ ${pct}% SWEET!` : `${pct}%`;
    castLabelEl.style.color = inSweet ? '#fde047' : '#fff';
    world.rodPivot.rotation.set(0.35 * shared.castCharge + stowOffsetPitch, 0, 0);
    bendAmount = shared.castCharge * 0.14;
  } else if (shared.mode === 'REELING') {
    let targetRodAngle = joyState.x;
    if (keys['KeyA'] || keys['ArrowLeft']) targetRodAngle -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) targetRodAngle += 1;
    targetRodAngle = THREE.MathUtils.clamp(targetRodAngle, -1, 1);

    shared.rodPullAngle = THREE.MathUtils.lerp(shared.rodPullAngle, targetRodAngle, dt * 8.5);
    world.rodPivot.rotation.y = -shared.rodPullAngle * 0.68;
    world.rodPivot.rotation.z = -shared.rodPullAngle * 0.42;
    world.rodPivot.rotation.x = -0.25 - shared.tension * 0.35 + stowOffsetPitch + fight.dip * 0.6;
    bendAmount = 0.08 + shared.tension * 0.28;
    lateralBend = -shared.rodPullAngle * 0.12;
  } else if (shared.mode === 'LANDING') {
    world.rodPivot.rotation.x = THREE.MathUtils.lerp(world.rodPivot.rotation.x, -0.75 + stowOffsetPitch, Math.min(1, dt * 10));
    bendAmount = 0.22;
  } else {
    shared.rodPullAngle = THREE.MathUtils.lerp(shared.rodPullAngle, 0, dt * 6);
    world.rodPivot.rotation.x = THREE.MathUtils.lerp(world.rodPivot.rotation.x, stowOffsetPitch, dt * 8);
    world.rodPivot.rotation.y = THREE.MathUtils.lerp(world.rodPivot.rotation.y, 0, dt * 8);
    world.rodPivot.rotation.z = THREE.MathUtils.lerp(world.rodPivot.rotation.z, 0, dt * 8);
  }

  if (world.rodSegments) {
    world.rodSegments.forEach((seg, idx) => {
      if (idx === 0) {
        seg.rotation.x = -0.65 - bendAmount * 0.4;
      } else {
        seg.rotation.x = -bendAmount * (0.7 + idx * 0.35);
        seg.rotation.z = lateralBend * (0.5 + idx * 0.25);
      }
    });
  }

  if (shared.mode === 'WAITING_BITE' || shared.mode === 'BITE_WINDOW' || shared.mode === 'REELING' || shared.mode === 'LANDING') {
    if (!shared.bobberInWater) {
      bobberVel.y -= 16 * dt;
      bobberPos.addScaledVector(bobberVel, dt);
      const waterY = getWaveHeight(bobberPos.x, bobberPos.z, shared.elapsed, zone);
      if (bobberPos.y <= waterY) {
        bobberPos.y = waterY;
        shared.bobberInWater = true;
        sfx.playSplash();
        vfx.spawnSplash(bobberPos, 14, 0xe0f2fe, 2.8);
        world.fishShadow.visible = true;
        {   // the fish lurks beyond the bobber, along the cast direction, a little to either side
          const cy = shared.onBoat ? boatCastYaw() : shared.playerYaw, ahead = 4 + Math.random() * 3, side = (Math.random() - 0.5) * 6;
          world.fishShadow.position.set(
            bobberPos.x - Math.sin(cy) * ahead + Math.cos(cy) * side,
            waterY - 0.18,
            bobberPos.z - Math.cos(cy) * ahead - Math.sin(cy) * side
          );
        }
      }
    } else {
      const waterY = getWaveHeight(bobberPos.x, bobberPos.z, shared.elapsed, zone);
      const dip = shared.mode === 'BITE_WINDOW' ? Math.sin(shared.elapsed * 28) * 0.18 - 0.12 : Math.sin(shared.elapsed * 4) * 0.04;
      bobberPos.y = waterY + dip;

      if (shared.mode === 'WAITING_BITE') {
        world.fishShadow.position.x = THREE.MathUtils.lerp(world.fishShadow.position.x, bobberPos.x, dt * 0.9);
        world.fishShadow.position.z = THREE.MathUtils.lerp(world.fishShadow.position.z, bobberPos.z, dt * 0.9);
        world.fishShadow.position.y = waterY - 0.18;
        world.fishShadow.lookAt(bobberPos.x, waterY - 0.18, bobberPos.z);

        shared.waitTimer -= dt;
        if (shared.waitTimer <= 0) {
          shared.mode = 'BITE_WINDOW';
          shared.biteTimer = 1.85;
          document.getElementById('bite-banner').style.display = 'block';
          sfx.playBiteAlert();
          triggerCamShake(0.22);
          spawnWorldCallout(bobberPos, '! BITE !', '#fef08a');
          vfx.spawnSplash(bobberPos, 18, 0xfef08a, 3.2);
          updatePrimaryActionButton();
        }
      } else if (shared.mode === 'BITE_WINDOW') {
        shared.biteTimer -= dt;
        if (shared.biteTimer <= 0) {
          cancelFishing('The fish nibbled the bait and got away!', 'escape');
        }
      } else if (shared.mode === 'REELING' && shared.activeCatch && dt > 0) {
        const isPassiveItem = shared.activeCatch.item.category === 'Junk' || shared.activeCatch.item.category === 'Flora';
        const fm = fightTick(dt, isPassiveItem || shared.activeCatch.isUnderpowered);

        let surge = 0.25;
        let weightFactor = Math.min(0.45, 0.12 + shared.activeCatch.weight / 35);
        let fishDragForce = 0.09 + weightFactor * 0.14;

        if (isPassiveItem) {
          shared.fishSwimDir = 0;
          shared.fishLateralPos = THREE.MathUtils.lerp(shared.fishLateralPos, 0, dt * 5);
        } else {
          shared.fishDirTimer -= dt;
          if (shared.fishDirTimer <= 0) {
            const dirs = [-1, 0, 1];
            shared.fishSwimDir = dirs[Math.floor(Math.random() * dirs.length)];
            shared.fishDirTimer = (1.3 + Math.random() * 1.5) * (fight.style === 'thrasher' ? 0.45 : 1);
          }
          if (fm.dir) shared.fishSwimDir = fm.dir;
          if (fm.center) shared.fishLateralPos = THREE.MathUtils.lerp(shared.fishLateralPos, 0, dt * 3);

          shared.fishPullPhase += dt * (2.6 + shared.activeCatch.zoneObj.id * 0.7);
          surge = 0.65 + 0.35 * Math.sin(shared.fishPullPhase);
          weightFactor = Math.min(1.5, 0.35 + shared.activeCatch.weight / 28);
          fishDragForce = (0.20 + weightFactor * 0.26) * surge * fm.drag;

          const lateralSpeed = (0.55 + weightFactor * 0.35) * surge * fm.lat;
          shared.fishLateralPos = THREE.MathUtils.clamp(
            shared.fishLateralPos + (shared.fishSwimDir * lateralSpeed + shared.rodPullAngle * 0.42) * dt,
            -1,
            1
          );
        }

        const activeYaw = shared.onBoat ? boatCastYaw() : shared.playerYaw;
        const rightVec = _fightRight.set(Math.cos(activeYaw), 0, -Math.sin(activeYaw));
        const forwardVec = _fightFwd.set(-Math.sin(activeYaw), 0, -Math.cos(activeYaw));

        const currentDist = Math.max(2.0, shared.initialLineDist * (1 - shared.reelProgress * 0.85));
        const targetBobber = _fightTgt.copy(world.anglerGroup.position)
          .addScaledVector(forwardVec, currentDist)
          .addScaledVector(rightVec, shared.fishLateralPos * (2.5 + currentDist * 0.28));
        bobberPos.x = THREE.MathUtils.lerp(bobberPos.x, targetBobber.x, dt * 4);
        bobberPos.z = THREE.MathUtils.lerp(bobberPos.z, targetBobber.z, dt * 4);

        const isCounterPulling = isPassiveItem
          ? true
          : ((shared.fishLateralPos < -0.15 && shared.rodPullAngle > 0.22) ||
             (shared.fishLateralPos > 0.15 && shared.rodPullAngle < -0.22) ||
             (Math.abs(shared.fishLateralPos) <= 0.15 && Math.abs(shared.rodPullAngle) < 0.3));

        const isPullingSameWay = !isPassiveItem &&
          ((shared.fishLateralPos < -0.2 && shared.rodPullAngle < -0.25) ||
           (shared.fishLateralPos > 0.2 && shared.rodPullAngle > 0.25));

        if (shared.activeCatch.isUnderpowered) {
          shared.underpoweredTimer += dt;
          shared.tension = Math.min(1, shared.tension + dt * 0.55);
          sfx.playReelTick(0.95);
          if (!cheats.noSnap && (shared.underpoweredTimer >= 1.55 || shared.tension >= 0.99)) {
            snapLine();
            return;
          }
        } else {
          const rod = getCurrentRod();
          const dragRelief = isPassiveItem
            ? (0.48 + rod.forgiveness * 0.25)
            : (isCounterPulling ? (0.34 + rod.forgiveness * 0.28) : (isPullingSameWay ? -0.18 : 0.08));

          if (shared.isHoldingAction) {
            const rawDelta = fishDragForce - dragRelief + 0.11, netTensionDelta = rawDelta > 0 ? rawDelta * (shared.fightFed ? 0.85 : 1) * (shared.fightJig ? 0.8 : 1) : rawDelta;
            shared.tension += netTensionDelta * dt;
            const reelEfficiency = isPassiveItem
              ? 0.26
              : (isCounterPulling ? 0.22 : (isPullingSameWay ? 0.04 : 0.11));
            shared.reelProgress += reelEfficiency * fm.reel * dt;
            sfx.playReelTick(shared.tension);
          } else {
            shared.tension -= (0.28 + dragRelief * 0.65) * dt;
            const pullBackRate = isPassiveItem ? 0.03 : (0.14 + fishDragForce * 0.42);
            shared.reelProgress = Math.max(0, shared.reelProgress - pullBackRate * dt);
          }
        }

        shared.tension = THREE.MathUtils.clamp(shared.tension, 0.04, 1.0);
        sfx.startLineStrain();
        sfx.updateLineStrain(shared.tension, dt);
        setTensionVignette(shared.tension, shared.elapsed);
        world.fishShadow.position.set(bobberPos.x, waterY - 0.18 - fm.sink, bobberPos.z);
        const swimOrient = shared.fishSwimDir !== 0 ? shared.fishSwimDir : (Math.abs(shared.fishLateralPos) > 0.08 ? Math.sign(shared.fishLateralPos) : 0);
        world.fishShadow.rotation.y = activeYaw + (swimOrient < 0 ? Math.PI * 0.42 : (swimOrient > 0 ? -Math.PI * 0.42 : 0));

        if (chancePerSec(9, dt)) {
          vfx.spawnRipple(bobberPos, 0xe0f2fe, 1.9);
        }
        if (cheats.noSnap) shared.tension = Math.min(shared.tension, 0.9);
        if (shared.tension >= 0.98) {
          vfx.spawnSplash(bobberPos, 16, 0xf87171, 3.0);
          triggerCamShake(0.45);
          spawnWorldCallout(bobberPos, 'LINE SNAPPED!', '#f87171');
          snapLine();
          return;
        }

        const dirText = isPassiveItem
          ? 'DEAD WEIGHT ▲'
          : (shared.fishLateralPos < -0.18 ? 'LEFT ◀' : (shared.fishLateralPos > 0.18 ? 'RIGHT ▶' : 'CENTER ▲'));
        document.getElementById('fish-dir-label').textContent = `${FIGHT_STYLES[fight.style].label}: ${dirText}`;

        const hintEl = document.getElementById('counter-pull-hint');
        if (isPassiveItem) {
          hintEl.textContent = shared.isHoldingAction ? 'HAULING IN CATCH!' : 'HOLD REEL BUTTON!';
          hintEl.style.color = '#4ade80';
        } else if (!shared.isHoldingAction) {
          hintEl.textContent = 'HOLD REEL OR FISH PULLS BACK!';
          hintEl.style.color = '#fb923c';
        } else if (shared.fishLateralPos < -0.18) {
          hintEl.textContent = shared.rodPullAngle > 0.22 ? '✓ COUNTERING RIGHT!' : 'PULL STICK RIGHT ▶';
          hintEl.style.color = shared.rodPullAngle > 0.22 ? '#4ade80' : '#fde047';
        } else if (shared.fishLateralPos > 0.18) {
          hintEl.textContent = shared.rodPullAngle < -0.22 ? '✓ COUNTERING LEFT!' : '◀ PULL STICK LEFT';
          hintEl.style.color = shared.rodPullAngle < -0.22 ? '#4ade80' : '#fde047';
        } else {
          hintEl.textContent = 'HOLD REEL BUTTON!';
          hintEl.style.color = '#4ade80';
        }
        if (fight.hint) { hintEl.textContent = fight.hint; hintEl.style.color = fight.hintCol; }

        document.getElementById('reel-dist-label').textContent = `LINE: ${currentDist.toFixed(1)} m`;
        document.getElementById('reel-progress-label').textContent = `REEL: ${Math.round(shared.reelProgress * 100)}%`;

        const fishPct = Math.round(((shared.fishLateralPos + 1) * 0.5) * 86 + 7);
        const rodPct = Math.round(((shared.rodPullAngle + 1) * 0.5) * 86 + 7);
        document.getElementById('fish-dir-marker').style.left = `${fishPct}%`;
        document.getElementById('rod-dir-marker').style.left = `${rodPct}%`;

        const cursorEl = document.getElementById('reel-cursor');
        cursorEl.style.left = `${Math.round(shared.tension * 100)}%`;
        cursorEl.style.backgroundColor = shared.tension > 0.8 ? '#f87171' : '#ffffff';

        const progBar = document.getElementById('reel-progress-bar');
        progBar.style.width = `${Math.min(100, Math.round(shared.reelProgress * 100))}%`;
        progBar.style.backgroundColor = isCounterPulling ? '#4ade80' : '#facc15';

        if (shared.reelProgress >= 1.0) {
          beginLanding();
          return;
        }
      }
    }

    world.bobberGroup.position.copy(bobberPos);

    const tipPos = _camV3;
    world.anglerGroup.updateMatrixWorld(true);
    world.rodTipAnchor.getWorldPosition(tipPos);
    const posAttr = world.fishingLine.geometry.attributes.position;
    const sagAmount = shared.mode === 'LANDING' ? 0.04 : shared.mode === 'REELING'
      ? Math.max(0.05, (1.0 - shared.tension) * 0.65)
      : 0.75 + Math.sin(shared.elapsed * 3.5) * 0.12;
    for (let i = 0; i < 16; i++) {
      const t = i / 15;
      const lx = THREE.MathUtils.lerp(tipPos.x, bobberPos.x, t);
      const ly = THREE.MathUtils.lerp(tipPos.y, bobberPos.y, t) - Math.sin(t * Math.PI) * sagAmount;
      const lz = THREE.MathUtils.lerp(tipPos.z, bobberPos.z, t);
      posAttr.setXYZ(i, lx, ly, lz);
    }
    posAttr.needsUpdate = true;
  }

  updateFightEnd(dt, zone);

  // Articulated Angler Animations & Folding Pier Chair Unfold / Sit Sequence
  const isWalkingPier = !shared.onBoat && shared.mode === 'PIER_IDLE' && Math.hypot(walkDX, walkDZ) > 0.001;
  const atEdgeForChair = !shared.onBoat && (isAtPierWaterEdge() || (shared.mode !== 'PIER_IDLE' && shared.mode !== 'SHOP_BROWSE')) && !isWalkingPier;
  const targetChairOpen = atEdgeForChair ? 1.0 : 0.0;
  shared.chairOpenProgress = THREE.MathUtils.lerp(shared.chairOpenProgress, targetChairOpen, Math.min(1, dt * 7.5));

  const showChair = !shared.onBoat && (isAtPierWaterEdge() || (shared.mode !== 'PIER_IDLE' && shared.mode !== 'SHOP_BROWSE') || shared.chairOpenProgress > 0.03);
  world.chairGroup.visible = showChair;
  if (showChair) {
    const t = shared.chairOpenProgress;
    const ease = t * t * (3 - 2 * t);
    world.chairFrontLegPivot.rotation.x = ease * 0.48;
    world.chairBackLegPivot.rotation.x = -ease * 0.46;
    world.chairBackrestPivot.rotation.x = (1 - ease) * -1.35 + ease * 0.14;
    world.chairSeatPivot.rotation.x = (1 - ease) * 1.48;
    world.chairGroup.position.set(0, 0, 0.12 + ease * 0.04);
    world.chairGroup.scale.setScalar(0.85 + ease * 0.15);
  }

  // Smoothly sit the fisherman down onto the unfolded chair after the legs open
  const sitT = THREE.MathUtils.clamp((shared.chairOpenProgress - 0.35) / 0.65, 0, 1);
  const chairSitEase = sitT * sitT * (3 - 2 * sitT);
  // riding a boat: sit on the thwart (rowboat) and hold the wheel or tiller while steering
  const rideSpot = shared.onBoat ? currentRideSpot() : null;
  shared.boatSitProgress = THREE.MathUtils.lerp(shared.boatSitProgress, rideSpot && rideSpot.sit ? 1 : 0, Math.min(1, dt * 6));
  shared.boatHandsProgress = THREE.MathUtils.lerp(shared.boatHandsProgress, shared.onBoat && shared.mode === 'BOAT_DRIVING' && !shared.boatStationActive ? 1 : 0, Math.min(1, dt * 6));
  const boatSitEase = shared.boatSitProgress * shared.boatSitProgress * (3 - 2 * shared.boatSitProgress);
  const sitEase = Math.max(chairSitEase, boatSitEase);
  const handsEase = shared.boatHandsProgress * shared.boatHandsProgress * (3 - 2 * shared.boatHandsProgress);

  // v4: the animator poses the whole skeleton; the rod rides in the angler's hands
  {
    const rig = world.anglerRig, hs = rig.dims.hScale;
    const castRelease = shared.anglerPrevMode === 'CASTING' && shared.mode !== 'CASTING' && shared.mode !== 'PIER_IDLE';
    const stepTrigger = shared.anglerPrevOnBoat !== shared.onBoat;
    shared.anglerPrevMode = shared.mode; shared.anglerPrevOnBoat = shared.onBoat;
    const chairScale = 0.85 + 0.15 * (shared.chairOpenProgress * shared.chairOpenProgress * (3 - 2 * shared.chairOpenProgress));
    const restW = !shared.onBoat && shared.mode === 'PIER_IDLE' ? restState.w : 0, restSp = restState.last;
    const onBench = restW > 0.001 && restSp && restSp.kind === 'bench';
    const seatH = (shared.onBoat && rideSpot && rideSpot.sit ? rideSpot.seatH : onBench ? restSp.seatH : 0.44 * chairScale + 0.07) / hs;
    // rod base in front of the right hip, following the hips (sitting lowers it)
    const hipNow = THREE.MathUtils.lerp(rig.dims.hipY, seatH, sitEase);
    world.rodPivot.position.set(0.1 * hs, (hipNow + 0.12) * hs, -0.3 * hs + sitEase * 0.04);
    if (anglerAnim.whip > 0) world.rodPivot.rotation.x -= Math.sin((1 - anglerAnim.whip) * Math.PI) * 0.9;
    world.anglerGroup.updateMatrixWorld(true);
    let hands = null, handBlend = 0, readPoint = false;
    const helm = shared.playerBoatMesh.userData && shared.playerBoatMesh.userData.helm;
    if (helm && helm.roof) { // the trawler's wheelhouse roof turns see-through while you drive in third person
      const target = shared.onBoat && shared.mode === 'BOAT_DRIVING' && !settings.firstPerson ? 0.28 : 1;
      helm.roof.forEach(m => { m.material.opacity += (target - m.material.opacity) * Math.min(1, dt * 5); m.material.depthWrite = m.material.opacity > 0.95; });
    }
    if (shared.onBoat && shared.mode === 'BOAT_DRIVING' && !shared.boatStationActive && rideSpot && helm) {
      const steer = THREE.MathUtils.clamp(shared.boatTurnRate, -1.6, 1.6);
      if (helm.kind === 'wheel') {
        helm.spin.rotation.z = -steer * 1.8;
        helm.spin.updateMatrixWorld(true);
        const at = a => helm.spin.localToWorld(new THREE.Vector3(Math.cos(a) * helm.r, Math.sin(a) * helm.r, 0.02));
        hands = { L: at(Math.PI * 0.85), R: at(Math.PI * 0.15) };
      } else {
        helm.pivot.rotation.y = steer * 0.45;
        helm.pivot.updateMatrixWorld(true);
        hands = { R: helm.pivot.localToWorld(helm.grip.clone()), L: world.anglerGroup.localToWorld(new THREE.Vector3(-0.14, seatH * hs + 0.1, -0.34)) };
      }
      handBlend = handsEase;
    } else if (world.rodPivot.visible && shared.rodVisProgress > 0.3) {
      const seg0 = world.rodSegments[0];
      const cranking = shared.mode === 'REELING' && shared.isHoldingAction;
      if (cranking) shared.anglerCrank += dt * 13;
      hands = {
        L: seg0.localToWorld(new THREE.Vector3(0, 0.1, 0)),
        R: shared.mode === 'REELING'
          ? seg0.localToWorld(new THREE.Vector3(0.17, 0.24 + Math.cos(shared.anglerCrank) * 0.055, Math.sin(shared.anglerCrank) * 0.055))
          : seg0.localToWorld(new THREE.Vector3(0, -0.11, 0))
      };
      handBlend = Math.min(1, shared.rodVisProgress);
    } else if (restW > 0.001 && restSp) {
      const ag = world.anglerGroup;
      if (restSp.kind === 'bench' && reading.id && readProp && readProp.visible) {   // the left hand holds the book, the right index finger follows the lines
        updateReadBook(dt, seatH * hs); readProp.updateMatrixWorld(true);
        const lt = shared.elapsed / 1.6, u = lt % 1, line = Math.floor(lt) % 8, sweep = u < 0.85 ? u / 0.85 : 1 - (u - 0.85) / 0.15;
        hands = { L: readProp.localToWorld(new THREE.Vector3(-0.13, -0.02, 0.07)), R: readProp.localToWorld(new THREE.Vector3(0.02 + 0.09 * sweep, 0.07, -0.02 + line * 0.017)) };
        readPoint = true;
      } else if (restSp.kind === 'bench') {   // hands rest on the thighs
        hands = { L: ag.localToWorld(new THREE.Vector3(-0.13, seatH * hs + 0.1, -0.32)), R: ag.localToWorld(new THREE.Vector3(0.13, seatH * hs + 0.1, -0.32)) };
      } else {                         // forearms on the top rail
        const y = ag.position.y + 0.99;
        hands = restSp.railX != null
          ? { L: new THREE.Vector3(restSp.railX, y, restSp.z - restSp.side * 0.2), R: new THREE.Vector3(restSp.railX, y, restSp.z + restSp.side * 0.2) }
          : { L: new THREE.Vector3(ag.position.x - 0.2, y, restSp.railZ + 0.02), R: new THREE.Vector3(ag.position.x + 0.2, y, restSp.railZ + 0.02) };
      }
      handBlend = restW;
    }
    {   // the umbrella (rain or storm, on foot, nothing in the hands, third person)
      const want = !shared.onBoat && !dive.active && isRaining() && !settings.firstPerson
        && !(restW > 0.001) && (shared.mode === 'PIER_IDLE' || shared.mode === 'SHOP_BROWSE');   // not while fishing (the modes), seated or on a boat
      umbrella.w += ((want ? 1 : 0) - umbrella.w) * (dt > 0 ? 1 - Math.exp(-5 * dt) : 0);
      if (umbrella.w > 0.02) {
        ensureUmbrella(); const k = umbrella.w;
        const grip = placeUmbrella(umbrella, world.anglerGroup, hs);   // the left hand holds it (the right keeps the rod)
        if (!hands) { hands = { L: grip, R: null }; handBlend = k; } else { hands.L = grip; handBlend = Math.max(handBlend, k); }
      } else if (umbrella.g) umbrella.g.visible = false;
    }
    anglerAnim.update({
      point: readPoint ? 'R' : null,
      // v9.1.0 expressions: surprised on a bite, focused in the fight, happy with a catch or in a chat
      expr: shared.mode === 'BITE_WINDOW' ? 'surprise' : shared.mode === 'REELING' ? 'focus' : (document.getElementById('modal-catch').classList.contains('open') || document.getElementById('modal-talk').classList.contains('open')) ? 'happy' : 'open',
      dt, elapsed: shared.elapsed,
      speed: isWalkingPier ? Math.hypot(walkDX, walkDZ) / Math.max(1e-3, dt) : 0,
      sit: Math.max(sitEase, onBench ? restW : 0), seatH,
      rest: restW > 0.001 && restSp ? { kind: restSp.kind, w: restW } : null,
      casting: shared.mode === 'CASTING', castCharge: shared.castCharge, castRelease,
      reeling: shared.mode === 'REELING', cranking: shared.mode === 'REELING' && shared.isHoldingAction, tension: shared.tension, pull: shared.mode === 'REELING' ? shared.rodPullAngle : 0,
      hands, handBlend,
      sway: shared.onBoat && !lhDock.on ? -shared.playerBoatMesh.rotation.z : 0,
      stepTrigger: stepTrigger && shared.elapsed > 1,
      idleAllowed: shared.mode === 'PIER_IDLE' || shared.mode === 'SHOP_BROWSE' || shared.mode === 'BOAT_DRIVING'
    });
  }

  const isHookedGlowing = shared.activeCatch && shared.activeCatch.item && shared.activeCatch.item.glowing;
  if (world.fishShadow.visible) {
    if (isHookedGlowing || isFullMoonNight()) {
      world.fishShadow.material.color.setHex(0x38bdf8);
      world.fishShadow.material.opacity = 0.72 + Math.sin(shared.elapsed * 8) * 0.2;
      if (chancePerSec(15, dt)) {
        vfx.spawnSparkles(world.fishShadow.position, 2, 0x67e8f9);
      }
    } else {
      world.fishShadow.material.color.setHex(0x051324);
      world.fishShadow.material.opacity = 0.62;
    }
  }

  const anchorPos = shared.onBoat ? boatPos : world.anglerGroup.position;
  vfx.frenzyVisible = (shared.onBoat && shared.state.boatTier > 0 && hasModule('sonar')) || scope.on;
  vfx.update(dt, anchorPos, getWaveHeight, shared.elapsed, zone, dive.active ? 0 : weather.rainRate);

  // Smooth camera tracking across entire pier (including left boat slip & portrait mobile screens)
  const camSmooth = 1 - Math.exp(-6.5 * dt);
  shared.reelLookW += ((shared.mode === 'REELING' ? 1 : 0) - shared.reelLookW) * (1 - Math.exp(-5 * dt));
  if (!shared.onBoat) {
    const isPortrait = camera.aspect < 0.85;
    const lateralFollow = isPortrait ? 0.95 : 0.72;
    // past 12 m from the pier the camera follows 1:1 so the far ends (Boatyard, Cabin) stay framed
    const camFX = Math.sign(shared.playerX) * (Math.min(Math.abs(shared.playerX), 12) * lateralFollow + Math.max(0, Math.abs(shared.playerX) - 12) * 0.97);
    // orbit: the camera swings round the angler by camOrbit.yaw (drag on the screen); during a fight it eases back
    // the camera stays behind the angler and turns with him (plus a look-around offset that eases back as you walk)
    if (!camDrag.on && (shared.pierMoveInput > 0.1 || shared.mode !== 'PIER_IDLE')) camOrbit.look *= Math.exp(-3 * dt);
    { const goal = shared.playerYaw + camOrbit.look, d = Math.atan2(Math.sin(goal - camOrbit.yaw), Math.cos(goal - camOrbit.yaw)); camOrbit.yaw += d * (dt > 0 ? 1 - Math.exp(-7 * dt) : 0); }
    const oy = camOrbit.yaw, ow = Math.min(1, Math.abs(Math.atan2(Math.sin(oy), Math.cos(oy))) / 0.35);
    const isl = THREE.MathUtils.smoothstep(shared.playerZ, ISLAND.zGate, ISLAND.zIn + 2.5);   // in town: higher and closer, above the hills
    const pivX = THREE.MathUtils.lerp(camFX, shared.playerX, Math.max(ow, isl)), back = (isPortrait ? 8.4 : 7.8) - isl * 2.2;
    const targetCamPos = _camV1.set(
      pivX + Math.sin(oy) * back,
      5.6 + isl * 3.0 + Math.sin(shared.elapsed * 1.4) * 0.06 + townLift(),
      shared.playerZ + Math.cos(oy) * back
    );
    const lookGoal = _camV2.set(pivX - Math.sin(oy) * 6.0, 1.35 + townLift(), shared.playerZ - Math.cos(oy) * 6.0);
    if (standFocus.stand) {
      standCameraPose(standFocus.stand);
      targetCamPos.copy(_standPos);
      lookGoal.copy(_standLook);
    }
    if (shopBrowse.active) { shopCameraPose(); targetCamPos.copy(_shPos); lookGoal.copy(_shLook); }
    if (shared.reelLookW > 0.002) lookGoal.lerp(world.fishShadow.position, shared.reelLookW); // look at the fish while it is dragged
    if (!shared.camLookInit) { camLookCur.copy(lookGoal); shared.camLookInit = true; }
    const lookSmooth = 1 - Math.exp(-(shopBrowse.active ? 4.5 : standFocus.stand ? 5.5 : 9) * dt);
    camLookCur.lerp(lookGoal, lookSmooth);
    camera.position.lerp(targetCamPos, shopBrowse.active ? 1 - Math.exp(-4.2 * dt) : standFocus.stand ? 1 - Math.exp(-5.0 * dt) : camSmooth);
    camera.lookAt(camLookCur);
  } else {
    const speedZoom = Math.min(1.6, Math.abs(shared.boatVel) * 0.05);
    // Chase camera: it swings round behind the boat with a short lag so turns feel smooth.
    // Going astern it flips round to the bow and looks the way the boat is moving.
    if (shared.mode === 'BOAT_DRIVING' && shared.boatVel < -0.8) shared.boatCamReverse = true;
    else if (shared.boatVel > -0.15 || shared.mode !== 'BOAT_DRIVING') shared.boatCamReverse = false;
    const camGoalYaw = (shared.boatStationActive || shared.mode !== 'BOAT_DRIVING' ? shared.rideYawAbs : shared.boatYaw) + (shared.boatCamReverse ? Math.PI : 0);
    const yawErr = Math.atan2(Math.sin(camGoalYaw - shared.boatCamYaw), Math.cos(camGoalYaw - shared.boatCamYaw));
    shared.boatCamYaw += yawErr * (1 - Math.exp(-3.5 * dt));
    const backOffset = _camV3.set(
      Math.sin(shared.boatCamYaw) * (9.5 + speedZoom),
      5.8 + speedZoom * 0.35,
      Math.cos(shared.boatCamYaw) * (9.5 + speedZoom)
    );

    const camBase = lhDock.on ? world.anglerGroup.position : boatPos;
    const targetCamPos = _camV1.copy(camBase).add(backOffset);
    camera.position.lerp(targetCamPos, camSmooth);
    const lookTarget = _camV2.copy(camBase).add(_camV3.set(-Math.sin(shared.boatCamYaw) * 8, 1.0, -Math.cos(shared.boatCamYaw) * 8));
    if (shared.reelLookW > 0.002) lookTarget.lerp(world.fishShadow.position, shared.reelLookW); // look at the fish while it is dragged
    camLookCur.copy(lookTarget); shared.camLookInit = true;
    camera.lookAt(lookTarget);
  }

  // zoomed on the bounty board: step the angler out of the picture so he never stands in front of the papers
  if (!dive.active && shared.mode !== 'DIVING') world.anglerGroup.visible = !(!shared.onBoat && ((standFocus.stand && (standFocus.stand.id === 'aquarium' || (!settings.firstPerson && standFocus.stand.id === 'bounty'))) || (shopBrowse.active && shopBrowse.kind === 'aqua')));
  updateFirstPersonCamera(dt);
  updateDive(dt);
}
