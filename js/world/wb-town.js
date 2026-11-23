/* WorldBuilder method: buildHarbourTown, the planned town (v12.0.0): gate, streets, the Town Square (props in town-props.js),
   the notice kiosk, your plot, every building of TOWN_BUILDINGS on the modern kit, the restaurant terrace, the trees. */
import { THREE } from '../engine/three.js';
import { PixelTextureFactory } from '../render/texture-factory.js';
import { ModelKit } from '../render/model-kit.js';
import { COL, ISLAND, STREETS, TOWN, TOWN_BUILDINGS, TREES, doorOf, faceYaw, townGround } from './layout.js';
import { Colliders } from '../data/recipes.js';
import { buildModernBuilding, buildRoundTree, townKitMaterials } from './town-kit.js';
import { addLandmark } from './town-landmarks.js';
import { buildFountain, buildStalls } from './town-props.js';
import { buildStreetProps } from './town-street-props.js';

const SIGNS = { resto: "🍝 FISHERMAN'S RESTAURANT", post: '📮 POST OFFICE', talia: "🌿 TALIA'S GREENHOUSE", shop: "🔨 BARNABY'S WORKSHOP",
  tavern: "🍺 SAILORS' REST", rook: '⚓ ROOK', hut: '🗼 MARTA', pip: '🧒 PIP', ines: '🔬 INES' };

