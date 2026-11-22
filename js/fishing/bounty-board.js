/* The bounty papers, the cabin fade and claiming bounties. */
import { THREE } from '../engine/three.js';
import { shared } from '../state.js';
import { BAIT_TIERS, sfx } from '../data/equipment.js';
import { BOUNTY_POOL } from '../data/bottles-bounties.js';
import { CABIN } from '../world/layout.js';
import { world } from '../render/lights.js';
import { pickBounties } from './bounties.js';
import { addXp, bumpStat } from '../save/career.js';
import { checkAchievements } from './market.js';
import { saveGame } from '../save/save-game.js';
import { showToast } from '../ui/toasts.js';
import { updateHUD } from '../ui/hud.js';

/* ---- Bounty board: the active contracts are written on the papers pinned to the board (see buildBountyBoard).
   Tap a finished paper (or press the action button beside the board) to claim it. ---- */
function wrapLines(ctx, text, maxW) {
  const out = []; let line = '';
  String(text).split(' ').forEach(w => {
    const t = line ? line + ' ' + w : w;
    if (line && ctx.measureText(t).width > maxW) { out.push(line); line = w; } else line = t;
  });
  if (line) out.push(line);
  return out;
}
function drawBountyPaper(cv, b) {
  const W = cv.width, H = cv.height, x = cv.getContext('2d');
  const grad = x.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, '#fdf3d0'); grad.addColorStop(1, '#efdca6');
  x.fillStyle = grad; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(120,80,30,0.6)'; x.lineWidth = 5; x.strokeRect(10, 10, W - 20, H - 20);
  x.textAlign = 'center'; x.fillStyle = '#5b3a1a';
  if (!b) { x.font = 'bold 34px "Courier New", monospace'; x.fillText('NO CONTRACT', W / 2, H / 2); return; }
  const done = b.progress >= b.target;
  x.font = 'bold 22px "Courier New", monospace'; x.fillStyle = '#92400e'; x.fillText('HARBOR CONTRACT', W / 2, 52);
  x.fillStyle = '#3b2410'; x.font = 'bold 36px "Courier New", monospace';
  let y = 104; wrapLines(x, b.title, W - 60).slice(0, 3).forEach(l => { x.fillText(l, W / 2, y); y += 40; });
  x.fillStyle = 'rgba(91,58,26,0.5)'; x.fillRect(40, y - 18, W - 80, 3); y += 20;
  x.fillStyle = '#4a3220'; x.font = '27px "Courier New", monospace';
  wrapLines(x, b.desc, W - 60).slice(0, 5).forEach(l => { x.fillText(l, W / 2, y); y += 33; });
  const bait = BAIT_TIERS[b.rewardBaitTier - 1];
  x.fillStyle = '#166534'; x.font = 'bold 58px "Courier New", monospace'; x.fillText('$' + b.rewardCash, W / 2, H - 150);
  x.fillStyle = '#4a3220'; x.font = 'bold 23px "Courier New", monospace'; x.fillText('+' + b.rewardBaitQty + 'x ' + (bait ? bait.name : 'bait'), W / 2, H - 116);
  const bw = W - 100, frac = Math.min(1, b.progress / b.target);
  x.fillStyle = 'rgba(91,58,26,0.25)'; x.fillRect(50, H - 90, bw, 22);
  x.fillStyle = done ? '#16a34a' : '#d97706'; x.fillRect(50, H - 90, bw * frac, 22);
  x.strokeStyle = '#5b3a1a'; x.lineWidth = 2; x.strokeRect(50, H - 90, bw, 22);
  x.fillStyle = '#3b2410'; x.font = 'bold 28px "Courier New", monospace'; x.fillText(b.progress + ' / ' + b.target, W / 2, H - 36);
  if (done) {
    x.save(); x.translate(W / 2, H * 0.5); x.rotate(-0.28);
    x.strokeStyle = '#b91c1c'; x.fillStyle = '#b91c1c'; x.lineWidth = 7; x.globalAlpha = 0.88;
    x.strokeRect(-150, -48, 300, 96); x.font = 'bold 54px "Courier New", monospace'; x.fillText('READY', 0, 6);
    x.font = 'bold 26px "Courier New", monospace'; x.fillText('TAP TO CLAIM', 0, 36);
    x.restore();
  }
}
export function refreshBountyPapers(force = false) {
  const grp = world && world.bountyPapers; if (!grp) return;
  grp.children.forEach(p => {
    const b = (shared.state.bounties || [])[p.userData.bountyIdx];
    const sig = b ? [b.id, b.progress, b.target].join('|') : 'none';
    if (!force && p.userData.sig === sig) return;
    if (p.userData.sig && p.userData.sig.split('|')[0] !== sig.split('|')[0]) p.userData.pin = 0;   // a new paper gets pinned up
    p.userData.sig = sig;
    drawBountyPaper(p.userData.canvas, b); p.userData.tex.needsUpdate = true;
  });
}
export function updateBountyPapers(dt) {
  const grp = world && world.bountyPapers; if (!grp) return;
  grp.children.forEach(p => {
    if (p.userData.pin < 1) {
      p.userData.pin = Math.min(1, p.userData.pin + dt * 3);
      const t = p.userData.pin, e = 1 + 1.6 * Math.pow(t - 1, 3) + 0.6 * Math.pow(t - 1, 2);
      p.scale.setScalar(Math.max(0.05, e));
    }
  });
}
/* the cabin's front wall and roof fade out while you are inside, so the chase camera can see in */
const cabinFade = { t: 1, mats: null };
export function updateCabinFade(dt) {
  const c = world && world.cabin; if (!c) return;
  if (!cabinFade.mats) { cabinFade.mats = []; [c.userData.front, c.userData.roof].forEach(grp => grp.traverse(o => { if (o.isMesh && o.material) cabinFade.mats.push(o.material); })); }
  const inside = !shared.onBoat && Math.abs(shared.playerX - CABIN.x) < CABIN.w / 2 + 0.2 && shared.playerZ > -0.2 && shared.playerZ < CABIN.d + 1.3;
  const target = inside ? 0.1 : 1, prev = cabinFade.t;
  cabinFade.t += (target - cabinFade.t) * Math.min(1, dt * 6);
  if (Math.abs(cabinFade.t - target) < 0.01) cabinFade.t = target;
  if (cabinFade.t !== prev || dt === 0) { const t = cabinFade.t; cabinFade.mats.forEach(m => { m.opacity = t; m.depthWrite = t > 0.9; }); [c.userData.front, c.userData.roof].forEach(grp => { grp.visible = t > 0.02; }); }
}
export function claimBounty(idx) {
  const b = (shared.state.bounties || [])[idx];
  if (!b) return false;
  if (b.progress < b.target) {
    showToast(`📋 ${b.title}: ${b.progress}/${b.target}. ${b.desc}`);
    return false;
  }
  const baitName = BAIT_TIERS[b.rewardBaitTier - 1].name;
  shared.state.cash = +(shared.state.cash + b.rewardCash).toFixed(2);
  bumpStat('earned', b.rewardCash); bumpStat('bountiesClaimed'); addXp(40);
  shared.state.baitStock[b.rewardBaitTier] = (shared.state.baitStock[b.rewardBaitTier] || 0) + b.rewardBaitQty;
  if (shared.state.baitTier === b.rewardBaitTier) shared.state.baitCount = shared.state.baitStock[b.rewardBaitTier];
  const rest = shared.state.bounties.filter((_, i) => i !== idx);
  shared.state.bounties[idx] = pickBounties(shared.state, 1, rest)[0] || { ...BOUNTY_POOL[0], progress: 0, claimed: false };
  sfx.playCatchFanfare(false);
  checkAchievements();
  saveGame();
  refreshBountyPapers();
  updateHUD();
  showToast(`🎉 Claimed $${b.rewardCash} + ${b.rewardBaitQty}x ${baitName}!`);
  return true;
}
export function claimFirstReadyBounty() {
  const i = (shared.state.bounties || []).findIndex(b => b.progress >= b.target);
  if (i >= 0) return claimBounty(i);
  showToast('📋 Nothing ready yet. Finish a contract, then tap its paper (or press this button) to claim it.');
  return false;
}
export const _bountyRay = new THREE.Raycaster(), _bountyNdc = new THREE.Vector2();
