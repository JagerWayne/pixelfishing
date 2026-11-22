/* Entry point: sets the build numbers, starts the loader and hands it the game. The game's modules are imported
   once the 3D engine is ready (they read the global THREE as they load); the page markup is mounted and every
   module's init() runs, in the original order, when the physics engine is ready too. */
import './boot/version.js';
import { boot } from './boot/loader.js';

async function loadGame() {
  const [dom, game] = await Promise.all([import('./dom.js'), import('./start.js')]);
  const runInits = await game.loadGame();
  return () => {
    dom.mountMarkup();
    runInits();
  };
}

boot(loadGame);
