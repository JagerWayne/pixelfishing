/* Procedural pixel-art textures (class): canvas textures and sign boards. The texture set and the item icons
   join from the texture-set and item-icons method groups. */
import { THREE } from '../engine/three.js';
import { addMethods } from '../utils.js';
import { textureSetStatics } from './texture-set.js';
import { itemIconsStatics } from './item-icons.js';

/* =========================================================================
   SECTION C: PROCEDURAL PIXEL-ART TEXTURE & ICON FACTORY
   ========================================================================= */
export class PixelTextureFactory {
  static makeTexture(size, drawFn, repeatX = 1, repeatY = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    drawFn(ctx, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
    tex.colorSpace = THREE.SRGBColorSpace;
    if (repeatX > 1 || repeatY > 1) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeatX, repeatY);
    }
    return tex;
  }

  static makeSignTexture(text, width = 256, height = 64) {
    const k = width / 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#3e210e';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#ffd24c';
    ctx.lineWidth = 4 * k;
    ctx.strokeRect(4 * k, 4 * k, width - 8 * k, height - 8 * k);
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Shrink the font until the text fits inside the frame (long names used to be clipped).
    let fontPx = Math.round(26 * k);
    const maxTextWidth = width - 28 * k;
    do {
      ctx.font = `bold ${fontPx}px "Courier New", monospace`;
      if (ctx.measureText(text).width <= maxTextWidth) break;
      fontPx -= 1;
    } while (fontPx > 8);
    ctx.fillText(text, width / 2, height / 2 + 2 * k);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
}

export function init() {
  addMethods(PixelTextureFactory, null, textureSetStatics);
  addMethods(PixelTextureFactory, null, itemIconsStatics);
}
