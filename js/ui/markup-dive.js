/* Markup: the diving overlay (tint, reticle, lock marker, alarm flash, gauges). */
export const markupDive = `
  <!-- Diving overlay: water tint, aim reticle, auto-aim lock marker, air alarm flash and the dive gauges -->
  <div id="dive-vignette"></div>
  <div id="dive-flash"></div>
  <div id="dive-reticle"></div>
  <div id="dive-lock"><span id="dive-lock-label"></span></div>
  <div id="dive-hud">
    <div class="dive-panel">
      <div class="dive-row"><span>🌊 DEPTH</span><span id="dive-depth">0.0 m</span></div>
      <div class="dive-bar" id="dive-depth-bar"><i class="u-dive-depth-bar-1"></i></div>
      <div class="dive-row"><span>🫧 AIR</span><span id="dive-air-text">0:00</span></div>
      <div class="dive-bar" id="dive-air-bar"><i class="u-dive-air-bar-1"></i></div>
      <div class="dive-row"><span>🎒 BAG</span><span id="dive-bag-text">0 / 0 kg</span></div>
      <div class="dive-row"><span id="dive-gun-name">🔱 -</span><span id="dive-gun-state" class="ready">READY</span></div>
    </div>
  </div>

`;
