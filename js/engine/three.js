/* three.js for the game modules: the loader puts the engine (with the legacy look) on window.THREE before the
   game's modules are imported, so this module only hands it on. */
export const THREE = window.THREE;