export const wbTownStatics = {
  buildHarbourTown(root, fade, textures) {
    const K = this.propKit(textures), M = K.M, W = COL.WALK, km = townKitMaterials(K), G = ISLAND.gateHW;
    root.userData.townKit = km;
    const sign = (parent, text, w, x, y, z) => K.box(parent, w, w * 0.18, 0.05, new THREE.MeshBasicMaterial({ map: PixelTextureFactory.makeSignTexture(text, 320, 56) }), x, y, z);
    // the harbour gate: two white pillars with a timber beam and the town's name, steps over the seawall
    const stone = M(0x7f7a72, 0.95), brick = M(0x85543f, 0.95), edge = M(0x55514c, 0.95);   // the lights are strong: keep paving mid-dark
    for (let i = 0; i < 4; i++) K.box(root, 2 * G + 0.4, 0.06, 0.32, i % 2 ? stone : edge, 0, 1.52 + i * 0.015, 5.85 + i * 0.3);
    [-1, 1].forEach(sx => { K.box(root, 0.5, 2.7, 0.5, km.white, sx * (G + 0.3), 1.5 + 1.35, 6.3); Colliders.box('gate pillar', sx * (G + 0.3), 6.3, 0.25, 0.25, W); });
    K.box(root, 2 * G + 1.4, 0.22, 0.4, K.lightWood, 0, 4.25, 6.3);
    sign(root, '🏘️ HARBOUR TOWN', 2.4, 0, 3.85, 6.08);
    // streets: paved pieces of at most a metre that follow the ground; Harbour Street climbs the slope in steps
    const piece = (x0, z0, x1, z1, w, mat) => {
      const len = Math.hypot(x1 - x0, z1 - z0), y0 = townGround(z0), y1 = townGround(z1);
      const m = K.sharpBox(root, w, 0.06, len + 0.02, mat, (x0 + x1) / 2, (y0 + y1) / 2 + 0.03, (z0 + z1) / 2);
      m.rotation.order = 'YXZ'; m.rotation.y = Math.atan2(x1 - x0, z1 - z0); m.rotation.x = -Math.atan2(y1 - y0, len); m.receiveShadow = true;
    };
    STREETS.forEach(st => {
      const mat = st.kind === 'stone' ? stone : brick;
      for (let k = 0; k < st.pts.length - 1; k++) {
        const [ax, az] = st.pts[k], [bx, bz] = st.pts[k + 1], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 1.0));
        for (let i = 0; i < n; i++) {
          const t0 = i / n, t1 = (i + 1) / n, z0 = az + (bz - az) * t0, z1 = az + (bz - az) * t1;
          if (st.id === 'harbourUp' && z1 > ISLAND.rampZ0 - 0.2 && z0 < ISLAND.rampZ1 + 0.2) continue;   // the steps below
          piece(ax + (bx - ax) * t0, z0, ax + (bx - ax) * t1, z1, st.w, mat);
        }
        if (st.kind === 'stone') [-1, 1].forEach(s => {   // kerbs along the stone streets
          const len = Math.hypot(bx - ax, bz - az), nx = (bz - az) / len, nz = -(bx - ax) / len;
          if (st.id === 'harbourUp') return;
          piece(ax + nx * s * st.w / 2, az + nz * s * st.w / 2, bx + nx * s * st.w / 2, bz + nz * s * st.w / 2, 0.16, edge);
        });
      }
    });
    { // the steps up to the Upper Terrace, with low cheek walls
      const n = 9, z0 = ISLAND.rampZ0 - 0.2, z1 = ISLAND.rampZ1 + 0.2, dz = (z1 - z0) / n;
      for (let i = 0; i < n; i++) { const z = z0 + dz * (i + 0.5), y = townGround(z); K.sharpBox(root, 4.0, y - 1.2, dz + 0.02, i % 2 ? stone : edge, 0, (y + 1.2) / 2 + 0.03, z); }
      [-1, 1].forEach(s => { const c = K.sharpBox(root, 0.3, 0.5, z1 - z0 + 0.4, km.concrete, s * 2.15, (townGround(z0) + townGround(z1)) / 2 + 0.25, (z0 + z1) / 2); c.rotation.x = -Math.atan2(ISLAND.up, z1 - z0); });
    }
    // the Town Square: light paving with a darker border; the fountain, stalls and street furniture (town-props.js)
    const S = TOWN.square;
    const sq = K.sharpBox(root, S.x1 - S.x0, 0.06, S.z1 - S.z0, M(0x8d867b, 0.95), S.x, 1.53, S.z); sq.receiveShadow = true;
    [[S.x, S.z0, S.x1 - S.x0, 0.3], [S.x, S.z1, S.x1 - S.x0, 0.3], [S.x0, S.z, 0.3, S.z1 - S.z0], [S.x1, S.z, 0.3, S.z1 - S.z0]].forEach(([x, z, w, d]) => K.sharpBox(root, w, 0.07, d, edge, x, 1.535, z));
    buildFountain(K, km, root, fade); buildStalls(K, km, root); buildStreetProps(K, km, root);
    // the notice kiosk at the gate: a timber board under a small roof, facing the promenade
    {
      const B = TOWN.board, k = new THREE.Group(); k.position.set(B.x, 1.5, B.z); k.rotation.y = faceYaw(B.face); root.add(k);
      [-0.8, 0.8].forEach(x => K.box(k, 0.1, 2.2, 0.1, km.frame, x, 1.1, 0));
      K.box(k, 1.7, 1.05, 0.08, K.lightWood, 0, 1.35, 0); K.box(k, 2.0, 0.08, 0.5, km.roof, 0, 2.25, 0.05);
      sign(k, '📌 TOWN JOBS', 1.4, 0, 1.98, 0.06);
      [[-0.45, 1.3, 0xfef3c7], [0.05, 1.25, 0xfde68a], [0.5, 1.35, 0xf8fafc]].forEach(([x, y, c]) => K.box(k, 0.36, 0.44, 0.01, M(c, 0.9), x, y, 0.05));
      Colliders.box('notice kiosk', B.x, B.z, 0.9, 0.18, W);
      ModelKit.mergeStatic(k, [], { bakeColor: true });
    }
    // your plot on the east waterfront: a fresh lawn behind a low timber fence (open to the promenade) and its sign
    {
      const P = TOWN.plot, lawn = K.sharpBox(root, P.w, 0.04, P.d, M(0x3b7a30, 0.9), P.x, 1.52, P.z); lawn.receiveShadow = true;
      const fence = (x, z, w, d) => { K.sharpBox(root, w, 0.7, d, K.lightWood, x, 1.85, z); Colliders.box('plot fence', x, z, w / 2 + 0.02, d / 2 + 0.02, W); };
      fence(P.x, P.z + P.d / 2, P.w, 0.08); fence(P.x - P.w / 2, P.z, 0.08, P.d); fence(P.x + P.w / 2, P.z, 0.08, P.d);
      const post = K.box(root, 0.08, 1.2, 0.08, km.frame, P.x - P.w / 2 + 1.2, 2.1, P.z - P.d / 2 + 0.3);
      sign(root, '🏠 YOUR PLOT', 1.3, post.position.x, 2.6, post.position.z + 0.06);
    }
    // the buildings: one fade group each, a collider for the walls and one for each solid extra
    const groups = {};
    TOWN_BUILDINGS.forEach(id => {
      const b = TOWN[id], { g, cols } = buildModernBuilding(K, km, b, id === 'resto' ? null : SIGNS[id]);
      addLandmark(K, km, b, g, cols);
      g.position.set(b.x, townGround(b.z), b.z); g.rotation.y = faceYaw(b.face); g.userData.townFade = true; g.userData.building = id;
      root.add(g); fade.push(g); groups[id] = g;
      Colliders.box(b.name, b.x, b.z, b.hx + 0.12, b.hz + 0.12, W);
      cols.forEach(([lx, lz, hw, hd]) => {
        const wx = b.x + b.tx * lx + b.fx * lz, wz = b.z + b.tz * lx + b.fz * lz, side = b.fx !== 0;
        Colliders.box(b.name + ' prop', wx, wz, side ? hd : hw, side ? hw : hd, W);
      });
    });
    // Lorenzo's: its name sign (renamed after you), the "opening soon" board, and the terrace on the square
    const R = TOWN.resto, rg = groups.resto, F0 = doorOf(R, 0);
    rg.userData.nameSign = K.box(rg, 3.4, 0.5, 0.06, new THREE.MeshBasicMaterial({ map: PixelTextureFactory.makeSignTexture("🍝 FISHERMAN'S RESTAURANT", 384, 64) }), 0, 2.78, R.d / 2 + 0.1);
    rg.userData.soonSign = K.box(rg, 1.0, 0.5, 0.04, new THREE.MeshBasicMaterial({ map: PixelTextureFactory.makeSignTexture('OPENING SOON', 192, 64) }), 1.6, 0.6, R.d / 2 + 0.6);
    const at = (fwd, lat) => ({ x: F0.x + R.fx * fwd + R.tx * lat, z: F0.z + R.fz * fwd + R.tz * lat });
    const tables = [], guests = [], lights = new THREE.Group(); root.add(lights);
    const shirt = [0xdc2626, 0x2563eb, 0x16a34a, 0xeab308, 0x7c3aed, 0x0e7490];
    [[2.0, -2.2], [2.0, 2.2], [3.9, 0]].forEach(([fwd, lat], ti) => {
      const p = at(fwd, lat), tg = new THREE.Group(); tg.position.set(p.x, 1.5, p.z); tg.rotation.y = faceYaw(R.face) + Math.PI / 2; root.add(tg); tables.push(tg);
      K.cyl(tg, 0.45, 0.45, 0.05, km.white, 0, 0.74, 0, 16); K.cyl(tg, 0.05, 0.08, 0.72, K.iron, 0, 0.36, 0, 8);
      K.box(tg, 0.92, 0.012, 0.18, M(0xdc2626, 0.9), 0, 0.775, 0);
      [-0.75, 0.75].forEach((sx, si) => {
        K.cyl(tg, 0.17, 0.17, 0.05, K.darkWood, sx, 0.46, 0, 10); K.cyl(tg, 0.03, 0.03, 0.44, K.iron, sx, 0.22, 0, 6);
        const gst = new THREE.Group(); gst.position.set(sx, 0.48, 0); gst.rotation.y = sx < 0 ? -Math.PI / 2 : Math.PI / 2; tg.add(gst);
        K.cyl(gst, 0.15, 0.18, 0.5, M(shirt[(ti * 2 + si) % 6], 0.8), 0, 0.27, 0, 8);
        K.sph(gst, 0.13, M([0xfde0c8, 0xe0a878, 0x8d5524][(ti + si) % 3], 0.7), 0, 0.66, 0, 10, 8);
        K.box(gst, 0.1, 0.06, 0.16, km.white, 0, 0.33, -0.22);
        gst.visible = false; guests.push(gst);
      });
      Colliders.circle('terrace table', p.x, p.z, 0.55, W);
      ModelKit.mergeStatic(tg, guests.slice(-2), { bakeColor: true });   // v12.1.0: the table in one or two meshes, its two guests apart
    });
    const bulbs = [0xfde68a, 0xf472b6, 0x7dd3fc].map(color => new THREE.MeshBasicMaterial({ color }));
    for (let i = 0; i <= 12; i++) { const p = at(0.7, -3.1 + i * 0.52); K.sph(lights, 0.05, bulbs[i % 3], p.x, 1.5 + 3.05 - Math.sin(i / 12 * Math.PI) * 0.35, p.z, 6, 5); }
    ModelKit.mergeStatic(lights, []);   // three meshes, one per bulb colour (the string is switched as a whole)
    lights.visible = false;
    // planned planting: palms on the promenade, round trees along the streets (each fades if it blocks the camera)
    const palmMats = {
      trunk: M(0x8b5a2b, 0.95, 0, { flatShading: true }), trunk2: M(0x6f4520, 0.95, 0, { flatShading: true }),
      frond: M(0x15803d, 0.7, 0, { side: THREE.DoubleSide, flatShading: true }), frond2: M(0x22a046, 0.7, 0, { side: THREE.DoubleSide, flatShading: true }), coconut: M(0x5b3a1a, 0.8, 0, { flatShading: true })
    };
    TREES.forEach(([kind, x, z], i) => {
      const t = kind === 'palm' ? this.buildPalm(4.4 + (i % 3) * 0.5, (i % 2 ? 0.5 : -0.5), i * 1.3, palmMats) : buildRoundTree(K, km, i);
      t.position.set(x, townGround(z), z); t.userData.fade = true; root.add(t);
      Colliders.circle(kind, x, z, kind === 'palm' ? 0.32 : 0.22, W);
    });
    return { tables, guests, lights, soon: rg.userData.soonSign, sign: rg.userData.nameSign };
  },
};
