/* AnglerFactory methods: the skeleton (createRig, bone layout) and disposing of a rig. */
import { THREE } from '../engine/three.js';

export const anglerRigStatics = {
  createRig(look) {
    const root = new THREE.Group();
    const skelRoot = new THREE.Group();
    root.add(skelRoot);
    const B = name => { const b = new THREE.Bone(); b.name = name; return b; };
    const hips = B('hips'), spine = B('spine'), chest = B('chest'), neck = B('neck'), head = B('head');
    hips.add(spine); spine.add(chest); chest.add(neck); neck.add(head);
    const side = s => {
      const clav = B('clav' + s), upper = B('upper' + s), fore = B('fore' + s), hand = B('hand' + s);
      chest.add(clav); clav.add(upper); upper.add(fore); fore.add(hand);
      const thigh = B('thigh' + s), shin = B('shin' + s), foot = B('foot' + s);
      hips.add(thigh); thigh.add(shin); shin.add(foot);
      return { clav, upper, fore, hand, thigh, shin, foot, fingers: [], handGroup: null, footGroup: null };
    };
    const L = side('L'), R = side('R');
    skelRoot.add(hips);
    const headGroup = new THREE.Group(); head.add(headGroup);
    // soft-tissue bones for the bust (driven by the spring physics in AnglerAnimator); kept last so older skin indices stay valid
    const bustL = B('bustL'), bustR = B('bustR'); chest.add(bustL); chest.add(bustR);
    const bones = [hips, spine, chest, neck, head, L.clav, L.upper, L.fore, L.hand, L.thigh, L.shin, L.foot, R.clav, R.upper, R.fore, R.hand, R.thigh, R.shin, R.foot, bustL, bustR];
    const rig = { root, skelRoot, hips, spine, chest, neck, head, headGroup, L, R, bustL, bustR, bones, parts: [], dims: this.dims(look || this.defaultLook('male')) };
    // legacy names (the customise screen and older helpers look for these)
    rig.bodyGroup = hips; rig.leftArm = L.upper; rig.rightArm = R.upper; rig.leftLeg = L.thigh; rig.rightLeg = R.thigh;
    this.layoutBones(rig, rig.dims);
    return rig;
  },

  /* rest pose: every bone at its offset, no rotation */
  layoutBones(rig, d) {
    rig.bones.forEach(b => { b.rotation.set(0, 0, 0); b.scale.set(1, 1, 1); });
    rig.hips.position.set(0, d.hipY, 0);
    rig.spine.position.set(0, d.spine, 0);
    rig.chest.position.set(0, d.chest, 0);
    rig.neck.position.set(0, d.neck, 0);
    rig.head.position.set(0, d.headB, 0);
    [[rig.L, -1], [rig.R, 1]].forEach(([S, s]) => {
      S.clav.position.set(s * d.clavX, d.clavY, 0);
      S.upper.position.set(s * (d.shoulderX * (0.92 + 0.08 * d.w)), 0, 0);
      S.fore.position.set(0, -d.upper, 0);
      S.hand.position.set(0, -d.fore, 0);
      S.thigh.position.set(s * d.legX * (0.94 + 0.06 * d.w), -0.02, 0);
      S.shin.position.set(0, -d.thigh, 0);
      S.foot.position.set(0, -d.shin, 0);
    });
    // bust pivots sit on the chest wall behind each mound, so a rotation swings the lower pole
    [[rig.bustL, -1], [rig.bustR, 1]].forEach(([b, s]) => b.position.set(s * d.bustX, d.bustY, d.bustZ));
    rig.skelRoot.scale.setScalar(d.hScale);
    rig.headGroup.position.set(0, d.headLift, 0.0);
    rig.headGroup.scale.setScalar(d.headScale);
    rig.root.updateMatrixWorld(true);
  },

  dispose(obj) {
    obj.traverse(o => {
      if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
    });
  },

  clear(group, keep = []) {
    [...group.children].forEach(ch => {
      if (keep.includes(ch) || ch.isBone) return;
      group.remove(ch);
      this.dispose(ch);
    });
  },
};
