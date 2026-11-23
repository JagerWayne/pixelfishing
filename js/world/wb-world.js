/* WorldBuilder method: buildWorld, the sea, sky, pier, harbour and island. Kept whole (one long method). */
import { THREE } from '../engine/three.js';
import { settings } from '../core/settings.js';
import { PixelTextureFactory } from '../render/texture-factory.js';
import { AnglerFactory } from '../angler/angler-factory.js';
import { LIGHT_TUNING, ModelKit } from '../render/model-kit.js';
import { AQUARIUM_TANKS, BOAT_TERMINAL, BW_HALF, CABIN, COL, DOCK_PUMP, ISLAND, LH_J, PIER_BUCKET_X, PIER_DX, PIER_HW,
  PIER_PILE, PIER_TOOLBOX_X, PLATFORM, RECYCLE, SHORE_SHOPS, townFlatten } from './layout.js';
import { Colliders } from '../data/recipes.js';
import { WorldBuilder } from './world-builder.js';

export const wbWorldStatics = {
  buildWorld(scene, textures) {
    // Sculpted Natural Coastal Island: Sandy Beach (Z: 2 -> 6.5), Grassy Harbor Terrace (Z: 6.5 -> 16), Rising Hills (Z: > 16)
    const shoreGeo = new THREE.PlaneGeometry(240, 86, 64, 32);
    shoreGeo.rotateX(-Math.PI / 2);
    const sPos = shoreGeo.attributes.position;
    for (let i = 0; i < sPos.count; i++) {
      const x = sPos.getX(i);
      const localZ = sPos.getZ(i);
      const worldZ = localZ + 43;
      let y = -1.6;
      if (worldZ > 0.0) {
        const beachT = Math.min(1, worldZ / 6.2);
        const curveEdge = Math.sin(x * 0.05) * 0.35;
        y = -0.6 + beachT * 2.08 + curveEdge * 0.35;
      }
      if (worldZ > 6.2 && worldZ <= 14.5) {
        // Flat, level grassy harbor terrace right at Y = 1.48 so buildings sit flush
        y = 1.48 + Math.sin(x * 0.12) * 0.03;
      } else if (worldZ > 14.5) {
        // Rolling coastal hills rising behind the harbor terrace
        y = 1.48 + Math.pow((worldZ - 14.5) * 0.25, 1.38) + Math.cos(x * 0.06) * 1.4;
      }
      if (worldZ > 14.5 && Math.abs(x) < 140) y = 1.2;   // v6.3.0: the hills heightfield covers this; keep the sand well under it
      else if (worldZ > 6.2) y = townFlatten(x, worldZ, y);
      sPos.setY(i, y);
    }
    shoreGeo.computeVertexNormals();
    const shoreMesh = new THREE.Mesh(
      shoreGeo,
      new THREE.MeshStandardMaterial({ map: textures.sand, roughness: 0.9, flatShading: true })
    );
    shoreMesh.position.set(0, 0, 43);
    scene.add(shoreMesh);

    // Grassy Harbor Terrace Lawn (Z = 6.2 to 22) matching pier deck elevation (Y = 1.48)
    const grassMat = new THREE.MeshStandardMaterial({ map: textures.grass, roughness: 0.85, flatShading: true });
    // v6.3.0: wider (x +-40), with a ramp up to an upper terrace 1.2 m higher (see ISLAND, townGround)
    const TERR_HW = 40;
    // v12.0.0: the lower town runs to the slope at rampZ0, the Upper Terrace from rampZ1 back to the town's edge
    const terraceMesh = new THREE.Mesh(new THREE.BoxGeometry(2 * TERR_HW, 1.2, ISLAND.rampZ0 + 0.4 - 6.2), grassMat);
    terraceMesh.position.set(0, 0.90, (6.2 + ISLAND.rampZ0 + 0.4) / 2);
    scene.add(terraceMesh);
    const upperEnd = ISLAND.zMax + 2.5;
    const upperTerrace = new THREE.Mesh(new THREE.BoxGeometry(2 * TERR_HW, 1.2 + ISLAND.up, upperEnd - ISLAND.rampZ1), grassMat);
    upperTerrace.position.set(0, 0.3 + (1.2 + ISLAND.up) / 2, (ISLAND.rampZ1 + upperEnd) / 2);
    scene.add(upperTerrace);
    {
      const run = ISLAND.rampZ1 - ISLAND.rampZ0, a = Math.atan2(ISLAND.up, run);
      const ramp = new THREE.Mesh(new THREE.BoxGeometry(2 * TERR_HW, 0.3, Math.hypot(run, ISLAND.up) + 0.08), grassMat);
      ramp.rotation.x = -a; ramp.position.set(0, 1.5 + ISLAND.up / 2 - 0.15 / Math.cos(a), (ISLAND.rampZ0 + ISLAND.rampZ1) / 2);
      scene.add(ramp);
    }

    // Stone Seawall Retaining Curb Separating Sandy Beach from Grassy Terrace (Z = 6.2)
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9, flatShading: true });
    const seawall = new THREE.Mesh(new THREE.BoxGeometry(2 * 40 + 2, 1.35, 0.7), stoneMat);
    seawall.position.set(0, 1.5 - 0.675, 6.2);   // v6.6.1: flush with the terrace, a curb you step over
    {   // v6.6.1: a paved strip from the boardwalk's back edge onto the terrace, so the open town front has no gap
      const strip = new THREE.Mesh(new THREE.BoxGeometry(2 * BW_HALF, 0.3, 1.2), new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.95, flatShading: true }));
      strip.position.set(0, 1.52 - 0.15, 6.25); strip.receiveShadow = true; scene.add(strip);
    }
    scene.add(seawall);

    // Stone Pier Abutment & Timber Ramp Steps Connecting Terrace (Z = 6.2) to Pier (Z = 3.2)
    const abutment = new THREE.Mesh(new THREE.BoxGeometry(6.0, 2.2, 3.6), stoneMat);
    abutment.position.set(0, 0.30, 4.6);
    scene.add(abutment);

    // Island scenery that the third-person camera could get stuck behind (palms, cottages, bushes): hidden unless first person
    const islandScenery = new THREE.Group(); scene.add(islandScenery);
    // Rolling island hills behind the harbour terrace: one heightfield with grass, darker hollows and rocky slopes in its
    // vertex colours. It always sits on or above the beach plane underneath, so nothing pokes through.
    {
      const W = 280, D = 74, nx = 112, nz = 34;
      const hg = new THREE.PlaneGeometry(W, D, nx, nz);
      hg.rotateX(-Math.PI / 2);
      const hp = hg.attributes.position, col = new Float32Array(hp.count * 3), c = new THREE.Color();
      const grassA = new THREE.Color(0x376b2e), grassB = new THREE.Color(0x5a8f40), dry = new THREE.Color(0x96904e), rock = new THREE.Color(0x7d8088);
      const shoreY = (x, z) => 1.48 + Math.pow(Math.max(0, z - 14.5) * 0.25, 1.38) + Math.cos(x * 0.06) * 1.4;
      const hY = (x, z) => {
        const k = THREE.MathUtils.smoothstep(z, 15, 34);
        const n = this.noise2(x * 0.035, z * 0.05) * 9 + this.noise2(x * 0.09 + 7, z * 0.09) * 3.5 + this.noise2(x * 0.25, z * 0.25) * 0.8;
        const ridge = Math.max(0, Math.sin(x * 0.028 + 0.8)) * 7 * THREE.MathUtils.smoothstep(z, 30, 70);
        return townFlatten(x, z, Math.max(shoreY(x, z) + 0.15, 1.5 + k * (n * 0.8 + ridge + (z - 15) * 0.12)));
      };
      for (let i = 0; i < hp.count; i++) {
        const x = hp.getX(i), z = hp.getZ(i) + 14.5 + D / 2;
        const y = hY(x, z);
        hp.setY(i, y);
        const slope = Math.abs(hY(x + 1, z) - y) + Math.abs(hY(x, z + 1) - y);
        const nn = this.noise2(x * 0.15, z * 0.15);
        c.copy(grassA).lerp(grassB, nn).lerp(dry, Math.max(0, this.noise2(x * 0.05 + 3, z * 0.05) - 0.6) * 1.6);
        if (slope > 1.3) c.lerp(rock, Math.min(1, (slope - 1.3) * 0.8));
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      }
      hg.setAttribute('color', new THREE.BufferAttribute(col, 3));
      hg.computeVertexNormals();
      const hills = new THREE.Mesh(hg, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, flatShading: true }));
      hills.position.z = 14.5 + D / 2;
      scene.add(hills);
      // a scatter of rocks and bushes on the slopes (bushes join the island scenery group, hidden in third person)
      for (let i = 0; i < 26; i++) {
        const x = (this.noise2(i * 3.1, 1) - 0.5) * 200, z = 26 + this.noise2(i * 1.7, 5) * 40;
        if (Math.abs(x) < 44 && z < ISLAND.zMax + 6) continue;   // v12.0.0: clear of the deeper town
        const y = hY(x, z);
        if (i % 3) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9 + (i % 4) * 0.35, 0), new THREE.MeshStandardMaterial({ color: i % 2 ? 0x2f6f2a : 0x3d7f33, roughness: 0.9, flatShading: true })); b.position.set(x, y + 0.4, z); b.scale.y = 0.75; islandScenery.add(b); }
        else { const r = this.buildRock(1.1 + (i % 5) * 0.3, i, 0x8a8f96, 0); r.position.set(x, y + 0.2, z); scene.add(r); }
      }
    }

    // Coastal Boulders Framing Both Ends of the Seawall
    [
      [-41.4, 1.3, 6.8, 1.3], [41.4, 1.3, 6.8, 1.4], [-43.6, 1.5, 9.2, 1.7],
      [43.6, 1.5, 9.2, 1.6], [-46.2, 1.8, 12.0, 2.1], [46.2, 1.8, 12.0, 2.0]
    ].forEach(([rx, ry, rz, rad]) => {
      const rock = this.buildRock(rad, rx * 0.37 + rz, 0x6b7280, 1);
      rock.scale.set(1.2, 0.95, 1.1);
      rock.position.set(rx, ry, rz);
      rock.rotation.y = rx * 0.5;
      scene.add(rock);
    });

    // v12.0.0: every town building, street, tree and prop comes from the town plan (town-plan.js), built below
    const townFade = [];
    const restoProps = this.buildHarbourTown(islandScenery, townFade, textures);
    const districtProps = this.buildTownDistricts(islandScenery, townFade, textures);
    // v6.3.1 performance: merge the static meshes of every town building and palm (fading still works per material),
    // then the loose props on the terrace (hedges, paving, cobbles, rocks); groups that change stay as they are
    islandScenery.children.forEach(g => { if (!g.isMesh && (g.userData.townFade || g.userData.fade)) ModelKit.mergeStatic(g, [g.userData.nameSign, g.userData.soonSign], { bakeColor: true }); });
    ModelKit.mergeStatic(islandScenery, islandScenery.children.filter(o => !o.isMesh), { bakeColor: true });

    const pierGroup = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ map: textures.wood, roughness: 0.85, flatShading: true });
    const postMat = new THREE.MeshStandardMaterial({ color: 0x4a2c16, roughness: 0.9, flatShading: true });

    const RB = (w, h, d) => ModelKit.roundedBox(w, h, d, ModelKit.bevelFor(w, h, d));
    // ---- Deck: boards with the grain running along their length, three tints, dark timber underneath ----
    const deckMats = (rx, ry, rot) => {
      const t = textures.deck.clone(); t.needsUpdate = true;
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
      if (rot) { t.center.set(0.5, 0.5); t.rotation = Math.PI / 2; }
      return [0xffffff, 0xe7cfb6, 0xd2b497].map(c => new THREE.MeshStandardMaterial({ map: t, color: c, roughness: 0.88, flatShading: true }));
    };
    const planksAcross = deckMats(4 * PIER_HW / 2.45, 1, false);   // pier planks run along X
    const planksAlong = deckMats(1, 4.3, true);   // boardwalk planks run along Z
    const timberDark = new THREE.MeshStandardMaterial({ color: 0x2b180b, roughness: 0.95, flatShading: true });
    const addBox = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(RB(w, h, d), mat); m.position.set(x, y, z); pierGroup.add(m); return m; };

    // dark underlay and joists, so the gaps between boards read as shadowed timber instead of showing the sea
    addBox(2 * BW_HALF + 0.6, 0.12, 5.7, timberDark, 0, 1.38, 2.85);
    addBox(2 * PIER_HW + 0.6, 0.12, 11.5, timberDark, 0, 1.38, -5.7);
    for (let jz = 0.4; jz < 5.6; jz += 1.44) addBox(2 * BW_HALF + 0.4, 0.16, 0.14, timberDark, 0, 1.28, jz);
    for (let jz = -0.3; jz > -11.4; jz -= 1.44) addBox(2 * PIER_HW + 0.5, 0.16, 0.14, timberDark, 0, 1.28, jz);
    // fascia trim: the island edge of the boardwalk, its sea edge either side of the pier, and the seam where the pier starts
    addBox(2 * BW_HALF + 0.6, 0.2, 0.1, timberDark, 0, 1.45, 5.68);
    [-1, 1].forEach(sd => addBox(BW_HALF - (PIER_HW + 0.15), 0.2, 0.1, timberDark, sd * (BW_HALF + PIER_HW + 0.15) / 2, 1.45, -0.04));
    [-1, 1].forEach(sd => addBox(0.1, 0.2, 5.75, timberDark, sd * (BW_HALF + 0.05), 1.45, 2.82));   // end fascias
    addBox(2 * PIER_HW + 0.5, 0.2, 0.1, timberDark, 0, 1.47, 0.0);

    // Waterfront boardwalk along the sea edge (X = -10.5 to +10.5, Z = 0.0 to 5.6): one layer only
    for (let x = -BW_HALF, n = 0; x <= BW_HALF + 1e-6; x += 0.72, n++) {
      const bwPlank = new THREE.Mesh(RB(0.64, 0.14, 5.6), planksAlong[(n * 7 + Math.floor(n / 3)) % 3]);
      bwPlank.position.set(x, 1.49 + ((n * 5) % 4) * 0.002, 2.8);
      pierGroup.add(bwPlank);
    }

    // Main pier walkway (Z = 0 out to the tip at -11.12). The first board is trimmed so it never overlaps the boardwalk.
    for (let k = 0; k < 16; k++) {
      const z = -0.72 * k;
      const depth = k === 0 ? 0.32 : 0.64;
      const plank = new THREE.Mesh(RB(2 * PIER_HW + 0.3, 0.14, depth), planksAcross[(k * 5 + Math.floor(k / 2)) % 3]);
      plank.position.set(0, 1.48 + ((k * 3) % 4) * 0.002, k === 0 ? -0.16 : z);
      pierGroup.add(plank);
    }

    // Port-Side Wooden Stairs Descending to a Low Floating Mooring Platform (Z = -5.6)
    const stepCount = 4;
    for (let s = 0; s < stepCount; s++) {
      const stepX = -2.75 - PIER_DX - s * 0.30;
      const stepY = 1.32 - s * 0.18;
      const tread = new THREE.Mesh(RB(0.32, 0.12, 2.2), woodMat);
      tread.position.set(stepX, stepY, -5.6);
      const riser = new THREE.Mesh(RB(0.06, 0.18, 2.15), postMat);
      riser.position.set(stepX + 0.14, stepY - 0.08, -5.6);
      pierGroup.add(tread, riser);
    }
    // Stair Stringer Beams
    [-4.55, -6.65].forEach(sz => {
      const stringer = new THREE.Mesh(RB(1.45, 0.16, 0.12), postMat);
      stringer.position.set(-3.2 - PIER_DX, 1.04, sz);
      stringer.rotation.z = 0.54;
      pierGroup.add(stringer);
    });

    // Low Water-Level Mooring Platform (X = -3.85 to -6.05, Y = 0.64)
    for (let px = -3.95 - PIER_DX; px >= -5.95 - PIER_DX; px -= 0.42) {
      const dockPlank = new THREE.Mesh(RB(0.36, 0.14, -4.25 - PLATFORM.zEnd), woodMat);
      dockPlank.position.set(px, 0.64, (-4.25 + PLATFORM.zEnd) / 2);
      pierGroup.add(dockPlank);
    }
    // Mooring Platform Pontoon Floats, Pilings & Cleats
    [-4.6, -6.6, -8.6].forEach(pz => {
      const pontoon = new THREE.Mesh(
        RB(2.15, 0.36, 0.42),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, flatShading: true })
      );
      pontoon.position.set(-4.95 - PIER_DX, 0.42, pz);
      const piling = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 3.2, 8), postMat);
      piling.position.set(-5.95 - PIER_DX, 0.35, pz);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.14, 8), woodMat);
      cap.position.set(-5.95 - PIER_DX, 2.02, pz);
      pierGroup.add(pontoon, piling, cap);
    });
    const cleatMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.75, roughness: 0.3, flatShading: true });
    [-4.75, -6.45, -8.35].forEach(cz => {
      const cleatBase = new THREE.Mesh(RB(0.12, 0.08, 0.12), cleatMat);
      cleatBase.position.set(-5.82 - PIER_DX, 0.74, cz);
      const cleatHorn = new THREE.Mesh(RB(0.10, 0.05, 0.34), cleatMat);
      cleatHorn.position.set(-5.82 - PIER_DX, 0.79, cz);
      pierGroup.add(cleatBase, cleatHorn);
    });

    // Pier & Boardwalk Pilings
    const pilingCoords = [
      [-10.4, 0.0], [-5.2, 0.0], [5.2, 0.0], [10.4, 0.0], [-15.7, 0.0], [15.7, 0.0], [-(BW_HALF - 0.1), 0.0], [BW_HALF - 0.1, 0.0],
      [-PIER_PILE, -3.2], [PIER_PILE, -3.2], [-PIER_PILE, -9.8], [PIER_PILE, -9.8], [-PIER_PILE, -11.25], [PIER_PILE, -11.25]
    ];
    pilingCoords.forEach(([px, pz]) => {
      const piling = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 4.2, 8), postMat);
      piling.position.set(px, 0.35, pz);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.23, 0.16, 8), woodMat);
      cap.position.set(px, 2.53, pz);
      pierGroup.add(piling, cap);
    });

    // Proper Wooden Safety Railings on the Waterfront Sea Edge & First Part of the Pier (Z = 0.0 to -4.2)
    const addRailingSegment = (x1, z1, x2, z2) => {
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      const midX = (x1 + x2) * 0.5;
      const midZ = (z1 + z2) * 0.5;
      const angle = Math.atan2(dx, dz);

      [2.45, 2.02].forEach(ry => {
        const rail = new THREE.Mesh(RB(0.11, 0.09, len), woodMat);
        rail.position.set(midX, ry, midZ);
        rail.rotation.y = angle;
        pierGroup.add(rail);
      });

      const numPosts = Math.max(2, Math.round(len / 1.4) + 1);
      for (let i = 0; i < numPosts; i++) {
        const t = i / (numPosts - 1);
        const px = x1 + dx * t;
        const pz = z1 + dz * t;
        const rPost = new THREE.Mesh(RB(0.14, 1.02, 0.14), postMat);
        rPost.position.set(px, 2.05, pz);
        const rCap = new THREE.Mesh(RB(0.18, 0.06, 0.18), woodMat);
        rCap.position.set(px, 2.58, pz);
        pierGroup.add(rPost, rCap);
      }
    };

    // Boardwalk sea-edge railings flanking the pier entrance
    addRailingSegment(-(BW_HALF - 0.1), 0.12, -PIER_HW, 0.12);
    addRailingSegment(PIER_HW, 0.12, BW_HALF - 0.1, 0.12);
    // First section of the main pier railings (Z = 0.12 down to Z = -4.2)
    addRailingSegment(-PIER_HW, 0.12, -PIER_HW, -4.2);
    addRailingSegment(PIER_HW, 0.12, PIER_HW, -4.2);
    // Railings continue down both sides to the far end. The port side keeps an opening
    // (Z -4.2 to -6.9) for the stairs down to the mooring platform.
    addRailingSegment(PIER_HW, -4.2, PIER_HW, -11.34);
    addRailingSegment(-PIER_HW, -6.9, -PIER_HW, -11.34);

    // 3D Tackle Shop on the Waterfront Edge with Back to the Sea, Facing South (+Z) so Player Walks in Front
    const tackleShop = this.buildTackleShop(textures);
    tackleShop.position.set(-7.6, 1.56, 1.0);
    tackleShop.rotation.y = 0;
    pierGroup.add(tackleShop);

    // 3D Harbor Bounty Board with Back to the Sea, Facing South (+Z)
    const bountyBoard = this.buildBountyBoard(textures);
    bountyBoard.position.set(-4.2, 1.56, 0.8);
    bountyBoard.rotation.y = 0;
    pierGroup.add(bountyBoard);

    // 3D Bottle Gallery Display Stand with Back to the Sea, Facing South (+Z)
    const galleryStand = this.buildBottleGalleryStand(textures);
    galleryStand.position.set(CABIN.galleryX, 1.56, 0.8);
    galleryStand.rotation.y = 0;
    pierGroup.add(galleryStand);

    // The aquarium on the cabin's back wall, right of the bottle gallery (front faces +Z)
    const aquarium = this.buildAquariumTank(textures, AQUARIUM_TANKS[0]);
    aquarium.position.set(CABIN.aquaX, 1.56, 0.5);
    pierGroup.add(aquarium);

    // Recycling stand (three skips) and the walk-in cabin
    const recycleStand = this.buildRecycleStand(textures);
    recycleStand.position.set(RECYCLE.x, 1.56, 0); pierGroup.add(recycleStand);
    const cabin = this.buildCabin(textures);
    cabin.position.set(CABIN.x, 1.56, 0); pierGroup.add(cabin);

    // 3D Tackle Toolbox on the Starboard Front Pier Opposite the Catch Bucket
    const tackleToolbox = this.buildTackleToolbox();
    tackleToolbox.position.set(PIER_TOOLBOX_X, 1.56, -7.6);
    tackleToolbox.rotation.y = -0.35;
    pierGroup.add(tackleToolbox);

    // Shops on the boardwalk: backs on the sea rail, fronts facing south like the Tackle Shop
    Object.entries(SHORE_SHOPS).forEach(([kind, sh]) => {
      const house = this.buildShopHouse(kind, { ...sh, w: sh.w / sh.s, d: sh.d / sh.s }, textures);   // built full size, then scaled down
      house.scale.setScalar(sh.s);
      house.position.set(sh.x, 1.56, sh.z);
      pierGroup.add(house);
      const frontPad = (kind === 'fish' ? 0.85 : 0.45) * sh.s;   // the fish bench and the awning stick out at the front
      Colliders.box(kind + ' shop', sh.x, sh.z + frontPad / 2, sh.w / 2 + sh.extra / 2, sh.d / 2 + frontPad / 2 + 0.05, COL.WALK);
      sh.front = frontPad;
    });

    // Walk colliders for the stands (the back edge sits on the boardwalk rail at z = 0)
    const W = COL.WALK;
    Colliders.box('tackle shop', -7.525, 1.275, 1.825, 1.275, W);
    Colliders.box('bounty board', -4.2, 0.825, 1.0, 0.825, W);
    Colliders.box('bottle gallery', CABIN.galleryX, 0.875, 1.3, 0.875, W);
    aquarium.userData.collider = Colliders.box('aquarium', CABIN.aquaX, 0.5, AQUARIUM_TANKS[0].w / 2 + 0.1, 0.5, W);
    Colliders.box('recycling', RECYCLE.x, 0.65, RECYCLE.w / 2, 0.65, W);
    {   // the cabin: side walls, the front wall with its door gap, the bunk bed
      const hw = CABIN.w / 2, dz = CABIN.d + 0.05, dw = CABIN.doorW / 2;
      Colliders.box('cabin wall W', CABIN.x - hw + 0.07, (CABIN.d + 0.2) / 2, 0.11, (CABIN.d + 0.3) / 2, W);
      Colliders.box('cabin wall E', CABIN.x + hw - 0.07, (CABIN.d + 0.2) / 2, 0.11, (CABIN.d + 0.3) / 2, W);
      Colliders.box('cabin front W', CABIN.x - (hw + dw) / 2, dz, (hw - dw) / 2, 0.12, W);
      Colliders.box('cabin front E', CABIN.x + (hw + dw) / 2, dz, (hw - dw) / 2, 0.12, W);
      Colliders.box('cabin bed', CABIN.x + hw - 0.62, 2.55, 0.5, 0.95, W);
    }
    Colliders.box('toolbox', PIER_TOOLBOX_X, -7.6, 0.55, 0.45, W);
    const bucketCollider = Colliders.box('bucket', PIER_BUCKET_X, -7.6, 0.69, 0.65, W);

    let cheatGull = null;
    let lighthouseBeacon = null;
    // ---- Pier detail layer: structure, mooring gear, bunting, gulls and a distant lighthouse ----
    {
      const K = this.propKit(textures);
      const deckY = 1.55;

      // side stringers and under-deck cross bracing so the pier reads as a built structure
      [-1, 1].forEach(sd => K.box(pierGroup, 0.16, 0.3, 11.44, K.darkWood, sd * (PIER_HW + 0.15), 1.36, -5.72));
      [[-PIER_PILE, -3.2], [PIER_PILE, -3.2], [-PIER_PILE, -9.8], [PIER_PILE, -9.8], [-PIER_PILE, -11.25], [PIER_PILE, -11.25]].forEach(([px, pz]) => {
        // barnacle ring at the waterline and a rope wrap near the top
        for (let i = 0; i < 9; i++) {
          const a = (i / 9) * Math.PI * 2;
          const c = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.07, 5), K.M(i % 2 ? 0xd6d3d1 : 0x9ca3af, 0.95));
          c.position.set(px + Math.cos(a) * 0.25, 0.12 + (i % 3) * 0.05, pz + Math.sin(a) * 0.25);
          c.rotation.z = -Math.cos(a) * 1.4; c.rotation.x = Math.sin(a) * 1.4;
          pierGroup.add(c);
        }
        const wrap = new THREE.Mesh(new THREE.TorusGeometry(0.245, 0.03, 5, 14), K.rope);
        wrap.rotation.x = Math.PI / 2; wrap.position.set(px, 1.7, pz); pierGroup.add(wrap);
        const wrap2 = wrap.clone(); wrap2.position.y = 1.82; pierGroup.add(wrap2);
      });
      [[-3.2], [-9.8], [-11.25]].forEach(([z]) => K.box(pierGroup, 2 * PIER_HW - 0.1, 0.14, 0.14, K.darkWood, 0, 0.75, z));
      [-1, 1].forEach(s => [-3.2, -9.8].forEach(z => { /* diagonals across the span between the two bent pairs */ }));
      const span = Math.hypot(6.6, 0.9);
      [-1, 1].forEach(s => {
        const brace = K.box(pierGroup, 0.1, 0.1, span, K.darkWood, s * PIER_PILE, 0.78, -6.5);
        brace.rotation.x = 0; brace.rotation.y = 0; brace.rotation.z = 0;
        const diag = K.box(pierGroup, 0.09, 0.09, 4.6, K.darkWood, s * PIER_PILE, 1.0, -6.5);
        diag.rotation.x = s * 0.28;
      });

      // mooring bollards at the pier tip with rope coils
      [-1, 1].forEach(sd => Colliders.circle('bollard', sd * (PIER_HW - 0.25), -9.6, 0.22, COL.WALK));
      Colliders.box('rod rack', -(PIER_HW - 0.15), -9.05, 0.12, 0.4, COL.WALK);
      [-PIER_HW, PIER_HW].forEach(x => Colliders.circle('bunting pole', x, 0.3, 0.1, COL.WALK));
      [-(PIER_HW - 0.25), PIER_HW - 0.25].forEach(x => {
        K.cyl(pierGroup, 0.12, 0.16, 0.34, K.iron, x, deckY + 0.17, -9.6, 10);
        K.cyl(pierGroup, 0.19, 0.12, 0.08, K.iron, x, deckY + 0.38, -9.6, 10);
        const rope = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.03, 5, 12), K.rope);
        rope.rotation.x = Math.PI / 2; rope.position.set(x, deckY + 0.28, -9.6); pierGroup.add(rope);
      });
      // life ring station on the starboard rail, and a coiled hose
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.085, 8, 18), K.M(0xf97316, 0.5));
      ring.rotation.y = Math.PI / 2; ring.position.set(PIER_HW - 0.15, 2.2, -3.48); pierGroup.add(ring);
      for (let i = 0; i < 4; i++) {
        const band = new THREE.Mesh(RB(0.02, 0.18, 0.1), K.M(0xf8fafc, 0.5));
        const a = (i / 4) * Math.PI * 2;
        band.position.set(PIER_HW - 0.15, 2.2 + Math.cos(a) * 0.26, -3.48 + Math.sin(a) * 0.26); band.rotation.x = a; pierGroup.add(band);
      }
      // rod rack at the tip, port side: in the bay between two rail posts (z -8.38 and -9.86), inside the rail line
      K.box(pierGroup, 0.06, 0.5, 0.5, K.darkWood, -(PIER_HW - 0.11), deckY + 0.25, -9.12);
      [0xd97706, 0x0284c7, 0x16a34a].forEach((c, i) => {
        const r = K.cyl(pierGroup, 0.013, 0.02, 1.9, K.M(c, 0.4, 0.2), -(PIER_HW - 0.19), deckY + 0.95, -8.94 - i * 0.18, 5); r.rotation.z = -0.12;
      });

      // bunting across the pier entrance
      {
        const pts = [], cols = [[0xdc2626], [0xfacc15], [0x38bdf8], [0xf8fafc]];
        const posByColor = cols.map(() => []);
        const N = 18;
        for (let i = 0; i < N; i++) {
          const t0 = i / N, t1 = (i + 0.8) / N;
          const p = t => [(-1 + 2 * t) * PIER_HW, 4.8 - Math.sin(t * Math.PI) * 0.36, 0.30];
          const a = p(t0), b = p(t1), mid = p((t0 + t1) / 2);
          posByColor[i % 4].push(a[0], a[1], a[2], b[0], b[1], b[2], mid[0], mid[1] - 0.34, mid[2]);
        }
        posByColor.forEach((arr, i) => {
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3)); g.computeVertexNormals();
          pierGroup.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: cols[i][0], side: THREE.DoubleSide, roughness: 0.85 })));
        });
        const line = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 13 }, (_, i) => { const t = i / 12; return new THREE.Vector3((-1 + 2 * t) * PIER_HW, 4.8 - Math.sin(t * Math.PI) * 0.36, 0.30); })), 30, 0.012, 4, false), K.M(0x111827, 0.8));
        pierGroup.add(line);
        [-PIER_HW, PIER_HW].forEach(x => K.cyl(pierGroup, 0.05, 0.075, 3.4, K.darkWood, x, 3.25, 0.30, 6));
      }

      // ---- v3.6: benches facing the sea at the back of the boardwalk, and barrel and crate stacks at its ends ----
      const bench = (x, z) => {
        const b = new THREE.Group();
        for (let k = 0; k < 3; k++) K.box(b, 1.6, 0.05, 0.13, K.lightWood, 0, 0.46, -0.16 + k * 0.15);
        for (let k = 0; k < 2; k++) { const bk = K.box(b, 1.6, 0.12, 0.04, K.lightWood, 0, 0.66 + k * 0.17, 0.27); bk.rotation.x = -0.18; }
        [-0.68, 0.68].forEach(lx => {
          K.box(b, 0.07, 0.44, 0.07, K.iron, lx, 0.22, -0.18); K.box(b, 0.07, 0.95, 0.07, K.iron, lx, 0.47, 0.25);
          K.box(b, 0.07, 0.05, 0.5, K.iron, lx, 0.44, 0.03); K.box(b, 0.07, 0.04, 0.38, K.iron, lx, 0.64, -0.02);
        });
        b.position.set(x, deckY, z); pierGroup.add(b);
        Colliders.box('bench', x, z + 0.05, 0.82, 0.35, COL.WALK);
      };
      bench(-4.6, 5.25); bench(4.6, 5.25);
      const barrelStack = (x, z, seed) => {
        const st = new THREE.Group();
        [[0, 0, 0x7c4a1e], [0.42, 0.12, 0x92400e], [0.18, -0.34, 0x78350f]].forEach(([bx, bz, c], k) => {
          K.cyl(st, 0.2, 0.18, 0.52, K.M(c, 0.85, 0, { map: textures.wood }), bx, 0.26, bz, 12);
          [0.08, 0.44].forEach(y => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.195, 0.012, 4, 14), K.iron); r.rotation.x = Math.PI / 2; r.position.set(bx, y, bz); st.add(r); });
          K.cyl(st, 0.17, 0.17, 0.02, K.darkWood, bx, 0.53, bz, 12);
        });
        const cr = K.box(st, 0.46, 0.34, 0.4, K.lightWood, 0.12, 0.7, -0.05); cr.rotation.y = 0.4 + seed;
        st.position.set(x, deckY, z); st.rotation.y = seed; pierGroup.add(st);
        Colliders.circle('barrels', x + 0.15, z - 0.05, 0.66, COL.WALK);
      };
      barrelStack(BW_HALF - 0.85, 5.2, 0.3); barrelStack(-(BW_HALF - 0.75), 5.2, -0.5);

      // seagull builder: only the one hiding behind the tackle shop is placed (the secret-menu gull)
      const buildGull = yaw => {
        const g = new THREE.Group();
        const white = K.M(0xf8fafc, 0.7), grey = K.M(0x94a3b8, 0.7), orange = K.M(0xf59e0b, 0.5);
        const body = K.sph(g, 0.11, white, 0, 0.16, 0, 10, 8); body.scale.set(1, 0.85, 1.7);
        K.sph(g, 0.065, white, 0, 0.27, -0.14, 8, 6);
        const beak = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.08, 5), orange); beak.rotation.x = -Math.PI / 2; beak.position.set(0, 0.265, -0.22); g.add(beak);
        [-1, 1].forEach(s => {
          const wing = K.sph(g, 0.07, grey, s * 0.1, 0.18, 0.04, 8, 6); wing.scale.set(0.5, 0.35, 1.9);
          K.sph(g, 0.012, new THREE.MeshBasicMaterial({ color: 0x0b1020 }), s * 0.035, 0.285, -0.17, 5, 4);
          K.cyl(g, 0.006, 0.006, 0.1, orange, s * 0.03, 0.04, 0.0, 4);
        });
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 4), white); tail.rotation.x = Math.PI / 2 + 0.3; tail.position.set(0, 0.17, 0.2); g.add(tail);
        g.rotation.y = yaw; return g;
      };
      // the secret-menu seagull, perched on the end post of the boardwalk rail (west corner)
      cheatGull = buildGull(1.0); cheatGull.position.set(-(BW_HALF - 0.1), 2.62, 0.12); pierGroup.add(cheatGull);

      // distant lighthouse on a rock out at sea: lumpy rocks, a tapered banded tower with a door, windows and a
      // gallery rail, a framed lantern room with a dome, and a keeper's hut (the lantern height is unchanged)
      const lh = new THREE.Group();
      for (let i = 0; i < 6; i++) {
        const rock = WorldBuilder.buildRock(3 + (i % 3), i * 2.3, i % 2 ? 0x57534e : 0x78716c, 1);
        rock.position.set(Math.cos(i * 1.2) * 3.5, 0.2 + (i % 2) * 0.8, Math.sin(i * 1.2) * 3.0); rock.scale.set(1.2, 0.8, 1.0); lh.add(rock);
      }
      {
        // tower: one lathe, red and white bands baked into vertex colours
        const prof = [];
        for (let k = 0; k <= 16; k++) { const y = 3.2 + k * 0.8; prof.push(new THREE.Vector2(1.72 - k * 0.8 * 0.055, y)); }
        const tg = new THREE.LatheGeometry(prof, 20);
        const tp = tg.attributes.position, tc = new Float32Array(tp.count * 3), red = new THREE.Color(0xdc2626), wht = new THREE.Color(0xf8fafc);
        for (let k = 0; k < tp.count; k++) { const band = Math.floor((tp.getY(k) - 3.2 + 0.001) / 3.2); const c = band % 2 ? red : wht; tc.set([c.r, c.g, c.b], k * 3); }
        tg.setAttribute('color', new THREE.BufferAttribute(tc, 3));
        tg.computeVertexNormals();
        lh.add(new THREE.Mesh(tg, K.M(0xffffff, 0.6, 0, { vertexColors: true })));
        // stone base course, door with a step, windows up the tower
        K.cyl(lh, 1.85, 2.0, 0.8, K.M(0x78716c, 0.95), 0, 3.2, 0, 20);
        K.box(lh, 0.8, 1.5, 0.3, K.M(0x1e3a8a, 0.6), 0, 4.35, 1.65);
        K.box(lh, 1.1, 0.2, 0.6, K.M(0x78716c, 0.95), 0, 3.65, 1.85);
        [[7.0, 0.3], [10.4, 2.2], [13.6, -0.6]].forEach(([y, a]) => {
          const r = 1.72 - (y - 3.2) * 0.055;
          const wnd = K.box(lh, 0.45, 0.7, 0.12, K.M(0x0f172a, 0.3, 0, { emissive: new THREE.Color(0xfbbf24), emissiveIntensity: 0.25 }), Math.sin(a) * r, y, Math.cos(a) * r);
          wnd.rotation.y = a;
        });
      }
      const gallery = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.3, 20), K.M(0x1e293b, 0.5, 0.5)); gallery.position.y = 3.2 + 4 * 3.2 + 1.7; lh.add(gallery);
      // gallery railing: posts and two rings
      for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; K.cyl(lh, 0.03, 0.03, 0.7, K.M(0x1e293b, 0.5, 0.5), Math.cos(a) * 1.62, gallery.position.y + 0.5, Math.sin(a) * 1.62, 4); }
      [0.45, 0.85].forEach(dy => { const ring = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.03, 4, 24), K.M(0x1e293b, 0.5, 0.5)); ring.rotation.x = Math.PI / 2; ring.position.y = gallery.position.y + dy; lh.add(ring); });
      const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 1.6, 12), new THREE.MeshBasicMaterial({ color: 0xfef08a })); lantern.position.y = gallery.position.y + 1.0; lh.add(lantern);
      // lantern room frame: mullions, sill and cornice
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; K.box(lh, 0.08, 1.7, 0.08, K.M(0x111827, 0.5, 0.4), Math.cos(a) * 0.98, lantern.position.y, Math.sin(a) * 0.98); }
      K.cyl(lh, 1.08, 1.08, 0.12, K.M(0x111827, 0.5, 0.4), 0, lantern.position.y - 0.85, 0, 16);
      K.cyl(lh, 1.12, 1.12, 0.12, K.M(0x111827, 0.5, 0.4), 0, lantern.position.y + 0.85, 0, 16);
      const lroof = new THREE.Mesh(new THREE.SphereGeometry(1.15, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), K.M(0xdc2626, 0.6)); lroof.position.y = lantern.position.y + 0.9; lroof.scale.y = 0.8; lh.add(lroof);
      K.cyl(lh, 0.12, 0.18, 0.4, K.M(0x111827, 0.5, 0.4), 0, lantern.position.y + 1.95, 0, 8);
      K.sph(lh, 0.12, K.M(0x111827, 0.5, 0.4), 0, lantern.position.y + 2.2, 0, 8, 6);
      // keeper's hut on the rocks
      {
        const hut = new THREE.Group();
        K.box(hut, 3.0, 2.0, 2.4, K.M(0xf8fafc, 0.85), 0, 1.0, 0);
        const rf = K.box(hut, 3.3, 0.18, 1.6, K.M(0xb91c1c, 0.8), 0, 2.3, -0.55); rf.rotation.x = 0.55;
        const rb = K.box(hut, 3.3, 0.18, 1.6, K.M(0xb91c1c, 0.8), 0, 2.3, 0.55); rb.rotation.x = -0.55;
        K.box(hut, 0.7, 1.3, 0.08, K.M(0x1e3a8a, 0.6), 0.6, 0.65, 1.22);
        K.box(hut, 0.6, 0.55, 0.08, K.M(0x0f172a, 0.3, 0, { emissive: new THREE.Color(0xfbbf24), emissiveIntensity: 0.25 }), -0.7, 1.2, 1.22);
        hut.position.set(3.4, 2.4, 1.2); hut.rotation.y = -0.5; lh.add(hut);
      }
      lh.position.set(52, -0.6, -150);
      lh.scale.setScalar(1.6);
      scene.add(lh);

      // ---- the lighthouse jetty (see LH_J): deck, pilings, a rail on the sea side, bollards, fenders, ladder, lamp, sign ----
      {
        const JK = this.propKit(textures), jg = new THREE.Group(), L = LH_J.len, stone = JK.M(0x78716c, 0.95);
        for (let i = -2; i <= 2; i++) JK.box(jg, L, 0.1, 0.32, JK.lightWood, -L / 2, -0.05, i * 0.34);                 // planks
        [-0.62, 0.62].forEach(z => JK.box(jg, L, 0.16, 0.16, JK.darkWood, -L / 2, -0.2, z));                             // stringers
        for (let x = -0.4; x > -L; x -= 1.6) JK.box(jg, 0.14, 0.14, 1.9, JK.darkWood, x, -0.3, 0);                      // joists
        [-0.9, -3.3, -5.7, -8.1, -9.4].forEach(x => [-0.8, 0.8].forEach(z => {
          JK.cyl(jg, 0.14, 0.17, 3.8, JK.darkWood, x, -1.4, z, 8);                                                       // piling down to the seabed
          JK.box(jg, 0.36, 0.08, 0.36, JK.iron, x, 0.5, z);                                                              // cap
        }));
        // rail along the north (open sea) side, two bars; the tip and the south side stay open
        [-0.9, -3.3, -5.7, -8.1].forEach(x => JK.cyl(jg, 0.05, 0.05, 1.0, JK.darkWood, x, 0.5, -0.8, 6));
        [0.55, 1.0].forEach(y => JK.box(jg, L - 1.0, 0.06, 0.06, JK.lightWood, -(L - 1.0) / 2 - 0.45, y, -0.8));
        // bollards and fenders on the berth side
        [-2.2, -6.8].forEach(x => { JK.cyl(jg, 0.08, 0.11, 0.34, JK.iron, x, 0.17, 0.72, 8); JK.sph(jg, 0.11, JK.iron, x, 0.37, 0.72, 8, 6); });
        [-1.5, -4.5, -7.5].forEach(x => { const t = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.075, 6, 12), JK.M(0x111827, 0.9)); t.position.set(x, -0.3, 0.9); jg.add(t); });
        // ladder down to the water at the tip
        [-0.12, 0.12].forEach(z => JK.box(jg, 0.05, 1.9, 0.05, JK.iron, -9.2, -0.75, 0.78 + z));
        for (let k = 0; k < 6; k++) JK.box(jg, 0.04, 0.04, 0.3, JK.iron, -9.2, -0.2 - k * 0.3, 0.78);
        // stone landing and steps at the rock end, with two boulders blending it in
        JK.box(jg, 1.7, 0.6, 2.2, stone, 0.85, -0.3, 0); JK.box(jg, 0.5, 0.25, 1.4, stone, 1.9, -0.1, 0); JK.box(jg, 0.5, 0.5, 1.2, stone, 2.3, 0.0, 0);
        [[1.4, -0.5, 1.15, 0x57534e, 1.3], [1.6, -0.6, -1.1, 0x78716c, 1.1]].forEach(([x, y, z, c, r], i) => { const rk = WorldBuilder.buildRock(r, 5 + i, c, 1); rk.position.set(x, y, z); jg.add(rk); });
        // lamp post (emissive lantern), a hanging ring buoy, a barrel and a crate
        JK.cyl(jg, 0.05, 0.07, 2.5, JK.iron, -0.9, 1.25, -0.8, 6);
        JK.box(jg, 0.3, 0.34, 0.3, JK.M(0xfacc15, 0.3, 0.4, { emissive: new THREE.Color(0xf59e0b), emissiveIntensity: 0.8 }), -0.9, 2.6, -0.8);
        JK.box(jg, 0.4, 0.06, 0.4, JK.iron, -0.9, 2.82, -0.8);
        { const rb = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.07, 6, 14), JK.M(0xdc2626, 0.7)); rb.position.set(-5.0, 0.55, -0.88); jg.add(rb); }
        JK.cyl(jg, 0.24, 0.21, 0.55, JK.M(0x7c4a1e, 0.85, 0, { map: textures.wood }), -1.7, 0.27, -0.5, 10);
        JK.box(jg, 0.5, 0.4, 0.5, JK.lightWood, -2.5, 0.2, -0.45);
        // sign facing the open sea to the south
        [-0.55, 0.55].forEach(x => JK.cyl(jg, 0.05, 0.05, 1.6, JK.darkWood, 0.9 + x, 1.0, -1.15, 6));
        JK.box(jg, 1.4, 0.4, 0.06, new THREE.MeshBasicMaterial({ map: PixelTextureFactory.makeSignTexture('⚓ LIGHTHOUSE PIER', 320, 80) }), 0.9, 1.5, -1.15);
        jg.position.set(LH_J.x, LH_J.y, LH_J.z);
        scene.add(jg); ModelKit.mergeStatic(jg, []);
      }

      // ---- Rotating beacon: two long beams that sweep round, plus a flare that is visible from any distance ----
      const beaconPivot = new THREE.Group();
      beaconPivot.position.y = lantern.position.y;
      lh.add(beaconPivot);
      const beamLen = 90, beamMat = new THREE.MeshBasicMaterial({
        color: 0xffffff, vertexColors: true, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending,
        depthWrite: false, side: THREE.DoubleSide, fog: false
      });
      const beamGeo = new THREE.CylinderGeometry(0.12, 4.4, beamLen, 14, 1, true);
      beamGeo.translate(0, beamLen / 2, 0); beamGeo.rotateZ(-Math.PI / 2); // along +X, narrow end at the lantern
      {
        const pos = beamGeo.attributes.position, col = new Float32Array(pos.count * 3);
        for (let i = 0; i < pos.count; i++) {
          const f = Math.max(0, 1 - pos.getX(i) / beamLen); // bright at the lantern, fading out along the beam
          col[i * 3] = 1.0 * f; col[i * 3 + 1] = 0.95 * f; col[i * 3 + 2] = 0.8 * f;
        }
        beamGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      }
      const beamA = new THREE.Mesh(beamGeo, beamMat), beamB = new THREE.Mesh(beamGeo, beamMat);
      beamB.rotation.y = Math.PI;
      beaconPivot.add(beamA, beamB);
      const flareTex = (() => {
        const c = document.createElement('canvas'); c.width = c.height = 64;
        const g2 = c.getContext('2d'), gr = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
        gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.18, 'rgba(255,244,200,0.85)'); gr.addColorStop(0.5, 'rgba(255,220,140,0.25)'); gr.addColorStop(1, 'rgba(255,200,100,0)');
        g2.fillStyle = gr; g2.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
      })();
      const flare = new THREE.Sprite(new THREE.SpriteMaterial({
        map: flareTex, color: 0xfff3d0, transparent: true, blending: THREE.AdditiveBlending,
        depthWrite: false, fog: false, sizeAttenuation: false, opacity: 0
      }));
      flare.renderOrder = 10; flare.frustumCulled = false;
      scene.add(flare);
      const lanternWorld = new THREE.Vector3(0, lantern.position.y, 0).multiplyScalar(lh.scale.x).add(lh.position);
      const toCam = new THREE.Vector3();
      lighthouseBeacon = {
        flare,
        // The flare sits on the line from the camera to the lantern, never further than 600 m away, with a fixed
        // size on screen: it looks identical to a light at the real spot but is never clipped or fogged at 2000 m.
        update(elapsed, cam, night) {
          const a = elapsed * 0.7;
          beaconPivot.rotation.y = a;
          toCam.copy(cam.position).sub(lanternWorld);
          const dist = toCam.length();
          if (dist < 6) { flare.visible = false; return; }
          flare.visible = true;
          toCam.multiplyScalar(1 / dist);
          const horiz = Math.max(1e-4, Math.hypot(toCam.x, toCam.z));
          const align = Math.abs((Math.cos(a) * toCam.x - Math.sin(a) * toCam.z) / horiz); // beams point along +-(cos a, -sin a)
          const pulse = Math.pow(align, 40);
          const r = Math.min(dist - 2, 600);
          flare.position.copy(cam.position).addScaledVector(toCam, -r);
          const base = 0.4 + 0.4 * night;
          const sz = 0.03 + 0.02 * night + pulse * (0.1 + 0.06 * night);
          flare.scale.set(sz, sz, 1);
          flare.material.opacity = Math.min(1, base * 0.55 + pulse * 0.7);
          beamMat.opacity = 0.08 + 0.18 * night;
        }
      };
    }

    // Bake the static pier (deck, rails, pilings, stands, props) into a few merged meshes. The aquarium's water and fish
    // (they change), the bounty papers, the cabin's fading front and roof and the secret seagull stay separate.
    ModelKit.mergeStatic(pierGroup, [aquarium, cheatGull, bountyBoard.userData.papers, cabin.userData.front, cabin.userData.roof], { bakeColor: true });
    scene.add(pierGroup);

    const oceanGeo = new THREE.PlaneGeometry(900, 950, 84, 88);
    oceanGeo.rotateX(-Math.PI / 2);

    const waveUniforms = {
      uTime: { value: 0 },
      uWaveAmp: { value: 0.18 },
      uWaveFreq: { value: 1.6 },
      uCenterZ: { value: -340.0 }
    };

    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x3b8ea5,
      map: textures.water,
      roughness: 0.38,
      metalness: 0.12,
      flatShading: true
    });

    oceanMat.onBeforeCompile = shader => {
      shader.uniforms.uTime = waveUniforms.uTime;
      shader.uniforms.uWaveAmp = waveUniforms.uWaveAmp;
      shader.uniforms.uWaveFreq = waveUniforms.uWaveFreq;
      shader.uniforms.uCenterZ = waveUniforms.uCenterZ;

      shader.vertexShader = `
              uniform float uTime;
              uniform float uWaveAmp;
              uniform float uWaveFreq;
              uniform float uCenterZ;
              ${shader.vertexShader}
            `.replace(
        '#include <begin_vertex>',
        `
              #include <begin_vertex>
              float worldZ = transformed.z + uCenterZ;
              transformed.y += sin(transformed.x * 0.14 + uTime * uWaveFreq * 1.4) * uWaveAmp * 0.55
                             + cos(worldZ * 0.11 + uTime * uWaveFreq * 1.1) * uWaveAmp * 0.45;
              `
      );
    };

    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    oceanMesh.position.set(0, 0, -340);
    scene.add(oceanMesh);

    const buoys = [];
    const buoySpecs = [
      { z: -118, color: 0x22c55e },
      { z: -318, color: 0xf59e0b },
      { z: -668, color: 0xef4444 },
      { z: -1518, color: 0xa855f7 }
    ];
    buoySpecs.forEach(spec => {
      [-14, 14].forEach((bx, sideIdx) => {
        const bGroup = new THREE.Group();
        const floatBase = new THREE.Mesh(
          new THREE.SphereGeometry(0.95, 10, 8),
          new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.4, flatShading: true })
        );
        floatBase.scale.y = 0.72;
        const collar = new THREE.Mesh(
          new THREE.TorusGeometry(0.88, 0.12, 6, 12),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, flatShading: true })
        );
        collar.rotation.x = Math.PI / 2;
        collar.position.y = 0.18;
        const tower = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.52, 2.0, 6),
          new THREE.MeshStandardMaterial({ color: 0xf8fafc, flatShading: true })
        );
        tower.position.y = 1.25;
        const lampHousing = new THREE.Mesh(
          new THREE.CylinderGeometry(0.28, 0.28, 0.16, 8),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, flatShading: true })
        );
        lampHousing.position.y = 2.3;
        const beaconMat = new THREE.MeshBasicMaterial({ color: spec.color });
        const beacon = new THREE.Mesh(
          new THREE.SphereGeometry(0.26, 8, 8),
          beaconMat
        );
        beacon.position.y = 2.52;
        const haloMat = new THREE.MeshBasicMaterial({
          color: spec.color,
          transparent: true,
          opacity: 0.35,
          depthWrite: false
        });
        const halo = new THREE.Mesh(new THREE.SphereGeometry(0.58, 10, 10), haloMat);
        halo.position.y = 2.52;
        const beaconLight = new THREE.PointLight(spec.color, 4.5, 34, 1.4);
        beaconLight.position.y = 2.65;
        bGroup.add(floatBase, collar, tower, lampHousing, beacon, halo, beaconLight);
        // lattice day-mark: four legs, two hoops, a top deck, a radar reflector, a number board and a solar panel
        {
          const legMat = new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.5, flatShading: true });
          const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, flatShading: true });
          tower.scale.set(0.55, 1, 0.55);
          for (let k = 0; k < 4; k++) {
            const a2 = k / 4 * Math.PI * 2 + Math.PI / 4;
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.1, 5), legMat);
            leg.position.set(Math.cos(a2) * 0.42, 1.25, Math.sin(a2) * 0.42); leg.rotation.set(Math.sin(a2) * -0.16, 0, Math.cos(a2) * 0.16);
            bGroup.add(leg);
          }
          [0.75, 1.65].forEach((y, k) => { const hp = new THREE.Mesh(new THREE.TorusGeometry(0.5 - k * 0.12, 0.035, 4, 12), darkMat); hp.rotation.x = Math.PI / 2; hp.position.y = y; bGroup.add(hp); });
          const deck = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 10), darkMat); deck.position.y = 2.2; bGroup.add(deck);
          const refl = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.3, flatShading: true })); refl.position.y = 2.95; bGroup.add(refl);
          const board = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.04), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 })); board.position.set(0, 1.2, 0.5); bGroup.add(board);
          const panel = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.3), new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.4, roughness: 0.3 })); panel.position.set(0, 2.25, -0.3); panel.rotation.x = 0.5; bGroup.add(panel);
        }
        bGroup.position.set(bx, 0, spec.z);
        bGroup.userData = { beacon, halo, beaconLight, baseIntensity: 4.5, phase: sideIdx * 1.4 };
        scene.add(bGroup); ModelKit.mergeSafe(bGroup, [beacon, halo]);
        buoys.push(bGroup);
      });
    });

    // Solid objects on the sea for boat collision, as circles {x, z, r}.
    // Keep the lighthouse numbers in sync with the lighthouse built above (position 52,-150, scale 1.6).
    {
      const LH = { x: 52, z: -150, s: 1.6 };
      const SEA = COL.BOAT | COL.DIVE;
      for (let i = 0; i < 6; i++) {
        const rad = 3 + (i % 3);
        Colliders.circle('rocks', LH.x + Math.cos(i * 1.2) * 3.5 * LH.s, LH.z + Math.sin(i * 1.2) * 3.0 * LH.s, rad * LH.s * 1.05, SEA);
      }
      Colliders.circle('lighthouse', LH.x, LH.z, 1.8 * LH.s, SEA);
      // the jetty deck (above the water: hulls only) and its pilings
      Colliders.box('lighthouse jetty', LH_J.x - LH_J.len / 2, LH_J.z, LH_J.len / 2 + 0.1, LH_J.hw + 0.1, COL.BOAT);
      [-0.9, -3.3, -5.7, -8.1, -9.4].forEach(dx => [-0.8, 0.8].forEach(dz => Colliders.circle('pier', LH_J.x + dx, LH_J.z + dz, 0.2, SEA)));
      // buoys float: solid for hulls, and for a diver only near the surface
      buoys.forEach(b => Colliders.circle('buoy', b.position.x, b.position.z, 1.0, SEA, -2.5, 3));
      // Pier and boardwalk pilings plus the two mooring pilings (same list as the pilings built above)
      [[-10.4, 0.0], [-5.2, 0.0], [5.2, 0.0], [10.4, 0.0], [-15.7, 0.0], [15.7, 0.0], [-(BW_HALF - 0.1), 0.0], [BW_HALF - 0.1, 0.0], [-5.95 - PIER_DX, -8.6], [-PIER_PILE, -3.2], [PIER_PILE, -3.2], [-PIER_PILE, -9.8], [PIER_PILE, -9.8], [-5.95 - PIER_DX, -4.6], [-5.95 - PIER_DX, -6.6], [-PIER_PILE, -11.25], [PIER_PILE, -11.25]]
        .forEach(([x, z]) => Colliders.circle('pier', x, z, 0.3, SEA));
      // Solid rectangles for hulls: pier deck, boardwalk, stairs + mooring platform (all above the water, so not for divers)
      Colliders.box('pier', 0, -5.7, PIER_HW + 0.3, 5.8, COL.BOAT);
      Colliders.box('pier', 0, 3.95, BW_HALF + 0.2, 4.05, COL.BOAT);
      Colliders.box('pier', -4.3 - PIER_DX, (-4.25 + PLATFORM.zEnd) / 2, 1.8, (-4.25 - PLATFORM.zEnd) / 2 + 0.1, COL.BOAT);
    }
    const seaObstacles = Colliders.of(COL.BOAT).filter(c => c.kind === 'circle');
    const boatRects = Colliders.of(COL.BOAT).filter(c => c.kind === 'box').map(c => ({ name: c.name, x1: c.x - c.hx, z1: c.z - c.hz, x2: c.x + c.hx, z2: c.z + c.hz }));
    // The island: the beach reaches the waterline (y = 0) near z = 1.8; everything beyond is land
    const shoreZ = x => 6.2 * Math.max(0, (0.6 - Math.sin(x * 0.05) * 0.35 * 0.35) / 2.08);

    // Celestial Sun, Phased Moon, Starfield & Pier Harbor Lantern
    const skyGroup = new THREE.Group();
    const sunOrb = new THREE.Mesh(
      new THREE.SphereGeometry(9, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xfef08a, fog: false })
    );
    const moonGroup = new THREE.Group();
    const moonLit = new THREE.Mesh(
      new THREE.SphereGeometry(8.2, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xf8fafc, fog: false })
    );
    const moonShadow = new THREE.Mesh(
      new THREE.SphereGeometry(8.35, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x091124, fog: false })
    );
    moonShadow.position.set(4.5, 0, 1.2);
    const moonHalo = new THREE.Mesh(
      new THREE.SphereGeometry(12.5, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.16, depthWrite: false, fog: false })
    );
    moonGroup.add(moonLit, moonShadow, moonHalo);
    skyGroup.add(sunOrb, moonGroup);

    const starCount = 260;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.46;
      const r = 420;
      starPos[i * 3] = Math.cos(theta) * Math.sin(phi) * r;
      starPos[i * 3 + 1] = Math.cos(phi) * r + 25;
      starPos[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * r - 180;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xf8fafc, size: 2.2, transparent: true, opacity: 0, fog: false });
    const starField = new THREE.Points(starGeo, starMat);
    skyGroup.add(starField);
    scene.add(skyGroup);

    // Nautical Pier Harbor Lamp Posts (Front Corner + Two at the Rear Pier Entrance)
    const lanternLights = [];
    const standGlows = [];
    const realLights = settings.quality !== 'low';
    // soft additive light pool laid on the deck under each light, so a lit stand reads even where the real lights are few
    const glowTex = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const g2 = c.getContext('2d'), gr = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.4, 'rgba(255,255,255,0.3)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g2.fillStyle = gr; g2.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();
    const addPool = (x, y, z, radius, color, k = 1) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2),
        new THREE.MeshBasicMaterial({ map: glowTex, color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.position.set(x, y + 0.03, z); m.renderOrder = 2;
      scene.add(m); standGlows.push({ mat: m.material, k });
    };
    const addLight = (x, y, z, color, range, k) => {
      const l = new THREE.PointLight(color, 0, range, 1.6);
      l.position.set(x, y, z); l.userData.k = k;
      scene.add(l); lanternLights.push(l);
    };
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.32, flatShading: true });
    const buildHarborLamp = (lx, ly, lz, withLight = true) => {
      Colliders.circle('lamp post', lx, lz, 0.22, COL.WALK);
      const lamp = new THREE.Group();
      lamp.position.set(lx, ly, lz);
      const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.26, 0.24, 8), ironMat);
      lampBase.position.y = 0.12;
      const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.085, 1.55, 8), ironMat);
      lampPole.position.y = 0.98;
      const lampCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.10, 0.12, 6), ironMat);
      lampCollar.position.y = 1.78;
      const lampGlass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.20, 0.15, 0.34, 6),
        new THREE.MeshBasicMaterial({ color: LIGHT_TUNING.lampGlass })
      );
      lampGlass.position.y = 2.00;
      const lampCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 8, 8),
        new THREE.MeshBasicMaterial({ color: LIGHT_TUNING.lampCore })
      );
      lampCore.position.y = 2.00;
      const lampRoof = new THREE.Mesh(new THREE.ConeGeometry(0.27, 0.22, 6), ironMat);
      lampRoof.position.y = 2.27;
      const lampFinial = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), ironMat);
      lampFinial.position.y = 2.40;
      for (let c = 0; c < 6; c++) {
        const ang = (c / 6) * Math.PI * 2;
        const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.35, 4), ironMat);
        rib.position.set(Math.cos(ang) * 0.18, 2.00, Math.sin(ang) * 0.18);
        rib.rotation.z = -Math.cos(ang) * 0.14;
        rib.rotation.x = Math.sin(ang) * 0.14;
        lamp.add(rib);
      }
      lamp.add(lampBase, lampPole, lampCollar, lampGlass, lampCore, lampRoof, lampFinial);
      scene.add(lamp); ModelKit.mergeSafe(lamp);

      addPool(lx, ly, lz, 2.3, LIGHT_TUNING.lamp.pool, 0.8);
      if (withLight) addLight(lx, ly + 2.0, lz, LIGHT_TUNING.lamp.color, 14, LIGHT_TUNING.lamp.k);
    };

    // Pier lamp posts stand on the rail line, in pairs: near the entrance, flanking the bucket and toolbox, and at the tip.
    // (only three carry a real light, the pools of the others fill in)
    buildHarborLamp(-PIER_HW, 1.55, -2.2, true);
    buildHarborLamp(PIER_HW, 1.55, -2.2, false);
    buildHarborLamp(-PIER_HW, 1.55, -8.0, false);
    buildHarborLamp(PIER_HW, 1.55, -8.0, true);
    buildHarborLamp(-2.3, 1.55, -11.1, true);
    buildHarborLamp(2.3, 1.55, -11.1, false);

    // ---- Every stand gets its own light ----
    const bulbMat = c => new THREE.MeshBasicMaterial({ color: c });
    // Tackle shop (-7.6, 1.0): warm bulbs strung under the awning valance
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), bulbMat(LIGHT_TUNING.bulbs[i % 2]));
      b.position.set(-7.6 - 1.15 + t * 2.3, 1.56 + 2.12 - Math.sin(t * Math.PI) * 0.14, 1.0 + 1.14);
      scene.add(b);
    }
    if (realLights) addLight(-7.6, 1.56 + 2.2, 1.0 + 1.5, LIGHT_TUNING.shop.color, 10, LIGHT_TUNING.shop.k);
    addPool(-7.6, 1.56, 1.0 + 1.7, 2.9, LIGHT_TUNING.shop.pool, 1);
    // Bounty board (-4.2, 0.8): a gooseneck lamp over the notices
    {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.55), ironMat); arm.position.set(-4.2, 1.56 + 2.5, 0.8 + 0.28); scene.add(arm);
      const hood = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.12, 8), ironMat); hood.position.set(-4.2, 1.56 + 2.5, 0.8 + 0.55); scene.add(hood);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), bulbMat(LIGHT_TUNING.bulbs[0])); bulb.position.set(-4.2, 1.56 + 2.42, 0.8 + 0.55); scene.add(bulb);
      if (realLights) addLight(-4.2, 1.56 + 2.35, 0.8 + 0.9, LIGHT_TUNING.bounty.color, 7.5, LIGHT_TUNING.bounty.k);
      addPool(-4.2, 1.56, 0.8 + 1.0, 2.1, LIGHT_TUNING.bounty.pool, 0.9);
    }
    // Cabin: a warm lamp in the middle, a teal light on the bottle gallery, a cool glow at the aquarium
    if (realLights) addLight(CABIN.x, 1.56 + 2.1, 1.8, LIGHT_TUNING.shop.color, 9, LIGHT_TUNING.shop.k);
    if (realLights) addLight(CABIN.galleryX, 1.56 + 2.0, 0.8 + 0.9, LIGHT_TUNING.gallery.color, 6.5, LIGHT_TUNING.gallery.k);
    addPool(CABIN.galleryX, 1.56, 0.8 + 1.2, 2.4, LIGHT_TUNING.gallery.pool, 0.9);
    if (realLights) addLight(CABIN.aquaX, 1.56 + 2.0, 1.4, 0x7dd3fc, 6, LIGHT_TUNING.trophy.k);
    addPool(CABIN.aquaX, 1.56, 1.7, 2.4, LIGHT_TUNING.trophy.pool, 0.8);
    addPool(CABIN.x, 1.56, 2.0, 2.6, LIGHT_TUNING.shop.pool, 0.8);
    // Recycling stand: a lamp post by the skips
    buildHarborLamp(RECYCLE.x - RECYCLE.w / 2 - 0.4, 1.56, 1.7, realLights);
    addPool(RECYCLE.x, 1.56, 1.8, 2.8, LIGHT_TUNING.shop.pool, 0.8);
    // Boat terminal: a small kiosk on the mooring platform's corner (screen faces the platform, +Z)
    {
      const T = BOAT_TERMINAL, kiosk = new THREE.Group();
      const steelM = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });
      const trimM = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.3, roughness: 0.4 });
      const base = new THREE.Mesh(ModelKit.roundedBox(0.42, 0.08, 0.32, 0.02), steelM); base.position.y = 0.04;
      const post = new THREE.Mesh(ModelKit.roundedBox(0.2, 0.86, 0.16, 0.03), steelM); post.position.y = 0.5;
      const head = new THREE.Group(); head.position.set(0, 1.0, 0.02); head.rotation.x = -0.55;
      const housing = new THREE.Mesh(ModelKit.roundedBox(0.5, 0.38, 0.08, 0.025), steelM);
      const sc = document.createElement('canvas'); sc.width = 128; sc.height = 96;
      const g = sc.getContext('2d');
      g.fillStyle = '#04223a'; g.fillRect(0, 0, 128, 96);
      g.fillStyle = '#38bdf8'; g.font = 'bold 18px "Courier New", monospace'; g.textAlign = 'center'; g.fillText('BOATS', 64, 24);
      g.fillStyle = '#e0f2fe'; g.beginPath(); g.moveTo(26, 58); g.lineTo(102, 58); g.lineTo(90, 72); g.lineTo(38, 72); g.closePath(); g.fill();
      g.fillRect(56, 44, 20, 14); g.fillStyle = '#0ea5e9'; g.fillRect(60, 47, 12, 6);
      g.strokeStyle = '#38bdf8'; g.lineWidth = 2; g.beginPath(); for (let x = 8; x <= 120; x += 4) g.lineTo(x, 80 + Math.sin(x * 0.2) * 3); g.stroke();
      const tex = new THREE.CanvasTexture(sc); tex.colorSpace = THREE.SRGBColorSpace;
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.3), new THREE.MeshBasicMaterial({ map: tex }));
      screen.position.z = 0.042;
      const brim = new THREE.Mesh(ModelKit.roundedBox(0.54, 0.04, 0.16, 0.015), trimM); brim.position.set(0, 0.2, 0.05);
      head.add(housing, screen, brim);
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), new THREE.MeshBasicMaterial({ color: 0x38bdf8 })); beacon.position.y = 1.3;
      kiosk.add(base, post, head, beacon);
      kiosk.position.set(T.x, 0.71, T.z);
      kiosk.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      scene.add(kiosk);
      Colliders.box('boat terminal', T.x, T.z, 0.24, 0.18, COL.WALK);
    }
    // Dock fuel pump at the platform's outer sea-end corner, right by the moored boat (screen faces the platform)
    {
      const P = DOCK_PUMP, pump = new THREE.Group();
      const red = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 }), white = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
      const blk = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.6 });
      const body = new THREE.Mesh(ModelKit.roundedBox(0.46, 1.15, 0.36, 0.04), red); body.position.y = 0.58;
      const cap = new THREE.Mesh(ModelKit.roundedBox(0.52, 0.12, 0.42, 0.03), white); cap.position.y = 1.2;
      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), new THREE.MeshStandardMaterial({ color: 0xfef3c7, emissive: new THREE.Color(0xfacc15), emissiveIntensity: 0.6, roughness: 0.3 })); globe.position.y = 1.4;
      const sc = document.createElement('canvas'); sc.width = 64; sc.height = 48; const g = sc.getContext('2d');
      g.fillStyle = '#052e16'; g.fillRect(0, 0, 64, 48); g.fillStyle = '#4ade80'; g.font = 'bold 13px monospace'; g.textAlign = 'center'; g.fillText('FUEL', 32, 18); g.fillText('$0.50', 32, 38);
      const tex = new THREE.CanvasTexture(sc); tex.colorSpace = THREE.SRGBColorSpace;
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.24), new THREE.MeshBasicMaterial({ map: tex })); screen.position.set(0, 0.86, 0.185);
      const nozzle = new THREE.Mesh(ModelKit.roundedBox(0.08, 0.22, 0.1, 0.02), blk); nozzle.position.set(0.27, 0.74, 0.08);
      const hose = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 6, 16, Math.PI * 1.4), blk); hose.position.set(0.25, 0.48, 0.1); hose.rotation.set(0, Math.PI / 2, -0.4);
      const base = new THREE.Mesh(ModelKit.roundedBox(0.62, 0.06, 0.52, 0.02), new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 })); base.position.y = 0.03;
      pump.add(base, body, cap, globe, screen, nozzle, hose);
      pump.position.set(P.x, 0.71, P.z); pump.rotation.y = 0.6;
      pump.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      scene.add(pump);
      Colliders.box('fuel pump', P.x, P.z, 0.4, 0.34, COL.WALK);   // covers the hose loop too
    }
    // Terrace shops: a warm light over each counter
    Object.values(SHORE_SHOPS).forEach(sh => {
      const fz = sh.z + sh.d / 2;
      if (realLights) addLight(sh.x, 1.56 + 2.5, fz + 1.0, LIGHT_TUNING.shop.color, 9, LIGHT_TUNING.shop.k);
      addPool(sh.x, 1.56, fz + 1.2, 2.6, LIGHT_TUNING.shop.pool, 0.9);
    });
    // Mooring platform: lantern on the piling
    {
      const glass = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), bulbMat(LIGHT_TUNING.bulbs[1])); glass.position.set(-5.95 - PIER_DX, 2.3, -4.6); scene.add(glass);
      const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.3, 6, 1, true), ironMat); cage.position.set(-5.95 - PIER_DX, 2.3, -4.6); scene.add(cage);
      if (realLights) addLight(-5.95 - PIER_DX, 2.35, -4.6, LIGHT_TUNING.mooring.color, 8, LIGHT_TUNING.mooring.k);
      addPool(-5.0 - PIER_DX, 0.66, -5.6, 2.2, LIGHT_TUNING.mooring.pool, 0.8);
    }

    // Articulated Fisherman Character with Wader Overalls, Rain Slicker & Sou'wester Hat
    // The angler (v4): a skeleton with a skinned body, dressed from the save by dressAngler()
    const anglerGroup = new THREE.Group();
    const anglerRig = AnglerFactory.createRig();
    anglerGroup.add(anglerRig.root);
    const bodyGroup = anglerRig.hips, headGroup = anglerRig.headGroup, chest = anglerRig.chest;
    const leftArm = anglerRig.L.upper, rightArm = anglerRig.R.upper, leftLeg = anglerRig.L.thigh, rightLeg = anglerRig.R.thigh;
    const waderHips = null, waderMat = null, stripeMat = null, maleFacialGroup = new THREE.Group(), femaleHairGroup = new THREE.Group();

    // Folding Aluminum & Canvas Fisherman's Chair (Unfolds & appears only at the pier fishing edge)
    const chairGroup = new THREE.Group();
    chairGroup.position.set(0, 0, 0.14);
    chairGroup.visible = false;

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.72, roughness: 0.3, flatShading: true });
    const footCapMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8, flatShading: true });
    const chairCanvasMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.78, side: THREE.DoubleSide, flatShading: true });
    const chairTrimMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.6, flatShading: true });

    const chairFrontLegPivot = new THREE.Group();
    chairFrontLegPivot.position.set(0, 0.23, 0);
    [-0.24, 0.24].forEach(lx => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.56, 6), frameMat);
      leg.position.set(lx, 0, 0);
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.028, 0.04, 6), footCapMat);
      foot.position.set(lx, -0.27, 0);
      chairFrontLegPivot.add(leg, foot);
    });
    const frontCrossBar = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.48, 6), frameMat);
    frontCrossBar.rotation.z = Math.PI / 2;
    frontCrossBar.position.set(0, -0.10, 0);
    chairFrontLegPivot.add(frontCrossBar);

    const chairBackLegPivot = new THREE.Group();
    chairBackLegPivot.position.set(0, 0.23, 0);
    [-0.22, 0.22].forEach(lx => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.58, 6), frameMat);
      leg.position.set(lx, 0.01, 0);
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.028, 0.04, 6), footCapMat);
      foot.position.set(lx, -0.27, 0);
      chairBackLegPivot.add(leg, foot);
    });

    // Hinged Folding Backrest & Fabric Armrests with Cup Holder
    const chairBackrestPivot = new THREE.Group();
    chairBackrestPivot.position.set(0, 0.44, 0.14);
    [-0.23, 0.23].forEach(lx => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.48, 6), frameMat);
      post.position.set(lx, 0.24, 0);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), footCapMat);
      cap.position.set(lx, 0.48, 0);
      chairBackrestPivot.add(post, cap);
    });
    const backrestCloth = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.24, 0.035), chairCanvasMat);
    backrestCloth.position.set(0, 0.34, 0.01);
    const backrestStripe = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.045, 0.04), chairTrimMat);
    backrestStripe.position.set(0, 0.34, 0.01);
    chairBackrestPivot.add(backrestCloth, backrestStripe);

    [-0.24, 0.24].forEach(ax => {
      const armStrap = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.025, 0.36), chairCanvasMat);
      armStrap.position.set(ax, 0.20, -0.17);
      const armFrontSupport = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.20, 6), frameMat);
      armFrontSupport.position.set(ax, 0.10, -0.33);
      chairBackrestPivot.add(armStrap, armFrontSupport);
    });

    // Mesh Cup Holder on Right Armrest
    const cupHolder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.038, 0.07, 8, 1, true),
      footCapMat
    );
    cupHolder.position.set(0.28, 0.17, -0.26);
    chairBackrestPivot.add(cupHolder);

    const chairSeatPivot = new THREE.Group();
    chairSeatPivot.position.set(0, 0.44, 0.10);
    const seatCloth = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.04, 0.40), chairCanvasMat);
    seatCloth.position.set(0, 0, -0.19);
    const seatFrontTrim = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.045, 0.04), chairTrimMat);
    seatFrontTrim.position.set(0, 0, -0.38);
    const seatBar = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.48, 6), frameMat);
    seatBar.rotation.z = Math.PI / 2;
    seatBar.position.set(0, -0.01, -0.38);
    chairSeatPivot.add(seatCloth, seatFrontTrim, seatBar);

    chairGroup.add(chairFrontLegPivot, chairBackLegPivot, chairBackrestPivot, chairSeatPivot);
    anglerGroup.add(chairGroup);

    const rodPivot = new THREE.Group();
    rodPivot.position.set(0.24, 0.74, -0.28);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xd97706, flatShading: true });
    const rodSegments = [];
    const segRadii = [
      [0.036, 0.045],
      [0.028, 0.036],
      [0.020, 0.028],
      [0.012, 0.020]
    ];
    let parentJoint = rodPivot;
    for (let s = 0; s < 4; s++) {
      const joint = new THREE.Group();
      if (s === 0) {
        joint.rotation.x = -0.65;
      } else {
        joint.position.set(0, 0.58, 0);
      }
      const segMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(segRadii[s][0], segRadii[s][1], 0.58, 7),
        rodMat
      );
      segMesh.position.y = 0.29;
      joint.add(segMesh);
      parentJoint.add(joint);
      rodSegments.push(joint);
      parentJoint = joint;
    }

    // Rod details: cork grip, spinning reel, line guides and a tip cap (attached to the animated joints)
    {
      const cork = new THREE.MeshStandardMaterial({ color: 0xc9a26b, roughness: 0.95 });
      const steelM = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.3 });
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.056, 0.34, 10), cork); grip.position.y = 0.0; rodSegments[0].add(grip);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.056, 8, 6), new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.8 })); cap.position.y = -0.17; rodSegments[0].add(cap);
      const reelBody = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.07, 12), steelM); reelBody.rotation.z = Math.PI / 2; reelBody.position.set(0.1, 0.24, 0); rodSegments[0].add(reelBody);
      const spool = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 12), new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4, metalness: 0.3 })); spool.rotation.z = Math.PI / 2; spool.position.set(0.15, 0.24, 0); rodSegments[0].add(spool);
      const crank = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.09, 4), steelM); crank.position.set(-0.02, 0.24, 0.05); crank.rotation.x = 0.0; rodSegments[0].add(crank);
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.03), steelM); stand.position.set(0.06, 0.17, 0); rodSegments[0].add(stand);
      [0.28, 0.1].forEach((y, i) => rodSegments.slice(1).forEach((j, k) => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.02 - k * 0.003, 0.004, 4, 8), steelM); ring.position.set(0, 0.12 + i * 0.26, 0.016 - k * 0.003); ring.rotation.x = Math.PI / 2; j.add(ring);
      }));
      const tipCap = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 5), steelM); tipCap.position.y = 0.58; rodSegments[3].add(tipCap);
    }

    const rodTipAnchor = new THREE.Object3D();
    rodTipAnchor.position.set(0, 0.58, 0);
    parentJoint.add(rodTipAnchor);

    anglerGroup.add(rodPivot);

    const bobberGroup = new THREE.Group();
    const bobTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xef4444, flatShading: true })
    );
    const bobBot = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 8, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true })
    );
    bobberGroup.add(bobTop, bobBot);
    bobberGroup.visible = false;
    scene.add(bobberGroup);

    const lineGeo = new THREE.BufferGeometry();
    const linePositions = new Float32Array(16 * 3);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const fishingLine = new THREE.Line(
      lineGeo,
      new THREE.LineBasicMaterial({ color: 0xf8fafc })
    );
    fishingLine.visible = false;
    scene.add(fishingLine);

    const shadowGeo = new THREE.ConeGeometry(0.35, 1.4, 6);
    shadowGeo.rotateX(Math.PI / 2);
    shadowGeo.scale(1, 0.15, 1);
    const fishShadow = new THREE.Mesh(
      shadowGeo,
      new THREE.MeshBasicMaterial({ color: 0x051324, transparent: true, opacity: 0.62 })
    );
    fishShadow.visible = false;
    scene.add(fishShadow);

    const rescueBoat = this.buildBoatMesh(2, textures, null);
    rescueBoat.traverse(obj => {
      if (obj.isMesh) {
        obj.material = new THREE.MeshStandardMaterial({ color: 0xf97316, flatShading: true });
      }
    });
    rescueBoat.visible = false;
    scene.add(rescueBoat);

    return {
      oceanMesh,
      oceanGeo,
      oceanMat,
      waveUniforms,
      buoys,
      seaObstacles,
      boatCircles: seaObstacles,
      bucketCollider,
      boatRects,
      shoreZ,
      bountyPapers: bountyBoard.userData.papers,
      cabin,
      islandScenery,
      resto: restoProps,
      pierGroup,
      district: districtProps,
      townFade: islandScenery.children.filter(o => o.userData.fade || o.userData.townFade),
      skyGroup,
      sunOrb,
      moonGroup,
      moonShadow,
      moonHalo,
      starField,
      starMat,
      lanternLights,
      standGlows,
      lighthouseBeacon,
      aquarium,
      cheatGull,
      anglerGroup,
      anglerRig,
      bodyGroup,
      headGroup,
      chest,
      waderHips,
      waderMat,
      stripeMat,
      maleFacialGroup,
      femaleHairGroup,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      chairGroup,
      chairFrontLegPivot,
      chairBackLegPivot,
      chairBackrestPivot,
      chairSeatPivot,
      rodPivot,
      rodMat,
      rodSegments,
      rodTipAnchor,
      bobberGroup,
      fishingLine,
      fishShadow,
      rescueBoat
    };
  },
};
