/* WorldBuilder (class): the fish spec table. Every 3D model builder joins it from the wb-* method groups. */
import { THREE } from '../engine/three.js';
import { addMethods } from '../utils.js';
import { wbFishStatics } from './wb-fish.js';
import { wbJunkStatics } from './wb-junk.js';
import { wbHullStatics } from './wb-hull.js';
import { wbBoatStatics } from './wb-boat.js';
import { wbBoatBaseStatics } from './wb-boat-base.js';
import { wbPropKitStatics } from './wb-prop-kit.js';
import { wbBucketStatics } from './wb-bucket.js';
import { wbPierPropsStatics } from './wb-pier-props.js';
import { wbAquariumStatics } from './wb-aquarium.js';
import { wbGalleryStatics } from './wb-gallery.js';
import { wbShopHouseStatics } from './wb-shop-house.js';
import { wbCabinStatics } from './wb-cabin.js';
import { wbTackleShopStatics } from './wb-tackle-shop.js';
import { wbShopFitStatics } from './wb-shop-fit.js';
import { wbShopItemStatics } from './wb-shop-item.js';
import { wbNatureStatics } from './wb-nature.js';
import { wbTownStatics } from './wb-town.js';
import { wbDistrictsStatics } from './wb-districts.js';
import { wbCottageStatics } from './wb-cottage.js';
import { wbWorldStatics } from './wb-world.js';

