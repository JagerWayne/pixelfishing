/* AnglerFactory methods: random looks, the Harbour Chibi proportions (dims), the toon ramp and the face patch. */
import { THREE } from '../engine/three.js';
import { ANGLER_OPTS } from './look-options.js';

export const anglerDimsStatics = {
  randomLook(gender) {
    const f = gender === 'female';
    const r = n => Math.floor(Math.random() * n);
    const choose = arr => arr[r(arr.length)];
    const hat = choose(['souwester', 'cap', 'captain', 'flapcap', 'beanie', 'bucket', 'straw', 'bandana', 'flowers', 'none', 'none']);
    const blocked = this.blockedHair(hat);
    const hairPool = (f ? ['short', 'wavy', 'ponytail', 'long', 'long', 'bob', 'bun', 'braid', 'twintails', 'pixie', 'afro', 'sidepart'] : ['short', 'short', 'buzz', 'wavy', 'bald', 'ponytail', 'braid', 'spiky', 'afro', 'mohawk', 'sidepart']).filter(h => !blocked.includes(h));
    const facial = f ? ['none'] : ['none', 'none', 'stubble', 'mustache', 'goatee', 'beard', 'beard', 'sideburns'];
    // coherent outfits: beach wear is paired with beach wear
    const beach = r(6) === 0;
    let top, bottom;
    if (beach) {
      top = f ? 'bikini' : choose(['none', 'none', 'tank']);
      bottom = f ? choose(['bikini', 'bikini', 'swim', 'shorts']) : choose(['swim', 'shorts']);
    } else {
      top = choose(['sweater', 'tee', 'vest', 'tank', 'hoodie', 'slicker', 'polo', 'flannel', 'cardigan'].concat(f ? ['dress', 'dress'] : []));
      bottom = choose(f ? ['shorts', 'jeans', 'jeans', 'overalls', 'skirt', 'skirt', 'leggings', 'cargo'] : ['shorts', 'jeans', 'jeans', 'overalls', 'cargo']);
    }
    return this.sanitizeLook({
      gender: f ? 'female' : 'male',
      skin: r(ANGLER_OPTS.skin.length), eyes: r(ANGLER_OPTS.eyes.length),
      hairStyle: hairPool.length ? choose(hairPool) : 'short', hairColor: r(ANGLER_OPTS.hairColor.length),
      facial: choose(facial), glasses: choose(['none', 'none', 'none', 'round', 'sun']),
      top, topColor: r(ANGLER_OPTS.colors.length), topAccent: r(ANGLER_OPTS.colors.length),
      bottom, bottomColor: r(ANGLER_OPTS.colors.length),
      shoes: beach ? choose(['sandals', 'barefoot']) : choose(['boots', 'sneakers', 'sandals', 'barefoot']), shoeColor: r(ANGLER_OPTS.colors.length),
      hat, hatColor: r(ANGLER_OPTS.colors.length),
      height: choose(['s', 'm', 'm', 'l', f ? 's' : 'l']), build: choose(['slim', 'average', 'average', 'broad']),
      faceShape: choose(['oval', 'round', 'square', 'long']), nose: choose(['straight', 'small', 'button', 'broad']), brows: choose(['normal', 'normal', 'thin', 'bushy', 'arched', 'flat', 'bold', 'worried']),
      // v9.1.0
      heightK: 0.88 + Math.random() * 0.24, headK: 0.92 + Math.random() * 0.2, buildK: Math.random(),
      eyeShape: choose(ANGLER_OPTS.eyeShape)[0], mouth: choose(['smile', 'smile', 'grin', 'cat', 'open', 'smirk', 'flat', 'tongue', 'teeth', 'laugh']),
      cheeks: choose(['rosy', 'rosy', 'peach', 'none']), marks: choose(['none', 'none', 'none', 'freckles', 'mole', 'both']), ears: choose(['round', 'round', 'small', 'pointed']),
      fringe: choose(['none', 'none', 'side', 'full']), fringeColor: r(5) === 0 ? r(ANGLER_OPTS.hairColor.length) : -1,
      topPattern: choose(['auto', 'plain', 'plain', 'stripes', 'checks', 'waves', 'block']), bottomPattern: choose(['plain', 'plain', 'plain', 'stripes', 'checks']),
      bottomAccent: r(ANGLER_OPTS.colors.length), accessory: choose(['none', 'none', 'none', 'scarf', 'backpack', 'necklace', 'badge']), extraColor: r(ANGLER_OPTS.colors.length)
    }, gender);
  },

  /* =====================================================================
     ANGLER v4: a skeleton with real joints and a skinned body.
     Bones: hips > spine > chest > neck > head; chest > clavicle > upper arm > forearm > hand;
     hips > thigh > shin > foot. The body and the clothes are SkinnedMeshes generated in code
     (lofted torso and limbs with weights blended across every joint), the head, hands, shoes,
     hats and glasses are rigid meshes riding on their bones. Front is -Z, the right side is +X.
     ===================================================================== */
  /* Harbour Chibi proportions (v9.0.0): about 3.5 heads tall, a big round head on a short, chunky body. The body
     builders were written for adult proportions, so two factors carry the change through them: `torso` scales every
     height between the hips and the neck, `legs` the boot and skirt lengths. Widths stay adult, which makes the body
     read chunky. Total height is about 1.5 m (the bench, rod and camera heights still fit). */
  dims(look) {
    const female = look && look.gender === 'female';
    const build = (look && look.build) || 'average';
    // v9.1.0 sliders (older looks: from the steps)
    const bk = look && Number.isFinite(look.buildK) ? look.buildK : ({ slim: 0, average: 0.5, broad: 1 })[build];
    const w = 0.9 + 0.28 * (bk == null ? 0.5 : bk);
    const hk = look && Number.isFinite(look.heightK) ? look.heightK : (({ xs: 0.92, s: 0.96, m: 1.0, l: 1.04, xl: 1.08 })[(look && look.height) || 'm'] || 1);
    const hScale = hk * 1.08, headK = look && Number.isFinite(look.headK) ? look.headK : 1;
    const torso = 0.72, thigh = 0.20, shin = 0.19, ankle = 0.08;
    return {
      female, w, hScale, torso, legs: (thigh + shin) / 0.8,
      hipY: thigh + shin + ankle, thigh, shin, ankle, legX: female ? 0.09 : 0.096,
      spine: 0.10 * torso, chest: 0.18 * torso, neck: 0.25 * torso, headB: 0.05,
      clavX: female ? 0.028 : 0.032, clavY: 0.20 * torso, shoulderX: female ? 0.146 : 0.16,
      upper: 0.2, fore: 0.17, hand: 0.13,
      headScale: 1.38 * headK, headLift: 0.2 * (0.6 + 0.4 * headK),
      // bust: smaller and higher on the short chibi chest
      bustX: 0.078, bustY: 0.03 * torso, bustZ: -0.098 * (0.94 + 0.06 * w), bustAmt: 0.042,
      support: ({ sweater: 1.5, hoodie: 1.7, slicker: 1.8, vest: 1.4, tee: 1.15, tank: 1.05, bikini: 1.0, none: 0.9 })[(look && look.top) || 'tee'] || 1.2
    };
  },

  /* the shared three-step light ramp for toon shading (soft shadow, mid, lit) */
  toonRamp() {
    if (!this._ramp) { const t = new THREE.DataTexture(new Uint8Array([118, 118, 118, 255, 172, 172, 172, 255, 214, 214, 214, 255]), 3, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; t.userData.shared = true; this._ramp = t; }
    return this._ramp;
  },
  /* the face patch on the head sphere: 116 degrees across the front, 50..134 degrees down from the top */
  get FACE_PATCH() { return { phi0: Math.PI * 1.178, phiLen: Math.PI * 0.644, th0: Math.PI * 0.28, thLen: Math.PI * 0.466 }; },
};
