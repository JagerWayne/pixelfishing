/* Floating text callouts in the 3D view. */
import { camera } from '../render/renderer.js';

	  
	  export function spawnWorldCallout(worldVec3, text, color = '#fef08a') {
  if (!worldVec3) return;
  const projected = worldVec3.clone().project(camera);
  if (projected.z > 1) return;
  const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
  const el = document.createElement('div');
  el.className = 'world-callout';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.color = color;
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 960);
}
