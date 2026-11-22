/* Markup: the harbour map, bucket and settings modals. */
export const markupMapSettings = `
  <!-- MAP: the harbour from above, where you are and which way you face, every landmark with what it is for -->
  <div class="modal-backdrop" id="modal-map">
    <div class="pixel-box modal-window u-map-1">
      <div class="modal-header">
        <span class="modal-title">🗺️ HARBOUR MAP</span>
        <button class="pixel-btn red" data-close="modal-map" type="button">Close</button>
      </div>
      <div class="modal-body">
        <div id="map-buoy-bar"></div>
        <div id="map-wrap">
          <canvas id="map-canvas"></canvas>
          <div class="map-tools">
            <button class="pixel-btn" id="map-zoom-in" type="button" aria-label="Zoom in">＋</button>
            <button class="pixel-btn" id="map-zoom-out" type="button" aria-label="Zoom out">－</button>
            <button class="pixel-btn gold" id="map-me" type="button" aria-label="Centre on me">⌖</button>
            <button class="pixel-btn" id="map-buoy" type="button" aria-label="Drop a buoy">📍</button>
          </div>
          <div class="map-hint" id="map-hint">Drag to move • pinch to zoom</div>
        </div>
        <div id="map-legend"></div>
      </div>
    </div>
  </div>

  <div class="modal-backdrop" id="modal-bucket">
    <div class="pixel-box modal-window u-w560">
      <div class="modal-header">
        <span class="modal-title" id="bucket-modal-title">🪣 CATCH BUCKET (0.0 / 6.0 kg)</span>
        <button class="pixel-btn red" data-close="modal-bucket">Close</button>
      </div>
      <div class="modal-body">
        <div id="bucket-list-container"></div>
      </div>
    </div>
  </div>

  <!-- MODAL: SETTINGS -->
  <div class="modal-backdrop" id="modal-settings">
    <div class="pixel-box modal-window u-settings-1">
      <div class="modal-header">
        <span class="modal-title">🎛️ SETTINGS</span>
        <button class="pixel-btn red" data-close="modal-settings">Close</button>
      </div>
      <div class="modal-body">
        <h3 class="set-h">Display</h3>
        <div class="setting-row">
          <span class="setting-label" id="lbl-text">🔠 Text size<span class="setting-sub">Menus, shops, chats and the info chips</span></span>
          <div class="set-seg" id="set-text" role="group" aria-labelledby="lbl-text">
            <button type="button" data-v="S" aria-label="Small text">S</button><button type="button" data-v="M" aria-label="Medium text">M</button><button type="button" data-v="L" aria-label="Large text">L</button><button type="button" data-v="XL" aria-label="Extra large text">XL</button>
          </div>
        </div>
        <div class="setting-row">
          <span class="setting-label" id="lbl-alpha">🫧 HUD panels<span class="setting-sub">How much of the world shows through the glass</span></span>
          <div class="set-seg" id="set-alpha" role="group" aria-labelledby="lbl-alpha">
            <button type="button" data-v="40" aria-label="Clear panels">Clear</button><button type="button" data-v="60" aria-label="Balanced panels">Mid</button><button type="button" data-v="80" aria-label="Dark panels">Dark</button>
          </div>
        </div>
        <div class="setting-row">
          <span class="setting-label">🧊 Reduce transparency<span class="setting-sub">Solid panels without blur (always on in Battery saver)</span></span>
          <button class="pixel-btn" id="set-solid" type="button">OFF</button>
        </div>
        <div class="setting-row">
          <span class="setting-label">🖼️ Graphics<span class="setting-sub">Battery saver renders at lower resolution</span></span>
          <button class="pixel-btn" id="set-quality" type="button">High</button>
        </div>
        <div class="setting-row">
          <span class="setting-label">🖥️ Full screen<span class="setting-sub">Enter full screen when the game starts (not available on iPhone Safari)</span></span>
          <button class="pixel-btn green" id="set-fullscreen" type="button">ON</button>
        </div>
        <div class="setting-row">
          <span class="setting-label">🙈 Fade HUD while fishing<span class="setting-sub">Dims gauges and shortcuts once your line is out</span></span>
          <button class="pixel-btn" id="set-autohide" type="button">OFF</button>
        </div>
        <h3 class="set-h">Controls</h3>
        <div class="setting-row">
          <span class="setting-label">🖐️ Handedness<span class="setting-sub">Swap the thumbstick and action button</span></span>
          <button class="pixel-btn" id="set-hand" type="button">Right</button>
        </div>
        <div class="setting-row">
          <span class="setting-label">🕹️ Thumbstick<span class="setting-sub">Floating appears where you touch in the bottom corner (left, or right when left-handed)</span></span>
          <button class="pixel-btn" id="set-joy" type="button">Fixed</button>
        </div>
        <div class="setting-row">
          <span class="setting-label">🔘 Button size<span class="setting-sub">Thumbstick and action button</span></span>
          <button class="pixel-btn" id="set-btn" type="button">M</button>
        </div>
        <h3 class="set-h">Sound &amp; haptics</h3>
        <div class="setting-row">
          <span class="setting-label">🔊 Sound effects<span class="setting-sub">Waves, reel clicks and splashes</span></span>
          <button class="pixel-btn green" id="set-sound" type="button">ON</button>
        </div>
        <div class="setting-row">
          <span class="setting-label">📳 Haptics<span class="setting-sub">Vibration on bites and catches (phones)</span></span>
          <button class="pixel-btn green" id="set-haptics" type="button">ON</button>
        </div>
        <h3 class="set-h">Game</h3>
        <div class="setting-row">
          <span class="setting-label">🎨 Appearance<span class="setting-sub">Clothes, hair, hats and shoes, or roll a random look</span></span>
          <button class="pixel-btn gold" id="set-customize" type="button">Customise</button>
        </div>
        <div class="setting-row" id="row-install">
          <span class="setting-label">📲 Install app<span class="setting-sub">Add Pixel Fishing to your home screen and play offline</span></span>
          <button class="pixel-btn gold" id="set-install" type="button">Install</button>
        </div>
        <div class="setting-row">
          <span class="setting-label">🗑️ Save data<span class="setting-sub">Erases cash, gear and catches. Settings are kept.</span></span>
          <button class="pixel-btn red" id="set-reset" type="button">Reset</button>
        </div>
      </div>
    </div>
  </div>

`;
