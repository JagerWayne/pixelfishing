/* AnglerAnimator (class): procedural movement on the angler's skeleton. The per-frame update, the bust
   physics and the arm IK join from the animator-update and animator-ik method groups. */
import { THREE } from '../engine/three.js';
import { addMethods } from '../utils.js';
import { animatorUpdateMethods } from './animator-update.js';
import { animatorIkMethods } from './animator-ik.js';

/* =========================================================================
   ANGLER ANIMATOR (v4): procedural movement on the v4 skeleton.
   Every frame the bones start from the rest pose and the layers are added on top:
   gait (walk / jog, speed-driven so the feet do not skate), idle (breathing, weight shifts, looking around,
   an occasional stretch), sitting (chair or thwart), fishing (cast wind-up and whip, reeling, leaning
   against a fish) and two-bone IK that puts the hands on the rod, the wheel or the tiller.
   Conventions: front is -Z; thigh / upper-arm rotation.x > 0 swings forward, shin rotation.x < 0 bends the
   knee, forearm rotation.x > 0 bends the elbow, spine rotation.x < 0 leans forward.
   ========================================================================= */
export class AnglerAnimator {
  constructor(rig) {
    this.rig = rig;
    this.phase = 0; this.walkW = 0; this.runW = 0; this.still = 0;
    this.shift = 0; this.shiftTarget = 0; this.shiftTimer = 3;
    this.look = { yaw: 0, pitch: 0, ty: 0, tp: 0, timer: 2 };
    this.stretch = 0; this.stretchT = -1; this.stretchTimer = 14 + Math.random() * 12;
    this.crank = 0; this.whip = 0; this.step = 0; this.handW = 0; this.sitW = 0; this.lean = 0; this.twist = 0;
    this._a = new THREE.Vector3(); this._b = new THREE.Vector3(); this._c = new THREE.Vector3(); this._e = new THREE.Vector3();
    this._p = new THREE.Vector3(); this._q = new THREE.Quaternion(); this._q2 = new THREE.Quaternion(); this._down = new THREE.Vector3(0, -1, 0);
  }
}

export function init() {
  addMethods(AnglerAnimator, animatorUpdateMethods, null);
  addMethods(AnglerAnimator, animatorIkMethods, null);
}
