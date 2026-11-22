/* WorldBuilder method: buildTownDistricts, the town districts, benches and lamps. Kept whole. */
import { THREE } from '../engine/three.js';
import { PixelTextureFactory } from '../render/texture-factory.js';
import { ModelKit } from '../render/model-kit.js';
import { COL, EXTRA_BENCHES, JOB_LANTERNS, TOWN, benchGroundY, townGround } from './layout.js';
import { Colliders } from '../data/recipes.js';

export const wbDistrictsStatics = {
  /* Harbour Town districts (v6.3.0): the Market Square and Artisan Quarter to the east (Post Office, Barnaby's
     Workshop, the tide pool with its crab traps up on the terrace, Sailors' Rest tavern), Lighthouse Hill to the west
     (Talia's greenhouse, the herb garden, the Lookout Pavilion with its telescope and bench), street lanterns and the
     dockhand's winch on the boardwalk. Buildings fade (townFade) and everything solid has a walk collider. */
  buildTownDistricts(root, fade, textures) {
    const K = this.propKit(textures), M = K.M, W = COL.WALK, out = { lanterns: [], trapFloats: [] };
    const sign = (parent, text, w, x, y, z, px = 288) => K.box(parent, w, w * 0.18, 0.05, new THREE.MeshBasicMaterial({ map: PixelTextureFactory.makeSignTexture(text, px, 52) }), x, y, z);
    const stoneD = M(0x6b7280, 0.95), pave = M(0xb8b0a2, 0.95);
    // houses: the cottage model with a sign over the door, facing the sea
    const house = (t, wall, roof, seed, label) => {
      const ct = this.buildCottage(t.w, t.d, wall, roof, seed);
      ct.position.set(t.x, townGround(t.z), t.z); ct.rotation.y = Math.PI; ct.userData.townFade = true; root.add(ct); fade.push(ct);
      sign(ct, label, Math.min(2.4, t.w * 0.62), 0, 2.08, t.d / 2 + 0.1);
      Colliders.box(t.name, t.x, t.z, t.w / 2 + 0.12, t.d / 2 + 0.12, W);
      return ct;
    };
    house(TOWN.post, 0xfef9c3, 0x1d4ed8, 3, '📮 POST OFFICE');
    { const ct = house(TOWN.shop, 0xd6b48a, 0x7c2d12, 4, '🔨 WORKSHOP'); K.box(ct, 0.9, 0.5, 0.5, K.darkWood, TOWN.shop.w / 2 - 0.6, 0.55, TOWN.shop.d / 2 + 0.45); }
    { const ct = house(TOWN.tavern, 0xa16207, 0x334155, 5, "🍺 SAILORS' REST");
      [-1, 1].forEach(sx => K.cyl(ct, 0.28, 0.28, 0.62, M(0x7c2d12, 0.85), sx * (TOWN.tavern.w / 2 - 0.45), 0.61, TOWN.tavern.d / 2 + 0.45, 10));
      Colliders.circle('barrel', TOWN.tavern.x + TOWN.tavern.w / 2 - 0.45, TOWN.tavern.z - TOWN.tavern.d / 2 - 0.45, 0.32, W);
      Colliders.circle('barrel', TOWN.tavern.x - TOWN.tavern.w / 2 + 0.45, TOWN.tavern.z - TOWN.tavern.d / 2 - 0.45, 0.32, W); }
    house(TOWN.talia, 0xdcfce7, 0x15803d, 6, '🌿 TALIA');
    // the Market Square: paving, a fish-crate stall and bunting
    {
      const S = TOWN.market, y = townGround(S.z);
      const p = new THREE.Mesh(new THREE.CylinderGeometry(S.r, S.r, 0.06, 26), pave); p.position.set(S.x, y + 0.02, S.z); p.receiveShadow = true; root.add(p);
      const st = new THREE.Group(); st.position.set(S.x + 0.2, y, S.z + 0.2); root.add(st);
      K.box(st, 1.6, 0.7, 0.7, K.wood, 0, 0.35, 0); [[-0.5, 0x60a5fa], [0, 0xf8fafc], [0.5, 0xf87171]].forEach(([x, c]) => K.box(st, 0.42, 0.16, 0.5, M(c, 0.8), x, 0.78, 0));
      [-0.75, 0.75].forEach(x => K.cyl(st, 0.04, 0.04, 1.8, K.darkWood, x, 0.9, -0.3, 6)); K.box(st, 1.8, 0.05, 0.9, M(0x0e7490, 0.8), 0, 1.8, 0);
      Colliders.box('market stall', S.x + 0.2, S.z + 0.2, 0.85, 0.4, W);
    }
    // cobbles: the hill path west and the lane east
    const cob = (x, z, i) => { const s = new THREE.Mesh(ModelKit.roundedBox(0.9 + (i % 2) * 0.3, 0.07, 0.7, 0.03), i % 2 ? pave : M(0x9ca3af, 0.95)); s.position.set(x, townGround(z) + 0.02, z); s.rotation.y = i * 0.5; root.add(s); };
    for (let i = 0; i < 13; i++) { const t = i / 12; cob(-20.5 - t * 12.5 + Math.sin(t * 5) * 0.6, 9.6 + t * 10.0, i); }
    for (let i = 0; i < 10; i++) cob(21.5 + i * 1.05, 8.4 + Math.sin(i * 0.8) * 0.25, i + 1);
    for (let i = 0; i < 8; i++) { const t = i / 7; cob(26.5 + t * 2.5, 15.0 + t * 2.6, i); }
    // Lookout Pavilion: a six-post gazebo with a roof, a bench (reading spot) and a brass telescope pointing out to sea
    {
      const L = TOWN.lookout, y = townGround(L.z), g = new THREE.Group(); g.position.set(L.x, y, L.z); g.userData.townFade = true; root.add(g); fade.push(g);
      K.cyl(g, L.r + 0.2, L.r + 0.3, 0.06, stoneD, 0, 0.03, 0, 6);
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, px = Math.cos(a) * L.r, pz = Math.sin(a) * L.r;
        K.cyl(g, 0.07, 0.08, 2.3, M(0xf8fafc, 0.8), px, 1.3, pz, 8); if (pz > -0.5) Colliders.circle('pavilion post', L.x + px, L.z + pz, 0.12, W); }
      const roof = new THREE.Mesh(new THREE.ConeGeometry(L.r + 0.6, 1.1, 6), M(0x0f766e, 0.8)); roof.position.y = 3.0; roof.rotation.y = Math.PI / 6; g.add(roof);
      K.sph(g, 0.12, M(0xfacc15, 0.4, 0.5), 0, 3.6, 0, 8, 6);
      const bench = new THREE.Group(); bench.position.set(0, 0.06, TOWN.lookoutBench.z - L.z); g.add(bench);
      for (let k = 0; k < 3; k++) K.box(bench, 1.6, 0.05, 0.13, K.wood, 0, 0.46, -0.16 + k * 0.15);
      for (let k = 0; k < 2; k++) { const bk = K.box(bench, 1.6, 0.12, 0.04, K.wood, 0, 0.66 + k * 0.17, 0.27); bk.rotation.x = -0.18; }
      [-0.68, 0.68].forEach(lx => { K.box(bench, 0.07, 0.44, 0.07, K.iron, lx, 0.22, -0.18); K.box(bench, 0.07, 0.95, 0.07, K.iron, lx, 0.47, 0.25); });
      Colliders.box('bench', L.x, TOWN.lookoutBench.z + 0.05, 0.82, 0.35, W);
      const sc = TOWN.scope, tg = new THREE.Group(); tg.position.set(sc.x - L.x, 0.06, sc.z - L.z); g.add(tg);
      [0, 2.1, 4.2].forEach(a => { const leg = K.cyl(tg, 0.025, 0.025, 1.25, K.darkWood, Math.sin(a) * 0.25, 0.58, Math.cos(a) * 0.25, 5); leg.rotation.set(Math.cos(a) * 0.38, 0, -Math.sin(a) * 0.38); });
      const tube = new THREE.Group(); tube.position.y = 1.2; tube.rotation.x = 0.12; tg.add(tube);
      const brass = M(0xb8860b, 0.35, 0.8);
      K.cyl(tube, 0.07, 0.05, 1.0, brass, 0, 0, 0, 10).rotation.x = Math.PI / 2; K.cyl(tube, 0.085, 0.085, 0.12, brass, 0, 0, -0.5, 10).rotation.x = Math.PI / 2;
      Colliders.circle('telescope', sc.x, sc.z, 0.32, W);
    }
    // herb garden: three raised beds of herbs on Lighthouse Hill
    {
      const G = TOWN.garden, y = townGround(G.z), herb = [0x16a34a, 0x65a30d, 0x15803d, 0x4d7c0f];
      for (let b = 0; b < 3; b++) {
        const bz = G.z - 1.0 + b * 1.0, bed = new THREE.Group(); bed.position.set(G.x, y, bz); root.add(bed);
        K.box(bed, G.w, 0.28, 0.6, K.darkWood, 0, 0.14, 0); K.box(bed, G.w - 0.12, 0.05, 0.5, M(0x3f2a14, 1), 0, 0.29, 0);
        for (let i = 0; i < 7; i++) K.sph(bed, 0.13 + (i % 3) * 0.03, M(herb[(i + b) % 4], 0.9), -G.w / 2 + 0.3 + i * (G.w - 0.6) / 6, 0.4, (i % 2 ? 0.1 : -0.1), 6, 5);
        Colliders.box('herb bed', G.x, bz, G.w / 2 + 0.05, 0.32, W);
      }
    }
    // the tide pool on the east terrace: a ring of rocks around clear water, with three trap floats
    {
      const P = TOWN.pool, y = townGround(P.z);
      const water = new THREE.Mesh(new THREE.CircleGeometry(P.r, 28), M(0x1d7f9f, 0.15, 0.1, { transparent: true, opacity: 0.88 }));
      water.rotation.x = -Math.PI / 2; water.position.set(P.x, y + 0.03, P.z); root.add(water);
      const sand = new THREE.Mesh(new THREE.CircleGeometry(P.r * 0.7, 20), M(0xd6c08a, 0.9)); sand.rotation.x = -Math.PI / 2; sand.position.set(P.x, y + 0.02, P.z); root.add(sand);
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, rk = this.buildRock(0.3 + (i % 3) * 0.1, i * 3.7, 0x78716c, 0); rk.position.set(P.x + Math.cos(a) * (P.r + 0.15), y + 0.05, P.z + Math.sin(a) * (P.r + 0.15)); root.add(rk); }
      Colliders.circle('tide pool', P.x, P.z, P.r + 0.3, W);
      for (let i = 0; i < 3; i++) {
        const a = Math.PI * (0.65 + i * 0.35), f = new THREE.Group(); f.position.set(P.x + Math.cos(a) * P.r * 0.55, y + 0.08, P.z + Math.sin(a) * P.r * 0.55); root.add(f);
        K.sph(f, 0.11, M(0xf97316, 0.6), 0, 0.05, 0, 8, 6); K.cyl(f, 0.01, 0.01, 0.3, K.iron, 0, 0.2, 0, 4);
        f.visible = false; out.trapFloats.push(f);
      }
    }
    // street lanterns along the hill path, the upper terrace and the market (the night watch lights them)
    // v8.0.0: lanterns, benches and bench lamps go into one set that is merged at the end (only the parts that light up stay apart)
    const propSet = new THREE.Group(), propKeep = []; root.add(propSet);
    JOB_LANTERNS.forEach(p => {
      const y = townGround(p.z), g = new THREE.Group(); g.position.set(p.x, y, p.z); propSet.add(g);
      K.cyl(g, 0.05, 0.07, 2.2, K.iron, 0, 1.1, 0, 8); K.box(g, 0.3, 0.05, 0.3, K.iron, 0, 2.22, 0);
      const glass = M(0x334155, 0.3, 0.2, { emissive: new THREE.Color(0xfbbf24), emissiveIntensity: 0 });
      propKeep.push(K.box(g, 0.22, 0.3, 0.22, glass, 0, 2.05, 0)); K.box(g, 0.28, 0.04, 0.28, K.iron, 0, 1.89, 0);
      Colliders.circle('lantern', p.x, p.z, 0.12, W);
      out.lanterns.push({ g, glass });
    });
    // the dockhand's winch on the boardwalk: a small crane over a stack of crates
    {
      const Wn = TOWN.winch, g = new THREE.Group(); g.position.set(Wn.x, 1.5, Wn.z); root.add(g);
      K.cyl(g, 0.12, 0.16, 2.6, M(0xf59e0b, 0.6, 0.3), 0, 1.3, 0, 8);
      const arm = K.box(g, 0.12, 0.12, 2.0, M(0xf59e0b, 0.6, 0.3), 0, 2.5, -0.8); arm.rotation.x = -0.12;
      K.cyl(g, 0.01, 0.01, 1.2, K.iron, 0, 1.95, -1.7, 4); K.box(g, 0.5, 0.4, 0.5, K.wood, 0, 1.2, -1.7);
      K.cyl(g, 0.22, 0.22, 0.3, K.iron, 0.18, 0.8, 0, 10).rotation.z = Math.PI / 2;
      [[0.8, 0.2, 0], [0.8, 0.62, 0], [1.3, 0.2, 0.2]].forEach(([x, yy, z]) => K.box(g, 0.48, 0.42, 0.48, K.wood, x, yy, z));
      Colliders.circle('winch', Wn.x, Wn.z, 0.3, W); Colliders.box('crates', Wn.x + 1.05, Wn.z + 0.1, 0.55, 0.35, W);
    }
    // v6.8.0: the extra benches, each with a lamp post whose head glows at night over a soft pool of light
    {
      out.benchLamps = [];
      const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g2 = c.getContext('2d'), gr = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
        gr.addColorStop(0, 'rgba(255,230,170,0.9)'); gr.addColorStop(0.45, 'rgba(255,210,140,0.3)'); gr.addColorStop(1, 'rgba(255,200,120,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
      // every bench lamp lights at the same time, so they share one head and one glow material and merge into two meshes
      const head = K.M(0xfde68a, 0.4, 0.1, { emissive: new THREE.Color(0xfbbf24), emissiveIntensity: 0 });
      const poolMat = new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      out.benchLamps.push({ head, pool: poolMat });
      const lamp = (x, y, z) => {
        const g = new THREE.Group(); g.position.set(x, y, z); propSet.add(g);
        K.cyl(g, 0.045, 0.06, 2.0, K.iron, 0, 1.0, 0, 8); K.box(g, 0.26, 0.04, 0.26, K.iron, 0, 2.02, 0);
        K.box(g, 0.2, 0.26, 0.2, head, 0, 1.86, 0);
        const pool = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), poolMat);
        pool.rotation.x = -Math.PI / 2; pool.position.set(-0.5, 0.04, 0); g.add(pool);
        Colliders.circle('bench lamp', x, z, 0.1, W);
      };
      const bench = (x, z) => {
        const y = benchGroundY(z), b = new THREE.Group(); b.position.set(x, y, z); propSet.add(b);
        for (let k = 0; k < 3; k++) K.box(b, 1.6, 0.05, 0.13, K.lightWood, 0, 0.46, -0.16 + k * 0.15);
        for (let k = 0; k < 2; k++) { const bk = K.box(b, 1.6, 0.12, 0.04, K.lightWood, 0, 0.66 + k * 0.17, 0.27); bk.rotation.x = -0.18; }
        [-0.68, 0.68].forEach(lx => {
          K.box(b, 0.07, 0.44, 0.07, K.iron, lx, 0.22, -0.18); K.box(b, 0.07, 0.95, 0.07, K.iron, lx, 0.47, 0.25);
          K.box(b, 0.07, 0.05, 0.5, K.iron, lx, 0.44, 0.03); K.box(b, 0.07, 0.04, 0.38, K.iron, lx, 0.64, -0.02);
        });
        Colliders.box('bench', x, z + 0.05, 0.82, 0.35, W);
        lamp(x + 1.1, y, z + 0.25);
      };
      EXTRA_BENCHES.forEach(b => bench(b.x, b.z));
      [-4.6, 4.6].forEach(x => lamp(x + 1.1, 1.55, 5.5));   // the two original boardwalk benches get a lamp too
    }
    ModelKit.mergeStatic(propSet, propKeep, { bakeColor: true });
    propSet.children.forEach(m => { if (!m.isMesh) return; m.castShadow = false; if (m.material.blending === THREE.AdditiveBlending) { m.renderOrder = 2; m.receiveShadow = false; } });   // as before the merge: these never cast sun shadows
    return out;
  },
};
