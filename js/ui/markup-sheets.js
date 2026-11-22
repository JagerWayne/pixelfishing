/* Markup: shop sheet, books, talk, cook, quests, town sheet and telescope view. */
export const markupSheets = `
  <!-- SHOP CATALOGUE (v4.9.0): a paper brochure for the shops that sell things, a bucket list for the Fish Market and Recycling -->
  <div id="shop-ui">
    <section id="shop-sheet" role="dialog" aria-modal="true" aria-labelledby="shop-name" aria-describedby="shop-hint">
      <header class="sh-head">
        <span id="shop-icon" class="sh-icon" aria-hidden="true"></span>
        <h2 id="shop-name" class="sh-name"></h2>
        <span id="shop-cash" class="sh-cash" role="status" aria-label="Your cash"></span>
        <button id="shop-leave" class="sh-close" type="button" aria-label="Close (Esc)">✕</button>
      </header>
      <div id="shop-tabs" class="sh-tabs" role="tablist" aria-label="Departments"></div>
      <div id="shop-summary" class="sh-summary" hidden></div>
      <div id="shop-body" class="sh-body" role="tabpanel" tabindex="-1"><ul id="shop-rows" class="sh-list" role="list"></ul></div>
      <div id="shop-foot" class="sh-foot" hidden><button id="shop-sellall" class="sh-primary" type="button"></button></div>
      <p id="shop-hint" class="sr-only">Arrow keys switch departments and move between buttons, Escape closes.</p>
      <p id="shop-live" class="sr-only" aria-live="polite" aria-atomic="true"></p>
    </section>
    <div id="shop-confirm" role="alertdialog" aria-modal="true" aria-labelledby="shop-confirm-title" aria-describedby="shop-confirm-sub">
      <div class="sc-box">
        <div id="shop-confirm-title"></div>
        <div id="shop-confirm-sub"></div>
        <div class="sc-btns"><button type="button" id="shop-confirm-no">Cancel</button><button type="button" id="shop-confirm-yes">Buy</button></div>
      </div>
    </div>
  </div>

  <!-- BOOKS: pick a book to read on a bench -->
  <div class="modal-backdrop" id="modal-books">
    <div class="pixel-box modal-window u-books-1">
      <div class="modal-header u-books-2">
        <span class="modal-title u-books-3">📚 YOUR BOOKS</span>
        <button class="pixel-btn red" data-close="modal-books" type="button">Close</button>
      </div>
      <div class="modal-body">
        <div class="upgrade-grid" id="books-list"></div>
      </div>
    </div>
  </div>

  <!-- MODAL 2: BUCKET INVENTORY -->
  <!-- TALK: a conversation with someone in town (pauses the world) -->
  <div class="modal-backdrop" id="modal-talk">
    <div class="pixel-box" id="talk-box">
      <div class="talk-head"><span id="talk-icon"></span><span><b id="talk-name"></b><small id="talk-role"></small></span></div>
      <div id="talk-text"></div>
      <div id="talk-choices"></div>
    </div>
  </div>
  <!-- COOK: the three-step kitchen mini-game -->
  <div class="modal-backdrop" id="modal-cook">
    <div class="pixel-box modal-window u-cook-1">
      <div class="modal-header"><span class="modal-title" id="cook-title">🍳 COOKING</span><button class="pixel-btn red" id="cook-quit" type="button">Stop</button></div>
      <div class="modal-body u-center">
        <div id="cook-step"></div>
        <div id="cook-hint"></div>
        <div id="cook-area"></div>
        <button class="pixel-btn gold" id="cook-btn" type="button">CHOP</button>
      </div>
    </div>
  </div>
  <!-- QUESTS: the story so far -->
  <div class="modal-backdrop" id="modal-quests">
    <div class="pixel-box modal-window u-w560">
      <div class="modal-header"><span class="modal-title">📜 QUESTS</span><button class="pixel-btn red" data-close="modal-quests" type="button">Close</button></div>
      <div class="modal-body"><div id="quest-list"></div></div>
    </div>
  </div>

  <!-- HARBOUR TOWN (v6.3.0): one sheet for the noticeboard, Post Office, tavern, traps, workshop and greenhouse -->
  <div class="modal-backdrop" id="modal-town">
    <div class="pixel-box modal-window u-w560">
      <div class="modal-header"><span class="modal-title" id="town-title">HARBOUR TOWN</span><button class="pixel-btn red" data-close="modal-town" type="button">Close</button></div>
      <div class="modal-body"><ul id="town-body" class="sh-list" role="list"></ul></div>
    </div>
  </div>
  <!-- the lookout telescope view -->
  <div id="scope-ui"><div class="scope-ring"></div><div class="scope-cross"></div>
    <div class="scope-bar"><button id="scope-left" class="pixel-btn" type="button" aria-label="Look left">◀</button><button id="scope-close" class="pixel-btn red" type="button">Close</button><button id="scope-right" class="pixel-btn" type="button" aria-label="Look right">▶</button></div>
  </div>

`;
