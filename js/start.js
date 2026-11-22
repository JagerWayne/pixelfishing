/* The game's start: loads every game module, then runs their init() functions in this order, which is the order the
   original single script ran its top-level code in (data, renderer, world, state, UI wiring, the frame loop last). */
const ORDER = [
  './core/settings.js', './audio/audio-engine.js', './data/equipment.js', './render/texture-factory.js',
  './angler/angler-factory.js', './angler/animator.js', './render/model-kit.js', './world/layout.js',
  './data/townsfolk.js', './data/quests.js', './data/recipes.js', './engine/physics.js', './world/world-builder.js',
  './render/vfx.js', './render/renderer.js', './render/post.js', './render/lights.js', './render/previews.js',
  './render/live-bait.js', './boat/stations.js', './sim/controls-state.js', './sim/joystick.js', './events.js',
  './town/aquarium.js', './save/career.js', './fishing/market.js', './save/defaults.js', './ui/customise-preview.js',
  './ui/customise.js', './ui/customise-tools.js', './ui/cheats.js', './ui/cheat-sections.js', './save/queries.js', './save/save-game.js',
  './sim/spots.js', './ui/toasts.js', './town/talk.js', './town/resto-sheet.js', './sim/tap-walk.js',
  './town/town-state.js', './town/post-office.js', './fishing/rigs.js', './town/trophy-wall.js', './ui/map-draw.js',
  './utils.js', './fishing/sea-events.js', './ui/career-modal.js', './town/aquarium-world.js', './ui/trophies.js',
  './ui/camera-modal.js', './shop/shop-ui.js', './shop/shop-browse.js', './ui/start-screen.js', './ui/log-modal.js',
  './ui/settings.js', './ui/install.js', './ui/tracker.js', './sim/sky.js', './dive/dive-state.js',
  './dive/dive-seabed.js', './dive/dive-fish.js', './dive/dive-gear.js', './dive/dive-controls.js',
  './fishing/fight.js', './ui/pause.js'
];

export async function loadGame() {
  const mods = await Promise.all(ORDER.map(p => import(p)));
  return () => { for (const m of mods) m.init(); };
}
