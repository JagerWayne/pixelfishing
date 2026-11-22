/* PixelTextureFactory method: generateItemIcon, the small pixel icons of catches and goods. */

export const itemIconsStatics = {
  generateItemIcon(item) {
    const c = document.createElement('canvas');
    c.width = 32;
    c.height = 32;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = item.color;
    if (item.shape === 'seaweed') {
      for (let i = 0; i < 3; i++) {
        const bx = 8 + i * 6;
        for (let y = 6; y < 27; y += 2) {
          const ox = Math.round(Math.sin(y * 0.4 + i) * 2);
          ctx.fillStyle = y % 4 === 0 ? item.accent : item.color;
          ctx.fillRect(bx + ox, y, 3, 2);
        }
      }
    } else if (item.shape === 'boot') {
      ctx.fillRect(11, 6, 8, 14);
      ctx.fillRect(11, 18, 15, 7);
      ctx.fillStyle = item.accent;
      ctx.fillRect(10, 24, 16, 2);
    } else if (item.shape === 'can') {
      ctx.fillRect(10, 8, 12, 16);
      ctx.fillStyle = item.accent;
      ctx.fillRect(10, 12, 12, 6);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(10, 7, 12, 2);
    } else if (item.shape === 'bottle') {
      ctx.fillRect(14, 5, 4, 6);
      ctx.fillRect(11, 11, 10, 15);
      ctx.fillStyle = item.accent;
      ctx.fillRect(13, 14, 3, 8);
      if (item.isMessageBottle) {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(14, 3, 4, 2);
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(14, 13, 4, 9);
      }
    } else if (item.shape === 'anchor') {
      ctx.fillStyle = item.color;
      ctx.fillRect(15, 5, 2, 20);
      ctx.fillRect(11, 9, 10, 2);
      ctx.fillRect(8, 21, 16, 2);
      ctx.fillRect(8, 17, 2, 5);
      ctx.fillRect(22, 17, 2, 5);
    } else if (item.shape === 'hat') {
      ctx.fillRect(5, 19, 22, 4);
      ctx.fillRect(9, 11, 14, 8);
      ctx.fillStyle = item.accent;
      ctx.fillRect(14, 14, 4, 4);
    } else if (item.shape === 'box') {
      ctx.fillRect(6, 10, 20, 14);
      ctx.fillStyle = item.accent;
      ctx.fillRect(6, 15, 20, 2);
      ctx.fillRect(14, 14, 4, 4);
    } else {
      ctx.fillStyle = item.color;
      ctx.fillRect(8, 11, 14, 10);
      ctx.fillRect(6, 13, 18, 6);
      ctx.fillRect(23, 10, 4, 4);
      ctx.fillRect(23, 18, 4, 4);
      ctx.fillRect(22, 13, 3, 6);
      ctx.fillStyle = item.accent;
      ctx.fillRect(12, 8, 5, 3);
      ctx.fillRect(10, 15, 10, 2);
      if (item.shape === 'fish_marlin') {
        ctx.fillRect(1, 15, 6, 2);
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(8, 13, 2, 2);
      ctx.fillStyle = '#000000';
      ctx.fillRect(8, 13, 1, 1);
    }
    return c.toDataURL();
  },
};
