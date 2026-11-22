/* WorldBuilder methods: the shared prop kit (materials and helpers) and mini fish. */
import { THREE } from '../engine/three.js';
import { ModelKit } from '../render/model-kit.js';

export const wbPropKitStatics = {
  /* ------------------------------------------------------------------
     PIER PROPS: catch buckets, toolbox, bounty board,
     bottle gallery and tackle shop. Same footprints and orientation
     as before (fronts face +Z, origin at the base centre).
     ------------------------------------------------------------------ */
  propKit(textures) {
    const M = (color, rough = 0.7, metal = 0, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal }, extra));
    const kit = {
      M,
      wood: M(0x8a5a30, 0.85, 0, { map: textures.wood }),
      darkWood: M(0x4a2c16, 0.9),
      lightWood: M(0xc98a4a, 0.8, 0, { map: textures.wood }),
      steel: M(0xcbd5e1, 0.3, 0.8),
      iron: M(0x334155, 0.5, 0.6),
      brass: M(0xd9a21b, 0.3, 0.8),
      rope: M(0xa8845a, 0.95)
    };
    kit.box = (parent, w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(ModelKit.roundedBox(w, h, d, ModelKit.bevelFor(w, h, d)), mat); m.position.set(x, y, z); parent.add(m); return m; };
    kit.sharpBox = (parent, w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); parent.add(m); return m; };
    kit.cyl = (parent, rt, rb, h, mat, x, y, z, seg = 10) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); parent.add(m); return m; };
    kit.sph = (parent, r, mat, x, y, z, ws = 10, hs = 8) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat); m.position.set(x, y, z); parent.add(m); return m; };
    // paper texture with a few ink lines, used by the bounty board
    kit.paper = (kind, seed) => {
      const c = document.createElement('canvas'); c.width = 64; c.height = 80;
      const x = c.getContext('2d');
      x.fillStyle = kind === 'wanted' ? '#f3dfb0' : '#fdf3d0'; x.fillRect(0, 0, 64, 80);
      x.strokeStyle = 'rgba(120,80,30,0.55)'; x.lineWidth = 2; x.strokeRect(2, 2, 60, 76);
      x.fillStyle = '#5b3a1a';
      if (kind === 'wanted') {
        x.font = 'bold 11px "Courier New", monospace'; x.textAlign = 'center'; x.fillText('WANTED', 32, 15);
        x.beginPath(); x.ellipse(32, 40, 17, 8, 0, 0, Math.PI * 2); x.fill();
        x.beginPath(); x.moveTo(15, 40); x.lineTo(5, 31); x.lineTo(5, 49); x.closePath(); x.fill();
        x.fillStyle = '#fdf3d0'; x.beginPath(); x.arc(42, 38, 2.5, 0, Math.PI * 2); x.fill();
        x.fillStyle = '#5b3a1a'; for (let i = 0; i < 3; i++) x.fillRect(10, 58 + i * 5, 44 - i * 8, 2);
      } else {
        for (let i = 0; i < 9; i++) x.fillRect(8, 10 + i * 7, 48 - ((i * 13 + seed * 7) % 20), 2);
        x.fillStyle = '#b91c1c'; x.fillRect(8, 68, 18, 5);
      }
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    return kit;
  },

  miniFish(color, accent, kit) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), kit.M(color, 0.35, 0.15));
    body.scale.set(1.9, 0.62, 0.5);
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 6), kit.M(0xf1f5f9, 0.35, 0.1));
    belly.scale.set(1.7, 0.4, 0.46); belly.position.y = -0.06;
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.24, 4), kit.M(accent, 0.6));
    tail.rotation.z = Math.PI / 2; tail.scale.set(1, 1, 0.2); tail.position.x = -0.42;
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 4), kit.M(accent, 0.6));
    fin.scale.set(1.4, 1, 0.2); fin.position.set(0.0, 0.14, 0);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), new THREE.MeshBasicMaterial({ color: 0x0b1020 }));
    eye.position.set(0.28, 0.04, 0.09); const eye2 = eye.clone(); eye2.position.z = -0.09;
    g.add(body, belly, tail, fin, eye, eye2);
    return g;
  },
};
