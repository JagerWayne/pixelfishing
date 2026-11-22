/* Markup: centre banners, meter dock and thumb-zone controls of the HUD layer. */
export const markupHudBottom = `
    <!-- Center Dynamic Fishing & Proximity Indicators -->
    <div id="center-hud">
      <div id="station-picker"></div>
      <div id="proximity-banner">⚓ TACKLE SHOP — PRESS ACTION BUTTON TO OPEN</div>
      <div id="bite-banner">! BITE! TAP HOOK NOW !</div>
      <div id="leap-banner">🐟 IT'S JUMPING! TAP TO DIP THE ROD!</div>

      <div class="pixel-box" id="cast-meter-box">
        <div class="stat-row">
          <span class="stat-label">CAST POWER <span class="u-gold">(★ 72–88%)</span></span>
          <span class="stat-val" id="cast-power-label">0%</span>
        </div>
        <div class="bar-wrap cast-bar-wrap">
          <div class="bar-fill" id="cast-power-bar"></div>
          <div class="cast-sweet-zone" title="Sweet Spot"></div>
        </div>
      </div>

      <!-- Fish drag / reel meter: docked just above the thumbs (v7.0.0) -->
      <div class="pixel-box" id="reel-meter-box">
          <div id="rod-warning-text">ROD OVERLOADED! DRAG TOO HEAVY!</div>
          <div class="stat-row">
            <span class="stat-label" id="fish-dir-label">FISH DRAG: CENTER</span>
            <span class="stat-val" id="reel-dist-label">LINE: 14.0 m</span>
          </div>
          <div class="reel-dir-labels">
            <span>◀ STICK L</span>
            <span id="counter-pull-hint">STEER STICK OPPOSITE!</span>
            <span>STICK R ▶</span>
          </div>
          <div class="reel-track reel-dir-track">
            <div id="fish-dir-marker">🐟</div>
            <div id="rod-dir-marker"></div>
          </div>
          <div class="stat-row u-reel-meter-box-1">
            <span class="stat-label">LINE TENSION</span>
            <span class="stat-val" id="reel-progress-label">REEL: 0%</span>
          </div>
          <div class="reel-track">
            <div class="reel-safe-zone" id="reel-safe-zone"></div>
            <div class="reel-cursor" id="reel-cursor"></div>
          </div>
          <div class="bar-wrap reel-progress-wrap">
            <div class="bar-fill" id="reel-progress-bar"></div>
          </div>
        </div>
    </div>

    <!-- Bottom Thumb-Zone Mobile Controls -->
    <div id="joy-zone" aria-hidden="true"></div>
    <div id="mobile-controls">
      <div class="touch-zone-left">
        <div id="virtual-joystick" role="img" aria-label="Thumbstick: drag to walk, steer the boat and the fight (keyboard: WASD or arrows)">
          <span class="joy-dir-label joy-n">▲</span>
          <span class="joy-dir-label joy-s">▼</span>
          <span class="joy-dir-label joy-w">◀</span>
          <span class="joy-dir-label joy-e">▶</span>
          <div id="joystick-knob"></div>
        </div>
      </div>


      <div class="touch-zone-right">
        <div id="dive-pad">
          <button class="dive-btn" id="btn-dive-up" type="button" aria-label="Swim up (R)">▲<small>UP</small></button>
          <button class="dive-btn" id="btn-dive-down" type="button" aria-label="Swim down (F)">▼<small>DOWN</small></button>
          <button class="dive-btn" id="btn-chum" type="button" aria-label="Tip a chum bucket (C)">🪣<small>CHUM</small></button>
          <button class="dive-btn" id="btn-dive-toggle" type="button" aria-label="Dive or surface (X)"><span id="dive-toggle-icon">🤿</span><span id="dive-toggle-label">DIVE</span></button>
        </div>
        <button id="btn-primary-action" type="button">
          <span id="primary-action-icon">🎣</span>
          <span id="primary-action-label">HOLD CAST</span>
        </button>
      </div>
    </div>
  </div>
`;
