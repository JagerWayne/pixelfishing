/* Markup: the side drawer (menu sheet), career and trophy modals. */
export const markupMenu = `
  <!-- MENU SHEET (replaces the old strip of small buttons and the gear drawer) -->
  <div class="modal-backdrop sheet-modal" id="modal-menu">
    <div class="pixel-box modal-window">
      <div class="sheet-handle"></div>
      <div class="modal-header">
        <span class="modal-title">☰ MENU</span>
        <button class="pixel-btn" id="btn-pause" data-closes-menu type="button" aria-label="Pause the game" title="Pause (P)"><svg class="ic" aria-hidden="true"><use href="#i-pause"/></svg> Pause</button>
        <button class="pixel-btn red" data-close="modal-menu" type="button">Close</button>
      </div>
      <div class="modal-body">
        <!-- Profile (v7.1.0): who you are, your rank and how far to the next, and your cash -->
        <div class="menu-profile" id="menu-profile">
          <div class="mp-avatar" aria-hidden="true">🎣</div>
          <div class="mp-main">
            <div class="mp-name" id="mp-name">Angler</div>
            <div class="mp-rank"><span class="mp-badge" id="mp-rank">1. Deckhand</span><span class="mp-cash num" id="mp-cash">$0.00</span></div>
            <div class="mp-xp" role="progressbar" aria-label="Progress to the next rank" aria-valuemin="0" aria-valuemax="100" id="mp-xp"><i id="mp-xp-bar"></i></div>
            <div class="mp-next" id="mp-next"></div>
          </div>
        </div>
        <div class="menu-tiles">
          <button class="menu-tile" id="menu-map" data-closes-menu type="button">🗺️<span>Map</span></button>
          <button class="menu-tile" id="menu-bag" data-closes-menu type="button">🪣<span>Bag</span></button>
          <button class="menu-tile menu-dot" id="menu-log" data-closes-menu type="button">📖<span>Log</span></button>
          <button class="menu-tile" id="btn-open-settings" data-closes-menu type="button" aria-label="Settings">🎛️<span>Settings</span></button>
          <button class="menu-tile" id="menu-career" data-closes-menu type="button">🏅<span>Career</span></button>
          <button class="menu-tile" id="menu-trophies" data-closes-menu type="button">🏆<span>Records</span></button>
          <button class="menu-tile" id="btn-drawer-customize" data-closes-menu type="button">🎨<span>Look</span></button>
          <button class="menu-tile" id="btn-toggle-audio" data-label="Sound" type="button" aria-label="Toggle sound">🔊</button>
          <button class="menu-tile" id="btn-toggle-view" data-label="View" data-closes-menu type="button" aria-label="Toggle first person view (V)">🎥</button>
          <button class="menu-tile" id="menu-filter" data-closes-menu type="button">🎬<span>Filter</span></button>
          <button class="menu-tile" id="menu-quests" data-closes-menu type="button">📜<span>Quests</span></button>
          <button class="menu-tile" id="menu-exit" type="button">🚪<span>Exit</span></button>
        </div>
        <div class="menu-info">
          <div class="drawer-item wide"><span class="drawer-label">RANK:</span><span class="drawer-val" id="hud-rank">Deckhand</span></div>
          <div class="drawer-item"><span class="drawer-label">ROD:</span><span class="drawer-val" id="hud-rod">Bamboo (3.5kg)</span></div>
          <div class="drawer-item"><span class="drawer-label">BAIT:</span><span class="drawer-val" id="hud-bait">Bread (∞)</span></div>
          <div class="drawer-item"><span class="drawer-label">VESSEL:</span><span class="drawer-val" id="hud-fuel-text">No Boat</span></div>
          <div class="drawer-item"><span class="drawer-label">ECO PERK:</span><span class="drawer-val" id="hud-eco">♻️ 0.0/100kg</span></div>
          <div class="drawer-item"><span class="drawer-label">MOON:</span><span class="drawer-val" id="hud-moon" title="Moon Phase">🌑</span></div>
          <div class="drawer-item"><span class="drawer-label">🎬 LENS:</span><span class="drawer-val" id="hud-vfx-label">Standard Lens</span></div>
          <div class="drawer-item wide u-menu-1">
            <span class="drawer-label">🎣 ANGLER:</span>
            <div class="angler-row">
              <button class="sleek-menu-btn active" id="btn-drawer-male" type="button">🧔 Male</button>
              <button class="sleek-menu-btn" id="btn-drawer-female" type="button">👩 Female</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL: CAREER (rank, stats, achievements) -->
  <div class="modal-backdrop" id="modal-career">
    <div class="pixel-box modal-window">
      <div class="modal-header">
        <span class="modal-title">🏅 CAREER</span>
        <button class="pixel-btn red" data-close="modal-career" type="button">Close</button>
      </div>
      <div class="modal-body">
        <div class="pixel-box u-career-1">
          <div class="u-career-2">
            <span id="career-rank">Deckhand</span>
            <span id="career-xp">0 XP</span>
          </div>
          <div class="bar-wrap u-career-3"><div class="bar-fill" id="career-xp-bar"></div></div>
          <div id="career-next"></div>
        </div>
        <div id="career-stats" class="menu-info"></div>
        <div class="cheat-title">🏅 ACHIEVEMENTS (<span id="career-ach-count">0</span>)</div>
        <div id="career-achievements"></div>
      </div>
    </div>
  </div>

  <!-- MODAL: TROPHY CASE -->
  <div class="modal-backdrop" id="modal-trophies">
    <div class="pixel-box modal-window u-trophies-1">
      <div class="modal-header u-trophies-2">
        <span class="modal-title">🏆 RECORDS</span>
        <button class="pixel-btn red" data-close="modal-trophies" type="button">Close</button>
      </div>
      <div class="modal-body">
        <div id="trophy-summary"></div>
        <div class="u-trophies-3">Your record weight for each fish decides its medal: gold at 90% of the species' top weight, silver at 70%, bronze below. The five best are mounted in the case on the pier.</div>
        <div id="trophy-list"></div>
      </div>
    </div>
  </div>

`;
