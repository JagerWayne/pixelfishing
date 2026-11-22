/* The floating stick: moving it from a touch, latching the keyboard keys and releasing every input. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { joyEl, joyState, keys, knobEl, primaryBtn } from './controls-state.js';
import { sleepState } from './spots.js';
import { scope } from '../town/telescope-dice.js';
import { handleActionRelease } from '../fishing/cast.js';
import { fightEnd } from '../fishing/hook.js';
import { isAnyModalOpen } from '../utils.js';

let joyZone;

function updateJoystickFromClient(clientX, clientY) {
  const rect = joyEl.getBoundingClientRect();
  const cx = rect.left + rect.width * 0.5;
  const cy = rect.top + rect.height * 0.5;
  const maxRadius = rect.width * 0.36;

  let dx = clientX - cx;
  let dy = clientY - cy;
  const dist = Math.hypot(dx, dy);
  if (dist > maxRadius) {
    dx = (dx / dist) * maxRadius;
    dy = (dy / dist) * maxRadius;
  }

  const normX = dx / maxRadius;
  const normY = dy / maxRadius;
  joyState.x = Math.abs(normX) < 0.12 ? 0 : normX;
  joyState.y = Math.abs(normY) < 0.12 ? 0 : normY;

  knobEl.style.transform = `translate(${dx}px, ${dy}px)`;
}

function resetJoystick() {
  joyState.active = false;
  joyState.pointerId = null;
  joyState.x = 0;
  joyState.y = 0;
  knobEl.style.transform = 'translate(0px, 0px)';
}

/* after a fight ends (snap, escape, landing) the stick is usually still held to one side: ignore it until it is let go,
   so the angler never walks off (or the boat drives off) on his own */
shared.moveLatch = false;
export const MOVE_KEYS = ['KeyA', 'KeyD', 'KeyW', 'KeyS', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
const moveHeld = () => joyState.x !== 0 || joyState.y !== 0 || MOVE_KEYS.some(k => keys[k]);
export function moveLatched() { if (shared.moveLatch && !moveHeld()) shared.moveLatch = false; return shared.moveLatch || !!fightEnd || scope.on || sleepState.on; }
export function releaseAllInputs() {
  for (const k in keys) keys[k] = false;
  resetJoystick();
  joyEl.classList.remove('live');
  if (shared.isHoldingAction) {
    shared.isHoldingAction = false;
    shared.actionPointerId = null;
    primaryBtn.classList.remove('pressed');
    if (shared.mode === 'CASTING') {
      handleActionRelease();
    }
  }
}
const startJoy = e => {
  e.preventDefault();
  e.stopPropagation();
  sfx.init();
  if (joyState.pointerId !== null) return;
  if (isAnyModalOpen()) return;
  if (e.currentTarget === joyZone) {
    // floating: centre the stick under the first touch (kept fully on screen)
    const size = joyEl.getBoundingClientRect().width || 120;
    const half = size / 2;
    const x = Math.max(half + 4, Math.min(innerWidth - half - 4, e.clientX));
    const y = Math.max(half + 4, Math.min(innerHeight - half - 4, e.clientY));
    joyEl.style.left = (x - half) + 'px';
    joyEl.style.top = (y - half) + 'px';
    joyEl.style.width = joyEl.style.height = size + 'px';
    joyEl.classList.add('live');
  }
  joyState.active = true;
  joyState.pointerId = e.pointerId;
  e.currentTarget.setPointerCapture(e.pointerId);
  updateJoystickFromClient(e.clientX, e.clientY);
};
const moveJoy = e => {
  if (e.pointerId !== joyState.pointerId) return;
  e.preventDefault();
  updateJoystickFromClient(e.clientX, e.clientY);
};
const onJoyEnd = e => {
  if (e.pointerId === joyState.pointerId) {
    resetJoystick();
    joyEl.classList.remove('live');
    joyEl.style.left = joyEl.style.top = joyEl.style.width = joyEl.style.height = '';
  }
};

export function init() {
  joyZone = document.getElementById('joy-zone');
  for (const t of [joyEl, joyZone]) {
    t.addEventListener('pointerdown', startJoy);
    t.addEventListener('pointermove', moveJoy);
    t.addEventListener('pointerup', onJoyEnd);
    t.addEventListener('pointercancel', onJoyEnd);
  }
}
