/* AnglerFactory (class): looks (defaults, validation, presets). Proportions, faces, the rig, the skinned
   geometry and dress() join from the angler-* method groups. */
import { addMethods } from '../utils.js';
import { ANGLER_OPTS, HEX_RE } from './look-options.js';
import { anglerDimsStatics } from './angler-dims.js';
import { anglerFaceStatics } from './angler-face.js';
import { anglerRigStatics } from './angler-rig.js';
import { anglerLimbsStatics } from './angler-limbs.js';
import { anglerTorsoStatics } from './angler-torso.js';
import { anglerDressStatics } from './angler-dress.js';

export class AnglerFactory {
  static defaultLook(gender) {
    const f = gender === 'female';
    return {
      gender: f ? 'female' : 'male', skin: 1, eyes: 0,
      hairStyle: f ? 'ponytail' : 'short', hairColor: f ? 3 : 2, facial: f ? 'none' : 'beard', glasses: 'none',
      top: 'sweater', topColor: 0, topAccent: f ? 7 : 1,
      bottom: 'jeans', bottomColor: f ? 13 : 1,
      shoes: 'boots', shoeColor: 10,
      hat: 'souwester', hatColor: 3,
      height: 'm', build: 'average', faceShape: 'oval', nose: 'straight', brows: 'normal',
      // v9.1.0 (their defaults reproduce the v9.0.0 look)
      heightK: 1, headK: 1, buildK: 0.5, eyeShape: 'round', mouth: 'smile', cheeks: 'rosy', marks: 'none', ears: 'round',
      fringe: 'none', fringeColor: -1, topPattern: 'auto', bottomPattern: 'plain', bottomAccent: 10, accessory: 'none', extraColor: 2
    };
  }

  // Hair styles that would poke through a hat; they are disabled while that hat is worn.
  static blockedHair(hat) {
    const volume = ['wavy', 'bun', 'bob', 'ponytail', 'afro', 'mohawk', 'spiky', 'twintails'];
    return ({ none: [], flowers: ['afro', 'mohawk'], bandana: ['afro', 'mohawk', 'spiky'], cap: ['wavy', 'bun', 'bob', 'afro', 'mohawk', 'spiky'], captain: ['wavy', 'bun', 'bob', 'afro', 'mohawk', 'spiky'],
      flapcap: volume, beanie: volume, bucket: volume, straw: volume, souwester: volume.concat(['long']) })[hat] || [];
  }