export class WorldBuilder {
  /* ------------------------------------------------------------------
     LOFTED FISH GENERATOR
     Smooth countershaded bodies, real fin shapes, layered eyes and
     per-species features. Nose points toward +X, up is +Y, width is Z.
     ------------------------------------------------------------------ */
  static fishSpec(item) {
    const mix2 = (hex, f) => '#' + new THREE.Color(hex).lerp(new THREE.Color('#ffffff'), f).getHexString();
    const spec = {
      L: 1.5, H: 0.30, W: 0.16, peak: 0.42, noseQ: 0.6, ped: 0.10, belly: 0.85,
      bend: 0, bendFreq: 1.5,
      caudal: { type: 'fork', size: 0.36 },
      dorsal: [{ t0: 0.30, t1: 0.62, h: 0.22, sweep: 0.6, front: 0.45 }],
      anal: [{ t0: 0.26, t1: 0.46, h: 0.12, sweep: 0.6, front: 0.4 }],
      pectoral: { size: 0.22, t: 0.74, y: -0.25, ratio: 1.0 },
      pelvic: { size: 0.13, t: 0.62 },
      eye: { r: 0.05, t: 0.875, y: 0.22 },
      gill: true, mouth: 0.1,
      bands: [], bellyColor: null, finColor: null,
      spines: 0, spineLen: 0.09, bill: 0, teeth: 0, lure: false, finlets: 0, barbel: false,
      flatEyes: false, tallFins: false, crest: false, target: 1.7
    };
    const id = item.id;
    switch (item.shape) {
      case 'fish_slim':
        Object.assign(spec, { L: 1.9, H: 0.17, W: 0.10, peak: 0.45, ped: 0.12, target: 2.0 });
        spec.dorsal = [{ t0: 0.34, t1: 0.52, h: 0.12, sweep: 0.7, front: 0.4 }];
        spec.anal = [{ t0: 0.30, t1: 0.44, h: 0.09, sweep: 0.7, front: 0.4 }];
        spec.caudal = { type: 'fork', size: 0.30 };
        spec.pectoral = { size: 0.16, t: 0.76, y: -0.2, ratio: 0.9 };
        spec.pelvic = { size: 0.09, t: 0.62 };
        spec.eye = { r: 0.04, t: 0.9, y: 0.2 };
        break;
      case 'fish_round':
        Object.assign(spec, { L: 1.05, H: 0.50, W: 0.17, peak: 0.48, noseQ: 0.8, ped: 0.2, target: 1.45 });
        spec.dorsal = [{ t0: 0.16, t1: 0.80, h: 0.30, sweep: 0.9, front: 0.35 }];
        spec.anal = [{ t0: 0.22, t1: 0.72, h: 0.22, sweep: 0.9, front: 0.35 }];
        spec.caudal = { type: 'round', size: 0.28 };
        spec.pectoral = { size: 0.24, t: 0.72, y: -0.12, ratio: 1.3 };
        spec.pelvic = { size: 0.16, t: 0.62 };
        spec.eye = { r: 0.06, t: 0.86, y: 0.2 };
        break;
      case 'fish_flat':
        Object.assign(spec, { L: 1.5, H: 0.46, W: 0.12, peak: 0.5, noseQ: 0.85, ped: 0.18, target: 1.6 });
        spec.dorsal = [{ t0: 0.12, t1: 0.9, h: 0.07, sweep: 0.2, front: 0.5 }];
        spec.anal = [{ t0: 0.12, t1: 0.8, h: 0.07, sweep: 0.2, front: 0.5 }];
        spec.finColor = mix2(item.color, 0.25);
        spec.caudal = { type: 'round', size: 0.24 };
        spec.pectoral = { size: 0.14, t: 0.72, y: -0.05, ratio: 1.0 };
        spec.pelvic = { size: 0.0, t: 0.6 };
        spec.eye = { r: 0.05, t: 0.84, y: 0.35 };
        break;
      case 'fish_spiky':
        Object.assign(spec, { L: 1.15, H: 0.42, W: 0.38, peak: 0.5, noseQ: 0.75, ped: 0.16, spines: 46, target: 1.45 });
        spec.dorsal = [{ t0: 0.20, t1: 0.34, h: 0.11, sweep: 0.5, front: 0.5 }];
        spec.anal = [{ t0: 0.22, t1: 0.32, h: 0.09, sweep: 0.5, front: 0.5 }];
        spec.caudal = { type: 'round', size: 0.2 };
        spec.pectoral = { size: 0.16, t: 0.74, y: -0.1, ratio: 1.2 };
        spec.pelvic = { size: 0.0, t: 0.6 };
        spec.eye = { r: 0.075, t: 0.86, y: 0.28 };
        break;
      case 'fish_tuna':
        Object.assign(spec, { L: 2.1, H: 0.32, W: 0.27, peak: 0.5, noseQ: 0.55, ped: 0.06, finlets: 6, target: 2.2 });
        spec.dorsal = [
          { t0: 0.52, t1: 0.62, h: 0.24, sweep: 1.1, front: 0.2 },
          { t0: 0.34, t1: 0.44, h: 0.1, sweep: 1.0, front: 0.3 }
        ];
        spec.anal = [{ t0: 0.32, t1: 0.42, h: 0.1, sweep: 1.0, front: 0.3 }];
        spec.caudal = { type: 'lunate', size: 0.44 };
        spec.pectoral = { size: 0.3, t: 0.74, y: -0.22, ratio: 0.6 };
        spec.pelvic = { size: 0.1, t: 0.62 };
        spec.eye = { r: 0.05, t: 0.9, y: 0.12 };
        break;
      case 'fish_marlin':
        Object.assign(spec, { L: 2.0, H: 0.30, W: 0.22, peak: 0.48, noseQ: 0.55, ped: 0.05, finlets: 5, bill: 0.7, target: 2.5 });
        spec.dorsal = [
          { t0: 0.42, t1: 0.76, h: 0.38, sweep: 0.9, front: 0.25 },
          { t0: 0.26, t1: 0.34, h: 0.08, sweep: 1.0, front: 0.3 }
        ];
        spec.anal = [{ t0: 0.28, t1: 0.36, h: 0.09, sweep: 1.0, front: 0.3 }];
        spec.caudal = { type: 'lunate', size: 0.46 };
        spec.pectoral = { size: 0.26, t: 0.72, y: -0.25, ratio: 0.5 };
        spec.pelvic = { size: 0.14, t: 0.6 };
        spec.eye = { r: 0.05, t: 0.88, y: 0.1 };
        break;
      case 'fish_eel':
        Object.assign(spec, { L: 3.0, H: 0.13, W: 0.11, peak: 0.55, noseQ: 0.5, ped: 0.35, bend: 0.2, bendFreq: 1.6, target: 2.4 });
        spec.dorsal = [{ t0: 0.04, t1: 0.86, h: 0.09, sweep: 0.0, front: 0.5 }];
        spec.anal = [{ t0: 0.04, t1: 0.8, h: 0.07, sweep: 0.0, front: 0.5 }];
        spec.caudal = { type: 'round', size: 0.12 };
        spec.pectoral = { size: 0.08, t: 0.84, y: -0.1, ratio: 1.0 };
        spec.pelvic = { size: 0.0, t: 0.6 };
        spec.eye = { r: 0.04, t: 0.93, y: 0.35 };
        spec.mouth = 0.2;
        break;
      case 'fish_angler':
        Object.assign(spec, { L: 1.15, H: 0.52, W: 0.42, peak: 0.62, noseQ: 0.35, ped: 0.12, lure: true, teeth: 9, target: 1.5 });
        spec.dorsal = [{ t0: 0.24, t1: 0.38, h: 0.16, sweep: 0.5, front: 0.5 }];
        spec.anal = [{ t0: 0.22, t1: 0.34, h: 0.12, sweep: 0.5, front: 0.5 }];
        spec.caudal = { type: 'round', size: 0.24 };
        spec.pectoral = { size: 0.2, t: 0.66, y: -0.15, ratio: 1.3 };
        spec.pelvic = { size: 0.0, t: 0.6 };
        spec.eye = { r: 0.05, t: 0.84, y: 0.4 };
        spec.mouth = 0.3;
        break;
      default: break; // fish_standard
    }

    // Species touches
    const A = item.accent, C = item.color;
    const bar = (t0, t1, color, cy0 = -1, cy1 = 1) => ({ t0, t1, color, cy0, cy1 });
    switch (id) {
      case 'f_minnow': spec.bellyColor = '#fffbe6'; break;
      case 'f_sardine': spec.bands = [bar(0.25, 0.92, A, 0.1, 0.45)]; spec.bellyColor = '#ffffff'; break;
      case 'f_herring': spec.bands = [bar(0.2, 0.9, A, 0.2, 0.5)]; spec.bellyColor = '#f1f5f9'; break;
      case 'f_perch':
        spec.bands = [0.36, 0.46, 0.56, 0.66, 0.76].map(t => bar(t, t + 0.045, A, 0.0, 1.0)); spec.bellyColor = '#fde68a';
        spec.finColor = '#ef4444'; spec.dorsal = [{ t0: 0.26, t1: 0.46, h: 0.2, sweep: 0.5, front: 0.4 }, { t0: 0.5, t1: 0.64, h: 0.15, sweep: 0.5, front: 0.4 }];
        break;
      case 'f_mullet': spec.bands = [bar(0.2, 0.95, A, 0.0, 0.2)]; spec.bellyColor = '#f8fafc'; break;
      case 'f_seabream': spec.bands = [bar(0.8, 0.98, A, 0.4, 0.95)]; spec.bellyColor = '#e2e8f0'; break;
      case 'f_seahorse': break;
      case 'f_flounder': spec.bands = [bar(0.1, 0.9, A, 0.55, 0.8)]; break;
      case 'f_seabass': spec.bands = [bar(0.2, 0.9, '#64748b', 0.35, 0.7)]; break;
      case 'f_snapper': spec.bellyColor = '#fecaca'; spec.finColor = '#dc2626'; break;
      case 'f_puffer': spec.bellyColor = '#fef9c3'; spec.bands = [bar(0.3, 0.8, A, 0.55, 1.0)]; break;
      case 'f_lionfish':
        spec.L = 1.4; spec.H = 0.30; spec.W = 0.17; spec.spines = 0;
        spec.bands = [0.28, 0.38, 0.48, 0.58, 0.68, 0.78].map((t, i) => bar(t, t + 0.045, i % 2 ? C : '#f8fafc'));
        spec.dorsal = [{ t0: 0.28, t1: 0.74, h: 0.5, sweep: 0.2, front: 0.5, spiky: true }];
        spec.anal = [{ t0: 0.28, t1: 0.44, h: 0.2, sweep: 0.3, front: 0.5, spiky: true }];
        spec.pectoral = { size: 0.5, t: 0.74, y: -0.1, ratio: 1.5, fan: true };
        break;
      case 'f_moray': spec.bands = [0.2, 0.34, 0.48, 0.62, 0.76].map(t => bar(t, t + 0.06, A, 0.2, 1.0)); spec.mouth = 0.3; spec.teeth = 6; spec.eye.r = 0.035; break;
      case 'f_parrotfish': spec.H = 0.36; spec.noseQ = 0.4; spec.bands = [bar(0.5, 0.95, A, -0.1, 0.5)]; break;
      case 'f_grouper': spec.H = 0.36; spec.W = 0.22; spec.noseQ = 0.4; spec.mouth = 0.2; spec.bellyColor = '#d6d3d1'; break;
      case 'f_trigger': spec.bands = [bar(0.7, 0.92, A, -1, 1)]; break;
      case 'f_mandarin':
        spec.bands = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8].map((t, i) => bar(t, t + 0.05, i % 2 ? A : '#fb923c')); spec.bellyColor = C; break;
      case 'f_clownfish':
        spec.bands = [bar(0.34, 0.42, '#ffffff'), bar(0.6, 0.67, '#ffffff'), bar(0.88, 0.94, '#ffffff'), bar(0.31, 0.34, '#111827'), bar(0.42, 0.45, '#111827'), bar(0.57, 0.6, '#111827'), bar(0.67, 0.7, '#111827')];
        spec.bellyColor = C; spec.finColor = '#fb923c'; break;
      case 'f_angelfish':
        spec.H = 0.6; spec.L = 1.15; spec.tallFins = true; spec.bands = [bar(0.3, 0.9, A, 0.45, 0.8)]; spec.bellyColor = '#93c5fd';
        spec.dorsal = [{ t0: 0.14, t1: 0.74, h: 0.5, sweep: 1.5, front: 0.2 }]; spec.anal = [{ t0: 0.2, t1: 0.7, h: 0.4, sweep: 1.5, front: 0.2 }]; break;
      case 'f_blobfish':
        spec.L = 1.1; spec.H = 0.46; spec.W = 0.34; spec.peak = 0.62; spec.noseQ = 0.3; spec.ped = 0.12; spec.eye = { r: 0.04, t: 0.8, y: 0.15 };
        spec.dorsal = [{ t0: 0.2, t1: 0.4, h: 0.1, sweep: 0.3, front: 0.5 }]; spec.mouth = 0.25; spec.bellyColor = '#fecdd3'; break;
      case 'f_mahi':
        spec.H = 0.38; spec.noseQ = 0.32; spec.L = 1.9; spec.bands = [bar(0.2, 0.95, '#22c55e', 0.15, 0.55)]; spec.bellyColor = '#fef08a';
        spec.dorsal = [{ t0: 0.14, t1: 0.92, h: 0.24, sweep: 0.5, front: 0.5 }]; break;
      case 'f_barracuda': spec.L = 2.3; spec.teeth = 8; spec.mouth = 0.22; spec.bands = [0.3, 0.42, 0.54, 0.66].map(t => bar(t, t + 0.04, A, 0.1, 1.0)); spec.bellyColor = '#f8fafc'; break;
      case 'f_wahoo': spec.L = 2.2; spec.bands = [0.25, 0.35, 0.45, 0.55, 0.65, 0.75].map(t => bar(t, t + 0.04, A, -0.2, 1.0)); spec.finlets = 6; break;
      case 'f_skipjack': spec.bands = [0.3, 0.4, 0.5, 0.6].map(t => bar(t, t + 0.04, '#0f172a', -0.8, -0.2)); spec.bellyColor = '#e2e8f0'; break;
      case 'f_cobia': spec.bands = [bar(0.2, 0.95, '#1c1917', 0.0, 0.25)]; spec.bellyColor = '#e7e5e4'; spec.H = 0.26; spec.L = 1.9; break;
      case 'f_sailfish': spec.bill = 0.55; spec.dorsal[0] = { t0: 0.34, t1: 0.9, h: 0.5, sweep: 0.8, front: 0.4 }; spec.bellyColor = '#e0f2fe'; break;
      case 'f_swordfish': spec.bill = 0.95; spec.dorsal[0] = { t0: 0.5, t1: 0.6, h: 0.3, sweep: 1.1, front: 0.2 }; spec.target = 2.8; break;
      case 'fm_astralmarlin': spec.bill = 0.75; break;
      case 'f_sunfish':
        spec.L = 1.15; spec.H = 0.75; spec.W = 0.2; spec.peak = 0.5; spec.noseQ = 0.7; spec.ped = 0.5; spec.target = 1.6;
        spec.caudal = { type: 'square', size: 0.34 }; spec.dorsal = [{ t0: 0.2, t1: 0.5, h: 0.5, sweep: 1.4, front: 0.2 }]; spec.anal = [{ t0: 0.2, t1: 0.48, h: 0.42, sweep: 1.4, front: 0.2 }];
        spec.eye = { r: 0.05, t: 0.84, y: 0.1 }; spec.mouth = 0.05; break;
      case 'f_angler': spec.bands = []; break;
      case 'f_viperfish': spec.L = 1.9; spec.H = 0.2; spec.W = 0.13; spec.noseQ = 0.4; spec.teeth = 8; spec.barbel = true; spec.mouth = 0.28; spec.lure = false; break;
      case 'f_gulper': spec.L = 2.8; spec.H = 0.16; spec.peak = 0.78; spec.noseQ = 0.35; spec.mouth = 0.5; spec.bend = 0.22; spec.teeth = 5; spec.dorsal = [{ t0: 0.04, t1: 0.7, h: 0.07, sweep: 0, front: 0.5 }]; break;
      case 'f_oarfish': spec.L = 3.2; spec.crest = true; spec.bellyColor = '#f1f5f9'; spec.bend = 0.14; spec.dorsal = [{ t0: 0.04, t1: 0.96, h: 0.2, sweep: 0.0, front: 0.5, spiky: true }]; break;
      case 'f_coelacanth': spec.H = 0.38; spec.W = 0.24; spec.pectoral = { size: 0.3, t: 0.7, y: -0.28, ratio: 1.6 }; spec.pelvic = { size: 0.22, t: 0.52 }; spec.caudal = { type: 'round', size: 0.4 }; spec.bands = [0.25, 0.4, 0.55, 0.7].map(t => bar(t, t + 0.05, '#f8fafc', 0.2, 0.9)); break;
      case 'f_goblin': spec.bill = 0.45; spec.L = 2.0; spec.H = 0.3; spec.teeth = 6; spec.bellyColor = '#f5d0fe'; spec.finlets = 0; break;
      case 'f_dragonfish': spec.barbel = true; spec.teeth = 7; spec.mouth = 0.25; spec.L = 2.6; spec.bend = 0.16; break;
      case 'f_leviathan': spec.spines = 10; spec.spineLen = 0.14; spec.teeth = 8; spec.L = 2.4; break;
      case 'f_lanternfish': spec.bands = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8].map(t => bar(t, t + 0.025, A, -0.7, -0.5)); break;
      case 'fm_moonglow': spec.bands = [bar(0.2, 0.9, A, -0.8, -0.4)]; break;
      case 'fm_celestial': spec.bands = [bar(0.2, 0.4, '#f8fafc', 0.1, 0.9), bar(0.56, 0.7, '#fb923c', 0.0, 1.0), bar(0.8, 0.9, '#f8fafc', 0.0, 0.9)]; break;
      case 'fm_opah': spec.bands = [bar(0.3, 0.8, '#f8fafc', -0.2, 0.2)]; spec.finColor = '#ef4444'; break;
      case 'st_thundereel': spec.bands = [0.2, 0.4, 0.6, 0.8].map(t => bar(t, t + 0.05, A, 0.3, 1.0)); break;
      case 'fm_ribbonserpent': spec.crest = true; spec.dorsal = [{ t0: 0.04, t1: 0.96, h: 0.16, sweep: 0.0, front: 0.5, spiky: true }]; break;
      default: break;
    }
    return spec;
  }
}

