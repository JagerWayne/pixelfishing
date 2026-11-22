/* Talking to the townsfolk and friendship. */
import { shared } from '../state.js';
import { sfx } from '../data/equipment.js';
import { FRIEND_PERK, FRIEND_PERKS, NPCS, friendPerk, friendPts, rarityAtLeast } from '../data/townsfolk.js';
import { QUESTS, QUEST_BY_ID } from '../data/quests.js';
import { sellValue } from '../fishing/market.js';
import { saveGame } from '../save/save-game.js';
import { rebuildPierBucketVisual } from '../boat/terminal.js';
import { showToast } from '../ui/toasts.js';
import { questAdvance, questAvailable, questEvent, questReady, questStepText, story } from './story.js';
import { questFinish } from './npcs.js';
import { updateQuestPill } from './restaurant.js';
import { town } from './town-state.js';
import { inesTalk } from './post-office.js';

/* ---- talking ---- */
export const talk = { npc: null, lines: [], i: 0, choices: null };
function talkShow() {
  const n = talk.npc, d = n.d;
  document.getElementById('talk-icon').textContent = d.icon;
  document.getElementById('talk-name').textContent = d.name;
  document.getElementById('talk-role').textContent = d.role;
  document.getElementById('talk-text').textContent = talk.lines[talk.i] || '';
  const host = document.getElementById('talk-choices'); host.innerHTML = '';
  const last = talk.i >= talk.lines.length - 1;
  const opts = last && talk.choices ? talk.choices : [{ label: last ? 'Bye' : 'Next ▸', fn: last ? null : () => { talk.i++; talkShow(); } }];
  opts.forEach(o => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pixel-btn ' + (o.cls || ''); b.textContent = o.label;
    b.addEventListener('click', e => { e.stopPropagation(); if (o.fn) o.fn(); else talkClose(); });
    host.appendChild(b);
  });
}
export function talkSay(lines, choices) { talk.lines = lines; talk.i = 0; talk.choices = choices || null; talkShow(); }
function talkClose() { document.getElementById('modal-talk').classList.remove('open'); talk.npc = null; updateQuestPill(); }
/* friendship points: +3 a finished quest, +1 the first chat of the day, +2 a craving served, +2 a commission, +1 a dice win */
export function addFriend(id, n) {
  const S = story(); if (!NPCS[id]) return;
  const before = S.friend[id] || 0; S.friend[id] = Math.min(99, before + n);
  if (before < FRIEND_PERK && S.friend[id] >= FRIEND_PERK) { showToast(`❤️ You and ${NPCS[id].name} are friends! ${FRIEND_PERKS[id]}.`); sfx.playCatchFanfare(false); }
  saveGame();
}
export const friendHearts = id => { const f = Math.min(FRIEND_PERK, friendPts(id)); return '❤️'.repeat(Math.floor(f / 2)) + '🤍'.repeat(Math.ceil((FRIEND_PERK - f) / 2) - (f % 2 ? 1 : 0)) + (f % 2 ? '🩷' : ''); };
export function openTalk(n) {
  talk.npc = n; n.talk = 4;
  { const T = town(), day = shared.state.dayCount || 0; if (T.met[n.id] !== day) { T.met[n.id] = day; addFriend(n.id, 1); } }
  document.getElementById('modal-talk').classList.add('open');
  questEvent('talk', { npc: n.id });
  talkMenu();
}
export function talkMenu() {
  const n = talk.npc, S = story();
  // 1. a quest of theirs is ready to hand in
  const ready = Object.keys(S.active).find(id => QUEST_BY_ID[id].giver === n.id && questReady(id));
  if (ready) { const q = QUEST_BY_ID[ready]; talkSay(q.outro, [{ label: 'Thanks!', cls: 'green', fn: () => { questFinish(ready); talkMenu(); } }]); return; }
  // 2. a delivery they are waiting for, and a matching fish in the bucket
  const waiting = Object.keys(S.active).find(id => { const q = QUEST_BY_ID[id], a = S.active[id]; return q.giver === n.id && q.steps[a.s] && q.steps[a.s].t === 'deliver'; });
  if (waiting) {
    const q = QUEST_BY_ID[waiting], st = q.steps[S.active[waiting].s];
    const fit = shared.state.bucket.filter(e => e.category === 'Fish' && (!st.rarityMin || rarityAtLeast(e.rarity, st.rarityMin)) && (!st.minW || e.weight >= st.minW))
      .sort((a, b) => sellValue(a) - sellValue(b))[0];
    if (fit) { talkSay([`Is that ${/^[aeiou]/i.test(fit.name) ? 'an' : 'a'} ${fit.name} in your bucket?`], [{ label: `Give ${fit.name}`, cls: 'green', fn: () => { const i = shared.state.bucket.indexOf(fit); if (i >= 0) { shared.state.bucket.splice(i, 1); rebuildPierBucketVisual(); } questAdvance(waiting); talkMenu(); } }, { label: 'Not yet' }]); return; }
    talkSay([`${st.text}. I will be right here!`]); return;
  }
  // 3. a new quest to offer
  const offer = QUESTS.find(q => q.giver === n.id && questAvailable(q));
  if (offer) {
    talkSay(offer.intro, [{ label: 'I will do it', cls: 'green', fn: () => { S.active[offer.id] = { s: 0, n: 0, seen: [] }; saveGame(); showToast(`📜 New quest: ${offer.title}`); updateQuestPill(); shared.questTickT = 0; talkSay([`Good luck! (${offer.steps[0].text})`]); } }, { label: 'Not now' }]);
    return;
  }
  // 3b. Ines' specimen commissions (v6.4.0)
  if (n.id === 'ines' && QUEST_BY_ID.study && S.done.includes('study')) { if (inesTalk()) return; }
  // 4. an active quest of theirs in progress, or small talk (with your friendship)
  const mine = Object.keys(S.active).find(id => QUEST_BY_ID[id].giver === n.id);
  const fl = `${friendHearts(n.id)} ${friendPerk(n.id) ? `Friends: ${FRIEND_PERKS[n.id]}.` : `Friendship ${Math.min(FRIEND_PERK, friendPts(n.id))} / ${FRIEND_PERK}`}`;
  const day = shared.state.dayCount || 0, chat = n.d.chat[(day + Object.keys(NPCS).indexOf(n.id)) % n.d.chat.length];
  talkSay(mine ? [`How is it going? ${questStepText(mine)}.`, chat, fl] : [chat, fl]);
}

export function init() {
  (function wireTalk() {
    const box = document.getElementById('talk-box');
    if (box) box.addEventListener('click', e => { if (e.target.closest('button')) return; if (talk.i < talk.lines.length - 1) { talk.i++; talkShow(); } });
  })();
}
