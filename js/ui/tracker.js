/* The bounty pill and the objective tracker. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { questReady, story } from '../town/story.js';
import { isAnyModalOpen } from '../utils.js';
import { refreshBountyPapers } from '../fishing/bounty-board.js';

let trackerEl, trackerMore, trackerSig;

/* One objective pill at a time (v6.2.1): a finished quest, then a finished bounty, then a bounty that just moved
   (for 6 seconds), otherwise the current quest (or the leading bounty when there is no quest). */
const bountyNote = { key: '', until: 0 };
export function updateBountyPill() {
  refreshBountyPapers();
  const pill = document.getElementById('hud-bounty-pill');
  const active = (shared.state.bounties || []).filter(b => !b.claimed);
  const S = story(), qids = Object.keys(S.active), questDone = qids.some(questReady);
  if (active.length === 0 || isAnyModalOpen()) { pill.style.display = 'none'; return; }
  const ready = active.find(b => b.progress >= b.target);
  const b = ready || active.reduce((best, cur) => (cur.progress / cur.target > best.progress / best.target ? cur : best), active[0]);
  const key = active.map(x => x.progress).join(',');
  if (key !== bountyNote.key) { if (bountyNote.key) bountyNote.until = performance.now() + 6000; bountyNote.key = key; }
  const show = !questDone && (ready || performance.now() < bountyNote.until || !qids.length);
  pill.classList.toggle('ready', !!ready);
  pill.textContent = ready ? `✅ ${b.title}: claim at the board` : `📜 ${b.title}: ${b.progress}/${b.target}`;
  pill.style.display = show ? 'flex' : 'none';
  const qp = document.getElementById('hud-quest-pill');
  if (show && qp) qp.style.display = 'none';
}
export function syncTracker() {
  if (!trackerEl) return;
  const vis = [...trackerEl.querySelectorAll('.trk')].filter(p => p.style.display && p.style.display !== 'none');
  const sig = vis.map(p => p.id).join(',');
  if (sig === trackerSig) return; trackerSig = sig;
  trackerEl.querySelectorAll('.trk').forEach(p => p.classList.toggle('trk-top', p === vis[0]));
  trackerEl.classList.toggle('has-more', vis.length > 1);
  if (vis.length < 2) { trackerEl.classList.remove('open'); trackerMore.setAttribute('aria-expanded', 'false'); }
  trackerMore.textContent = trackerEl.classList.contains('open') ? '−' : `+${vis.length - 1}`;
}

export function init() {
  /* Tracker (v7.0.0): the radar, bounty, quest and reading pills share one slot on the info rail. Only the first
     visible one (in that order of urgency) shows; +N opens the others. */
  trackerEl = document.getElementById('hud-tracker');
      trackerMore = document.getElementById('hud-tracker-more');
      trackerSig = '';
  trackerMore.addEventListener('click', e => {
    e.stopPropagation();
    const open = trackerEl.classList.toggle('open');
    trackerMore.setAttribute('aria-expanded', String(open));
    trackerMore.setAttribute('aria-label', open ? 'Show only the most urgent objective' : 'Show all objectives');
    trackerSig = ''; syncTracker(); sfx.playTick();
  });
}
