/* The frame loop (animate): world time, pause, freeze frames and rendering. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { settings } from '../core/settings.js';
import { camera, mainCanvas, postCamera, postScene, postUniforms, renderTarget, renderer, scene } from '../render/renderer.js';
import { camPreviewCanvas, camPreviewCtx } from '../render/lights.js';
import { compass, pipCam, pipRenderer, pipScene, previewCam, previewRenderer, previewScene } from '../render/previews.js';
import { pipBubbles, pipFishHolder, pipLine, pipRigGroup } from '../render/live-bait.js';
import { standFocus } from './runtime.js';
import { checkAchievements } from '../fishing/market.js';
import { updateScope } from '../town/telescope-dice.js';
import { inFight, isGamePaused } from '../utils.js';
import { seaEvents } from '../fishing/sea-events.js';
import { updateHUD } from '../ui/hud.js';
import { updateSimulation } from './update-simulation.js';
import { updateLeap } from '../fishing/leap.js';
import { _camV1, _shakeOff, camJuice, timeFx, updateLanding, updatePauseCountdown } from '../ui/pause.js';

let hudClockTimer = 0;
let achTimer = 0;
export function animate(now) {
  requestAnimationFrame(animate);
  const rawDt = Math.min(0.05, Math.max(0, (now - shared.lastTime) / 1000));
  shared.lastTime = now;
  // world time: frozen while paused or in a menu, frozen for a freeze frame, slowed during slow motion
  let dt = isGamePaused() ? 0 : rawDt;
  if (dt > 0 && timeFx.hitStop > 0) { timeFx.hitStop -= rawDt; dt = 0; }
  else if (dt > 0 && timeFx.slowT > 0) { timeFx.slowT -= rawDt; dt *= timeFx.slow; }
  // take last frame's shake back out, so the follow camera never smooths the shake into a wobble
  camera.position.sub(_shakeOff); _shakeOff.set(0, 0, 0);

  updateSimulation(dt);
  updateLanding(dt);
  updateLeap(dt);
  seaEvents.update(dt, shared.elapsed);
  updatePauseCountdown(rawDt);
  achTimer += rawDt;
  if (achTimer > 2) { achTimer = 0; checkAchievements(); }
  const fishingNow = inFight() ? '1' : '0';
  if (document.body.dataset.fishing !== fishingNow) document.body.dataset.fishing = fishingNow;
  hudClockTimer += dt;
  if (hudClockTimer >= 0.5) {
    hudClockTimer = 0;
    updateHUD();
  }

if (shared.mode === 'REELING' && shared.tension > 0.78) {
    camJuice.shake = Math.max(camJuice.shake, (shared.tension - 0.78) * 0.3);
  }
  const targetFovOffset = (settings.firstPerson && standFocus.stand) ? -14 : (shared.mode === 'REELING' ? -4.5 : (shared.mode === 'CASTING' ? 2.5 : 0));
  camJuice.fovOffset += (targetFovOffset - camJuice.fovOffset) * Math.min(1, dt * 6);
  const baseFov = window.innerWidth < window.innerHeight ? 62 : 52;
  if (Math.abs(camera.fov - (baseFov + camJuice.fovOffset)) > 0.05) {
    camera.fov = baseFov + camJuice.fovOffset;
    camera.updateProjectionMatrix();
  }
  if (camJuice.shake > 0.002 && !isGamePaused()) {
    _shakeOff.set((Math.random() - 0.5) * camJuice.shake, (Math.random() - 0.5) * camJuice.shake, 0).applyQuaternion(camera.quaternion);
    camera.position.add(_shakeOff);
    camJuice.shake *= Math.pow(0.04, rawDt);   // decays in real time, also through a freeze frame
  }

  updateScope(rawDt);   // the lookout telescope takes over the camera
  compass.update();
  if (postUniforms.uMode.value === 0) {
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
  } else {
    postUniforms.uTime.value = shared.elapsed;
    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCamera);
  }

  if (shared.previewFishObj && document.getElementById('modal-catch').classList.contains('open')) {
    shared.previewFishObj.rotation.y += dt * 1.8;
    shared.previewFishObj.position.y = Math.sin(shared.elapsed * 3) * 0.06;
    previewRenderer.render(previewScene, previewCam);
  }

  if (camPreviewCtx && document.getElementById('modal-camera').classList.contains('open')) {
    camPreviewCtx.drawImage(mainCanvas, 0, 0, camPreviewCanvas.width, camPreviewCanvas.height);
  }

  // Render Underwater Live Bait Cam PiP during Reeling (when Rod-Tip Live Bait Cam is installed)
  if (shared.mode === 'REELING' && shared.state.hasLiveBaitCam) {
    const isPassive = shared.activeCatch && (shared.activeCatch.item.category === 'Junk' || shared.activeCatch.item.category === 'Flora');
    const thrashSpeed = isPassive ? 2.5 : (9 + shared.tension * 10);

    const swimSign = isPassive ? 1 : (shared.fishSwimDir < 0 ? -1 : (shared.fishSwimDir > 0 ? 1 : (shared.fishLateralPos < -0.05 ? -1 : 1)));
    const targetPipYaw = swimSign < 0 ? Math.PI : 0;
    shared.pipFishDirYaw = THREE.MathUtils.lerp(shared.pipFishDirYaw, targetPipYaw, Math.min(1, dt * 9));

    const bobY = Math.sin(shared.elapsed * 3.8) * 0.06;
    const shakeZ = isPassive ? Math.sin(shared.elapsed * 2) * 0.05 : Math.sin(shared.elapsed * thrashSpeed) * (0.14 + shared.tension * 0.14);
    const shakeY = isPassive ? 0 : Math.cos(shared.elapsed * thrashSpeed * 0.85) * 0.12;

    pipFishHolder.position.set(shared.fishLateralPos * 0.22, bobY, 0);
    pipFishHolder.rotation.set(0, shared.pipFishDirYaw + shakeY, shakeZ);

    // Update fishing line endpoint to stay connected to the fish's mouth
    pipFishHolder.updateMatrixWorld(true);
    const mouthPos = pipRigGroup.getWorldPosition(_camV1);
    const lArr = pipLine.geometry.attributes.position.array;
    lArr[0] = -0.35;
    lArr[1] = 1.25;
    lArr[2] = 0;
    lArr[3] = mouthPos.x;
    lArr[4] = mouthPos.y + 0.08;
    lArr[5] = mouthPos.z;
    pipLine.geometry.attributes.position.needsUpdate = true;

    pipBubbles.forEach(b => {
      b.mesh.position.y += b.speed * dt;
      if (b.mesh.position.y > 0.85) {
        b.mesh.position.y = -0.85;
        b.mesh.position.x = (Math.random() - 0.5) * 1.8;
      }
    });

    pipRenderer.render(pipScene, pipCam);
  }
}
