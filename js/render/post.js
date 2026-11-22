/* The screen shader material (pixelation, palettes, filters, vignette). */
import { THREE } from '../engine/three.js';
import { postUniforms } from './renderer.js';

export let postMaterial;

export function init() {
  postMaterial = new THREE.ShaderMaterial({
    uniforms: postUniforms,
    depthWrite: false,
    depthTest: false,
    vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }
        `,
    fragmentShader: `
          uniform sampler2D tDiffuse;
          uniform vec2 uResolution;
          uniform float uTime;
          uniform int uMode;
          varying vec2 vUv;

          vec2 curveCRT(vec2 uv) {
            uv = uv * 2.0 - 1.0;
            vec2 offset = abs(uv.yx) / vec2(6.5, 5.5);
            uv = uv + uv * offset * offset;
            uv = uv * 0.5 + 0.5;
            return uv;
          }

          void main() {
            vec2 uv = vUv;

            if (uMode == 1) {
              vec2 cUv = curveCRT(uv);
              if (cUv.x < 0.0 || cUv.x > 1.0 || cUv.y < 0.0 || cUv.y > 1.0) {
                gl_FragColor = vec4(0.02, 0.03, 0.05, 1.0);
                return;
              }
              float shift = 0.0014;
              float r = texture2D(tDiffuse, cUv + vec2(shift, 0.0)).r;
              float g = texture2D(tDiffuse, cUv).g;
              float b = texture2D(tDiffuse, cUv - vec2(shift, 0.0)).b;
              vec3 col = vec3(r, g, b);
              // Boost contrast & vibrancy so water, bobbers, and pier edges pop clearly
              col = clamp((col - 0.42) * 1.48 + 0.46, 0.0, 1.0);
              float luma = dot(col, vec3(0.299, 0.587, 0.114));
              col = mix(vec3(luma), col, 1.28);
              float scanline = sin(cUv.y * uResolution.y * 1.35 + uTime * 4.0) * 0.055;
              col -= scanline;
              col = clamp(floor(col * 10.0 + 0.5) / 10.0, 0.0, 1.0);
              float vig = 16.0 * cUv.x * cUv.y * (1.0 - cUv.x) * (1.0 - cUv.y);
              col *= pow(vig, 0.14);
              gl_FragColor = vec4(col, 1.0);
              return;
            }

            if (uMode == 2) {
              float pixelSize = max(3.0, min(uResolution.x, uResolution.y) / 145.0);
              vec2 grid = uResolution / pixelSize;
              vec2 pUv = (floor(uv * grid) + 0.5) / grid;
              vec3 col = texture2D(tDiffuse, pUv).rgb;
              col = floor(col * 12.0 + 0.5) / 12.0;
              gl_FragColor = vec4(col, 1.0);
              return;
            }

            if (uMode == 8) {
              // Pocket DMG-01: 4 olive shades, ordered dithering, local-contrast boost and dark outlines
              // wherever neighbouring pixels differ in COLOUR (not just brightness), so a red bow against
              // blue water no longer melts into one flat shade.
              float pixelSize = max(3.0, min(uResolution.x, uResolution.y) / 170.0);
              vec2 grid = floor(uResolution / pixelSize);
              vec2 cell = floor(uv * grid);
              vec2 pUv = (cell + 0.5) / grid;
              vec2 st = 1.0 / grid;
              vec3 W = vec3(0.299, 0.587, 0.114);

              vec3 c  = texture2D(tDiffuse, pUv).rgb;
              vec3 cl = texture2D(tDiffuse, pUv - vec2(st.x, 0.0)).rgb;
              vec3 cr = texture2D(tDiffuse, pUv + vec2(st.x, 0.0)).rgb;
              vec3 cd = texture2D(tDiffuse, pUv - vec2(0.0, st.y)).rgb;
              vec3 cu = texture2D(tDiffuse, pUv + vec2(0.0, st.y)).rgb;

              float l = dot(c, W) + 0.12;                    // lift mid-tones so water sits on a mid shade, not the darkest one
              float nb = (dot(cl, W) + dot(cr, W) + dot(cd, W) + dot(cu, W)) * 0.25 + 0.12;

              float v = l + (l - nb) * 1.2;                  // local contrast
              v = clamp((v - 0.50) * 1.7 + 0.50, 0.0, 1.0);  // global contrast around mid grey

              // colour-difference edges -> darkest shade
              float e = max(max(length(c - cl), length(c - cr)), max(length(c - cd), length(c - cu)));
              float edge = smoothstep(0.16, 0.34, e);
              v = mix(v, 0.0, edge * 0.85);

              // 4x4 ordered dither adds in-between tones without extra palette colours
              vec2 q = mod(cell, 4.0);
              float b2 = fract(floor(q.x * 0.5) * 0.5 + floor(q.y * 0.5) * floor(q.y * 0.5) * 0.75);
              float b1 = fract(mod(q.x, 2.0) * 0.5 + mod(q.y, 2.0) * mod(q.y, 2.0) * 0.75);
              float dith = b2 * 0.25 + b1;
              v = clamp(v + (dith - 0.5) * 0.10, 0.0, 1.0);

              vec3 c0 = vec3(0.04, 0.16, 0.05);
              vec3 c1 = vec3(0.19, 0.38, 0.19);
              vec3 c2 = vec3(0.55, 0.67, 0.06);
              vec3 c3 = vec3(0.78, 0.86, 0.22);
              vec3 pal = v < 0.25 ? c0 : (v < 0.50 ? c1 : (v < 0.75 ? c2 : c3));
              gl_FragColor = vec4(pal, 1.0);
              return;
            }

            gl_FragColor = texture2D(tDiffuse, uv);
          }
        `
  });
}
