/* Entry point: sets the build numbers, starts the loader and hands it the game, which is downloaded once the
   3D engine is ready (the game reads the global THREE as it loads) and started when the physics engine is too. */
import './boot/version.js';
import { boot } from './boot/loader.js';

async function loadGame() {
  const [dom, game] = await Promise.all([import('./dom.js'), import('./game.js')]);
  return () => {
    dom.mountMarkup();
    game.start();
  };
}

boot(loadGame);
