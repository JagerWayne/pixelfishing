/* WorldBuilder method: buildJunkModel, the junk and treasure models. Kept whole (one long method). */
import { THREE } from '../engine/three.js';

export const wbJunkStatics = {
  /* ------------------------------------------------------------------
     JUNK, FLORA & BOTTLE MODELS (anything that isn't a fish)
     Upright, roughly 1 unit tall so the catch preview frames them well.
     ------------------------------------------------------------------ */
  buildJunkModel(item, textures) {
    const g = new THREE.Group();
    const col = new THREE.Color(item.color), acc = new THREE.Color(item.accent);
    const std = (c, rough = 0.6, metal = 0.0, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: rough, metalness: metal }, extra));
    const dark = c => new THREE.Color(c).multiplyScalar(0.55);
    const lathe = (pts, mat, seg = 20) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg), mat);

    switch (item.shape) {
      case 'seaweed': {
        const bladeMat = new THREE.MeshStandardMaterial({
          color: col, side: THREE.DoubleSide, roughness: 0.55,
          emissive: item.glowing || item.id === 'sw_abyssal' ? acc : new THREE.Color(0x000000), emissiveIntensity: item.id === 'sw_abyssal' ? 0.6 : 0
        });
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.17, 0), std(0x64748b, 0.9, 0, { flatShading: true }));
        rock.scale.set(1.2, 0.7, 1); rock.position.y = -0.62;
        g.add(rock);
        const n = item.id === 'sw_kelp' ? 5 : 6;
        for (let i = 0; i < n; i++) {
          const len = 1.0 + (i % 3) * 0.18, wid = item.id === 'sw_kelp' ? 0.2 : 0.14;
          const geo = new THREE.PlaneGeometry(wid, len, 3, 16);
          const p = geo.attributes.position;
          const ph = i * 1.7;
          for (let v = 0; v < p.count; v++) {
            const y = p.getY(v) + len / 2; // 0..len
            const u = y / len;
            const taper = 1 - 0.55 * u;
            p.setX(v, p.getX(v) * taper + Math.sin(y * 3.2 + ph) * 0.09 * (0.4 + u) + Math.sin(i * 1.3) * 0.05);
            p.setZ(v, Math.cos(y * 2.6 + ph) * 0.07 * u);
          }
          geo.computeVertexNormals();
          const blade = new THREE.Mesh(geo, i % 2 ? bladeMat : std(acc, 0.55, 0, { side: THREE.DoubleSide }));
          blade.position.set((i - n / 2) * 0.1, -0.55, (i % 2 ? 0.05 : -0.05));
          blade.rotation.y = i * 0.9;
          blade.rotation.z = (i - n / 2) * 0.06;
          g.add(blade);
        }
        if (item.id === 'sw_bladder') { // poppable air bladders
          for (let i = 0; i < 7; i++) {
            const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), std(0xbef264, 0.3));
            b.position.set(Math.sin(i * 1.9) * 0.2, -0.2 + i * 0.1, Math.cos(i * 1.9) * 0.1);
            g.add(b);
          }
        }
        break;
      }
      case 'boot': {
        const leather = std(col, 0.78, 0.0, { flatShading: false });
        const sole = std(acc.clone().lerp(new THREE.Color(0x1c1917), 0.6), 0.9);
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.21, 0.78, 16, 1, true), std(col, 0.78, 0, { side: THREE.DoubleSide }));
        shaft.position.set(-0.12, 0.2, 0);
        const inside = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.19, 0.02, 16), std(0x1c1917, 0.95));
        inside.position.set(-0.12, 0.45, 0);
        const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.235, 0.025, 6, 20), std(dark(col), 0.8));
        cuff.rotation.x = Math.PI / 2; cuff.position.set(-0.12, 0.59, 0);
        const ankle = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), leather);
        ankle.scale.set(1, 0.9, 0.95); ankle.position.set(-0.1, -0.2, 0);
        const toe = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), leather);
        toe.scale.set(1.6, 0.8, 0.95); toe.position.set(0.2, -0.3, 0);
        const soleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.07, 0.4), sole);
        soleMesh.position.set(0.1, -0.44, 0);
        const heel = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.11, 0.38), sole);
        heel.position.set(-0.26, -0.5, 0);
        g.add(shaft, inside, cuff, ankle, toe, soleMesh, heel);
        for (let i = 0; i < 4; i++) { // laces
          const lace = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.025, 0.2), std(0xe7e5e4, 0.9));
          lace.position.set(0.02 + i * 0.075, -0.06 - i * 0.07, 0.0);
          lace.rotation.z = -0.5;
          g.add(lace);
        }
        const weed = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.018, 5, 12, Math.PI * 1.3), std(0x4d7c0f, 0.6));
        weed.position.set(0.1, 0.35, 0.2); weed.rotation.set(0.4, 0.8, 0.2);
        g.add(weed);
        break;
      }
      case 'can': {
        const metal = std(col, 0.35, 0.7);
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.6, 24), metal);
        const label = new THREE.Mesh(new THREE.CylinderGeometry(0.278, 0.278, 0.34, 24, 1, true), std(acc, 0.7, 0.1, { side: THREE.DoubleSide }));
        [-0.3, 0.3].forEach(y => {
          const rim = new THREE.Mesh(new THREE.TorusGeometry(0.265, 0.025, 6, 24), std(0x94a3b8, 0.3, 0.8));
          rim.rotation.x = Math.PI / 2; rim.position.y = y; g.add(rim);
        });
        for (let i = 0; i < 6; i++) { // ridges
          const ridge = new THREE.Mesh(new THREE.TorusGeometry(0.272, 0.008, 4, 24), std(0x64748b, 0.4, 0.6));
          ridge.rotation.x = Math.PI / 2; ridge.position.y = -0.24 + i * 0.1; if (Math.abs(ridge.position.y) < 0.18) continue; g.add(ridge);
        }
        const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.02, 24, 1, false, 0, Math.PI * 1.4), std(0xcbd5e1, 0.3, 0.8));
        lid.position.y = 0.3; lid.rotation.x = -0.35; lid.position.set(0, 0.31, 0.03);
        for (let i = 0; i < 5; i++) { // rust blotches
          const r = new THREE.Mesh(new THREE.SphereGeometry(0.07 + (i % 2) * 0.03, 7, 5), std(0x9a3412, 0.95));
          r.scale.set(1, 0.35, 1); const a = i * 1.3;
          r.position.set(Math.cos(a) * 0.272, -0.2 + (i % 3) * 0.16, Math.sin(a) * 0.272);
          r.lookAt(r.position.clone().multiplyScalar(3)); g.add(r);
        }
        g.add(body, label, lid);
        break;
      }
      case 'bottle': {
        const glass = new THREE.MeshStandardMaterial({
          color: item.isMessageBottle ? 0x2dd4bf : col, transparent: true, opacity: item.isMessageBottle ? 0.62 : 0.72,
          roughness: 0.12, metalness: 0.1, emissive: item.isMessageBottle ? new THREE.Color(0x0f766e) : new THREE.Color(0x000000), emissiveIntensity: 0.25
        });
        const profile = [[0.001, -0.5], [0.2, -0.49], [0.255, -0.4], [0.26, -0.1], [0.24, 0.12], [0.17, 0.26], [0.1, 0.36], [0.075, 0.46], [0.08, 0.56], [0.1, 0.6], [0.1, 0.64], [0.07, 0.64]];
        const bottle = lathe(profile, glass, 22);
        g.add(bottle);
        const shine = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.4, 0.02), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }));
        shine.position.set(-0.18, -0.08, 0.17); shine.rotation.y = 0.5; g.add(shine);
        if (item.isMessageBottle) {
          const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.062, 0.16, 12), std(0xb45309, 0.95));
          cork.position.y = 0.66;
          const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 10), std(0xfef3c7, 0.9, 0, { emissive: new THREE.Color(0xfde047), emissiveIntensity: 0.3 }));
          scroll.position.set(0.02, -0.12, 0); scroll.rotation.z = 0.2;
          const ribbon = new THREE.Mesh(new THREE.TorusGeometry(0.074, 0.012, 5, 14), std(0xdc2626, 0.7));
          ribbon.rotation.y = Math.PI / 2; ribbon.position.set(0.02, -0.12, 0); ribbon.rotation.z = 0.2;
          const sand = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45), std(0xfde68a, 0.95));
          sand.position.y = -0.5; sand.scale.set(1, 0.5, 1);
          g.add(cork, scroll, ribbon, sand);
        } else {
          const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.07, 12), std(0xe2e8f0, 0.5, 0.4));
          cap.position.y = 0.67;
          const crack = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.3, 0.01), new THREE.MeshBasicMaterial({ color: 0xffffff }));
          crack.position.set(0.12, 0.05, 0.22); crack.rotation.z = 0.5;
          g.add(cap, crack);
        }
        break;
      }
      case 'anchor': {
        const iron = std(col, 0.6, 0.5);
        const shank = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 1.15, 10), iron);
        shank.position.y = 0.02;
        const stock = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.62, 8), iron);
        stock.rotation.z = Math.PI / 2; stock.position.y = 0.42;
        [-0.31, 0.31].forEach(x => { const k = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), iron); k.position.set(x, 0.42, 0); g.add(k); });
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 8, 16), iron);
        ring.position.y = 0.66;
        // curved arms: a half circle that sweeps out from the bottom of the shank
        const arc = [];
        for (let i = 0; i <= 16; i++) { const a = Math.PI + (i / 16) * Math.PI; arc.push(new THREE.Vector3(Math.cos(a) * 0.4, Math.sin(a) * 0.32 - 0.5 + 0.32, 0)); }
        const arms = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arc), 24, 0.055, 8, false), iron);
        arms.position.y = -0.28;
        g.add(shank, stock, ring, arms);
        [-1, 1].forEach(side => { // flukes
          const sh = new THREE.Shape();
          sh.moveTo(0, 0); sh.lineTo(0.19, 0.04); sh.lineTo(0.02, 0.26); sh.closePath();
          const fluke = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.08, bevelEnabled: false }), iron);
          fluke.position.set(side * 0.4, -0.3, -0.04);
          fluke.rotation.z = side > 0 ? -0.5 : Math.PI + 0.5; fluke.scale.x = side;
          g.add(fluke);
        });
        const rope = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 6, 14, Math.PI * 1.6), std(0xa8845a, 0.95));
        rope.position.set(0.05, 0.78, 0); rope.rotation.set(0.3, 0.2, 0.5);
        g.add(rope);
        const coral = std(acc, 0.8);
        for (let i = 0; i < 9; i++) { // barnacles & coral
          const c = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 5), coral);
          c.position.set((Math.sin(i * 2.1)) * 0.07, -0.3 + i * 0.1, Math.cos(i * 2.1) * 0.07);
          c.lookAt(c.position.clone().multiplyScalar(4)); c.rotateX(Math.PI / 2); g.add(c);
        }
        break;
      }
      case 'hat': {
        const felt = std(col, 0.85), gold = std(acc, 0.3, 0.8);
        const crown = lathe([[0.001, 0.32], [0.14, 0.31], [0.25, 0.24], [0.3, 0.1], [0.3, 0.0]], felt, 18);
        crown.position.y = -0.05;
        g.add(crown);
        for (let i = 0; i < 3; i++) { // three folded-up brim flaps
          const flap = new THREE.Group();
          const sh = new THREE.Shape();
          sh.moveTo(-0.34, 0); sh.lineTo(0.34, 0); sh.lineTo(0.5, 0.52); sh.quadraticCurveTo(0, 0.62, -0.5, 0.52); sh.closePath();
          const panel = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.035, bevelEnabled: false }), felt);
          panel.rotation.x = Math.PI / 2 + 0.5; // extend outward, tilt up
          panel.position.set(0, -0.04, 0.2);
          const trim = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.025, 0.04), gold);
          trim.position.set(0, 0.25, 0.7); trim.rotation.x = 0.55 - 0.1;
          flap.add(panel);
          flap.rotation.y = (i * Math.PI * 2) / 3;
          g.add(flap);
        }
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 6, 22), gold);
        band.rotation.x = Math.PI / 2; band.position.y = 0.0; g.add(band);
        const skull = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), std(0xf8fafc, 0.6));
        skull.position.set(0, 0.12, 0.3); g.add(skull);
        const feather = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-0.2, 0.2, 0.2), new THREE.Vector3(-0.35, 0.45, 0.15), new THREE.Vector3(-0.5, 0.5, 0.0)]), 8, 0.02, 5, false), std(0xdc2626, 0.7));
        g.add(feather);
        g.position.y = -0.1;
        break;
      }
      case 'box': {
        const wood = std(col, 0.85), iron = std(0x334155, 0.5, 0.6), brass = std(acc, 0.3, 0.8);
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.46, 0.62), wood);
        base.position.y = -0.1;
        const lidGeo = new THREE.CylinderGeometry(0.31, 0.31, 0.95, 16, 1, false, 0, Math.PI);
        lidGeo.rotateZ(Math.PI / 2); lidGeo.rotateY(Math.PI / 2);
        const lid = new THREE.Mesh(lidGeo, wood);
        lid.rotation.y = Math.PI / 2 * 0; lid.rotation.x = 0;
        lid.position.y = 0.13; lid.rotation.z = 0;
        lid.rotation.set(0, 0, 0);
        lid.rotateY(-Math.PI / 2); lid.rotateX(0);
        g.add(base, lid);
        [-0.3, 0, 0.3].forEach(x => { // iron straps over body & lid
          const strapB = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.48, 0.64), iron); strapB.position.set(x, -0.1, 0);
          const strapL = new THREE.Mesh(new THREE.CylinderGeometry(0.325, 0.325, 0.07, 16, 1, false, 0, Math.PI), iron);
          strapL.rotation.z = Math.PI / 2; strapL.rotation.y = 0; strapL.position.set(x, 0.13, 0);
          strapL.rotation.set(Math.PI / 2, 0, Math.PI / 2);
          g.add(strapB, strapL);
          [-0.25, 0.25].forEach(z => { const rv = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 5), brass); rv.position.set(x, -0.1 + 0.15, z * 1.25); g.add(rv); });
        });
        const lock = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.17, 0.05), brass);
        lock.position.set(0, 0.05, 0.33);
        const key = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.05, 8), new THREE.MeshBasicMaterial({ color: 0x1c1917 }));
        key.rotation.x = Math.PI / 2; key.position.set(0, 0.05, 0.36);
        g.add(lock, key);
        [[-0.47, -0.31], [0.47, -0.31], [-0.47, 0.31], [0.47, 0.31]].forEach(([x, z]) => { // corner brackets
          const cb = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.5, 0.07), brass); cb.position.set(x, -0.1, z); g.add(cb);
        });
        g.rotation.y = 0.5;
        break;
      }
      default: break;
    }
    return g;
  },
};
