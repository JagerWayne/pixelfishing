/* Build numbers: the single source of truth for the release (shown on the start screen, names the offline cache)
   and the engine sizes the loading screen weighs its progress with. Bump PF_VERSION with every release. */
window.PF_VERSION = '2.1';   /* v2.0 restarted the numbering (it followed 12.2.0) */
window.PF_TITLE = 'Pixel Fishing v' + window.PF_VERSION;   /* the game's title: the browser tab and the logos */
window.PF_THREE_REV = '187';
window.PF_THREE_BYTES = 748803; /* decoded size of vendor/three.r187.module.min.js */
window.PF_RAPIER_VER = '0.21.0';
window.PF_RAPIER_BYTES = 4336870; /* decoded size of vendor/rapier3d-compat.0.21.0.min.js (WebAssembly inlined) */
window.PF_PAGE_BYTES_GUESS = 1300000; /* index.html plus every file in css/ and js/ */
