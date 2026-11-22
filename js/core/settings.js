/* Player settings: stored apart from the save (a save reset keeps them), loaded with defaults and saved. */

/* Player settings (stored separately from the save so a save reset keeps them) */
const SETTINGS_KEY = 'pixel_fishing_settings_v1';
export const settings = { sound: true, haptics: true, quality: 'high', bucketSort: 'newest', hand: 'right', joyMode: 'fixed', btnSize: 'M', autoHideHud: false, fullscreen: true, firstPerson: false, textSize: 'M', hudAlpha: 60, solidUi: false };
export function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {}
}

export function init() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      if (typeof saved.sound === 'boolean') settings.sound = saved.sound;
      if (typeof saved.haptics === 'boolean') settings.haptics = saved.haptics;
      if (saved.quality === 'low' || saved.quality === 'high') settings.quality = saved.quality;
      if (['newest', 'value', 'weight', 'name'].includes(saved.bucketSort)) settings.bucketSort = saved.bucketSort;
      if (saved.hand === 'left' || saved.hand === 'right') settings.hand = saved.hand;
      if (saved.joyMode === 'floating' || saved.joyMode === 'fixed') settings.joyMode = saved.joyMode;
      if (['S', 'M', 'L'].includes(saved.btnSize)) settings.btnSize = saved.btnSize;
      if (typeof saved.autoHideHud === 'boolean') settings.autoHideHud = saved.autoHideHud;
      if (typeof saved.fullscreen === 'boolean') settings.fullscreen = saved.fullscreen;
      if (typeof saved.firstPerson === 'boolean') settings.firstPerson = saved.firstPerson;
      if (['S', 'M', 'L', 'XL'].includes(saved.textSize)) settings.textSize = saved.textSize;
      if ([40, 60, 80].includes(saved.hudAlpha)) settings.hudAlpha = saved.hudAlpha;
      if (typeof saved.solidUi === 'boolean') settings.solidUi = saved.solidUi;
    }
  } catch {}
}
