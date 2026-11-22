/* Markup: the pause screen and the toast stack. */
export const markupPause = `
  <!-- Pause screen (P / Esc / the pause button; also opens by itself when the tab is hidden) -->
  <div id="pause-overlay" role="dialog" aria-label="Paused">
    <div class="pixel-box pause-card" id="pause-card">
      <h2 class="pause-title">⏸ PAUSED</h2>
      <div id="pause-daily" class="pause-daily"></div>
      <button class="pixel-btn gold" id="btn-resume" type="button">▶ RESUME</button>
      <div class="pause-row">
        <button class="pixel-btn" id="btn-pause-sound" type="button">🔊 Sound: On</button>
        <button class="pixel-btn" id="btn-pause-menu" type="button">☰ Menu</button>
      </div>
      <div class="pause-help">
        <div><b>Keyboard</b><br/>Move: WASD / arrows<br/>Action: Space, E or Enter (hold to cast, hold to reel)<br/>Steer the fight: A / D<br/>B bag · T toolbox · L log · V view · X dive<br/>P or Esc: pause</div>
        <div><b>Touch</b><br/>Stick: walk, steer the boat and the fight<br/>Big button: the action shown on it<br/>Tap it when a fish leaps!</div>
      </div>
    </div>
    <div id="pause-count" aria-live="assertive"></div>
  </div>

  <!-- Toast notifications -->
  <div id="toast-stack" aria-live="polite"></div>

`;
