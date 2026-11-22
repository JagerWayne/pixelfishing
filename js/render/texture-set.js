/* PixelTextureFactory method: createAllTextures, every shared pixel-art texture of the world. */
import { THREE } from '../engine/three.js';

export const textureSetStatics = {
  createAllTextures() {
    const wood = this.makeTexture(32, (ctx, s) => {
      ctx.fillStyle = '#7c4a27';
      ctx.fillRect(0, 0, s, s);
      for (let y = 0; y < s; y += 8) {
        ctx.fillStyle = y % 16 === 0 ? '#8c5630' : '#6e4020';
        ctx.fillRect(0, y, s, 7);
        ctx.fillStyle = '#3e210e';
        ctx.fillRect(0, y + 7, s, 1);
        ctx.fillStyle = '#9e653c';
        ctx.fillRect((y * 3) % 24, y + 2, 6, 1);
        ctx.fillRect((y * 7 + 5) % 22, y + 4, 8, 1);
        ctx.fillStyle = '#334155';
        ctx.fillRect(2, y + 2, 1, 1);
        ctx.fillRect(2, y + 5, 1, 1);
        ctx.fillRect(s - 3, y + 2, 1, 1);
      }
    }, 2, 8);

    // Deck board: grain runs along U (the board's length); the edge lines frame one plank
    const deck = this.makeTexture(64, (ctx, s) => {
      let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      ctx.fillStyle = '#8b5a31'; ctx.fillRect(0, 0, s, s);
      for (let y = 3; y < s - 3; y++) { // soft banding between grain lines
        ctx.fillStyle = (y % 5 < 2) ? 'rgba(255,214,160,0.07)' : 'rgba(40,20,8,0.07)';
        ctx.fillRect(0, y, s, 1);
      }
      for (let i = 0; i < 26; i++) { // long grain streaks
        const y = 3 + Math.floor(rnd() * (s - 6)), x = Math.floor(rnd() * s), w = 14 + Math.floor(rnd() * 40);
        ctx.fillStyle = rnd() > 0.45 ? 'rgba(52,26,10,0.45)' : 'rgba(190,135,80,0.4)';
        ctx.fillRect(x, y, w, 1);
        if (x + w > s) ctx.fillRect(0, y, x + w - s, 1); // wrap so the tile repeats seamlessly
      }
      const knot = (kx, ky, r) => { // a knot with a few rings
        ctx.fillStyle = 'rgba(48,24,9,0.85)'; ctx.beginPath(); ctx.ellipse(kx, ky, r * 1.6, r, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(120,76,40,0.9)'; ctx.beginPath(); ctx.ellipse(kx, ky, r, r * 0.55, 0, 0, Math.PI * 2); ctx.fill();
      };
      knot(18, 30, 3); knot(47, 44, 2);
      ctx.fillStyle = '#3a1f0d'; ctx.fillRect(0, 0, s, 2); ctx.fillRect(0, s - 2, s, 2); // board edges
      ctx.fillStyle = 'rgba(255,220,170,0.18)'; ctx.fillRect(0, 2, s, 1);
    });
    deck.wrapS = deck.wrapT = THREE.RepeatWrapping;

    const water = this.makeTexture(64, (ctx, s) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#d8f3ff';
      for (let y = 0; y < s; y += 4) {
        for (let x = 0; x < s; x += 4) {
          if ((x + y) % 8 === 0) ctx.fillRect(x, y, 3, 1);
        }
      }
      ctx.fillStyle = '#bce8fc';
      for (let i = 0; i < 28; i++) {
        const rx = (i * 19) % 58;
        const ry = (i * 29) % 60;
        ctx.fillRect(rx, ry, 5, 1);
        ctx.fillRect(rx + 2, ry + 1, 3, 1);
      }
    }, 24, 96);

    const sand = this.makeTexture(32, (ctx, s) => {
      ctx.fillStyle = '#d9b982';
      ctx.fillRect(0, 0, s, s);
      for (let y = 0; y < s; y++) {
        for (let x = 0; x < s; x++) {
          const hash = (x * 37 + y * 91) % 17;
          if (hash === 0) {
            ctx.fillStyle = '#e8cfa0';
            ctx.fillRect(x, y, 1, 1);
          } else if (hash === 1) {
            ctx.fillStyle = '#b8965d';
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }, 12, 6);

    const grass = this.makeTexture(32, (ctx, s) => {
      ctx.fillStyle = '#4c7848';
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 60; i++) {
        const x = (i * 13) % s;
        const y = (i * 23) % s;
        ctx.fillStyle = i % 2 === 0 ? '#5e8f59' : '#3a5e37';
        ctx.fillRect(x, y, 2, 2);
      }
    }, 10, 4);

    const awning = this.makeTexture(32, (ctx, s) => {
      for (let x = 0; x < s; x += 8) {
        ctx.fillStyle = (x / 8) % 2 === 0 ? '#b91c1c' : '#fef3c7';
        ctx.fillRect(x, 0, 8, s);
      }
    }, 2, 1);

    const hull = this.makeTexture(32, (ctx, s) => {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 10, s, 5);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 22, s, 10);
    });

    const scales = this.makeTexture(16, (ctx, s) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      for (let y = 0; y < s; y += 4) {
        for (let x = (y % 8 === 0 ? 0 : 2); x < s; x += 4) {
          ctx.fillRect(x, y + 2, 3, 1);
          ctx.fillRect(x + 3, y + 1, 1, 1);
        }
      }
    });

    const shopSign = this.makeSignTexture('⚓ TACKLE SHOP');
    const bountySign = this.makeSignTexture('📋 BOUNTIES');
    const gallerySign = this.makeSignTexture('📜 BOTTLE GALLERY', 512, 128);

    return { wood, deck, water, sand, grass, awning, hull, scales, shopSign, bountySign, gallerySign };
  },
};
