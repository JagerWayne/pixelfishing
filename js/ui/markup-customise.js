/* Markup: cheat menu and confirm, character customisation, boats and toolbox modals. */
export const markupCustomise = `
  <!-- MODAL: SEAGULL'S SECRET CHEAT MENU -->
  <div class="modal-backdrop" id="modal-cheats">
    <div class="pixel-box modal-window cheat-window">
      <div class="modal-header">
        <span class="modal-title">🕊️ SEAGULL'S SECRET MENU</span>
        <button class="pixel-btn red" data-close="modal-cheats" type="button">Close</button>
      </div>
      <div class="modal-body" id="cheat-body"></div>
    </div>
  </div>

  <!-- MODAL: CONFIRM A CHEAT -->
  <div class="modal-backdrop" id="modal-cheat-confirm">
    <div class="pixel-box modal-window u-cheat-confirm-1">
      <div class="modal-header">
        <span class="modal-title">⚠️ APPLY CHEAT?</span>
      </div>
      <div class="modal-body u-center">
        <div class="cheat-title" id="cheat-confirm-section"></div>
        <div id="cheat-confirm-name"></div>
        <div class="u-cheat-confirm-2">This changes your game right away and is saved like normal progress.</div>
        <div class="u-cheat-confirm-3">
          <button class="pixel-btn green" id="cheat-confirm-yes" type="button">Apply</button>
          <button class="pixel-btn red" id="cheat-confirm-no" data-close="modal-cheat-confirm" type="button">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL: CHARACTER CUSTOMISATION -->
  <div class="modal-backdrop" id="modal-customize">
    <div class="pixel-box modal-window cust-window">
      <div class="modal-header">
        <span class="modal-title">🎨 CUSTOMISE YOUR ANGLER</span>
        <button class="pixel-btn green" id="cust-close" type="button">Done</button>
      </div>
      <div class="cust-body">
        <div class="cust-preview">
          <canvas id="cust-canvas" role="img" aria-label="Your angler. Drag to turn them round."></canvas>
          <div class="cust-tools" role="toolbar" aria-label="Look tools">
            <button class="pixel-btn" id="cust-undo" type="button" title="Undo (Ctrl+Z)">↶ Undo</button>
            <button class="pixel-btn" id="cust-redo" type="button" title="Redo (Ctrl+Shift+Z)">↷ Redo</button>
            <button class="pixel-btn gold" id="cust-random" type="button" aria-label="Random look">🎲 Random</button>
            <button class="pixel-btn" id="cust-reset" type="button" aria-label="Reset the look">↺ Reset</button>
          </div>
          <div class="cust-tools cust-view">
            <button class="pixel-btn" id="cust-spin" type="button" aria-label="Stop turning">⏸</button>
            <button class="pixel-btn" id="cust-back" type="button" aria-pressed="false" aria-label="Back view">⇄</button>
            <div class="cust-faces" role="group" aria-label="Try an expression">
              <button class="pixel-btn active" type="button" data-expr="open" aria-pressed="true" aria-label="Expression: calm">😐</button>
              <button class="pixel-btn" type="button" data-expr="happy" aria-pressed="false" aria-label="Expression: happy">😊</button>
              <button class="pixel-btn" type="button" data-expr="surprise" aria-pressed="false" aria-label="Expression: surprised">😮</button>
              <button class="pixel-btn" type="button" data-expr="focus" aria-pressed="false" aria-label="Expression: focused">😤</button>
            </div>
          </div>
        </div>
        <div class="cust-panel">
          <div class="tab-row" id="cust-tabs" role="tablist" aria-label="Look categories"></div>
          <div id="cust-options"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL 2B: PIER TACKLE TOOLBOX (BAIT SELECTOR) -->
  <div class="modal-backdrop" id="modal-boats">
    <div class="pixel-box modal-window u-boats-1">
      <div class="modal-header u-boats-2">
        <span class="modal-title u-boats-3">🛥️ BOAT TERMINAL — CHOOSE YOUR BOAT</span>
        <button class="pixel-btn red" data-close="modal-boats">Close</button>
      </div>
      <div class="modal-body">
        <div class="u-hint-gap">
          Every boat you own is kept at the harbor with its own fuel tank. Pick the one to moor at the platform; buy new boats at the Tackle Shop.
        </div>
        <div class="upgrade-grid" id="boat-terminal-list"></div>
      </div>
    </div>
  </div>

  <div class="modal-backdrop" id="modal-toolbox">
    <div class="pixel-box modal-window u-toolbox-1">
      <div class="modal-header u-toolbox-2">
        <span class="modal-title u-toolbox-3">🧰 PIER TACKLE TOOLBOX — SELECT BAIT</span>
        <button class="pixel-btn red" data-close="modal-toolbox">Close</button>
      </div>
      <div class="modal-body">
        <div class="u-hint-gap">
          Swap your active hook bait from your stored tackle inventory (buy extra 10x packs at the Tackle Shop):
        </div>
        <div class="upgrade-grid" id="toolbox-bait-list"></div>
      </div>
    </div>
  </div>

`;
