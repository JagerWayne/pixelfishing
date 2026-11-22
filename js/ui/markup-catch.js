/* Markup: catch reveal, catch log, bottle gallery, camera, rescue overlay and sleep fade. */
export const markupCatch = `
  <!-- MODAL 3: CATCH REVEAL & BUCKET OVERFLOW SWAP -->
  <div class="modal-backdrop" id="modal-catch">
    <div class="pixel-box modal-window u-catch-1">
      <div class="modal-header">
        <span class="modal-title" id="catch-modal-header">✨ CATCH LANDED!</span>
      </div>
      <div class="modal-body catch-layout">
        <canvas id="catch-preview-canvas" width="96" height="72"></canvas>
        <div>
          <span class="rarity-badge" id="catch-rarity">Common</span>
          <span class="record-badge" id="catch-record-badge">🏆 NEW RECORD!</span>
          <span class="record-badge cod-badge" id="catch-cod-badge">⭐ CATCH OF THE DAY ×3</span>
          <h2 id="catch-name">Sunlit Minnow</h2>
          <div id="catch-zone">Zone 1: Pier & Shallow Cove</div>
        </div>
        <div class="u-catch-2">
          <div>Weight: <span id="catch-weight">0.45 kg</span></div>
          <div>Value: <span id="catch-value">$6</span></div>
        </div>
        <div id="catch-desc"></div>

        <div id="catch-overflow-panel">
          <div id="catch-overflow-msg">
            Bucket Full! Release this catch or discard an item below:
          </div>
          <div id="catch-swap-list"></div>
        </div>

        <div id="catch-action-btns">
          <button class="pixel-btn green" id="btn-keep-catch">Keep in Bucket</button>
          <button class="pixel-btn" id="btn-release-catch">Release</button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL 4: CATCH LOG ENCYCLOPEDIA -->
  <div class="modal-backdrop" id="modal-log">
    <div class="pixel-box modal-window">
      <div class="modal-header">
        <span class="modal-title" id="log-modal-title">📖 MARINE ENCYCLOPEDIA (0 / 50)</span>
        <button class="pixel-btn red" data-close="modal-log">Close</button>
      </div>
      <div class="modal-body">
        <div class="log-grid" id="log-grid-container"></div>
      </div>
    </div>
  </div>

  <!-- MODAL 4B: MESSAGE IN A BOTTLE COLLECTIBLE GALLERY -->
  <div class="modal-backdrop" id="modal-gallery">
    <div class="pixel-box modal-window u-gallery-1">
      <div class="modal-header u-gallery-2">
        <span class="modal-title" id="gallery-modal-title">📜 MESSAGE IN A BOTTLE GALLERY (0 / 36)</span>
        <button class="pixel-btn red" data-close="modal-gallery">Close</button>
      </div>
      <div class="modal-body">
        <div class="pixel-box u-gallery-3">
          <div class="u-gallery-4">
            <span class="u-gallery-5">🏆 MASTER ARCHIVIST COLLECTION REWARD</span>
            <span id="gallery-reward-status">$2,500.00</span>
          </div>
          <div class="u-gallery-6">
            Collect & keep all <b>36 unique Messages in a Bottle</b> across all 4 ocean depths to claim <b>$2,500.00</b>! Each bottle is one-of-a-kind once kept (discarded bottles drift back to sea).
          </div>
          <div class="bar-wrap u-gallery-7">
            <div class="bar-fill" id="gallery-progress-bar"></div>
          </div>
        </div>

        <div class="gallery-grid" id="gallery-grid-container"></div>
      </div>
    </div>
  </div>

<!-- MODAL 5: FOURTH-WALL DIRECTOR'S CAMERA RIG -->
  <div class="modal-backdrop" id="modal-camera">
    <div class="pixel-box modal-window u-camera-1">
      <div class="modal-header u-camera-2">
        <span class="modal-title u-camera-3">🎬 CAMERA FILTERS</span>
        <button class="pixel-btn red" data-close="modal-camera">Close</button>
      </div>
      <div class="modal-body">
        <div class="pixel-box u-camera-4">
          <div class="u-camera-5">
            <div class="u-camera-6">
              <b>"Lights, Camera, Cast!"</b><br/>
              Swap optical camera lenses or snap a retro postcard with your active VFX filter:
            </div>
            <button class="pixel-btn gold" id="btn-snap-postcard" type="button">📸 SNAP POSTCARD</button>
          </div>
          <canvas id="camera-live-preview" width="320" height="140"></canvas>
        </div>

        <div class="upgrade-grid" id="camera-shader-grid"></div>
      </div>
    </div>
  </div>

  <!-- OVERLAY 7: COAST GUARD RESCUE SEQUENCE -->
  <div id="rescue-overlay">
    <div class="pixel-box u-rescue-overlay-1">
      <h2 class="u-rescue-overlay-2">🚨 OUT OF FUEL! MAYDAY!</h2>
      <p id="rescue-text">
        Your engine sputtered out at sea! A Coast Guard Rescue Cutter is towing your vessel back to the Harbor Pier...
      </p>
      <div class="bar-wrap u-rescue-overlay-3">
        <div class="bar-fill" id="rescue-progress-bar"></div>
      </div>
      <div id="rescue-fee-label">
        Emergency Tow Fee: $100.00
      </div>
    </div>
  </div>
  <div id="sleep-fade"></div>
`;
