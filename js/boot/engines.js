/* Engine downloads: three.js (as the global THREE, with the legacy look) and Rapier (as window.RAPIER), each
   fetched fresh with a progress count, written to the offline cache, and read from that cache when offline. */
import { L, paint } from './progress.js';

const URL3 = 'vendor/three.r187.module.min.js', URLR = 'vendor/rapier3d-compat.0.21.0.min.js';
const cacheName = () => 'pixel-fishing-' + window.PF_VERSION;

/* three.js r187 is an ES module (v8.0.0). The game reads a global THREE, so the module namespace is copied into a
   plain object (the namespace itself is frozen) and the legacy-look compat layer is applied. */
function addScript(src) {
  return import(src).then(ns => {
    if (!ns || !ns.WebGLRenderer) return false;
    window.THREE = Object.assign({}, ns);
    legacyLook(window.THREE);
    return true;
  }).catch(() => false);
}

/* Keep the r128 look on the new engine: colours were tuned for linear output with no colour management, and lights
   for the legacy (non-physical) model. So: colour management off, linear output, and the light shader chunk patched
   back to the legacy maths (intensity x PI and the old distance fall-off). */
function legacyLook(T) {
  T.ColorManagement.enabled = false;
  const Base = T.WebGLRenderer;
  T.WebGLRenderer = class extends Base { constructor(o) { super(o); this.outputColorSpace = T.LinearSRGBColorSpace; } };
  let c = T.ShaderChunk.lights_pars_begin;
  const n0 = c;
  const swap = (a, b) => { if (c.indexOf(a) < 0) { console.warn('legacyLook: chunk changed:', a); return; } c = c.split(a).join(b); };
  swap('vec3 irradiance = ambientLightColor;', 'vec3 irradiance = ambientLightColor * PI;');
  swap('float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );\n\tif ( cutoffDistance > 0.0 ) {\n\t\tdistanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );\n\t}\n\treturn distanceFalloff;',
    'if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );\n\treturn 1.0;');
  swap('light.color = sunLight.color;', 'light.color = sunLight.color * PI;');
  swap('light.color = directionalLight.color;', 'light.color = directionalLight.color * PI;');
  swap('light.color = pointLight.color;', 'light.color = pointLight.color * PI;');
  swap('light.color = spotLight.color * spotAttenuation;', 'light.color = spotLight.color * spotAttenuation * PI;');
  swap('vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );', 'vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight ) * PI;');
  T.ShaderChunk.lights_pars_begin = c;
  T.PF_LEGACY_LOOK = c !== n0;
}

/* download a vendor file with progress (fresh, then written to the offline cache); offline or blocked: the cached copy */
async function fetchParts(url, onBytes) {
  const parts = [];
  let got = 0;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(url, { cache: 'reload', signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error('http ' + res.status);
    if (res.body && res.body.getReader) {
      const reader = res.body.getReader();
      for (;;) { const r = await reader.read(); if (r.done) break; parts.push(r.value); got += r.value.length; onBytes(got); }
    } else {
      const buf = await res.arrayBuffer(); parts.push(new Uint8Array(buf)); onBytes(buf.byteLength);
    }
    try { // overwrite the cached copy with the fresh download
      if (window.caches) {
        const c = await caches.open(cacheName());
        await c.put(url, new Response(new Blob(parts, { type: 'application/javascript' }), { headers: { 'Content-Type': 'application/javascript' } }));
      }
    } catch (e) {}
    return parts;
  } catch (e) {
    onBytes(0);
    try {
      const hit = window.caches && await caches.match(url);
      if (hit) { const b2 = await hit.arrayBuffer(); onBytes(b2.byteLength); return [new Uint8Array(b2)]; }
    } catch (e2) {}
    return null;
  }
}
const blobUrl = parts => URL.createObjectURL(new Blob(parts, { type: 'application/javascript' }));

export async function downloadThree() {
  const cdns = ['https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js', 'https://unpkg.com/three@0.187.0/build/three.module.js'];
  const parts = await fetchParts(URL3, n => { L.loaded = n; paint(); });
  if (parts && parts.length && await addScript(blobUrl(parts))) return true;
  for (let i = 0; i < cdns.length; i++) {
    L.loaded = Math.round(window.PF_THREE_BYTES * ((i + 0.5) / cdns.length));
    paint();
    if (await addScript(cdns[i])) { L.loaded = window.PF_THREE_BYTES; paint(); return true; }
  }
  return false;
}

/* v8.2.0: Rapier, the physics engine (walking, the townsfolk, path finding). It has to start (compile its
   WebAssembly) before the game, so the loading screen waits for it too. */
export async function downloadPhysics() {
  const cdns = ['https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.21.0/dist/rapier.mjs', 'https://unpkg.com/@dimforge/rapier3d-compat@0.21.0/dist/rapier.mjs'];
  const parts = await fetchParts(URLR, n => { L.loadedR = n; paint(); });
  const srcs = (parts && parts.length ? [blobUrl(parts)] : []).concat(cdns);
  for (let i = 0; i < srcs.length; i++) {
    try {
      if (i > 0 || !parts) { L.loadedR = Math.round(window.PF_RAPIER_BYTES * 0.5); paint(); }
      const ns = await import(srcs[i]);
      const R = ns && (ns.init ? ns : ns.default);
      if (!R || !R.init) continue;
      L.physics = 'init'; paint();
      await R.init();
      window.RAPIER = R; L.loadedR = window.PF_RAPIER_BYTES; L.physics = true; paint();
      return true;
    } catch (e) { console.warn('Rapier could not start from', i ? srcs[i] : 'the bundled copy', e); }
  }
  L.physics = 'off'; paint();
  return false;
}
