/* AnglerFactory methods: paintFace (eyes, brows, mouth, cheeks, marks per expression) and setExpression. */
import { THREE } from '../engine/three.js';
import { LookColor } from './look-options.js';

export const anglerFaceStatics = {
  /* Paint the chibi face on a 256x256 canvas (v9.0.0; v9.1.0 shapes and expressions). Positions are in degrees on
     the head: ax across from the middle (+ = the character's left), ay down from the top. expr: 'open' (default),
     'blink', 'happy', 'surprise', 'focus'. Eyes, brows (hair colour), lashes, cheeks, freckles and mouth. */
  paintFace(look, expr = 'open') {
    const W = 256, cv = document.createElement('canvas'); cv.width = cv.height = W;
    const g = cv.getContext('2d'), FP = this.FACE_PATCH;
    const spanX = FP.phiLen * 180 / Math.PI, top = FP.th0 * 180 / Math.PI, spanY = FP.thLen * 180 / Math.PI;
    const X = ax => W / 2 + ax / spanX * W, Y = ay => (ay - top) / spanY * W, SX = d => d / spanX * W, SY = d => d / spanY * W;
    const female = look.gender === 'female';
    const eyeCol = LookColor.eyes(look), hairCol = LookColor.hair(look), ink = '#1a1410';
    const shape = look.eyeShape || 'round', brows = look.brows || 'normal', mouth = look.mouth || 'smile';
    const ell = (cx, cy, rx, ry, fill) => { g.beginPath(); g.ellipse(cx, cy, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2); g.fillStyle = fill; g.fill(); };
    const line = (w, col) => { g.lineWidth = w; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round'; };
    const arc = (x0, y0, xc, yc, x1, y1) => { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(xc, yc, x1, y1); g.stroke(); };
    const closed = expr === 'blink', happy = expr === 'happy', surprise = expr === 'surprise', focus = expr === 'focus';
    const size = ({ big: 1.22, wide: 1.1, dot: 0.42, almond: 0.95, cat: 1.0, sleepy: 1.0, sparkle: 1.08 })[shape] || 1;
    [-1, 1].forEach(s => {
      const cx = X(s * (shape === 'wide' ? 25 : 22.5)), cy = Y(92), rx = SX(6.4) * size, ry = SY(9.2) * size * (shape === 'almond' ? 0.72 : 1) * (surprise ? 1.12 : 1);
      if (closed || happy) {   // closed: a soft line; happy: an upward arc (^ ^)
        line(3.4, ink); happy ? arc(cx - rx, cy + ry * 0.2, cx, cy - ry * 0.9, cx + rx, cy + ry * 0.2) : arc(cx - rx, cy, cx, cy + ry * 0.35, cx + rx, cy);
      } else if (shape === 'dot') {
        ell(cx, cy, SX(3.2), SY(3.8), ink); ell(cx - s * SX(1), cy - SY(1.4), SX(1), SY(1), '#ffffff');
      } else {
        ell(cx, cy, rx + 2, ry + 2, ink);
        const gr = g.createLinearGradient(0, cy - ry, 0, cy + ry); gr.addColorStop(0, '#120c08'); gr.addColorStop(0.55, eyeCol); gr.addColorStop(1, eyeCol);
        ell(cx, cy, rx, ry, gr);
        ell(cx, cy + ry * 0.12, rx * (surprise ? 0.34 : 0.5), ry * (surprise ? 0.36 : 0.52), '#0b0705');
        if (shape === 'sparkle') {   // a little four-point star as the highlight
          g.fillStyle = '#ffffff'; g.beginPath(); const hx = cx - s * rx * 0.25, hy = cy - ry * 0.35, k = rx * 0.5;
          g.moveTo(hx, hy - k); g.quadraticCurveTo(hx, hy, hx + k * 0.8, hy); g.quadraticCurveTo(hx, hy, hx, hy + k); g.quadraticCurveTo(hx, hy, hx - k * 0.8, hy); g.quadraticCurveTo(hx, hy, hx, hy - k); g.fill();
        } else ell(cx - s * rx * 0.28, cy - ry * 0.4, rx * 0.36, ry * 0.26, '#ffffff');
        ell(cx + s * rx * 0.3, cy + ry * 0.36, rx * 0.16, ry * 0.12, 'rgba(255,255,255,0.85)');
        if (shape === 'sleepy' || focus) { g.fillStyle = LookColor.skin(look); g.fillRect(cx - rx - 3, cy - ry - 3, 2 * rx + 6, ry * (focus ? 0.75 : 0.9) + 3); line(3, ink); arc(cx - rx - 1, cy - ry * (focus ? 0.25 : 0.1), cx, cy - ry * (focus ? 0.32 : 0.14), cx + rx + 1, cy - ry * (focus ? 0.25 : 0.1)); }
        if (shape === 'cat') { line(3, ink); arc(cx + s * rx * 0.6, cy - ry * 0.75, cx + s * (rx + 4), cy - ry * 0.95, cx + s * (rx + 8), cy - ry * 1.15); }
      }
      if (female && !closed && !happy && shape !== 'dot') {   // three little lashes at the outer corner
        line(2.6, ink);
        for (let k = 0; k < 3; k++) { const a = -0.5 - k * 0.38; g.beginPath(); g.moveTo(cx + s * rx * Math.cos(a) * 0.95, cy + ry * Math.sin(a) * 0.95); g.lineTo(cx + s * (rx * Math.cos(a) + 6 + k), cy + ry * Math.sin(a) - 3 - k * 1.5); g.stroke(); }
      }
      // brow: shape from the brows option, raised when surprised, lowered and angled when focused
      if (brows !== 'none') {
        const bt = ({ thin: 2.4, bushy: 6.4, bold: 5.4 })[brows] || 4, by = 78.5 + (surprise ? -3 : 0) + (focus ? 1.5 : 0);
        line(bt, hairCol);
        const inY = by + (brows === 'bold' || focus ? 2.2 : brows === 'worried' ? -2.2 : 0), outY = by + (brows === 'worried' ? 1.5 : 0);
        const midY = by - (brows === 'arched' ? 4.5 : brows === 'flat' ? 0 : 3);
        arc(X(s * 15.5), Y(inY), X(s * 22.5), Y(midY), X(s * 29.5), Y(outY + 0.3));
      }
      // cheeks
      if (look.cheeks !== 'none') {
        const col = look.cheeks === 'peach' ? '251,146,60' : female ? '251,113,133' : '248,113,113', al = (female ? 0.42 : 0.28) + (happy ? 0.14 : 0);
        const bg = g.createRadialGradient(X(s * 33), Y(103), 0, X(s * 33), Y(103), SX(7));
        bg.addColorStop(0, `rgba(${col},${al})`); bg.addColorStop(1, `rgba(${col},0)`);
        g.fillStyle = bg; g.fillRect(X(s * 33) - SX(8), Y(103) - SX(8), SX(16), SX(16));
      }
      if (look.marks === 'freckles' || look.marks === 'both') [[-3, 0], [0, -2.2], [3, 0.6], [1.5, 2.6], [-1.8, 2.8]].forEach(([dx, dy]) => ell(X(s * (32 + dx)), Y(99 + dy), 1.4, 1.4, 'rgba(120,60,30,0.55)'));
    });
    if (look.marks === 'mole' || look.marks === 'both') ell(X(-14), Y(114), 1.8, 1.8, 'rgba(60,30,20,0.8)');
    // mouth
    const lip = female ? '#9f1239' : '#4a2a1a', m = surprise ? 'open' : happy && mouth !== 'laugh' ? 'grin' : focus ? 'flat' : mouth;
    const mx = X(0), my = Y(114);
    line(3.2, lip);
    if (m === 'smile') arc(X(-6), my - 0.5, mx, Y(118.5), X(6), my - 0.5);
    else if (m === 'flat') arc(X(-4.5), my + 2, mx, my + 2.4, X(4.5), my + 2);
    else if (m === 'smirk') arc(X(-5), my + 1.5, X(2), my + 3, X(6), my - 1.5);
    else if (m === 'cat') { g.beginPath(); g.moveTo(X(-6), my); g.quadraticCurveTo(X(-3), my + SY(3.5), mx, my); g.quadraticCurveTo(X(3), my + SY(3.5), X(6), my); g.stroke(); }
    else if (m === 'pout') ell(mx, my + 2, SX(2.2), SY(1.8), lip);
    else {   // open shapes: grin, open, laugh, teeth, tongue
      const w = ({ open: 3.2, grin: 6, laugh: 7, teeth: 6.5, tongue: 5.5 })[m] || 5, h = ({ open: 4.2, grin: 3.6, laugh: 5.2, teeth: 3.4, tongue: 3.8 })[m] || 3.6;
      g.beginPath();
      if (m === 'open') g.ellipse(mx, my + SY(1.5), SX(w), SY(h), 0, 0, Math.PI * 2);
      else { g.moveTo(X(-w), my); g.quadraticCurveTo(mx, my + SY(h * 2.1), X(w), my); g.closePath(); }
      g.fillStyle = '#5b1424'; g.fill(); g.stroke();
      if (m === 'teeth') { g.fillStyle = '#ffffff'; g.fillRect(X(-w * 0.7), my + 1, SX(w * 1.4), SY(1.6)); }
      if (m === 'tongue' || m === 'laugh') ell(mx + SX(1), my + SY(h * 0.85), SX(w * 0.42), SY(h * 0.45), '#f43f5e');
    }
    return cv;
  },
  /* show an expression on a dressed rig (textures are painted once per expression and kept until the next dress) */
  setExpression(rig, expr) {
    if (!rig.faceMesh || rig.faceExpr === expr) return;
    rig.faces = rig.faces || {};
    if (!rig.faces[expr]) { const t = new THREE.CanvasTexture(this.paintFace(rig.look, expr)); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; rig.faces[expr] = t; }
    rig.faceMesh.material.map = rig.faces[expr]; rig.faceExpr = expr;
  },
};