export function init() {
  addMethods(WorldBuilder, null, wbFishStatics);
  addMethods(WorldBuilder, null, wbJunkStatics);
  addMethods(WorldBuilder, null, wbHullStatics);
  addMethods(WorldBuilder, null, wbBoatStatics);
  addMethods(WorldBuilder, null, wbBoatBaseStatics);
  addMethods(WorldBuilder, null, wbPropKitStatics);
  addMethods(WorldBuilder, null, wbBucketStatics);
  addMethods(WorldBuilder, null, wbPierPropsStatics);
  addMethods(WorldBuilder, null, wbAquariumStatics);
  addMethods(WorldBuilder, null, wbGalleryStatics);
  addMethods(WorldBuilder, null, wbShopHouseStatics);
  addMethods(WorldBuilder, null, wbCabinStatics);
  addMethods(WorldBuilder, null, wbTackleShopStatics);
  addMethods(WorldBuilder, null, wbShopFitStatics);
  addMethods(WorldBuilder, null, wbShopItemStatics);
  addMethods(WorldBuilder, null, wbNatureStatics);
  addMethods(WorldBuilder, null, wbTownStatics);
  addMethods(WorldBuilder, null, wbDistrictsStatics);
  addMethods(WorldBuilder, null, wbCottageStatics);
  addMethods(WorldBuilder, null, wbWorldStatics);
}
