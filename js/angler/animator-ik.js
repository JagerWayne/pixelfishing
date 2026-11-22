/* AnglerAnimator methods: the bust spring physics and the two-bone arm IK. */
import { THREE } from '../engine/three.js';

export const animatorIkMethods = {
  /* Bust physics: one damped spring per side. A point mass follows an anchor on the chest; the spring and damping
     work in the chest's own axes (soft up and down, medium sideways, stiff front to back), so walking bob, turns,
     sitting down, casting and boat motion all make it lag and bounce. The offset then drives the bust bones. */
  bustPhysics(dt) {
    const r = this.rig, d = r.dims;
    if (!r.bustL || (dt <= 0 && this.bust)) return;   // frozen (pause / freeze frame): hold the current offsets
    if (!d.female) { r.bustL.position.set(-d.bustX, d.bustY, d.bustZ); r.bustR.position.set(d.bustX, d.bustY, d.bustZ); return; }
    if (!this.bust) {
      this.bust = [0, 1].map(i => ({ X: new THREE.Vector3(), V: new THREE.Vector3(), A: new THREE.Vector3(), AV: new THREE.Vector3(), init: false, tune: i ? 1.06 : 0.95 }));
      this._bq = new THREE.Quaternion(); this._bqi = new THREE.Quaternion(); this._bs = new THREE.Vector3();
      this._bd = new THREE.Vector3(); this._bv = new THREE.Vector3(); this._ba = new THREE.Vector3(); this._bo = new THREE.Vector3();
    }
    const chest = r.chest, sup = d.support || 1.2;
    chest.matrixWorld.decompose(this._ba, this._bq, this._bs);   // (position, rotation, scale)
    const scl = this._bs.x || 1;
    this._bqi.copy(this._bq).invert();
    // spring constants per local axis (x sideways, y up, z front/back): natural frequency and damping ratio
    const fx = 3.1 * Math.sqrt(sup), fy = 2.4 * Math.sqrt(sup), fz = 4.6 * Math.sqrt(sup);
    const zx = 0.32 * sup, zy = 0.2 * sup, zz = 0.5 * sup;
    const lim = { x: 0.012, y: 0.018, z: 0.007 };
    const n = 3, h = dt / n;
    [r.bustL, r.bustR].forEach((bone, i) => {
      const S = this.bust[i], sx = i ? 1 : -1, tn = S.tune;
      const kx = (2 * Math.PI * fx * tn) ** 2, ky = (2 * Math.PI * fy * tn) ** 2, kz = (2 * Math.PI * fz * tn) ** 2;
      const cx = 2 * zx * 2 * Math.PI * fx * tn, cy = 2 * zy * 2 * Math.PI * fy * tn, cz = 2 * zz * 2 * Math.PI * fz * tn;
      // anchor: the rest spot of the mound, in world space
      const anchor = this._ba.set(sx * d.bustX, d.bustY, d.bustZ - 0.04).applyMatrix4(chest.matrixWorld);
      const jump = S.init ? anchor.distanceTo(S.A) : 1e9;
      if (!S.init || jump > 0.5 || !isFinite(S.X.x)) { // first frame or a teleport: start at rest
        S.X.copy(anchor); S.V.set(0, 0, 0); S.AV.set(0, 0, 0); S.A.copy(anchor); S.init = true;
      } else {
        const av = S.AV.copy(anchor).sub(S.A).divideScalar(Math.max(1e-4, dt));   // anchor velocity
        for (let k = 1; k <= n; k++) {
          const at = this._bo.copy(S.A).lerp(anchor, (k - 1) / n);   // anchor at the start of this sub-step, same time as X
          const dl = this._bd.copy(S.X).sub(at).applyQuaternion(this._bqi).divideScalar(scl);
          const vl = this._bs.copy(S.V).sub(av).applyQuaternion(this._bqi).divideScalar(scl);
          const acc = this._bs.set(-kx * dl.x - cx * vl.x, -ky * dl.y - cy * vl.y, -kz * dl.z - cz * vl.z).multiplyScalar(scl).applyQuaternion(this._bq);
          S.V.addScaledVector(acc, h);
          S.X.addScaledVector(S.V, h);
        }
        S.A.copy(anchor);
      }
      // local offset, kept within a few centimetres (soft limit) so it never tears through the clothes
      const o = this._bd.copy(S.X).sub(anchor).applyQuaternion(this._bqi).divideScalar(scl);
      const hard = 2.5;
      if (Math.abs(o.x) > lim.x * hard || Math.abs(o.y) > lim.y * hard || Math.abs(o.z) > lim.z * hard) {
        o.set(THREE.MathUtils.clamp(o.x, -lim.x * hard, lim.x * hard), THREE.MathUtils.clamp(o.y, -lim.y * hard, lim.y * hard), THREE.MathUtils.clamp(o.z, -lim.z * hard, lim.z * hard));
        S.X.copy(o).multiplyScalar(scl).applyQuaternion(this._bq).add(anchor); S.V.sub(S.AV).multiplyScalar(0.5).add(S.AV);   // keep the body's own velocity, calm only the wobble
      }
      const gn = 0.55 / Math.sqrt(sup);   // firmer tops show less of the motion
      const ox = lim.x * Math.tanh(gn * o.x / lim.x), oy = lim.y * Math.tanh(gn * o.y / lim.y), oz = lim.z * Math.tanh(gn * o.z / lim.z);
      bone.position.set(sx * d.bustX + ox * 0.6, d.bustY + oy * 0.45, d.bustZ + oz * 0.4);
      // the lower pole lags: tip down when the mass drops, swings sideways with it
      bone.rotation.set(oy * 7.5, -ox * 6, 0);
    });
    r.bustL.updateMatrixWorld(true); r.bustR.updateMatrixWorld(true);
  },

  /* Two-bone IK for one arm: shoulder -> elbow -> wrist onto a world target, elbow bent down and out. */
  solveArm(S, target, side, w) {
    const A = this._a, T = this._b, E = this._e, pole = this._c;
    S.upper.getWorldPosition(A);
    const scale = this.rig.dims.hScale * (this.rig.root.parent ? this.rig.root.parent.scale.y : 1);
    const a = this.rig.dims.upper * scale, b = (this.rig.dims.fore + 0.07) * scale;
    T.copy(target);
    const dir = this._p.copy(T).sub(A);
    let dist = dir.length();
    if (dist < 1e-4) return;
    const reach = Math.min(dist, (a + b) * 0.999);
    dir.multiplyScalar(1 / dist);
    T.copy(A).addScaledVector(dir, reach);
    // elbow: in the plane of the arm and a pole that points down and out to the side (and a little back)
    const q = this.rig.root.parent ? this.rig.root.parent.getWorldQuaternion(this._q2) : this._q2.identity();
    pole.set(side * 0.7, -0.6, 0.25).applyQuaternion(q).normalize();
    const cosA = THREE.MathUtils.clamp((a * a + reach * reach - b * b) / (2 * a * reach), -1, 1);
    const along = a * cosA, up = a * Math.sqrt(Math.max(0, 1 - cosA * cosA));
    const perp = pole.addScaledVector(dir, -pole.dot(dir)).normalize();
    E.copy(A).addScaledVector(dir, along).addScaledVector(perp, up);
    // upper arm: aim its -Y at the elbow; forearm: aim its -Y at the wrist (local to each parent)
    const aim = (bone, from, to) => {
      const wdir = this._p.copy(to).sub(from).normalize();
      bone.parent.getWorldQuaternion(this._q).invert();
      wdir.applyQuaternion(this._q);
      const ql = this._q2.setFromUnitVectors(this._down, wdir);
      bone.quaternion.slerp(ql, w);
      bone.updateMatrixWorld(true);
    };
    aim(S.upper, A, E);
    S.fore.getWorldPosition(E);
    aim(S.fore, E, T);
  },
};
