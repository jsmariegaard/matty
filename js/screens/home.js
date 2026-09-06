// Forsiden: Matty, dagens mål, streak og de store træningsknapper.

import * as S from '../store.js';
import * as E from '../engine.js';
import * as F from '../facts.js';
import { h, esc, ring, pct } from '../ui.js';
import { mascotSvg, setMood, setAccessory } from '../mascot.js';
import { sfx } from '../audio.js';
import { HOME_LINES } from '../data/content.js';
import { go } from '../main.js';

export default function home() {
  const s = S.get();
  const goal = S.goalProgress();
  const lvl = S.levelInfo();
  const overall = E.overallProgress();
  const name = s.name || 'ven';
  const hour = new Date().getHours();
  const trainedToday = S.day().correct > 0;

  let line, mood;
  if (!s.sessions.length) { line = HOME_LINES.firstEver(name); mood = 'happy'; }
  else if (S.goalMet()) { line = HOME_LINES.goalDone(name); mood = 'excited'; }
  else if (s.streak.count >= 3 && !trainedToday) { line = HOME_LINES.streakRisk(); mood = 'think'; }
  else if (s.streak.count >= 3) { line = HOME_LINES.longStreak(s.streak.count); mood = 'proud'; }
  else if (hour < 10) { line = HOME_LINES.morning(name); mood = 'happy'; }
  else if (hour >= 20) { line = HOME_LINES.evening(name); mood = 'sleepy'; }
  else { line = HOME_LINES.normal(name); mood = 'happy'; }

  const weak = E.weakestFacts(4);

  const root = h(`<div class="screen">
    <div class="topbar">
      <span class="chip flame"><span class="ico">🔥</span>${s.streak.count}</span>
      <span class="chip bone"><span class="ico">🦴</span>${s.xp}</span>
      <span class="grow"></span>
      <button class="icon-btn" data-nav="settings" aria-label="Indstillinger">⚙️</button>
    </div>

    <div class="hero">
      <div class="speech">${esc(line)}</div>
      ${mascotSvg()}
    </div>

    <div class="card">
      <div class="ring-wrap">
        ${ring(goal.ratio, `${goal.done}`, goal.ratio >= 1 ? 'var(--green)' : 'var(--gold)')}
        <div style="flex:1">
          <b>Dagens mål</b>
          <div class="meta">${goal.done} af ${goal.goal} rigtige${goal.ratio >= 1 ? ' – klaret! 🎉' : ''}</div>
          <div style="margin-top:8px" class="meta">Niveau ${lvl.level} · ${esc(lvl.name)}</div>
          <div class="bar gold" style="margin-top:5px"><i style="width:${pct(lvl.ratio)}"></i></div>
        </div>
      </div>
    </div>

    <button class="btn green" data-start="daily">${trainedToday ? 'Træn videre' : 'Start dagens træning'}</button>

    <div class="btn-row" style="margin-bottom:14px">
      <button class="btn ghost small" data-start="hard">💪 Svære kort</button>
      <button class="btn ghost small" data-start="sprint">⏱️ Tidsløb</button>
    </div>

    ${weak.length ? `<div class="card tight">
      <b>Matty holder øje med disse</b>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:9px">
        ${weak.map((k) => { const { a, b } = F.parseKey(k);
          return `<span class="chip" style="font-size:.9rem">${a}×${b}</span>`; }).join('')}
      </div>
    </div>` : ''}

    <div class="card tight">
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <b>Hele gangetabellen</b><span class="meta">${overall.gold}/55 på guld</span>
      </div>
      <div class="bar" style="margin-top:8px"><i style="width:${pct(overall.ratio)}"></i></div>
    </div>
  </div>`);

  setMood(root, mood);
  setAccessory(root, s.accessory);

  root.querySelector('[data-nav="settings"]').onclick = () => { sfx.tap(); go('settings'); };
  root.querySelectorAll('[data-start]').forEach((b) => {
    b.onclick = () => { sfx.bark(); go('quiz', { mode: b.dataset.start, length: 15 }); };
  });
  // Et klap på Matty giver et lille wuf.
  root.querySelector('.matty').onclick = () => { sfx.bark(); setMood(root, 'excited', 1200); };

  return root;
}
