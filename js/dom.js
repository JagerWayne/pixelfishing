/* DOM: puts the game's markup (HUD layer, overlays, every modal and sheet) into the page, right after the start
   overlay and in the original order, before the game looks up its elements by id. */
import { markupPause } from './ui/markup-overlays.js';
import { markupHudTop } from './ui/markup-hud-top.js';
import { markupHudBottom } from './ui/markup-hud-bottom.js';
import { markupDive } from './ui/markup-dive.js';
import { markupMenu } from './ui/markup-menu.js';
import { markupSheets } from './ui/markup-sheets.js';
import { markupMapSettings } from './ui/markup-map-settings.js';
import { markupCustomise } from './ui/markup-customise.js';
import { markupCatch } from './ui/markup-catch.js';

export function mountMarkup() {
  if (document.getElementById('ui-layer')) return;
  const html = [
    markupPause,
    '  <!-- HUD Layer -->\n  <div id="ui-layer">', markupHudTop, markupHudBottom, '  </div>',
    markupDive, markupMenu, markupSheets, markupMapSettings, markupCustomise, markupCatch,
  ].join('\n');
  document.getElementById('start-overlay').insertAdjacentHTML('afterend', html);
}
