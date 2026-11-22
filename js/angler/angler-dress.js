/* AnglerFactory method: dress(rig, look), which builds the body, clothes, hair, hats, face and extras.
   Kept whole in one file (one long method). */
import { THREE } from '../engine/three.js';
import { ANGLER_OPTS, LookColor } from './look-options.js';
import { AnglerFactory } from './angler-factory.js';
import { ModelKit } from '../render/model-kit.js';

export const anglerDressStatics = {
  dress(rig, look) {
    look = AnglerFactory.sanitizeLook(look, look && look.gender);   // v9.1.0: every look gets every field (townsfolk looks are partial)
    look = this.sanitizeLook(look, look && look.gender);
    const female = look.gender === 'female';
    // remove the previous outfit (skinned meshes on the skeleton root, rigid parts on the bones)
    rig.parts.forEach(m => { if (m.parent) m.parent.remove(m); this.dispose(m); });
    rig.parts = [];
    if (rig.faces) Object.values(rig.faces).forEach(t => t.dispose());   // v9.1.0: the old face textures
    rig.faces = null; rig.faceMesh = null;
    this.clear(rig.headGroup);
    const d = this.dims(look);
    rig.dims = d;
    this.layoutBones(rig, d);
    const add = (parent, obj) => { parent.add(obj); rig.parts.push(obj); return obj; };
    const fingerBones = [];   // v11.0.0: the mitten joints are bones, so they still bend once the hands are baked

    const C = i => new THREE.Color(ANGLER_OPTS.colors[i]);
    const LC = k => new THREE.Color(LookColor[k](look));   // v9.1.0: picked colour or palette
    // v9.0.0: skin, hair and cloth use soft three-step toon shading; shiny and metal parts stay standard
    const mat = (color, rough = 0.8, metal = 0, extra = {}) => (metal > 0.3 || rough < 0.4)
      ? new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal }, extra))
      : new THREE.MeshToonMaterial(Object.assign({ color, gradientMap: AnglerFactory.toonRamp() }, extra));
    const skinCol = new THREE.Color(LookColor.skin(look));
    const skinMat = mat(skinCol, 0.7, 0, { side: THREE.DoubleSide });
    const hairMat = mat(LookColor.hair(look), 0.65);
    const topMat = mat(LC('top'), 0.85, 0, { side: THREE.DoubleSide });
    const accMat = mat(LC('accent'), 0.85, 0, { side: THREE.DoubleSide });
    const botMat = mat(LC('bottom'), 0.85, 0, { side: THREE.DoubleSide });
    const shoeMat = mat(LC('shoe'), look.shoes === 'boots' ? 0.35 : 0.8);
    const soleMat = mat(look.shoes === 'boots' ? 0xeab308 : 0xf1f5f9, 0.8);
    const hatMat = mat(LC('hat'), 0.7, 0, { side: THREE.DoubleSide });
    const darkMat = new THREE.MeshBasicMaterial({ color: 0x0b1020 });
    const brass = mat(0xd9a21b, 0.3, 0.8);
    const skinned = m => { const k = m.clone(); m.dispose(); return k; };   // skinning is automatic since r129

    const put = (parent, geo, m, x = 0, y = 0, z = 0) => { const mesh = new THREE.Mesh(geo, m); mesh.position.set(x, y, z); parent.add(mesh); if (parent !== rig.headGroup && !rig.parts.includes(parent) && parent.isBone) rig.parts.push(mesh); return mesh; };
    const sph = (parent, r, m, x, y, z, sx = 1, sy = 1, sz = 1, seg = 20) => { const mesh = put(parent, new THREE.SphereGeometry(r, seg, Math.max(8, seg - 6)), m, x, y, z); mesh.scale.set(sx, sy, sz); return mesh; };
    const lathe = (parent, pts, m, seg = 32, sz = 1) => { const mesh = put(parent, new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg), m); mesh.scale.z = sz; return mesh; };
    const rbox = (parent, w, h, dd, m, x, y, z, r = 0.01) => put(parent, ModelKit.roundedBox(w, h, dd, Math.min(r, Math.min(w, h, dd) * 0.45)), m, x, y, z);

    // ---------- rest-space joint positions ----------
    const bi = {}; rig.bones.forEach((b, i) => { bi[b.name] = i; });
    const idxOf = { hips: bi.hips, spine: bi.spine, chest: bi.chest, neck: bi.neck, clavL: bi.clavL, clavR: bi.clavR, bustL: bi.bustL, bustR: bi.bustR };
    const P = b => this.restPos(rig, b);
    const ySpine = d.hipY + d.spine, yChest = ySpine + d.chest, yNeck = yChest + d.neck;
    const W = d.w;
    // torso profile (half width, half depth, z centre) by height
    const fw = female ? 1 : 0;
    const prof = y => {
      const t = (y - d.hipY) / d.torso;   // the profile is keyed in adult heights
      const keys = [
        [-0.12, 0.118 + 0.012 * fw, 0.098], [-0.02, 0.158 + 0.024 * fw, 0.112], [0.08, 0.150 + 0.016 * fw, 0.108],
        [0.18, 0.140 - 0.014 * fw, 0.100], [0.30, 0.152 - 0.010 * fw, 0.108], [0.42, 0.174 - 0.016 * fw, 0.118],
        [0.50, 0.168 - 0.014 * fw, 0.105], [0.56, 0.115 - 0.008 * fw, 0.085], [0.60, 0.058, 0.058], [0.72, 0.052, 0.054]
      ];
      let k = 0; while (k < keys.length - 2 && t > keys[k + 1][0]) k++;
      const [ta, xa, za] = keys[k], [tb, xb, zb] = keys[k + 1];
      const f = THREE.MathUtils.clamp((t - ta) / (tb - ta), 0, 1), s = f * f * (3 - 2 * f);
      const neckish = t > 0.57;
      return { wx: (xa + (xb - xa) * s) * (neckish ? 1 : W), wz: (za + (zb - za) * s) * (neckish ? 1 : (0.94 + 0.06 * W)), cz: t > 0.5 ? (t - 0.5) * 0.12 * d.torso : 0 };
    };
    const TS = d.torso, BL = (d.shin + d.ankle) / 0.48;   // height factors for the torso and for boots
    const T0 = d.hipY - 0.115 * TS, T1 = yNeck + 0.06 * TS;
    const bodyGeos = [];
    bodyGeos.push(this.torsoGeo(d, idxOf, prof, { y0: T0, y1: T1, bust: female ? d.bustAmt : 0, capBottom: true }));
    // limb profiles
    const armR = (u, s) => { // u 0 shoulder .. 1 wrist
      const k = u < 0.53 ? 0.052 - u * 0.022 + 0.008 * Math.sin(Math.PI * Math.min(1, u / 0.5)) : 0.04 + 0.006 * Math.sin(Math.PI * Math.min(1, (u - 0.53) / 0.3)) - (u - 0.53) * 0.03;
      return k * (female ? 0.88 : 1) * (0.9 + 0.1 * W) * (0.85 + 0.15 * W);
    };
    const legR = (u, s) => { // u 0 hip .. 1 ankle
      const thigh = 0.084 - u * 0.05 + 0.01 * Math.sin(Math.PI * Math.min(1, u / 0.45));
      const calf = 0.047 + 0.013 * Math.exp(-((u - 0.64) ** 2) / 0.006) - Math.max(0, u - 0.8) * 0.06;
      const k = u < 0.5 ? thigh : Math.max(calf, u < 0.56 ? thigh : 0);
      return k * (female ? 1.04 : 1) * (0.86 + 0.14 * W);
    };
    const limbs = [];
    [['L', rig.L], ['R', rig.R]].forEach(([s, S]) => {
      const sh = P(S.upper), el = P(S.fore), wr = P(S.hand);
      const hp = P(S.thigh), kn = P(S.shin), an = P(S.foot);
      limbs.push({ s, S, sh, el, wr, hp, kn, an });
      bodyGeos.push(this.limbGeo(sh, el, wr, [bi['upper' + s], bi['fore' + s], bi['hand' + s]], armR, { capTop: true, topBone: bi['clav' + s], ez: 0.9, seg: 12 }));
      bodyGeos.push(this.limbGeo(hp.clone().add(new THREE.Vector3(0, 0.03, 0)), kn, an, [bi['thigh' + s], bi['shin' + s], bi['foot' + s]], legR, { capTop: true, topBone: bi.hips, ez: 0.95, seg: 14 }));
    });
    const skel = new THREE.Skeleton(rig.bones);
    const skinMesh = (geo, m) => {
      const mesh = new THREE.SkinnedMesh(geo, skinned(m));
      mesh.frustumCulled = false;
      add(rig.skelRoot, mesh);
      mesh.bind(skel);
      return mesh;
    };
    rig.root.updateMatrixWorld(true);
    // the skeleton's rest space is skelRoot (scaled by height): geometry is built in unscaled metres, so bind in that space
    skinMesh(this.mergeSkin(bodyGeos), skinMat);

    // ---------- hands (rigid on the hand bones) and feet / shoes (rigid on the foot bones) ----------
    limbs.forEach(({ s, S }) => {
      const sx = s === 'L' ? -1 : 1;
      const hg = add(S.hand, new THREE.Group());
      S.handGroup = hg; S.fingers = [];
      const hs = (female ? 0.9 : 1) * (0.94 + 0.06 * W);
      hg.scale.setScalar(hs);
      // v9.0.0 chibi mitten: a soft palm and one rounded finger block with a tip joint (the grip still curls it)
      sph(hg, 0.05, skinMat, 0, -0.045, 0, 0.72, 1.0, 0.95, 16);                    // palm (palms face the thigh)
      {
        const fg = new THREE.Bone(); fg.position.set(0, -0.085, 0); hg.add(fg);
        sph(fg, 0.042, skinMat, 0, -0.018, 0, 0.66, 0.85, 1.05, 14);
        const tip = new THREE.Bone(); tip.position.set(0, -0.035, 0); fg.add(tip);
        sph(tip, 0.035, skinMat, 0, -0.012, 0, 0.62, 0.75, 1.0, 12);
        S.fingers.push(fg, tip); fingerBones.push(fg, tip);
      }
      const th = new THREE.Bone(); th.position.set(-sx * 0.012, -0.03, -0.035); hg.add(th); fingerBones.push(th);
      const tm = sph(th, 0.022, skinMat, 0, -0.02, -0.012, 0.9, 1.45, 0.9, 10); tm.rotation.x = -0.5;
      S.thumb = th;

      const fgp = add(S.foot, new THREE.Group());
      S.footGroup = fgp;
      const shoe = look.shoes;
      const g0 = -d.ankle;                                   // ground, relative to the ankle
      const footLen = 0.25, fz = -0.06;
      const soleFn = (w, len, y, z, m) => {
        const g = ModelKit.roundedBox(w, 0.03, len, 0.012).clone();
        const p = g.attributes.position;
        for (let k = 0; k < p.count; k++) { const t = (p.getZ(k) / len) + 0.5; p.setX(k, p.getX(k) * (0.78 + 0.22 * Math.sin(Math.min(1, 1 - t) * Math.PI * 0.9))); }
        g.computeVertexNormals();
        put(fgp, g, m, 0, y, z);
        put(fgp, ModelKit.roundedBox(w * 0.78, 0.035, len * 0.26, 0.012), m, 0, y - 0.006, z + len * 0.36);
      };
      if (shoe === 'barefoot' || shoe === 'sandals') {
        sph(fgp, 0.05, skinMat, 0, g0 + 0.035, fz, 0.9, 0.62, 2.3, 16);
        sph(fgp, 0.045, skinMat, 0, g0 + 0.05, 0.02, 1, 0.9, 1.1, 12);
        for (let t = 0; t < 5; t++) sph(fgp, 0.011 - (t ? 0.002 : 0), skinMat, -0.03 + t * 0.015 * (sx > 0 ? 1 : 1), g0 + 0.02, fz - 0.105 + Math.abs(t - 1) * 0.006, 1, 1, 1, 8);
        if (shoe === 'sandals') {
          soleFn(0.105, footLen + 0.02, g0 + 0.008, fz - 0.005, shoeMat);
          rbox(fgp, 0.1, 0.012, 0.022, shoeMat, 0, g0 + 0.045, fz - 0.05, 0.005);
          rbox(fgp, 0.1, 0.012, 0.022, shoeMat, 0, g0 + 0.06, 0.0, 0.005);
        }
      } else if (shoe === 'sneakers' || shoe === 'hightops') {
        if (shoe === 'hightops') { lathe(fgp, [[0.058, g0 + 0.15 * BL], [0.062, g0 + 0.1 * BL], [0.06, g0 + 0.05]], shoeMat, 18); put(fgp, new THREE.TorusGeometry(0.059, 0.008, 6, 16), soleMat, 0, g0 + 0.15 * BL, 0).rotation.x = Math.PI / 2; }
        sph(fgp, 0.06, shoeMat, 0, g0 + 0.05, fz, 0.95, 0.75, 2.2, 18);
        sph(fgp, 0.055, shoeMat, 0, g0 + 0.07, 0.015, 1, 1, 1.05, 14);
        soleFn(0.112, footLen + 0.03, g0 + 0.012, fz, soleMat);
        sph(fgp, 0.04, soleMat, 0, g0 + 0.035, fz - 0.105, 1.35, 0.7, 0.9, 12);
        for (let l = 0; l < 3; l++) [-1, 1].forEach(sd => { const lace = put(fgp, new THREE.CylinderGeometry(0.004, 0.004, 0.05, 4), mat(0xf8fafc, 0.5), 0, g0 + 0.088 - l * 0.008, fz - 0.015 - l * 0.022); lace.rotation.set(Math.PI / 2 - 0.6, 0, sd * 0.6); });
      } else { // rubber boots: shaft up the shin, rounded toe
        lathe(fgp, [[0.062, g0 + 0.3 * BL], [0.066, g0 + 0.28 * BL], [0.06, g0 + 0.16 * BL], [0.064, g0 + 0.05]], shoeMat, 20);
        put(fgp, new THREE.TorusGeometry(0.063, 0.009, 6, 18), mat(0x111827, 0.4), 0, g0 + 0.3 * BL, 0).rotation.x = Math.PI / 2;
        sph(fgp, 0.064, shoeMat, 0, g0 + 0.05, fz, 1.0, 0.78, 2.15, 18);
        soleFn(0.12, footLen + 0.035, g0 + 0.012, fz, soleMat);
        rbox(fgp, 0.035, 0.026, 0.01, brass, 0, g0 + 0.2 * BL, -0.066, 0.004);
      }
    });

    // ---------- clothes (skinned shells, cut from the same lofts so they bend with the body) ----------
    const top = look.top, bottom = look.bottom;
    const clothGeos = new Map();
    const pushCloth = (m, g) => { if (!clothGeos.has(m)) clothGeos.set(m, []); clothGeos.get(m).push(g); };
    const tAt = o => this.torsoGeo(d, idxOf, prof, Object.assign({ bust: female ? d.bustAmt : 0 }, o));   // clothes follow the body's bust
    const topBase = LC('top'), topAcc = LC('accent');
    const vcol = m => { const k = m.clone(); k.vertexColors = true; k.color.set(0xffffff); return k; };
    const armCloth = (m, uEnd, off, colFn) => limbs.forEach(({ s, sh, el, wr }) => {
      const L1 = sh.distanceTo(el) + el.distanceTo(wr);
      pushCloth(m, this.limbGeo(sh, el, wr, [bi['upper' + s], bi['fore' + s], bi['hand' + s]], armR, { s1: L1 * uEnd, off, capTop: true, topBone: bi['clav' + s], ez: 0.9, seg: 12, colFn }));
    });
    const legCloth = (m, uEnd, off, flare = 0, colFn) => limbs.forEach(({ s, hp, kn, an }) => {
      const top0 = hp.clone().add(new THREE.Vector3(0, 0.03, 0)), L1 = top0.distanceTo(kn) + kn.distanceTo(an);
      pushCloth(m, this.limbGeo(top0, kn, an, [bi['thigh' + s], bi['shin' + s], bi['foot' + s]], (u, ss) => legR(u, ss) + flare * u, { s1: L1 * uEnd, off, capTop: true, topBone: bi.hips, ez: 0.95, seg: 14, colFn }));
    });
    const front = a => Math.abs(a - Math.PI * 1.5);   // angular distance from the front
    const shirtTop = yNeck - 0.035 * TS;
    /* v9.1.0 patterns, painted into the vertex colours: v is an adult-scale height (m), a the angle round the body */
    const PAT = (kind, v, a) => {
      if (kind === 'stripes') return Math.floor(v / 0.06) % 2 === 0;
      if (kind === 'checks') return (Math.floor(v / 0.05) + Math.floor(a / (Math.PI * 2) * 12)) % 2 === 0;
      if (kind === 'waves') return Math.floor((v + 0.018 * Math.sin(a * 4)) / 0.05) % 2 === 0;
      if (kind === 'block') return v > 0.3;
      return false;
    };
    const topPat = look.topPattern === 'auto' || !look.topPattern ? (({ sweater: 'stripes', flannel: 'checks' })[top] || 'plain') : look.topPattern;
    const botPat = look.bottomPattern || 'plain', botBase = LC('bottom'), botAcc = LC('bottomAcc');
    const torsoFn = (kind, base, acc) => (kind === 'plain' ? undefined : (yy, a, out) => out.copy(PAT(kind, (yy - d.hipY) / TS + 0.02, a) ? acc : base));
    const limbFn = (kind, base, acc, len) => (kind === 'plain' ? undefined : (u, a, out) => out.copy(PAT(kind, u * len, a) ? acc : base));
    const tMat = topPat === 'plain' ? topMat : vcol(topMat), tFn = torsoFn(topPat, topBase, topAcc), aFn = limbFn(topPat, topBase, topAcc, 0.55);
    const bMat = botPat === 'plain' ? botMat : vcol(botMat), bFn = torsoFn(botPat, botBase, botAcc), lFn = limbFn(botPat, botBase, botAcc, 0.8);
    if (top === 'sweater' || top === 'flannel') {
      pushCloth(tMat, tAt({ y0: d.hipY - 0.03 * TS, y1: shirtTop, off: 0.016, colFn: tFn }));
      armCloth(tMat, 0.9, 0.012, aFn);
    } else if (top === 'tee' || top === 'vest' || top === 'polo' || top === 'dress') {
      pushCloth(tMat, tAt({ y0: d.hipY - 0.02 * TS, y1: shirtTop, off: 0.012, colFn: tFn }));
      armCloth(tMat, top === 'dress' ? 0.22 : 0.3, 0.012, aFn);
      if (top === 'vest') { // fishing vest: open front, no sleeves, lots of pockets
        const vm = mat(LC('accent'), 0.85, 0, { side: THREE.DoubleSide });
        pushCloth(vm, tAt({ y0: d.hipY + 0.02 * TS, y1: yChest + 0.17 * TS, off: 0.03, keep: (a, y, x) => front(a) > 0.32 && !(Math.abs(x) > 0.13 && y > yChest + 0.08 * TS) }));
      }
    } else if (top === 'cardigan') { // an open knit over a shirt in the accent colour
      pushCloth(mat(LC('accent'), 0.85, 0, { side: THREE.DoubleSide }), tAt({ y0: d.hipY - 0.02 * TS, y1: shirtTop, off: 0.011 }));
      pushCloth(tMat, tAt({ y0: d.hipY - 0.05 * TS, y1: shirtTop, off: 0.022, colFn: tFn, keep: a => front(a) > 0.26 }));
      armCloth(tMat, 0.9, 0.016, aFn);
    } else if (top === 'tank') {
      pushCloth(tMat, tAt({ y0: d.hipY - 0.02 * TS, y1: yChest + 0.15 * TS, off: 0.012, colFn: tFn, keep: (a, y, x) => !(Math.abs(x) > 0.11 && y > yChest + 0.06 * TS) }));
    } else if (top === 'hoodie' || top === 'slicker') {
      const off = top === 'slicker' ? 0.026 : 0.02;
      pushCloth(tMat, tAt({ y0: top === 'slicker' ? d.hipY - 0.11 * TS : d.hipY - 0.03 * TS, y1: shirtTop, off, colFn: tFn }));
      armCloth(tMat, 0.88, off * 0.8, aFn);
    } else if (top === 'bikini') {
      pushCloth(topMat, tAt({ y0: yChest - 0.02 * TS, y1: yChest + 0.09 * TS, off: 0.008, bust: female ? d.bustAmt * 1.1 : 0 }));
    }
    if (bottom === 'jeans' || bottom === 'overalls' || bottom === 'cargo' || bottom === 'leggings') {
      const tight = bottom === 'leggings';
      pushCloth(bMat, tAt({ y0: d.hipY - 0.115 * TS, y1: d.hipY + 0.17 * TS, off: tight ? 0.008 : 0.012, capBottom: true, colFn: bFn }));
      legCloth(bMat, look.shoes === 'boots' ? 0.86 : tight ? 0.97 : 0.95, tight ? 0.006 : 0.012, tight ? 0 : bottom === 'cargo' ? 0.012 : 0.008, lFn);
      if (bottom === 'overalls') pushCloth(bMat, tAt({ y0: d.hipY + 0.15 * TS, y1: yChest + 0.12 * TS, off: 0.03, keep: a => front(a) < 1.05, colFn: bFn }));
    } else if (bottom === 'shorts' || bottom === 'swim') {
      pushCloth(bMat, tAt({ y0: d.hipY - 0.115 * TS, y1: d.hipY + 0.16 * TS, off: 0.013, capBottom: true, colFn: bFn }));
      legCloth(bMat, bottom === 'swim' ? 0.24 : 0.38, 0.016, 0.01, lFn);
    } else if (bottom === 'bikini') {
      pushCloth(botMat, tAt({ y0: d.hipY - 0.115 * TS, y1: d.hipY - 0.0 * TS, off: 0.008, capBottom: true }));
    } else if (bottom === 'skirt') {
      pushCloth(bMat, tAt({ y0: d.hipY - 0.04 * TS, y1: d.hipY + 0.16 * TS, off: 0.014, colFn: bFn }));
    }
    clothGeos.forEach((gs, m) => skinMesh(this.mergeSkin(gs), m));

    // rigid clothing details on the bones
    if (top === 'dress') { // the dress's skirt, in the top's colour, over whatever is worn below
      const pts = []; for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([0.175 * W + 0.03 * fw + t * 0.12 + Math.sin(t * Math.PI * 4) * 0.006, 0.02 - t * 0.36 * d.legs * 1.25]); }
      const sk = lathe(rig.hips, pts, topMat, 34, 0.86); rig.parts.push(sk);
    }
    if (top === 'polo') {   // a soft collar and two buttons
      [-1, 1].forEach(sx => { const f = rbox(rig.chest, 0.07, 0.012, 0.05, topMat, sx * 0.04, d.neck - 0.035 * TS, -0.05, 0.005); f.rotation.set(0.5, sx * 0.4, sx * 0.3); });
      [0, 1].forEach(k => sph(rig.chest, 0.007, accMat, 0, d.neck - (0.06 + k * 0.035) * TS, -(prof(yNeck - (0.06 + k * 0.035) * TS).wz + 0.017), 1, 1, 0.6, 6));
    }
    if (top === 'cardigan') [0, 1, 2].forEach(k => sph(rig.chest, 0.008, brass, 0.03, d.neck - (0.08 + k * 0.05) * TS, -(prof(yNeck - (0.08 + k * 0.05) * TS).wz + 0.026), 1, 1, 0.6, 6));
    if (bottom === 'cargo') limbs.forEach(({ S, s }) => { const sx = s === 'L' ? -1 : 1; rbox(S.thigh, 0.03, 0.07, 0.07, mat(LC('bottom').multiplyScalar(0.82), 0.85), sx * 0.085, -d.thigh * 0.55, 0, 0.008); });
    if (bottom === 'skirt') { // a flared skirt hanging from the hips
      const pts = []; for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([0.17 * W + 0.03 * fw + t * 0.11 + Math.sin(t * Math.PI * 4) * 0.006, -0.02 - t * 0.36 * d.legs * 1.3]); }
      const sk = lathe(rig.hips, pts, botMat, 34, 0.86); rig.parts.push(sk);
    }
    if (top === 'hoodie' || top === 'slicker') {
      const hood = sph(rig.chest, 0.13, topMat, 0, d.neck - 0.02 * TS, 0.1, 1.1, 0.75, 0.75, 14); hood.geometry = new THREE.SphereGeometry(0.13, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55); hood.rotation.x = 1.9;
      if (top === 'hoodie') {
        rbox(rig.spine, 0.2, 0.09 * TS, 0.02, topMat, 0, 0.06 * TS, -(prof(ySpine + 0.06 * TS).wz + 0.03), 0.01);
        [-0.04, 0.04].forEach(x => put(rig.chest, new THREE.CylinderGeometry(0.004, 0.004, 0.12, 4), accMat, x, d.chest + 0.02 * TS, -(prof(yChest + 0.2 * TS).wz + 0.03)));
      } else {
        for (let k = 0; k < 4; k++) rbox(rig.spine, 0.03, 0.012, 0.012, accMat, 0, (-0.02 + k * 0.09) * TS, -(prof(ySpine + k * 0.09 * TS).wz + 0.03), 0.004);
      }
    }
    if (top === 'tee' || top === 'sweater' || top === 'vest' || top === 'flannel' || top === 'dress') {
      const collar = put(rig.chest, new THREE.TorusGeometry(0.062, 0.014, 8, 20), top === 'sweater' ? accMat : topMat, 0, d.neck - 0.03 * TS, 0.005); collar.rotation.x = Math.PI / 2;
    }
    if (top === 'vest') {
      [[-1, 0.0], [1, 0.0], [-1, 0.1 * TS], [1, 0.1 * TS]].forEach(([sx, dy]) => rbox(rig.chest, 0.07, 0.06 * TS, 0.02, mat(LC('accent').multiplyScalar(0.8), 0.85), sx * 0.085, dy - 0.02 * TS, -(prof(yChest + dy).wz + 0.045), 0.006));
    }
    if (top === 'tank' || top === 'bikini') {
      [-1, 1].forEach(sx => { const st = put(rig.chest, new THREE.CylinderGeometry(0.006, 0.006, 0.22 * TS, 4), top === 'bikini' ? topMat : topMat, sx * 0.085, d.chest + 0.08 * TS, 0); st.rotation.x = 0.0; });
    }
    if (bottom === 'overalls') {
      [-1, 1].forEach(sx => { rbox(rig.chest, 0.04, 0.012, 0.26 * TS, botMat, sx * 0.085, d.chest + 0.14 * TS, 0.0, 0.005); rbox(rig.chest, 0.03, 0.03, 0.012, brass, sx * 0.085, d.chest + 0.1 * TS, -(prof(yChest + 0.1 * TS).wz + 0.035), 0.005); });
      rbox(rig.spine, 0.12, 0.08 * TS, 0.012, mat(LC('bottom').multiplyScalar(0.8), 0.85), 0, d.chest * 0.5, -(prof(ySpine + 0.1 * TS).wz + 0.04), 0.006);
    }
    if (bottom === 'jeans' || bottom === 'shorts') {
      const belt = put(rig.hips, new THREE.TorusGeometry(1, 0.02, 6, 28), mat(0x3b2314, 0.6), 0, 0.15 * TS, 0); belt.rotation.x = Math.PI / 2; belt.scale.set(prof(d.hipY + 0.15 * TS).wx + 0.014, prof(d.hipY + 0.15 * TS).wz + 0.014, 1);
      rbox(rig.hips, 0.045, 0.035, 0.012, brass, 0, 0.15 * TS, -(prof(d.hipY + 0.15 * TS).wz + 0.03), 0.005);
    }

    // ---------- head (rigid on the head bone; the face builders from v2 with face, nose and brow options) ----------
    const H = rig.headGroup;
    const shapeHead = hg => {
      const hp = hg.attributes.position;
      for (let i = 0; i < hp.count; i++) {
        let x = hp.getX(i), y = hp.getY(i) * 1.06, z = hp.getZ(i) * 0.99;
        if (y < 0) { const t = Math.min(1, -y / 0.21); const k = t * t; x *= 1 - (female ? 0.16 : 0.09) * k; z *= 1 - 0.05 * k; y *= 1 + 0.07 * k; }
        if (female) x *= 0.97;
        // face shape: round (wider, softer jaw), square (flat jaw), long (taller, narrower), oval (as is)
        const fsh = look.faceShape;
        if (fsh === 'round') { x *= 1.06; z *= 1.02; if (y < 0) y *= 0.94; }
        else if (fsh === 'square') { if (y < 0) { const t = Math.min(1, -y / 0.21); x *= 1 + 0.12 * t * t; y *= 0.97; } }
        else if (fsh === 'long') { y *= 1.08; x *= 0.95; }
        hp.setXYZ(i, x, y, z);
      }
      hg.computeVertexNormals();
      return hg;
    };
    put(H, shapeHead(new THREE.SphereGeometry(0.205, 48, 34)), skinMat);
    // v9.0.0: the painted face, a front patch of the same head 1% further out (its UVs span FACE_PATCH)
    {
      const FP = AnglerFactory.FACE_PATCH;
      const fg = shapeHead(new THREE.SphereGeometry(0.207, 36, 28, FP.phi0, FP.phiLen, FP.th0, FP.thLen));
      const tex = new THREE.CanvasTexture(AnglerFactory.paintFace(look)); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
      const fm = new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
      const face = put(H, fg, fm); face.renderOrder = 1; face.userData.noMerge = true; rig.faceTex = tex;
      rig.faceMesh = face; rig.look = look; rig.faces = { open: tex }; rig.faceExpr = 'open';
    }
    [-1, 1].forEach(s => {   // ears: round, small or pointed
      if (look.ears === 'pointed') { const e = sph(H, 0.042, skinMat, s * 0.205, 0.03, 0.02, 0.5, 1.5, 0.75, 12); e.rotation.z = -s * 0.5; }
      else sph(H, look.ears === 'small' ? 0.032 : 0.042, skinMat, s * 0.2, 0.0, 0.01, 0.55, 1, 0.8, 12);
    });
    {   // a small button nose (the eyes, brows, cheeks and mouth are painted on the face)
      const noseMat = mat(new THREE.Color(LookColor.skin(look)).multiplyScalar(0.93), 0.7);
      const k = ({ small: 0.8, button: 1.05, broad: 1.2, straight: 0.95 })[look.nose] || 1;
      sph(H, 0.021 * k, noseMat, 0, -0.03, -0.206, look.nose === 'broad' ? 1.4 : 1.1, 0.85, 0.75, 12);
    }

    // facial hair
    const fh = look.facial;
    if (fh === 'stubble') {
      const g = sph(H, 0.215, mat(LookColor.hair(look), 0.9, 0, { transparent: true, opacity: 0.16 }), 0, -0.03, -0.005, 1, 1, 1, 26);
      g.geometry.dispose(); g.geometry = new THREE.SphereGeometry(0.212, 28, 14, 0, Math.PI * 2, Math.PI * 0.62, Math.PI * 0.38);   // jaw only: the painted smile stays visible
    }
    if (fh === 'sideburns') [-1, 1].forEach(s => { const sb = sph(H, 0.03, hairMat, s * 0.19, -0.05, 0.0, 0.5, 1.9, 0.9, 10); sb.rotation.z = s * 0.15; });
    if (fh === 'mustache' || fh === 'beard' || fh === 'goatee') [-1, 1].forEach(s => { const m = sph(H, 0.038, hairMat, s * 0.032, -0.066, -0.19, 1.25, 0.55, 0.7, 12); m.rotation.z = s * -0.2; });
    if (fh === 'goatee') sph(H, 0.04, hairMat, 0, -0.14, -0.15, 0.9, 1.3, 0.8, 12);
    if (fh === 'beard') {
      const b = put(H, new THREE.SphereGeometry(0.22, 32, 16, 0, Math.PI * 2, Math.PI * 0.6, Math.PI * 0.4), hairMat); b.scale.set(0.98, 1.0, 1.02); b.position.set(0, -0.035, -0.008);   // a neat chibi beard below the smile
      sph(H, 0.06, hairMat, 0, -0.165, -0.12, 1.15, 0.8, 0.75, 14);
    }

    // hair (front cap + back cap cover the scalp; styles add volume)
    const hs = look.hairStyle;
    if (hs !== 'bald') {
      const R = hs === 'buzz' ? 0.212 : 0.222;
      const front = put(H, new THREE.SphereGeometry(R, 32, 14, Math.PI, Math.PI, 0, Math.PI * 0.32), hairMat); front.position.y = 0.01;
      const back = put(H, new THREE.SphereGeometry(R, 32, 18, 0, Math.PI, 0, Math.PI * (hs === 'buzz' ? 0.62 : 0.8)), hairMat); back.position.y = 0.01; back.scale.set(1, 1.04, 1.03);
      if (hs === 'short' && look.hat === 'none') { [-1, 1].forEach(s => sph(H, 0.07, hairMat, s * 0.1, 0.17, -0.12, 1, 0.6, 0.7, 12)); sph(H, 0.09, hairMat, 0, 0.19, -0.1, 1.3, 0.6, 0.7, 12); }
      if (hs === 'wavy') { for (let i = 0; i < 8; i++) { const a = (i / 7) * Math.PI; sph(H, 0.07, hairMat, Math.cos(a) * 0.17, 0.13 + Math.sin(i * 2.1) * 0.03, Math.sin(a) * 0.17 + 0.03, 1, 0.85, 1, 10); } [-0.1, 0, 0.1].forEach((x, i) => sph(H, 0.065, hairMat, x, 0.2, -0.06 + (i % 2) * 0.03, 1, 0.8, 1, 10)); }
      if (hs === 'ponytail') {
        const pts = [new THREE.Vector3(0, 0.1, 0.2), new THREE.Vector3(0, 0.02, 0.32), new THREE.Vector3(0, -0.09, 0.35), new THREE.Vector3(0, -0.2, 0.31)];   // shorter on the chibi head
        put(H, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.055, 10, false), hairMat);
        sph(H, 0.06, hairMat, 0, -0.21, 0.31, 0.85, 1.2, 0.85, 10);
        const tie = put(H, new THREE.TorusGeometry(0.058, 0.014, 6, 12), mat(LC('hat'), 0.5), 0, 0.09, 0.205); tie.rotation.x = 0.9;
        [-1, 1].forEach(s => sph(H, 0.04, hairMat, s * 0.17, 0.06, -0.08, 0.7, 1.2, 0.7, 10));
      }
      if (hs === 'long') {
        const pts = []; for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([0.215 + 0.03 * Math.sin(t * 2.4), 0.04 - t * 0.3]); }   // shoulder length on the big head
        const mesh = lathe(H, pts, mat(hairMat.color, 0.65, 0, { side: THREE.DoubleSide }), 28, 1.0);
        mesh.geometry.dispose(); mesh.geometry = new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), 28, 0, Math.PI); mesh.position.z = 0.02; mesh.rotation.y = -Math.PI / 2;
        [-1, 1].forEach(s => { const lock = sph(H, 0.055, hairMat, s * 0.19, -0.1, -0.03, 0.8, 2.3, 0.9, 12); });
      }
      if (hs === 'bob') { const bobM = put(H, new THREE.SphereGeometry(0.235, 30, 18, 0, Math.PI, 0, Math.PI * 0.78), mat(hairMat.color, 0.65)); bobM.scale.set(1.04, 0.85, 1.02); bobM.position.set(0, -0.04, 0.02); [-1, 1].forEach(s => sph(H, 0.04, hairMat, s * 0.2, -0.05, -0.04, 0.8, 1.6, 0.8, 10)); }
      if (hs === 'bun') { sph(H, 0.085, hairMat, 0, 0.24, 0.07, 1, 0.9, 1, 16); const t = put(H, new THREE.TorusGeometry(0.07, 0.014, 6, 14), mat(LC('hat'), 0.5), 0, 0.2, 0.07); t.rotation.x = Math.PI / 2; }
      if (hs === 'braid') {
        for (let i = 0; i < 6; i++) sph(H, 0.045 - i * 0.002, hairMat, 0.17 + i * 0.012, -0.03 - i * 0.055, -0.02 + (i % 2 ? 0.012 : -0.012), 1, 1.2, 1, 10);
        sph(H, 0.03, mat(LC('hat'), 0.5), 0.24, -0.33, -0.02, 1, 1, 1, 8);
      }
      // v9.1.0 styles
      const capOK = look.hat === 'none' || look.hat === 'flowers';
      if (hs === 'spiky' && capOK) for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2, rr = i % 2 ? 0.09 : 0.14; const c = put(H, new THREE.ConeGeometry(0.05, 0.13, 8), hairMat, Math.cos(a) * rr, 0.22, Math.sin(a) * rr + 0.02); c.rotation.set(Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6); }
      if (hs === 'afro') { sph(H, 0.27, hairMat, 0, 0.15, 0.1, 1.08, 0.92, 0.9, 24); for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; if (Math.sin(a) < -0.35) continue; sph(H, 0.09, hairMat, Math.cos(a) * 0.25, 0.12 + (i % 3) * 0.05, Math.sin(a) * 0.22 + 0.1, 1, 1, 1, 10); } sph(H, 0.1, hairMat, 0, 0.24, -0.08, 1.6, 0.7, 0.9, 12); }   // high and back, so the face stays clear
      if (hs === 'twintails') [-1, 1].forEach(sx => {
        const pts = [new THREE.Vector3(sx * 0.19, 0.1, 0.06), new THREE.Vector3(sx * 0.29, 0.03, 0.08), new THREE.Vector3(sx * 0.31, -0.1, 0.07), new THREE.Vector3(sx * 0.27, -0.21, 0.05)];
        put(H, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, 0.05, 10, false), hairMat);
        sph(H, 0.055, hairMat, sx * 0.27, -0.22, 0.05, 0.9, 1.15, 0.9, 10);
        sph(H, 0.022, mat(LC('hat'), 0.5), sx * 0.2, 0.1, 0.06, 1.3, 1.3, 1.3, 8);
      });
      if (hs === 'mohawk' && capOK) for (let i = 0; i < 6; i++) sph(H, 0.06, hairMat, 0, 0.2 + Math.sin(i / 5 * Math.PI) * 0.04, -0.15 + i * 0.065, 0.45, 1.5, 0.9, 10);
      if (hs === 'sidepart' && capOK) { const sw = sph(H, 0.12, hairMat, 0.06, 0.17, -0.1, 1.5, 0.6, 0.9, 14); sw.rotation.z = -0.3; sph(H, 0.08, hairMat, -0.12, 0.15, -0.08, 1, 0.7, 0.9, 12); }
      if (hs === 'pixie' && capOK) { for (let i = 0; i < 5; i++) sph(H, 0.05, hairMat, -0.12 + i * 0.06, 0.15 + (i % 2) * 0.02, -0.15, 0.9, 0.7, 0.8, 10); [-1, 1].forEach(sx => sph(H, 0.045, hairMat, sx * 0.19, 0.0, -0.06, 0.6, 1.3, 0.8, 10)); }
      // fringe (its own colour when chosen: tips and dyed bangs)
      if (look.fringe !== 'none' && hs !== 'buzz') {
        const fm = mat(LookColor.fringe(look), 0.65);
        if (look.fringe === 'full') { const fr = put(H, new THREE.SphereGeometry(0.226, 30, 10, Math.PI * 1.15, Math.PI * 0.7, Math.PI * 0.18, Math.PI * 0.2), fm); fr.position.y = 0.005; }
        else { const fr = sph(H, 0.085, fm, 0.07, 0.175, -0.15, 1.55, 0.5, 0.65, 14); fr.rotation.set(0.35, 0, -0.38); }   // a sweep across the hairline, above the brows
      }
    }

    // glasses
    if (look.glasses === 'sun') {
      [-1, 1].forEach(s => sph(H, 0.052, mat(0x0b1020, 0.15, 0.4), s * 0.08, -0.006, -0.197, 1.15, 0.86, 0.35, 16));
      put(H, new THREE.BoxGeometry(0.05, 0.012, 0.012), darkMat, 0, 0.004, -0.203);
      [-1, 1].forEach(s => put(H, new THREE.BoxGeometry(0.012, 0.012, 0.19), darkMat, s * 0.145, 0.004, -0.1));
    } else if (look.glasses === 'square') {
      [-1, 1].forEach(s => { const fr = put(H, new THREE.TorusGeometry(0.045, 0.008, 4, 4), darkMat, s * 0.08, -0.006, -0.205); fr.rotation.z = Math.PI / 4; fr.scale.set(1.15, 0.85, 1); });
      put(H, new THREE.BoxGeometry(0.03, 0.008, 0.008), darkMat, 0, 0.004, -0.207);
      [-1, 1].forEach(s => put(H, new THREE.BoxGeometry(0.008, 0.008, 0.18), darkMat, s * 0.13, 0.004, -0.12));
    } else if (look.glasses === 'round') {
      [-1, 1].forEach(s => put(H, new THREE.TorusGeometry(0.042, 0.007, 6, 20), brass, s * 0.08, -0.006, -0.205));
      put(H, new THREE.BoxGeometry(0.04, 0.008, 0.008), brass, 0, 0.004, -0.207);
      [-1, 1].forEach(s => put(H, new THREE.BoxGeometry(0.008, 0.008, 0.18), brass, s * 0.128, 0.004, -0.12));
    }

    // hats
    const hat = look.hat;
    const hatG = new THREE.Group(); H.add(hatG);
    hatG.position.y = { souwester: 0.07, cap: 0.07, captain: 0.07, flapcap: 0.06, beanie: 0.03, bucket: 0.09, straw: 0.06, bandana: 0.02, flowers: 0.16, none: 0 }[hat] || 0;
    if (hat === 'souwester') {
      lathe(hatG, [[0.001, 0.25], [0.12, 0.245], [0.205, 0.2], [0.232, 0.1], [0.235, 0.05]], hatMat, 30);
      lathe(hatG, [[0.235, 0.05], [0.29, 0.03], [0.4, -0.02]], hatMat, 30, 1.05).position.set(0, 0.0, 0.05);
      const flap = put(hatG, new THREE.CylinderGeometry(0.245, 0.34, 0.22, 18, 1, true, -Math.PI / 2, Math.PI), hatMat); flap.position.set(0, -0.08, 0.06);
      [-1, 1].forEach(s => put(hatG, new THREE.CylinderGeometry(0.006, 0.006, 0.26, 4), darkMat, s * 0.19, -0.1, -0.06).rotation.set(0.2, 0, s * -0.3));
      sph(hatG, 0.022, brass, 0, 0.255, 0, 1, 1, 1, 8);
    } else if (hat === 'cap') {
      const dome = put(hatG, new THREE.SphereGeometry(0.228, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), hatMat); dome.position.y = 0.02; dome.scale.set(1, 0.95, 1.02);
      const visor = put(hatG, new THREE.CircleGeometry(0.27, 28, Math.PI, Math.PI), new THREE.MeshStandardMaterial({ color: hatMat.color, roughness: 0.7, side: THREE.DoubleSide })); visor.geometry.rotateX(Math.PI / 2); visor.scale.set(0.85, 1, 1); visor.position.set(0, 0.035, -0.02); visor.rotation.x = 0.12;
      put(hatG, new THREE.TorusGeometry(0.226, 0.01, 6, 28), accMat, 0, 0.03, 0).rotation.x = Math.PI / 2;
      sph(hatG, 0.02, accMat, 0, 0.245, 0, 1, 1, 1, 8);
    } else if (hat === 'captain') {   // white crown, black peak, gold band and anchor badge
      const crown = lathe(hatG, [[0.001, 0.13], [0.2, 0.13], [0.26, 0.11], [0.25, 0.05], [0.22, 0.0]], mat(0xf8fafc, 0.7), 30); crown.position.y = 0.02;
      put(hatG, new THREE.TorusGeometry(0.222, 0.022, 8, 28), mat(0x111827, 0.6), 0, 0.03, 0).rotation.x = Math.PI / 2;
      put(hatG, new THREE.TorusGeometry(0.226, 0.006, 6, 28), brass, 0, 0.058, 0).rotation.x = Math.PI / 2;
      const peak = put(hatG, new THREE.CircleGeometry(0.24, 24, Math.PI, Math.PI), new THREE.MeshStandardMaterial({ color: 0x0b1020, roughness: 0.3, side: THREE.DoubleSide })); peak.geometry.rotateX(Math.PI / 2); peak.scale.set(0.8, 1, 0.75); peak.position.set(0, 0.02, -0.08); peak.rotation.x = 0.25;
      sph(hatG, 0.03, brass, 0, 0.09, -0.235, 1, 1, 0.4, 10);
    } else if (hat === 'bandana') {   // a scarf knotted at the back
      const cap = put(hatG, new THREE.SphereGeometry(0.218, 30, 14, 0, Math.PI * 2, 0, Math.PI * 0.4), hatMat); cap.scale.set(1.02, 1.02, 1.03);
      sph(hatG, 0.04, hatMat, 0, 0.06, 0.21, 1.1, 0.9, 0.8, 10);
      [-1, 1].forEach(sx => { const tail = sph(hatG, 0.035, hatMat, sx * 0.04, 0.0, 0.24, 0.6, 1.6, 0.4, 8); tail.rotation.z = sx * 0.5; });
    } else if (hat === 'flowers') {   // a crown of little flowers and leaves
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, x = Math.cos(a) * 0.2, z = Math.sin(a) * 0.2;
        if (i % 3 === 2) sph(hatG, 0.022, mat(0x16a34a, 0.8), x, 0, z, 1.6, 0.5, 0.9, 8);
        else { sph(hatG, 0.03, mat(i % 2 ? LC('hat') : LC('accent'), 0.7), x, 0.005, z, 1, 0.7, 1, 10); sph(hatG, 0.012, mat(0xfde047, 0.6), x * 1.03, 0.02, z * 1.03, 1, 1, 1, 6); } }
    } else if (hat === 'beanie') {
      const dome = put(hatG, new THREE.SphereGeometry(0.232, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.46), hatMat); dome.position.y = 0.02; dome.scale.set(1, 1.05, 1.02);
      const cuff = put(hatG, new THREE.TorusGeometry(0.225, 0.03, 10, 30), accMat, 0, 0.09, 0); cuff.rotation.x = Math.PI / 2;
      sph(hatG, 0.06, accMat, 0, 0.27, 0, 1, 1, 1, 14);
    } else if (hat === 'bucket') {
      lathe(hatG, [[0.001, 0.2], [0.17, 0.195], [0.22, 0.16], [0.24, 0.07], [0.3, 0.02], [0.36, 0.0]], hatMat, 30);
      put(hatG, new THREE.TorusGeometry(0.238, 0.012, 6, 28), accMat, 0, 0.07, 0).rotation.x = Math.PI / 2;
    } else if (hat === 'flapcap') {
      const dome = put(hatG, new THREE.SphereGeometry(0.232, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52), hatMat); dome.position.y = 0.01; dome.scale.set(1.02, 0.98, 1.03);
      const visor = put(hatG, new THREE.CircleGeometry(0.25, 24, Math.PI, Math.PI), new THREE.MeshStandardMaterial({ color: hatMat.color, roughness: 0.7, side: THREE.DoubleSide })); visor.geometry.rotateX(Math.PI / 2); visor.scale.set(0.8, 1, 0.85); visor.position.set(0, 0.02, -0.06);
      const fur = mat(0xe7e5e4, 0.95);
      [-1, 1].forEach(sx => { const flap = put(hatG, new THREE.SphereGeometry(0.11, 14, 10), hatMat, sx * 0.205, -0.1, 0.0); flap.scale.set(0.35, 1.05, 0.9); const lin = put(hatG, new THREE.SphereGeometry(0.1, 12, 8), fur, sx * 0.19, -0.1, 0.0); lin.scale.set(0.3, 1.0, 0.85); });
      put(hatG, new THREE.TorusGeometry(0.228, 0.022, 8, 28), fur, 0, 0.01, 0).rotation.x = Math.PI / 2;
    } else if (hat === 'straw') {
      const dome = put(hatG, new THREE.SphereGeometry(0.236, 30, 14, 0, Math.PI * 2, 0, Math.PI * 0.45), mat(0xe9c46a, 0.9, 0, { side: THREE.DoubleSide })); dome.position.y = 0.05; dome.scale.set(1, 0.9, 1);
      const brim = put(hatG, new THREE.CylinderGeometry(0.46, 0.46, 0.014, 34), mat(0xe9c46a, 0.9), 0, 0.055, 0); brim.scale.set(1, 1, 1.0);
      put(hatG, new THREE.TorusGeometry(0.218, 0.022, 8, 30), hatMat, 0, 0.1, 0).rotation.x = Math.PI / 2;
    }
    // v9.1.0 accessories (rigid on the chest)
    {
      const ac = look.accessory, em = mat(LC('extra'), 0.8, 0, { side: THREE.DoubleSide });
      const zf = yy => -(prof(yy).wz + 0.02);
      if (ac === 'scarf') {
        const sc = put(rig.chest, new THREE.TorusGeometry(0.075, 0.035, 10, 22), em, 0, d.neck - 0.02 * TS, -0.005); sc.rotation.x = Math.PI / 2; sc.scale.set(1.15, 1, 1); rig.parts.push(sc);
        rbox(rig.chest, 0.06, 0.13, 0.025, em, 0.05, d.neck - 0.1 * TS, zf(yNeck - 0.1 * TS) - 0.01, 0.01).rotation.z = 0.15;
      } else if (ac === 'backpack') {
        rbox(rig.chest, 0.2, 0.22, 0.09, em, 0, d.chest * 0.2, prof(yChest).wz + 0.06, 0.03);
        rbox(rig.chest, 0.15, 0.07, 0.03, mat(LC('extra').multiplyScalar(0.8), 0.8), 0, d.chest * 0.05, prof(yChest).wz + 0.115, 0.012);
        [-1, 1].forEach(sx => rbox(rig.chest, 0.025, 0.25, 0.018, mat(0x3f3f46, 0.7), sx * 0.08, d.chest * 0.25, zf(yChest + 0.05 * TS) + 0.005, 0.006));
      } else if (ac === 'necklace') {
        const nk = put(rig.chest, new THREE.TorusGeometry(0.08, 0.005, 6, 24), brass, 0, d.neck - 0.06 * TS, -0.025); nk.rotation.x = Math.PI / 2 + 0.5; rig.parts.push(nk);
        sph(rig.chest, 0.016, em, 0, d.neck - 0.115 * TS, zf(yNeck - 0.11 * TS) - 0.004, 1, 1, 0.6, 10);
      } else if (ac === 'badge') {
        const bd = put(rig.chest, new THREE.CylinderGeometry(0.025, 0.025, 0.008, 16), em, -0.07, d.chest * 0.75, zf(yChest + 0.03 * TS) - 0.008); bd.rotation.x = Math.PI / 2; rig.parts.push(bd);
        sph(rig.chest, 0.01, brass, -0.07, d.chest * 0.75, zf(yChest + 0.03 * TS) - 0.014, 1, 1, 0.5, 6);
      }
    }
    // v11.0.0: everything is baked into one skinned mesh per material look (rigid parts skinned to their bone),
    // so a character is a handful of draw calls; the painted face stays apart for the expressions
    this.bakeRig(rig, fingerBones);

    return look;
  },
};
