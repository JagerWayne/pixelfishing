/* WorldBuilder method: buildFishModel, the lofted fish generator. Kept whole (one long method). */
import { THREE } from '../engine/three.js';

export const wbFishStatics = {
  buildFishModel(item, textures) {
    const spec = this.fishSpec(item);
    const isGlowing = !!item.glowing;
    const mix = (a, b, f) => new THREE.Color(a).lerp(new THREE.Color(b), f);
    const back = new THREE.Color(item.color);
    const belly = spec.bellyColor ? new THREE.Color(spec.bellyColor) : mix(item.color, '#ffffff', 0.55);
    const finBase = new THREE.Color(spec.finColor || item.accent);
    const finTip = mix(finBase, '#ffffff', 0.35);

    const bodyMat = new THREE.MeshStandardMaterial({
      vertexColors: true, map: textures.scales, roughness: isGlowing ? 0.25 : 0.42, metalness: 0.18,
      emissive: isGlowing ? new THREE.Color(item.color) : new THREE.Color(0x000000), emissiveIntensity: isGlowing ? 0.55 : 0
    });
    const finMat = new THREE.MeshStandardMaterial({
      vertexColors: true, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.0,
      emissive: isGlowing ? new THREE.Color(item.accent) : new THREE.Color(0x000000), emissiveIntensity: isGlowing ? 0.5 : 0
    });
    const darkMat = new THREE.MeshBasicMaterial({ color: 0x0b1020 });

    const { L, H, W } = spec;
    const env = (t, peak, q, ped) => {
      const a = Math.log(0.5) / Math.log(peak);
      const bump = Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(t, a))), q);
      return ped + (1 - ped) * bump;
    };
    const hAt = t => H * env(t, spec.peak, spec.noseQ, spec.ped);
    const wAt = t => W * env(t, spec.peak, spec.noseQ * 0.9, spec.ped);
    const bendAt = t => spec.bend * Math.sin(t * spec.bendFreq * Math.PI * 2 + 0.6) * (0.35 + 0.65 * (1 - t));
    const xAt = t => (t - 0.5) * L;
    const topY = t => bendAt(t) + hAt(t);
    const botY = t => bendAt(t) - hAt(t) * spec.belly;

    const group = new THREE.Group();
    const inner = new THREE.Group();
    group.add(inner);

    // ---------- body ----------
    const NS = 48, NR = 24;   // v3.9: smoother body and cleaner pattern edges
    const pos = [], col = [], uvs = [], idx = [];
    const tmp = new THREE.Color();
    for (let i = 0; i <= NS; i++) {
      const t = i / NS;
      const h = hAt(t), w = wAt(t), yo = bendAt(t);
      for (let j = 0; j <= NR; j++) {
        const ang = (j / NR) * Math.PI * 2;
        const cy = Math.sin(ang), cz = Math.cos(ang);
        pos.push(xAt(t), yo + cy * h * (cy < 0 ? spec.belly : 1), cz * w);
        // countershading: dark back -> light belly
        const bf = THREE.MathUtils.smoothstep(-cy, -0.05, 0.55);
        tmp.copy(back).lerp(belly, bf);
        if (cy > 0.55) tmp.multiplyScalar(0.9);
        for (const b of spec.bands) {
          if (t >= b.t0 && t <= b.t1 && cy >= b.cy0 && cy <= b.cy1) tmp.set(b.color);
        }
        col.push(tmp.r, tmp.g, tmp.b);
        uvs.push((j / NR) * 10, t * 17);
      }
    }
    for (let i = 0; i < NS; i++) {
      for (let j = 0; j < NR; j++) {
        const a = i * (NR + 1) + j, b = a + NR + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const bodyGeo = new THREE.BufferGeometry();
    bodyGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    bodyGeo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    bodyGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    bodyGeo.setIndex(idx);
    bodyGeo.computeVertexNormals();
    const nrm = bodyGeo.attributes.normal;
    for (let i = 0; i <= NS; i++) { // close the shading seam
      const a = i * (NR + 1), b = a + NR;
      const nx = nrm.getX(a) + nrm.getX(b), ny = nrm.getY(a) + nrm.getY(b), nz = nrm.getZ(a) + nrm.getZ(b);
      const l = Math.hypot(nx, ny, nz) || 1;
      nrm.setXYZ(a, nx / l, ny / l, nz / l); nrm.setXYZ(b, nx / l, ny / l, nz / l);
    }
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    inner.add(body);
    // v3.9: a gill-cover arc and a lateral line, laid just above the skin on both sides
    {
      const onSkin = (t, cy, side, lift = 1.025) => {
        const h = hAt(t), w = wAt(t), cz = Math.sqrt(Math.max(0, 1 - cy * cy)) * side;
        return new THREE.Vector3(xAt(t), bendAt(t) + cy * h * (cy < 0 ? spec.belly : 1) * lift, cz * w * lift);
      };
      const gillMat = new THREE.MeshBasicMaterial({ color: back.clone().multiplyScalar(0.45) });
      const lineMat = new THREE.MeshBasicMaterial({ color: back.clone().lerp(belly, 0.55) });
      const tube = H * 0.025 + 0.004;
      [-1, 1].forEach(side => {
        const gill = [];
        for (let k = 0; k <= 8; k++) { const cy = -0.55 + k / 8 * 1.1; gill.push(onSkin(0.78 - 0.03 * (1 - Math.abs(cy)), cy, side)); }
        inner.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(gill), 12, tube, 4, false), gillMat));
        const lat = [];
        for (let k = 0; k <= 12; k++) { const t = 0.12 + k / 12 * 0.62; lat.push(onSkin(t, 0.12 + 0.12 * Math.sin(t * Math.PI), side)); }
        inner.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lat), 20, tube * 0.6, 3, false), lineMat));
      });
    }
    // tail cap
    {
      const capPos = [], capIdx = [];
      const t = 0, h = hAt(t), w = wAt(t), yo = bendAt(t);
      capPos.push(xAt(t), yo, 0);
      for (let j = 0; j <= NR; j++) {
        const ang = (j / NR) * Math.PI * 2, cy = Math.sin(ang), cz = Math.cos(ang);
        capPos.push(xAt(t), yo + cy * h * (cy < 0 ? spec.belly : 1), cz * w);
      }
      for (let j = 1; j <= NR; j++) capIdx.push(0, j, j + 1);
      const cg = new THREE.BufferGeometry();
      cg.setAttribute('position', new THREE.Float32BufferAttribute(capPos, 3));
      const cc = []; for (let k = 0; k < capPos.length / 3; k++) cc.push(back.r * 0.8, back.g * 0.8, back.b * 0.8);
      cg.setAttribute('color', new THREE.Float32BufferAttribute(cc, 3));
      cg.setIndex(capIdx); cg.computeVertexNormals();
      inner.add(new THREE.Mesh(cg, new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.6 })));
    }

    // ---------- fin helpers ----------
    const gradColor = (g, axisFn) => {
      const p = g.attributes.position, cs = [];
      let maxD = 0.0001;
      for (let k = 0; k < p.count; k++) maxD = Math.max(maxD, axisFn(p.getX(k), p.getY(k)));
      for (let k = 0; k < p.count; k++) {
        const f = Math.min(1, axisFn(p.getX(k), p.getY(k)) / maxD);
        tmp.copy(finBase).lerp(finTip, f);
        // fin rays: thin darker lines fanning out from the root
        const ray = 0.86 + 0.14 * Math.abs(Math.cos(Math.atan2(p.getY(k), p.getX(k)) * 9));
        tmp.multiplyScalar(f > 0.08 ? ray : 1);
        cs.push(tmp.r, tmp.g, tmp.b);
      }
      g.setAttribute('color', new THREE.Float32BufferAttribute(cs, 3));
    };
    const addShapeFin = (shape, setup) => {
      const g = new THREE.ShapeGeometry(shape, 10);
      gradColor(g, (x, y) => Math.hypot(x, y));
      const m = new THREE.Mesh(g, finMat);
      setup(m);
      inner.add(m);
      return m;
    };
    // Ribbon fins that follow the body outline (dorsal / anal / fringes / sails)
    const addRibbon = (f, onTop) => {
      const n = 16, p = [], c = [], ix = [];
      for (let k = 0; k <= n; k++) {
        const u = k / n;
        const t = f.t0 + (f.t1 - f.t0) * u;
        const shape = f.spiky
          ? (0.55 + 0.45 * Math.abs(Math.sin(u * Math.PI * (n * 0.5)))) * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 0.6)
          : Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(u, Math.log(0.5) / Math.log(f.front)))), 0.8);
        const fh = f.h * Math.max(0.12, shape);
        const x = xAt(t), by = onTop ? topY(t) - 0.015 : botY(t) + 0.015;
        const dir = onTop ? 1 : -1;
        p.push(x, by, 0, x - f.sweep * fh * 0.5, by + dir * fh, 0);
        tmp.copy(finBase); c.push(tmp.r, tmp.g, tmp.b);
        tmp.copy(finTip); c.push(tmp.r, tmp.g, tmp.b);
        if (k < n) { const a = k * 2; ix.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
      g.setIndex(ix); g.computeVertexNormals();
      inner.add(new THREE.Mesh(g, finMat));
    };

    // ---------- caudal fin ----------
    {
      const s = spec.caudal.size, pedH = hAt(0) * 0.9 + 0.01;
      const sh = new THREE.Shape();
      switch (spec.caudal.type) {
        case 'lunate':
          sh.moveTo(0, pedH * 0.6);
          sh.bezierCurveTo(-s * 0.4, s * 0.3, -s * 0.8, s * 0.9, -s * 1.15, s * 1.05);
          sh.bezierCurveTo(-s * 0.75, s * 0.45, -s * 0.55, s * 0.12, -s * 0.5, 0);
          sh.bezierCurveTo(-s * 0.55, -s * 0.12, -s * 0.75, -s * 0.45, -s * 1.15, -s * 1.05);
          sh.bezierCurveTo(-s * 0.8, -s * 0.9, -s * 0.4, -s * 0.3, 0, -pedH * 0.6);
          break;
        case 'round':
          sh.moveTo(0, pedH * 0.6);
          sh.bezierCurveTo(-s * 0.5, s * 0.75, -s * 1.1, s * 0.5, -s * 1.1, 0);
          sh.bezierCurveTo(-s * 1.1, -s * 0.5, -s * 0.5, -s * 0.75, 0, -pedH * 0.6);
          break;
        case 'square':
          sh.moveTo(0, pedH * 0.8);
          sh.bezierCurveTo(-s * 0.4, s * 0.5, -s * 0.9, s * 0.7, -s * 0.95, s * 0.5);
          sh.lineTo(-s * 0.95, -s * 0.5);
          sh.bezierCurveTo(-s * 0.9, -s * 0.7, -s * 0.4, -s * 0.5, 0, -pedH * 0.8);
          break;
        default: // fork
          sh.moveTo(0, pedH * 0.6);
          sh.bezierCurveTo(-s * 0.3, s * 0.35, -s * 0.7, s * 0.8, -s * 1.0, s * 0.9);
          sh.bezierCurveTo(-s * 0.75, s * 0.4, -s * 0.6, s * 0.12, -s * 0.55, 0);
          sh.bezierCurveTo(-s * 0.6, -s * 0.12, -s * 0.75, -s * 0.4, -s * 1.0, -s * 0.9);
          sh.bezierCurveTo(-s * 0.7, -s * 0.8, -s * 0.3, -s * 0.35, 0, -pedH * 0.6);
      }
      addShapeFin(sh, m => m.position.set(xAt(0) + 0.01, bendAt(0), 0));
    }

    // ---------- dorsal / anal ----------
    spec.dorsal.forEach(f => addRibbon(f, true));
    spec.anal.forEach(f => addRibbon(f, false));

    // finlets (tuna, marlin, wahoo)
    for (let k = 0; k < spec.finlets; k++) {
      const t = 0.1 + k * 0.028;
      [[true, topY(t)], [false, botY(t)]].forEach(([top, y]) => {
        const d = top ? 1 : -1;
        const g = new THREE.BufferGeometry();
        const x = xAt(t);
        g.setAttribute('position', new THREE.Float32BufferAttribute([x, y, 0, x - 0.05, y, 0, x - 0.045, y + d * 0.07, 0], 3));
        g.setAttribute('color', new THREE.Float32BufferAttribute([finBase.r, finBase.g, finBase.b, finBase.r, finBase.g, finBase.b, finTip.r, finTip.g, finTip.b], 3));
        g.setIndex([0, 1, 2]); g.computeVertexNormals();
        inner.add(new THREE.Mesh(g, finMat));
      });
    }

    // ---------- pectoral & pelvic ----------
    const leaf = (s, ratio) => {
      const sh = new THREE.Shape();
      sh.moveTo(0, 0.01);
      sh.bezierCurveTo(-s * 0.2, s * 0.36 * ratio, -s * 0.8, s * 0.32 * ratio, -s, -s * 0.12);
      sh.bezierCurveTo(-s * 0.7, -s * 0.2 * ratio, -s * 0.3, -s * 0.24 * ratio, 0, -0.01);
      return sh;
    };
    if (spec.pectoral.size > 0) {
      const pf = spec.pectoral, t = pf.t, y = bendAt(t) + hAt(t) * pf.y;
      [-1, 1].forEach(side => {
        if (pf.fan) {
          for (let k = 0; k < 7; k++) { // lionfish feathery fan
            const sh = leaf(pf.size * (0.7 + 0.3 * Math.sin(k * 0.9)), 0.25);
            addShapeFin(sh, m => {
              m.position.set(xAt(t), y, side * wAt(t) * 0.9);
              m.rotation.y = side * (0.5 + k * 0.1);
              m.rotation.z = -0.5 + k * 0.17;
            });
          }
        } else {
          addShapeFin(leaf(pf.size, pf.ratio), m => {
            m.position.set(xAt(t), y, side * wAt(t) * 0.92);
            m.rotation.y = side * 0.55;
            m.rotation.z = -0.15;
          });
        }
      });
    }
    if (spec.pelvic.size > 0) {
      const pf = spec.pelvic, t = pf.t, y = botY(t) + 0.02;
      [-1, 1].forEach(side => {
        addShapeFin(leaf(pf.size, 0.8), m => {
          m.position.set(xAt(t), y, side * wAt(t) * 0.5);
          m.rotation.y = side * 0.4;
          m.rotation.z = -0.55;
        });
      });
    }

    // ---------- head features ----------
    // eyes
    {
      const e = spec.eye, t = e.t, ey = bendAt(t) + hAt(t) * e.y, ew = wAt(t);
      const scl = new THREE.MeshStandardMaterial({ color: spec.flatEyes ? 0xfde68a : 0xf8fafc, roughness: 0.2 });
      const irisMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(item.accent).lerp(new THREE.Color(0xfbbf24), 0.5), roughness: 0.3 });
      const sides = spec.flatEyes ? [1, 1] : [-1, 1];
      sides.forEach((side, k) => {
        const ex = xAt(t) + (spec.flatEyes ? (k ? -0.12 : 0) : 0);
        const eyeG = new THREE.Group();
        const ball = new THREE.Mesh(new THREE.SphereGeometry(e.r, 12, 10), scl);
        const iris = new THREE.Mesh(new THREE.SphereGeometry(e.r * 0.78, 10, 8), irisMat);
        iris.position.z = e.r * 0.28;
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(e.r * 0.5, 8, 8), darkMat);
        pupil.position.z = e.r * 0.62;
        const glint = new THREE.Mesh(new THREE.SphereGeometry(e.r * 0.16, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        glint.position.set(e.r * 0.2, e.r * 0.25, e.r * 0.86);
        eyeG.add(ball, iris, pupil, glint);
        eyeG.position.set(ex, ey, side * (ew * 0.86 + e.r * 0.25 + (spec.flatEyes ? k * 0.0 : 0)));
        eyeG.rotation.y = side > 0 ? 0.0 : Math.PI;
        inner.add(eyeG);
      });
    }
    // gill cover
    if (spec.gill) {
      const t = Math.min(0.88, spec.eye.t - 0.1);
      [-1, 1].forEach(side => {
        if (spec.flatEyes && side < 0) return;
        const arc = new THREE.Mesh(new THREE.TorusGeometry(hAt(t) * 0.62, 0.011, 5, 14, Math.PI), darkMat);
        arc.position.set(xAt(t), bendAt(t) + hAt(t) * 0.02, side * wAt(t) * 0.97);
        arc.rotation.z = Math.PI / 2;
        arc.scale.set(0.55, 1, 1);
        inner.add(arc);
      });
    }
    // mouth line: a thin dark tube hugging the face from the nose back along each side
    {
      const t0 = Math.max(0.7, 1 - spec.mouth / L);
      [-1, 1].forEach(side => {
        if (spec.flatEyes && side < 0) return;
        const pts = [];
        for (let k = 0; k <= 8; k++) {
          const t = t0 + (0.995 - t0) * (k / 8);
          pts.push(new THREE.Vector3(xAt(t), bendAt(t) - hAt(t) * 0.14, side * wAt(t) * 0.99));
        }
        inner.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.008, 4, false), darkMat));
      });
    }
    // spines (puffer, leviathan)
    if (spec.spines > 0) {
      const sp = [], si = [];
      const R = spec.spineLen * 0.35;
      let seed = 7;
      const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      for (let k = 0; k < spec.spines; k++) {
        const t = 0.18 + rnd() * 0.7, ang = rnd() * Math.PI * 2;
        const cy = Math.sin(ang), cz = Math.cos(ang);
        const bx = xAt(t), by = bendAt(t) + cy * hAt(t) * (cy < 0 ? spec.belly : 1), bz = cz * wAt(t);
        const nx = 0.0, ny = cy * 1.0, nz = cz * 1.0;
        const nl = Math.hypot(nx, ny, nz) || 1;
        const dx = nx / nl, dy = ny / nl, dz = nz / nl;
        const n0 = sp.length / 3;
        // base triangle perpendicular-ish to the normal
        const ax = 1, ay = 0, az = 0;
        const bxv = dy * az - dz * ay, byv = dz * ax - dx * az, bzv = dx * ay - dy * ax;
        const bl = Math.hypot(bxv, byv, bzv) || 1;
        const ux = bxv / bl, uy = byv / bl, uz = bzv / bl;
        sp.push(bx + ax * R, by + ay * R, bz + az * R);
        sp.push(bx - ax * R * 0.5 + ux * R, by - ay * R * 0.5 + uy * R, bz - az * R * 0.5 + uz * R);
        sp.push(bx - ax * R * 0.5 - ux * R, by - ay * R * 0.5 - uy * R, bz - az * R * 0.5 - uz * R);
        sp.push(bx + dx * spec.spineLen, by + dy * spec.spineLen, bz + dz * spec.spineLen);
        si.push(n0, n0 + 1, n0 + 2, n0, n0 + 3, n0 + 1, n0 + 1, n0 + 3, n0 + 2, n0 + 2, n0 + 3, n0);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
      g.setIndex(si); g.computeVertexNormals();
      inner.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: mix(item.accent, '#fef3c7', 0.4), roughness: 0.5, side: THREE.DoubleSide })));
    }
    // bill (marlin / swordfish / goblin shark)
    if (spec.bill > 0) {
      const billMat = new THREE.MeshStandardMaterial({ color: mix(item.color, '#0f172a', 0.45), roughness: 0.4, metalness: 0.2 });
      const bg = new THREE.ConeGeometry(0.045, spec.bill, 8);
      bg.rotateZ(-Math.PI / 2);
      bg.translate(xAt(1) + spec.bill / 2 - 0.02, bendAt(1), 0);
      inner.add(new THREE.Mesh(bg, billMat));
    }
    // teeth
    if (spec.teeth > 0) {
      const toothMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
      for (let k = 0; k < spec.teeth; k++) {
        const u = k / Math.max(1, spec.teeth - 1);
        const t = 1 - (0.02 + u * (spec.mouth / L) * 0.95);
        [-1, 1].forEach(side => {
          if (spec.flatEyes && side < 0) return;
          [1, -1].forEach(row => {
            const tg = new THREE.ConeGeometry(0.012, 0.06, 4);
            const tm = new THREE.Mesh(tg, toothMat);
            tm.position.set(xAt(t), bendAt(t) - hAt(t) * 0.12 + row * 0.015, side * wAt(t) * 0.86);
            tm.rotation.x = row > 0 ? Math.PI : 0;
            inner.add(tm);
          });
        });
      }
    }
    // anglerfish lure
    if (spec.lure) {
      const t = 0.82;
      const base = new THREE.Vector3(xAt(t), topY(t), 0);
      const curve = new THREE.CatmullRomCurve3([base, base.clone().add(new THREE.Vector3(0.14, 0.2, 0)), base.clone().add(new THREE.Vector3(0.36, 0.28, 0)), base.clone().add(new THREE.Vector3(0.46, 0.14, 0))]);
      inner.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.012, 5, false), new THREE.MeshStandardMaterial({ color: mix(item.color, '#0f172a', 0.4) })));
      const tip = curve.getPoint(1);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshBasicMaterial({ color: 0x7dd3fc }));
      bulb.position.copy(tip);
      const halo = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.28, depthWrite: false }));
      halo.position.copy(tip);
      inner.add(bulb, halo);
    }
    // chin barbel (viperfish / dragonfish)
    if (spec.barbel) {
      const base = new THREE.Vector3(xAt(0.96), botY(0.96), 0);
      const curve = new THREE.CatmullRomCurve3([base, base.clone().add(new THREE.Vector3(0.04, -0.2, 0)), base.clone().add(new THREE.Vector3(-0.08, -0.38, 0))]);
      inner.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.008, 4, false), new THREE.MeshBasicMaterial({ color: 0x1f2937 })));
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(item.accent) }));
      bulb.position.copy(curve.getPoint(1));
      inner.add(bulb);
    }
    // oarfish-style crest
    if (spec.crest) {
      for (let k = 0; k < 8; k++) {
        const t = 0.88 - k * 0.012;
        const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.28 - k * 0.012, 4), new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 }));
        tuft.position.set(xAt(t), topY(t) + 0.1, 0);
        tuft.rotation.z = 0.5;
        inner.add(tuft);
      }
    }

    // ---------- normalise so every species fits the catch preview ----------
    const box = new THREE.Box3().setFromObject(inner);
    const size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
    const s = Math.min(spec.target / Math.max(0.01, size.x), 1.35 / Math.max(0.01, size.y), 1.35 / Math.max(0.01, size.z * 1.5));
    inner.position.set(-ctr.x * s, -ctr.y * s, -ctr.z * s);
    inner.scale.setScalar(s);
    return group;
  },
};
