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
        <span class="modal-title">🎨 CUSTOMISE FISHERMAN</span>
        <button class="pixel-btn green" id="cust-close" type="button">Done</button>
      </div>
      <div class="cust-body">
        <div class="cust-preview">
          <canvas id="cust-canvas"></canvas>
          <div class="cust-gender">
            <button class="pixel-btn green" id="cust-gender-male" type="button">🧔 Male</button>
            <button class="pixel-btn" id="cust-gender-female" type="button">👩 Female</button>
          </div>
          <div class="cust-gender">
            <button class="pixel-btn gold" id="cust-random" type="button">🎲 Random</button>
            <button class="pixel-btn" id="cust-reset" type="button">↺ Reset</button>
          </div>
          <button class="pixel-btn" id="cust-spin" type="button">⏸ Stop</button>
          <div class="cust-hint">Drag to rotate</div>
          <label class="cust-name-row">Your name
            <input id="cust-name" type="text" maxlength="16" autocomplete="off" spellcheck="false" placeholder="Type your name" enterkeyhint="done">
          </label>
        </div>
        <div class="cust-panel">
          <div class="tab-row" id="cust-tabs"></div>
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
