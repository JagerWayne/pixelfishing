/* AnglerAnimator method: update, the per-frame pose (gait, idle, sitting, casting, reeling, boats, blinking). */
import { THREE } from '../engine/three.js';
import { AnglerFactory } from './angler-factory.js';

export const animatorUpdateMethods = {
  /* st: { dt, elapsed, speed, sit (0..1), seatH, feetZ, casting, castCharge, reeling, cranking, tension, pull,
           hands: { L, R } (world-space wrist targets or null), handBlend, sway, idleAllowed } */
  update(st) {
    const r = this.rig, d = r.dims, dt = Math.min(0.05, st.dt == null ? 0.016 : st.dt), t = st.elapsed || 0;
    // v9.1.0 face: blink every few seconds on top of the expression asked for (painted textures, swapped)
    if (r.faceMesh) {
      if (this.blinkT == null) this.blinkT = 1 + Math.random() * 3;
      this.blinkT -= dt; if (this.blinkT < -0.13) this.blinkT = 2.2 + Math.random() * 3.8;
      const base = st.expr || 'open';
      AnglerFactory.setExpression(r, this.blinkT < 0 && base !== 'happy' ? 'blink' : base);
    }
    const damp = (cur, goal, k) => cur + (goal - cur) * (1 - Math.exp(-k * dt));
    const ss = (x, a, b) => THREE.MathUtils.smoothstep(x, a, b);
    // ---- rest pose ----
    r.bones.forEach(b => b.rotation.set(0, 0, 0));
    r.hips.position.set(0, d.hipY, 0);
    // ---- blend weights ----
    const speed = st.speed || 0;
    this.walkW = damp(this.walkW, speed > 0.25 ? 1 : 0, 9);
    this.runW = damp(this.runW, ss(speed, 2.6, 5.5), 6);
    this.sitW = damp(this.sitW, st.sit || 0, 10);
    this.handW = damp(this.handW, st.handBlend || 0, 8);
    const walk = this.walkW * (1 - this.sitW), run = this.runW;
    this.still = speed > 0.25 ? 0 : this.still + dt;

    // ---- gait: the phase follows the distance walked, so each step matches the ground speed ----
    const legK = d.legs || 1, stride = (1.75 + 0.75 * run) * (0.35 + 0.65 * legK);   // metres per full gait cycle (v9.0.0: shorter, quicker steps on chibi legs)
    this.phase = (this.phase + (speed * dt / stride) * Math.PI * 2) % (Math.PI * 2);
    const ph = this.phase;
    if (walk > 0.001) {
      const hipA = (0.42 + 0.3 * run) * walk, kneeA = (0.95 + 0.65 * run) * walk;
      [['L', 0], ['R', Math.PI]].forEach(([s, off]) => {
        const S = r[s], p = ph + off;
        const swing = Math.pow(Math.max(0, Math.cos(p)), 1.3);
        S.thigh.rotation.x += hipA * Math.sin(p) + 0.06 * run * walk;
        S.shin.rotation.x -= 0.08 * walk + kneeA * swing + 0.15 * run * walk * Math.max(0, -Math.sin(p));
        S.foot.rotation.x += (0.22 * Math.sin(p) + 0.25 * swing - 0.1 * run) * walk;
        // arms swing against the legs, elbows bend more when jogging
        const arm = r[s === 'L' ? 'R' : 'L'];
        arm.upper.rotation.x += (0.36 + 0.34 * run) * walk * Math.sin(p);
        arm.fore.rotation.x += (0.28 + 1.05 * run) * walk + 0.22 * walk * Math.max(0, Math.sin(p));
      });
      const bob = (0.025 + 0.035 * run) * walk * (0.6 + 0.4 * legK) * (legK < 1 ? 1.25 : 1);   // a little bouncier on short legs
      r.hips.position.y -= bob * Math.pow(Math.sin(ph), 2) + 0.02 * run * walk;
      r.hips.rotation.y -= 0.11 * walk * Math.sin(ph);
      r.hips.rotation.z += 0.035 * walk * Math.cos(ph);
      r.chest.rotation.y += 0.2 * walk * Math.sin(ph);
      r.spine.rotation.x -= (0.03 + 0.12 * run) * walk;
      r.neck.rotation.x += (0.02 + 0.08 * run) * walk;
    }

    // ---- idle: breathing, weight shift, looking around, a stretch now and then ----
    const idle = (1 - walk) * (1 - this.sitW) * (st.idleAllowed === false ? 0.3 : 1);
    const breathe = Math.sin(t * 1.55);
    r.chest.rotation.x += 0.018 * breathe;
    r.L.clav.rotation.z += 0.012 * breathe; r.R.clav.rotation.z -= 0.012 * breathe;
    if (idle > 0.001) {
      this.shiftTimer -= dt;
      if (this.shiftTimer <= 0) { this.shiftTimer = 3.5 + Math.random() * 4; this.shiftTarget = this.shiftTarget > 0 ? -1 : 1; }
      this.shift = damp(this.shift, this.shiftTarget, 1.6);
      const sh = this.shift * idle;
      r.hips.position.x += 0.028 * sh;
      r.hips.rotation.z -= 0.045 * sh;
      r.spine.rotation.z += 0.03 * sh;
      r.chest.rotation.z += 0.02 * sh;
      // the leg that carries the weight stays straight, the other relaxes at the knee
      const relaxed = sh > 0 ? r.L : r.R, k = Math.abs(sh);
      relaxed.thigh.rotation.x += 0.1 * k; relaxed.shin.rotation.x -= 0.22 * k; relaxed.foot.rotation.x += 0.1 * k;
      r.L.thigh.rotation.z += 0.045 * sh; r.R.thigh.rotation.z += 0.045 * sh;
      // stretch: arms up overhead, lean back, then relax
      this.stretchTimer -= dt;
      if (this.stretchT < 0 && this.stretchTimer <= 0 && this.still > 6 && !(st.rest && st.rest.w > 0.1)) { this.stretchT = 0; this.stretchTimer = 22 + Math.random() * 20; }
    }
    if (this.stretchT >= 0) {
      this.stretchT += dt;
      const e = Math.sin(Math.min(1, this.stretchT / 2.4) * Math.PI) * idle;
      r.L.upper.rotation.x += 2.6 * e; r.R.upper.rotation.x += 2.6 * e;
      r.L.upper.rotation.z -= 0.35 * e; r.R.upper.rotation.z += 0.35 * e;
      r.L.fore.rotation.x += 0.5 * e; r.R.fore.rotation.x += 0.5 * e;
      r.spine.rotation.x += 0.12 * e; r.neck.rotation.x += 0.22 * e;
      if (this.stretchT > 2.4 || idle < 0.2) this.stretchT = -1;
    }
    // arms hang a little away from the hips
    r.L.upper.rotation.z -= 0.09; r.R.upper.rotation.z += 0.09;
    r.L.fore.rotation.x += 0.12 * (1 - walk); r.R.fore.rotation.x += 0.12 * (1 - walk);

    // ---- look around (idle) or at the work in front (fishing / driving) ----
    this.look.timer -= dt;
    if (this.look.timer <= 0) {
      this.look.timer = 2.5 + Math.random() * 3.5;
      const glance = Math.random() < 0.3;
      this.look.ty = glance ? 0 : (Math.random() - 0.5) * 1.3;
      this.look.tp = glance ? -0.12 : (Math.random() - 0.5) * 0.3;
    }
    const lookW = idle * (this.handW > 0.5 ? 0.25 : 1) * (st.rest && st.rest.w > 0.1 ? 0.3 : 1);
    this.look.yaw = damp(this.look.yaw, this.look.ty * lookW + (st.pull || 0) * -0.3, 3);
    this.look.pitch = damp(this.look.pitch, this.look.tp * lookW, 3);
    r.neck.rotation.y += this.look.yaw * 0.35; r.head.rotation.y += this.look.yaw * 0.65;
    r.head.rotation.x += this.look.pitch;

    // ---- sitting (chair or thwart): hips onto the seat, thighs level, shins down, feet flat ----
    const sit = this.sitW;
    if (sit > 0.001) {
      const seatH = st.seatH || 0.5;
      r.hips.position.y = THREE.MathUtils.lerp(r.hips.position.y, seatH, sit);
      r.hips.position.z += 0.02 * sit;
      const kneeOpen = 0.12;
      [r.L, r.R].forEach((S, i) => {
        S.thigh.rotation.x = THREE.MathUtils.lerp(S.thigh.rotation.x, 1.5, sit);
        S.thigh.rotation.z += (i ? 1 : -1) * kneeOpen * sit;
        S.shin.rotation.x = THREE.MathUtils.lerp(S.shin.rotation.x, -1.45, sit);
        S.foot.rotation.x = THREE.MathUtils.lerp(S.foot.rotation.x, -0.05, sit);
      });
      r.spine.rotation.x += 0.06 * sit;
    }

    // ---- rest poses: leaning back on a bench (legs cross now and then), or leaning on the railing gazing at the sea ----
    const rest = st.rest;
    if (rest && rest.w > 0.001) {
      const w = rest.w;
      if (rest.kind === 'bench') {
        r.spine.rotation.x += 0.14 * w; r.neck.rotation.x -= 0.1 * w;
        this.crossT = (this.crossT == null ? 6 : this.crossT) - dt;
        if (this.crossT <= 0) { this.crossT = 7 + Math.random() * 8; this.crossGoal = this.crossGoal ? 0 : 1; }
        this.cross = damp(this.cross || 0, (this.crossGoal || 0) * w, 1.4);
        const c = this.cross;
        r.R.thigh.rotation.x += 0.2 * c; r.R.thigh.rotation.z -= 0.3 * c; r.R.shin.rotation.x += 0.45 * c; r.R.foot.rotation.x -= 0.2 * c;
        r.L.thigh.rotation.z -= 0.05 * c;
      } else if (rest.kind === 'rail') {
        r.hips.position.z += 0.13 * w;
        r.spine.rotation.x -= 0.3 * w; r.chest.rotation.x -= 0.14 * w;
        r.neck.rotation.x += 0.2 * w; r.head.rotation.x -= (0.1 + 0.12 * Math.max(0, Math.sin(t * 0.21))) * w;
        r.head.rotation.y += 0.35 * Math.sin(t * 0.23) * w;
        // the right foot crosses behind the left, toe down
        r.R.thigh.rotation.x -= 0.06 * w; r.R.thigh.rotation.z -= 0.13 * w; r.R.shin.rotation.x -= 0.28 * w; r.R.foot.rotation.x -= 0.35 * w;
        r.L.thigh.rotation.x += 0.05 * w;
      }
    }

    // ---- boat sway: the body leans against the roll ----
    if (st.sway) { r.spine.rotation.z -= st.sway * 0.6; r.neck.rotation.z += st.sway * 0.3; }

    // ---- fishing: cast wind-up and whip, reeling, leaning back against the fish ----
    const castW = st.casting ? 1 : 0;
    this.twist = damp(this.twist, castW * (st.castCharge || 0), 10);
    if (st.castRelease) this.whip = 1;
    this.whip = Math.max(0, this.whip - dt * 2.2);
    const whipE = Math.sin(Math.min(1, (1 - this.whip)) * Math.PI) * (this.whip > 0 ? 1 : 0);
    r.chest.rotation.y -= 0.45 * this.twist - 0.3 * whipE;
    r.spine.rotation.x += 0.12 * this.twist - 0.22 * whipE;
    this.lean = damp(this.lean, st.reeling ? 0.08 + (st.tension || 0) * 0.28 : 0, 5);
    r.spine.rotation.x += this.lean * (1 - sit * 0.5);
    r.chest.rotation.y -= (st.pull || 0) * 0.25 * (st.reeling ? 1 : 0);
    if (st.reeling && sit < 0.5) { // brace: knees soften and one foot steps forward
      r.L.thigh.rotation.x += 0.25 * this.lean * 3; r.L.shin.rotation.x -= 0.3 * this.lean * 3;
      r.R.thigh.rotation.x -= 0.12 * this.lean * 3;
      r.hips.position.y -= 0.03 * this.lean * 3;
    }

    // ---- boarding / docking: one high step ----
    if (st.stepTrigger) this.step = 1;
    if (this.step > 0) {
      this.step = Math.max(0, this.step - dt * 1.8);
      const e = Math.sin(this.step * Math.PI);
      r.R.thigh.rotation.x += 1.1 * e; r.R.shin.rotation.x -= 1.3 * e; r.L.shin.rotation.x -= 0.25 * e;
      r.L.upper.rotation.z -= 0.4 * e; r.R.upper.rotation.z += 0.3 * e;
    }

    // ---- hands: two-bone IK onto the rod / wheel / tiller targets ----
    r.root.updateMatrixWorld(true);
    const hw = this.handW;
    if (hw > 0.002 && st.hands) {
      ['L', 'R'].forEach(s => { if (st.hands[s]) this.solveArm(r[s], st.hands[s], s === 'L' ? -1 : 1, hw); });
    }
    // finger curl: relaxed, or wrapped round whatever the hands hold
    ['L', 'R'].forEach(s => {
      const S = r[s];
      const curl = 0.25 + (st.hands && st.hands[s] ? 1.1 * hw : 0) + (st.cranking && s === 'R' ? 0.2 : 0), point = st.point === s;
      S.fingers.forEach((f, i) => f.rotation.set(0, 0, (s === 'L' ? 1 : -1) * (point ? (i < 2 ? 0.05 : 1.45) : curl) * (i % 2 ? 0.9 : 0.7)));   // pointing: the index finger stays straight
    });
    r.root.updateMatrixWorld(true);
    this.bustPhysics(dt);
  },
};
