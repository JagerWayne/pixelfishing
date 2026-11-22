/* Sea events: treasure beams and the boss shadow. Kept whole (one closure). */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { BAIT_TIERS, sfx } from '../data/equipment.js';
import { ZONES } from '../data/catalog.js';
import { scene } from '../render/renderer.js';
import { world } from '../render/lights.js';
import { vfx } from '../render/previews.js';
import { boatPos } from '../sim/runtime.js';
import { addXp, bumpStat } from '../save/career.js';
import { checkAchievements } from './market.js';
import { getCurrentZone, getDistanceMeters, getZoneForDistance, saveGame } from '../save/save-game.js';
import { showToast } from '../ui/toasts.js';
import { scope } from '../town/telescope-dice.js';
import { isAnyModalOpen } from '../utils.js';
import { updateHUD } from '../ui/hud.js';
import { getWaveHeight } from '../sim/sky.js';

export let seaEvents;

export function init() {
  seaEvents = (() => {
    const treasures = [];
    let boss = null;
    let treasureTimer = 25, bossTimer = 150;
    const beamGeo = (r, h) => { const g = new THREE.CylinderGeometry(r, r * 1.6, h, 10, 1, true); g.translate(0, h / 2, 0); return g; };
    const gold = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7, flatShading: true });
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7, roughness: 0.3, flatShading: true });

    function makeChest() {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 0.75), gold); body.position.y = 0.28;
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.375, 0.375, 1.1, 10, 1, false, 0, Math.PI), gold);
      lid.rotation.z = Math.PI / 2; lid.rotation.y = Math.PI / 2; lid.position.y = 0.56; lid.scale.set(1, 1, 1);
      const lidFix = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.02, 0.75), gold); lidFix.position.y = 0.56;
      [-0.35, 0.35].forEach(x => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.78), bandMat); b.position.set(x, 0.3, 0); g.add(b); });
      const lock = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.06), bandMat); lock.position.set(0, 0.45, 0.4);
      const buoy = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.09, 6, 16), new THREE.MeshStandardMaterial({ color: 0xf97316, flatShading: true })); buoy.rotation.x = Math.PI / 2; buoy.position.y = 0.02;
      g.add(body, lid, lidFix, lock, buoy);
      return g;
    }
    function makeBeam(color, r, h) {
      return new THREE.Mesh(beamGeo(r, h), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    }
    function freeSpot(minD, maxD, zone) {
      for (let tries = 0; tries < 12; tries++) {
        const a = (Math.random() - 0.5) * Math.PI * 1.4; // mostly out to sea
        const d = minD + Math.random() * (maxD - minD);
        const x = THREE.MathUtils.clamp(boatPos.x - Math.sin(a) * d, -95, 95);
        const z = Math.min(-45, boatPos.z - Math.cos(a) * d);
        if (world.boatCircles.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 10)) continue;
        if (zone && getZoneForDistance(Math.max(0, -z - 12)).id !== zone.id) continue;
        return { x, z };
      }
      return null;
    }
    function spawnTreasure(quiet, zoneArg) {
      const zone = zoneArg || getCurrentZone();
      const spot = freeSpot(70, 220, zone);
      if (!spot) return null;
      const mesh = new THREE.Group();
      mesh.add(makeChest());
      const beam = makeBeam(0xfde047, 0.45, 70); mesh.add(beam);
      scene.add(mesh);
      const t = { x: spot.x, z: spot.z, ttl: 150, mesh, zoneId: zone.id, phase: Math.random() * 6 };
      treasures.push(t);
      if (!quiet) showToast('🪙 A treasure chest is floating nearby! Follow the golden beam.');
      return t;
    }
    function spawnBoss(zone, quiet, minD = 110, maxD = 260) {
      const spot = freeSpot(minD, maxD, zone);
      if (!spot) return;
      const mesh = new THREE.Group();
      const shadow = new THREE.Mesh(new THREE.CircleGeometry(9, 28), new THREE.MeshBasicMaterial({ color: 0x050914, transparent: true, opacity: 0.6, depthWrite: false }));
      shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.06;
      const ring = new THREE.Mesh(new THREE.RingGeometry(9, 10.4, 40), new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.08;
      mesh.add(shadow, ring, makeBeam(0xef4444, 1.2, 90));
      scene.add(mesh);
      boss = { x: spot.x, z: spot.z, ttl: 240, mesh, ring, shadow, radius: 10, zoneId: zone.id };
      if (!quiet) showToast(`🐉 A giant shadow circles ${Math.round(Math.hypot(spot.x - boatPos.x, spot.z - boatPos.z))} m away! Cast into the ring.`);
      updateHUD();
    }
    function removeTreasure(t) { scene.remove(t.mesh); t.mesh.traverse(o => { if (o.geometry) o.geometry.dispose(); }); treasures.splice(treasures.indexOf(t), 1); }
    function clearBoss() { if (!boss) return; scene.remove(boss.mesh); boss.mesh.traverse(o => { if (o.geometry) o.geometry.dispose(); }); boss = null; }

    function collect(t) {
      const z = t.zoneId;
      const cash = Math.round((40 + Math.random() * 60) * Math.pow(z, 1.6));
      const baitTier = Math.min(4, z + 1), baitQty = 3 + Math.floor(Math.random() * 4);
      shared.state.cash = +(shared.state.cash + cash).toFixed(2);
      shared.state.baitStock[baitTier] = (shared.state.baitStock[baitTier] || 0) + baitQty;
      if (shared.state.baitTier === baitTier) shared.state.baitCount = shared.state.baitStock[baitTier];
      bumpStat('treasures'); bumpStat('earned', cash); addXp(25);
      sfx.playCatchFanfare(false);
      vfx.spawnSparkles(new THREE.Vector3(t.x, 1.2, t.z), 36, 0xfacc15);
      showToast(`🪙 TREASURE! +$${cash} and ${baitQty}x ${BAIT_TIERS[baitTier - 1].name}`);
      removeTreasure(t);
      checkAchievements();
      saveGame();
      updateHUD();
    }

    return {
      get boss() { return boss; },
      treasures,
      bossAt(pos) { return boss && Math.hypot(pos.x - boss.x, pos.z - boss.z) <= boss.radius * 1.1 ? boss : null; },
      clearBoss,
      spawn(kind) { const zone = getCurrentZone(); if (kind === 'boss') { if (!boss) spawnBoss(zone); } else spawnTreasure(); },
      /* the lookout telescope and the Post Office's treasure map (v6.3.0): a chest out on the Coastal Reef and sometimes a boss on the Open Shelf */
      sight(onlyTreasure) {
        let t = null;
        if (treasures.length < 2) { for (let k = 0; k < 4 && !t; k++) t = spawnTreasure(true, ZONES[1]); if (t) t.ttl = 420; }
        if (!onlyTreasure && !boss && Math.random() < 0.4) { spawnBoss(ZONES[2], true, 320, 560); if (boss) boss.ttl = 420; }
        return t;
      },
      nearest(pos) {
        let best = null;
        treasures.forEach(t => { const d = Math.hypot(pos.x - t.x, pos.z - t.z); if (!best || d < best.dist) best = { kind: 'treasure', x: t.x, z: t.z, dist: d }; });
        if (boss) { const d = Math.hypot(pos.x - boss.x, pos.z - boss.z); if (!best || d < best.dist) best = { kind: 'boss', x: boss.x, z: boss.z, dist: d }; }
        return best;
      },
      reset() { while (treasures.length) removeTreasure(treasures[0]); clearBoss(); treasureTimer = 25; bossTimer = 150; },
      update(dt, elapsedT) {
        const aboard = (shared.onBoat && shared.state.boatTier > 0) || scope.on;   // the lookout telescope sees them too
        treasures.forEach(t => { t.mesh.visible = aboard; });
        if (boss) boss.mesh.visible = aboard;
        if (!aboard || shared.mode === 'RESCUE_SEQUENCE' || isAnyModalOpen()) return;
        // spawn timers only run while you are out on the water
        const zone = getCurrentZone();
        if (getDistanceMeters() > 40) {
          treasureTimer -= dt;
          if (treasureTimer <= 0 && treasures.length < 2) { spawnTreasure(); treasureTimer = 60 + Math.random() * 60; }
          if (zone.id >= 3 && !boss) { bossTimer -= dt; if (bossTimer <= 0) { spawnBoss(zone); bossTimer = 360 + Math.random() * 240; } }
        }
        for (let i = treasures.length - 1; i >= 0; i--) {
          const t = treasures[i];
          t.ttl -= dt;
          const y = getWaveHeight(t.x, t.z, elapsedT, zone) + 0.1;
          t.mesh.position.set(t.x, y + Math.sin(elapsedT * 1.6 + t.phase) * 0.06, t.z);
          t.mesh.rotation.y = elapsedT * 0.5 + t.phase;
          if (t.ttl <= 0) { removeTreasure(t); showToast('The treasure chest sank out of sight.'); updateHUD(); continue; }
          if (Math.hypot(boatPos.x - t.x, boatPos.z - t.z) < 4.5 + shared.boatHalfLen * 0.4) collect(t);
        }
        if (boss) {
          boss.ttl -= dt;
          boss.mesh.position.set(boss.x, getWaveHeight(boss.x, boss.z, elapsedT, zone), boss.z);
          boss.ring.rotation.z = elapsedT * 0.4;
          boss.shadow.material.opacity = 0.5 + Math.sin(elapsedT * 1.3) * 0.12;
          if (boss.ttl <= 0) { clearBoss(); showToast('The giant shadow slipped back into the deep.'); updateHUD(); }
        }
      }
    };
  })();
}
