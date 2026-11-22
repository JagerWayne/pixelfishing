/* WorldBuilder methods: the recycling stand and the cabin. */
import { THREE } from '../engine/three.js';
import { PixelTextureFactory } from '../render/texture-factory.js';
import { CABIN } from './layout.js';

export const wbCabinStatics = {
  /* ------------------------------------------------------------------
     RECYCLING STAND (v4.9.0): three coloured skips (flora, metal, other) under a post sign. Origin on the
     boardwalk rail at the stand's centre; the front faces +Z like every stand.
     ------------------------------------------------------------------ */
  buildRecycleStand(textures) {
    const g = new THREE.Group(), K = this.propKit(textures);
    const label = (name, css) => {
      const c = document.createElement('canvas'); c.width = 256; c.height = 96; const x = c.getContext('2d');
      x.fillStyle = '#f8fafc'; x.fillRect(0, 0, 256, 96); x.strokeStyle = css; x.lineWidth = 8; x.strokeRect(4, 4, 248, 88);
      x.fillStyle = css; x.font = 'bold 54px "Courier New", monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(name, 128, 52);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    };
    [['FLORA', 0x16a34a, '#15803d'], ['METAL', 0x2563eb, '#1d4ed8'], ['OTHER', 0xeab308, '#a16207']].forEach(([name, col, css], i) => {
      const x = (i - 1) * 1.5, body = K.M(col, 0.55, 0.15), dark = K.M(0x111827, 0.6);
      K.box(g, 1.4, 0.06, 0.9, body, x, 0.16, 0.75);
      K.box(g, 1.4, 0.82, 0.06, body, x, 0.57, 1.17);
      K.box(g, 1.4, 0.82, 0.06, body, x, 0.57, 0.33);
      [-0.67, 0.67].forEach(sx => K.box(g, 0.06, 0.82, 0.9, body, x + sx, 0.57, 0.75));
      K.box(g, 1.48, 0.06, 0.06, dark, x, 0.99, 1.18); K.box(g, 1.48, 0.06, 0.06, dark, x, 0.99, 0.32);
      [-0.69, 0.69].forEach(sx => K.box(g, 0.06, 0.06, 0.92, dark, x + sx, 0.99, 0.75));
      [-0.5, 0.5].forEach(sx => K.box(g, 0.14, 0.12, 0.96, dark, x + sx, 0.06, 0.75));
      const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.375), new THREE.MeshBasicMaterial({ map: label(name, css) })); plate.position.set(x, 0.6, 1.205); g.add(plate);
      // a heap in each skip
      if (i === 0) [[-0.35, 0, 0x15803d], [0.05, 0.1, 0x22c55e], [0.4, -0.05, 0x166534], [-0.1, -0.15, 0x4ade80]].forEach(([dx, dz, c]) => { const s = K.sph(g, 0.22, K.M(c, 0.8), x + dx, 0.98, 0.75 + dz, 7, 5); s.scale.y = 0.55; });
      else if (i === 1) [[-0.4, 0.05], [-0.05, -0.1], [0.3, 0.1]].forEach(([dx, dz], k) => { K.cyl(g, 0.09, 0.09, 0.2, K.M(0xcbd5e1, 0.35, 0.7), x + dx, 1.0, 0.75 + dz, 10).rotation.z = k * 0.6; });
      else [[-0.4, 0.0, 0x7c4a1e], [0.0, 0.1, 0x57534e], [0.38, -0.05, 0x16a34a]].forEach(([dx, dz, c]) => K.box(g, 0.3, 0.2, 0.22, K.M(c, 0.8), x + dx, 0.98, 0.75 + dz).rotation.y = dx * 2);
    });
    // post sign with a lamp
    [-2.25, 2.25].forEach(sx => K.cyl(g, 0.07, 0.08, 2.5, K.darkWood, sx, 1.25, 0.2, 8));
    K.box(g, 4.7, 0.62, 0.08, new THREE.MeshBasicMaterial({ map: PixelTextureFactory.makeSignTexture('♻️ RECYCLING', 512, 96) }), 0, 2.55, 0.22);
    K.box(g, 4.84, 0.76, 0.05, K.darkWood, 0, 2.55, 0.17);
    K.box(g, 4.9, 0.06, 0.3, K.M(0x14532d, 0.8), 0, 2.98, 0.22);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return g;
  },

  /* ------------------------------------------------------------------
     CABIN (v4.9.0): a walk-in room on the boardwalk. Local origin: centre of the back wall on the rail (z 0),
     x from -W/2 to W/2, z from 0 to D. The front wall and the roof are separate groups (userData.front / .roof) that
     fade out while the player is inside, so the chase camera can see in. The gallery and trophy case stand on the
     back wall, the bunk.
     ------------------------------------------------------------------ */
  buildCabin(textures) {
    const g = new THREE.Group(), K = this.propKit(textures), C = CABIN;
    const W = C.w, D = C.d, H = 2.7, T = 0.14, hw = W / 2;
    const wallM = () => K.M(0xb08a5a, 0.85, 0, { map: textures.wood }), trimM = () => K.M(0x4a2c16, 0.9), roofM = () => K.M(0x7f1d1d, 0.75);
    const front = new THREE.Group(), roof = new THREE.Group(); g.add(front, roof);
    g.userData.front = front; g.userData.roof = roof;
    // floor, a step at the door
    K.box(g, W, 0.1, D + 0.2, K.lightWood, 0, 0.05, D / 2 - 0.05);
    K.box(g, C.doorW + 0.6, 0.08, 0.5, K.darkWood, 0, 0.04, D + 0.3);
    // back wall
    K.box(g, W, H, T, wallM(), 0, H / 2, -0.02);
    // side walls
    [-1, 1].forEach(sd => K.box(g, T, H, D + 0.1, wallM(), sd * (hw - T / 2), H / 2, D / 2));
    // corner posts
    [-1, 1].forEach(sx => [0, D].forEach(z => K.box(g, 0.18, H + 0.05, 0.18, trimM(), sx * (hw - 0.05), H / 2, z)));
    // front wall (fades): two pieces and a lintel round the door, a sign over it
    const dz = D + 0.05, dw = C.doorW / 2;
    K.box(front, hw - dw, H, T, wallM(), -(hw + dw) / 2, H / 2, dz); K.box(front, hw - dw, H, T, wallM(), (hw + dw) / 2, H / 2, dz);
    K.box(front, C.doorW, H - 2.15, T, wallM(), 0, 2.15 + (H - 2.15) / 2, dz);
    [-dw, dw].forEach(x => K.box(front, 0.12, 2.2, 0.2, trimM(), x, 1.1, dz)); K.box(front, C.doorW + 0.24, 0.12, 0.2, trimM(), 0, 2.2, dz);
    K.box(front, 1.5, 0.34, 0.06, new THREE.MeshBasicMaterial({ map: PixelTextureFactory.makeSignTexture('🏠 CABIN', 256, 64) }), 0, 2.45, dz + 0.1);
    [[-1, 1], [1, 1]].forEach(([sd]) => { K.box(front, 0.9, 0.7, 0.05, K.M(0x9bdcf2, 0.2, 0.1, { transparent: true, opacity: 0.55 }), sd * (hw + dw) / 2, 1.5, dz + 0.04); K.box(front, 1.0, 0.8, 0.04, trimM(), sd * (hw + dw) / 2, 1.5, dz + 0.01); });
    // gabled roof (ridge along X) with eaves
    {
      const shape = new THREE.Shape(), half = D / 2 + 0.45, rh = 1.05;
      shape.moveTo(-half, 0); shape.lineTo(half, 0); shape.lineTo(0, rh); shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth: W + 0.5, bevelEnabled: false });
      geo.translate(0, 0, -(W + 0.5) / 2);
      const r = new THREE.Mesh(geo, roofM()); r.rotation.y = Math.PI / 2; r.position.set(0, H, D / 2 - 0.05); roof.add(r);
      K.box(roof, W + 0.6, 0.08, 0.14, trimM(), 0, H + 0.02, D / 2 - 0.05 + half - 0.02); K.box(roof, W + 0.6, 0.08, 0.14, trimM(), 0, H + 0.02, D / 2 - 0.05 - half + 0.02);
      K.box(roof, 0.5, 0.7, 0.5, K.M(0x78716c, 0.95), hw - 1.0, H + 0.9, 0.6);   // chimney
    }
    // inside: rug, bunk bed on the right, a hanging lamp, a lifebuoy
    K.box(g, 2.4, 0.02, 1.5, K.M(0xb91c1c, 0.95), 0.1, 0.11, 2.0); K.box(g, 2.0, 0.025, 1.1, K.M(0xfde68a, 0.95), 0.1, 0.115, 2.0);
    {
      const bx = hw - 0.62, bz = 2.55;
      [[-0.42, -0.85], [0.42, -0.85], [-0.42, 0.85], [0.42, 0.85]].forEach(([x, z]) => K.box(g, 0.07, 1.5, 0.07, K.darkWood, bx + x, 0.85, bz + z));
      [0.42, 1.12].forEach((y, k) => { K.box(g, 0.9, 0.12, 1.75, K.darkWood, bx, y, bz); K.box(g, 0.84, 0.1, 1.6, K.M(k ? 0x1d4ed8 : 0x0f766e, 0.9), bx, y + 0.1, bz); K.box(g, 0.6, 0.1, 0.34, K.M(0xf8fafc, 0.9), bx, y + 0.2, bz + 0.62); });
      K.box(g, 0.05, 0.9, 0.4, K.darkWood, bx - 0.45, 0.8, bz + 0.98);
    }
    K.cyl(g, 0.012, 0.012, 0.7, K.iron, 0.0, 2.35, 1.8, 4);
    K.cyl(g, 0.16, 0.2, 0.28, K.M(0xfacc15, 0.3, 0.3, { emissive: new THREE.Color(0xf59e0b), emissiveIntensity: 0.9 }), 0.0, 1.95, 1.8, 8);
    const lb = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.07, 6, 14), K.M(0xf97316, 0.6)); lb.position.set(-hw + 0.1, 1.6, 2.4); lb.rotation.y = Math.PI / 2; g.add(lb);
    [front, roof].forEach(grp => grp.traverse(o => { if (o.isMesh) { o.material.transparent = true; } }));
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return g;
  },
};
