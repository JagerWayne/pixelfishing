/* Markup: the status bar and info rail at the top of the HUD layer. */
export const markupHudTop = `
    <div class="hud-top" id="hud-top">
      <!-- Status bar (v7.0.0): one glass strip with cash, the bucket or fuel meter, weather and time, and the menu -->
      <div class="hud-bar-main">
        <span class="hud-chip cash" id="hud-cash">$25.00</span>
        <div class="hud-gauges">
          <div class="mini-progress-pill" title="Bucket Capacity">
            <div class="mini-progress-label">
              <svg class="ic" aria-hidden="true"><use href="#i-bucket"/></svg>
              <span id="hud-bucket">0.0/6kg</span>
            </div>
            <div class="mini-bar-track">
              <div class="mini-bar-fill" id="hud-bucket-bar"></div>
            </div>
          </div>
          <div class="mini-progress-pill" id="hud-fuel-bar-wrap" title="Boat Fuel">
            <div class="mini-progress-label">
              <svg class="ic" aria-hidden="true"><use href="#i-fuel"/></svg>
              <span id="hud-fuel">0/0</span>
            </div>
            <div class="mini-bar-track">
              <div class="mini-bar-fill" id="hud-fuel-bar"></div>
            </div>
          </div>
        </div>
        <div class="hud-right">
          <span class="hud-chip" id="hud-weather" title="Weather">☀️ Clear</span>
          <span class="hud-chip hud-time" id="hud-time">12:00</span>
          <button class="sleek-menu-btn menu-dot" id="btn-toggle-drawer" type="button" aria-label="Open menu" title="Menu"><svg class="ic" aria-hidden="true"><use href="#i-menu"/></svg></button>
        </div>
      </div>

      <!-- Info rail: where you are and one objective tracker on the left, the compass on the right -->
      <div class="hud-stack">
        <div class="hud-rail">
          <div class="hud-zone-pill">
            <span id="hud-zone">1. Shallow Cove</span>
            <span class="hz-sep">•</span>
            <span id="hud-dist">0 m</span>
            <span id="hud-zone-fuel" class="hz-extra"></span>
            <span id="hud-zone-buff" class="hz-extra"></span>
          </div>
          <div id="hud-fuel-warning" class="fuel-warning fuel-safe">
            Return Fuel: 0.0
          </div>
          <!-- Tracker: the radar, bounty, quest and reading lines; only the most urgent shows until you tap +N -->
          <div id="hud-tracker">
            <div id="hud-event-pill" class="trk"><span id="hud-event-text"></span></div>
            <div id="hud-bounty-pill" class="trk"></div>
            <div id="hud-quest-pill" class="trk"></div>
            <div id="hud-read-pill" class="trk"></div>
            <button id="hud-tracker-more" type="button" aria-expanded="false" aria-label="Show all objectives">+1</button>
          </div>
          <!-- Underwater Live Bait Cam Picture-in-Picture (Active when Rod Cam Upgrade is purchased & Reeling) -->
          <div id="live-bait-pip">
            <canvas id="pip-bait-canvas" width="176" height="112"></canvas>
            <div class="pip-overlay-top">
              <span class="pip-rec-dot">● LIVE CAM</span>
              <span class="u-live-bait-pip-1">SUBSEA</span>
            </div>
            <div class="pip-overlay-bottom" id="pip-bait-label">BAIT: Bread Crumbs</div>
          </div>
        </div>
        <div id="hud-compass" aria-hidden="true"><div class="cmp-needle"></div><span class="cmp-deg" id="hud-compass-deg">0°</span></div>
      </div>
    </div>

`;