  static sanitizeLook(src, gender) {
    const def = this.defaultLook(gender === 'female' ? 'female' : 'male');
    if (!src || typeof src !== 'object') return def;
    const idx = (v, n, d) => { const k = Math.round(Number(v)); return Number.isFinite(k) && k >= 0 && k < n ? k : d; };
    const pick = (v, list, d) => (list.some(o => o[0] === v) ? v : d);
    const out = {
      gender: src.gender === 'female' ? 'female' : (src.gender === 'male' ? 'male' : def.gender),
      skin: idx(src.skin, ANGLER_OPTS.skin.length, def.skin),
      eyes: idx(src.eyes, ANGLER_OPTS.eyes.length, def.eyes),
      hairStyle: pick(src.hairStyle, ANGLER_OPTS.hairStyle, def.hairStyle),
      hairColor: idx(src.hairColor, ANGLER_OPTS.hairColor.length, def.hairColor),
      facial: pick(src.facial, ANGLER_OPTS.facial, def.facial),
      glasses: pick(src.glasses, ANGLER_OPTS.glasses, def.glasses),
      top: pick(src.top, ANGLER_OPTS.top, def.top),
      topColor: idx(src.topColor, ANGLER_OPTS.colors.length, def.topColor),
      topAccent: idx(src.topAccent, ANGLER_OPTS.colors.length, def.topAccent),
      bottom: pick(src.bottom, ANGLER_OPTS.bottom, def.bottom),
      bottomColor: idx(src.bottomColor, ANGLER_OPTS.colors.length, def.bottomColor),
      shoes: pick(src.shoes, ANGLER_OPTS.shoes, def.shoes),
      shoeColor: idx(src.shoeColor, ANGLER_OPTS.colors.length, def.shoeColor),
      hat: pick(src.hat, ANGLER_OPTS.hat, def.hat),
      hatColor: idx(src.hatColor, ANGLER_OPTS.colors.length, def.hatColor),
      height: pick(src.height, ANGLER_OPTS.height, def.height),
      build: pick(src.build, ANGLER_OPTS.build, def.build),
      faceShape: pick(src.faceShape, ANGLER_OPTS.faceShape, def.faceShape),
      nose: pick(src.nose, ANGLER_OPTS.nose, def.nose),
      brows: pick(src.brows, ANGLER_OPTS.brows, def.brows)
    };
    // v9.1.0 fields: sliders (older saves: from the height / build steps), face, patterns, extras and picked colours
    const num = (v, lo, hi, d) => { const k = Number(v); return Number.isFinite(k) ? Math.min(hi, Math.max(lo, k)) : d; };
    out.heightK = num(src.heightK, 0.85, 1.15, ({ xs: 0.92, s: 0.96, m: 1, l: 1.04, xl: 1.08 })[out.height] || 1);
    out.buildK = num(src.buildK, 0, 1, ({ slim: 0, average: 0.5, broad: 1 })[out.build]);
    out.headK = num(src.headK, 0.9, 1.15, 1);
    out.eyeShape = pick(src.eyeShape, ANGLER_OPTS.eyeShape, def.eyeShape);
    out.mouth = pick(src.mouth, ANGLER_OPTS.mouth, def.mouth);
    out.cheeks = pick(src.cheeks, ANGLER_OPTS.cheeks, def.cheeks);
    out.marks = pick(src.marks, ANGLER_OPTS.marks, def.marks);
    out.ears = pick(src.ears, ANGLER_OPTS.ears, def.ears);
    out.fringe = pick(src.fringe, ANGLER_OPTS.fringe, def.fringe);
    out.fringeColor = Number(src.fringeColor) === -1 || src.fringeColor == null ? -1 : idx(src.fringeColor, ANGLER_OPTS.hairColor.length, -1);
    out.topPattern = src.topPattern === 'auto' ? 'auto' : pick(src.topPattern, ANGLER_OPTS.pattern, def.topPattern);
    out.bottomPattern = pick(src.bottomPattern, ANGLER_OPTS.pattern, def.bottomPattern);
    out.bottomAccent = idx(src.bottomAccent, ANGLER_OPTS.colors.length, def.bottomAccent);
    out.accessory = pick(src.accessory, ANGLER_OPTS.accessory, def.accessory);
    out.extraColor = idx(src.extraColor, ANGLER_OPTS.colors.length, def.extraColor);
    ['skinHex', 'eyeHex', 'hairHex', 'fringeHex', 'topHex', 'accentHex', 'bottomHex', 'bottomAccHex', 'shoeHex', 'hatHex', 'extraHex'].forEach(k => { if (HEX_RE.test(src[k] || '')) out[k] = String(src[k]).toLowerCase(); });
    if (this.blockedHair(out.hat).includes(out.hairStyle)) out.hairStyle = 'short';
    return out;
  }

  static applyPreset(look, id) {
    const f = look.gender === 'female';
    const presets = {
      fisherman: { top: 'sweater', topColor: 0, topAccent: f ? 7 : 1, bottom: 'jeans', bottomColor: f ? 13 : 1, shoes: 'boots', shoeColor: 10, hat: 'souwester', hatColor: 3, glasses: 'none' },
      bikini: { top: 'bikini', topColor: 7, topAccent: 0, bottom: 'bikini', bottomColor: 7, shoes: 'sandals', shoeColor: 0, hat: 'straw', hatColor: 3, glasses: 'sun' },
      shorts: { top: 'none', topColor: 0, topAccent: 0, bottom: 'swim', bottomColor: 5, shoes: 'barefoot', shoeColor: 0, hat: 'none', hatColor: 3, glasses: 'none' },
      raincoat: { top: 'slicker', topColor: 3, topAccent: 10, bottom: 'jeans', bottomColor: 1, shoes: 'boots', shoeColor: 10, hat: 'souwester', hatColor: 3, glasses: 'none' },
      angler: { top: 'vest', topColor: 0, topAccent: 12, bottom: 'overalls', bottomColor: 1, shoes: 'boots', shoeColor: 10, hat: 'flapcap', hatColor: 12, glasses: 'none' }
    };
    return this.sanitizeLook(Object.assign({}, look, presets[id] || {}), look.gender);
  }

  static isDefault(look) {
    const other = this.defaultLook(look.gender === 'female' ? 'male' : 'female');
    const mine = this.defaultLook(look.gender);
    const same = d => Object.keys(d).every(k => k === 'gender' || d[k] === look[k]);
    return same(mine) || same(other);
  }
}

export function init() {
  addMethods(AnglerFactory, null, anglerDimsStatics);
  addMethods(AnglerFactory, null, anglerFaceStatics);
  addMethods(AnglerFactory, null, anglerRigStatics);
  addMethods(AnglerFactory, null, anglerLimbsStatics);
  addMethods(AnglerFactory, null, anglerTorsoStatics);
  addMethods(AnglerFactory, null, anglerDressStatics);
}
