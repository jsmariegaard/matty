// Selve træningen. Alle tilstande (daglig, tabel, svære, prøve, tidsløb, niveautest).

import * as S from '../store.js';
import * as E from '../engine.js';
import * as F from '../facts.js';
import { finishSession } from '../progress.js';
import { h, esc, toast, confetti, vibrate, overlay, closeOverlay, fmtTime, fmtSec } from '../ui.js';
import { mascotSvg, setMood, setAccessory } from '../mascot.js';
import { sfx } from '../audio.js';
import { PRAISE_OK, PRAISE_FAST, PRAISE_COMBO, CONSOLE_MSG, SESSION_END } from '../data/content.js';
import { go } from '../main.js';

const SPRINT_SECONDS = 60;
const pick = (a) => a[Math.floor(Math.random() * a.length)];

export default function quiz({ mode = 'daily', table = null, length = 15 } = {}) {
  const root = h('<div class="quiz"></div>');
  const st = S.get();

  const Q = {
    mode, table,
    queue: [], idx: 0,
    correct: 0, wrong: 0, fast: 0,
    combo: 0, bestCombo: 0,
    hintUsed: false, answered: false,
    startedAt: performance.now(), qShownAt: 0,
    placement: [],
    timeLeft: SPRINT_SECONDS, timer: null,
    nextGen: null,
  };

  if (mode === 'sprint') {
    Q.nextGen = E.buildSession({ mode: 'sprint' });
    Q.queue = [Q.nextGen()];
  } else if (mode === 'placement') {
    Q.queue = E.placementKeys(12).map((k) => E.makeQuestion(k, { forceChoice: true }));
  } else {
    Q.queue = E.buildSession({ mode, table, length });
  }

  const requeues = !['test', 'sprint', 'placement'].includes(mode);
  const showHints = st.settings.hints && mode !== 'placement' && mode !== 'test';

  // ---------------------------------------------------------------- layout
  root.innerHTML = `
    <div class="quiz-top">
      <button class="close" aria-label="Luk">✕</button>
      <div class="segbar"></div>
      <div class="combo"></div>
    </div>
    <div class="question"></div>
    <div class="answer"></div>`;

  const segbar = root.querySelector('.segbar');
  const qBox = root.querySelector('.question');
  const aBox = root.querySelector('.answer');
  root.querySelector('.close').onclick = confirmQuit;

  function confirmQuit() {
    if (Q.idx === 0) return leave();
    const o = overlay(`
      <h2>Stoppe nu?</h2>
      <p>Det du har svaret på, er gemt. Du kan altid tage en runde til senere.</p>
      <button class="btn ghost" id="q-stay">Bliv og træn videre</button>
      <button class="btn small" id="q-quit" style="background:var(--red);box-shadow:0 5px 0 var(--red-dark)">Stop runden</button>`);
    o.el.querySelector('#q-stay').onclick = closeOverlay;
    o.el.querySelector('#q-quit').onclick = () => { closeOverlay(); leave(); };
  }
  function leave() { clearInterval(Q.timer); go('home'); }

  // ---------------------------------------------------------------- render
  function drawTop() {
    if (mode === 'sprint') {
      segbar.innerHTML = `<div style="flex:1;text-align:center;font-weight:900;font-size:1.3rem;
        color:${Q.timeLeft <= 10 ? 'var(--red)' : 'var(--ink)'}">${Q.timeLeft}s</div>`;
    } else {
      segbar.innerHTML = Q.queue.map((_, i) =>
        `<i class="${i < Q.idx ? (Q.queue[i]._ok === false ? 'bad' : 'ok') : i === Q.idx ? 'now' : ''}"></i>`).join('');
    }
    root.querySelector('.combo').textContent = Q.combo >= 3 ? `🔥${Q.combo}` : (mode === 'sprint' ? `${Q.correct}` : '');
  }

  function drawQuestion() {
    const q = Q.queue[Q.idx];
    if (!q) return finish();
    Q.answered = false;
    Q.hintUsed = false;
    drawTop();

    qBox.innerHTML = `
      ${mascotSvg()}
      ${q.isNew && mode !== 'placement' ? '<span class="q-new">NY!</span>' : ''}
      <div class="q-text">${q.a} <span class="op">×</span> ${q.b}</div>
      ${showHints ? '<button class="hint-btn">💡 Hjælp mig</button><div class="hint-text meta"></div>' : ''}`;
    setMood(qBox, 'think');
    setAccessory(qBox, st.accessory);

    const hintBtn = qBox.querySelector('.hint-btn');
    if (hintBtn) hintBtn.onclick = () => {
      Q.hintUsed = true;
      qBox.querySelector('.hint-text').textContent = q.hint;
      hintBtn.remove();
      sfx.tap();
    };

    if (q.type === 'choice') drawChoices(q); else drawKeypad(q);
    Q.qShownAt = performance.now();
  }

  function drawChoices(q) {
    aBox.innerHTML = `<div class="choices">${q.choices
      .map((c) => `<button class="choice" data-v="${c}">${c}</button>`).join('')}</div>`;
    aBox.querySelectorAll('.choice').forEach((b) => {
      b.onclick = () => answer(Number(b.dataset.v), b);
    });
  }

  function drawKeypad(q) {
    let typed = '';
    aBox.innerHTML = `
      <div class="typed"><span class="val"></span><span class="caret">|</span></div>
      <div class="keypad">
        ${[1,2,3,4,5,6,7,8,9].map((n) => `<button data-k="${n}">${n}</button>`).join('')}
        <button data-k="del">⌫</button>
        <button data-k="0">0</button>
        <button class="go" data-k="ok">OK</button>
      </div>`;
    const box = aBox.querySelector('.typed');
    const val = aBox.querySelector('.val');
    const paint = () => { val.textContent = typed; };
    aBox.querySelectorAll('.keypad button').forEach((b) => {
      b.onclick = () => {
        if (Q.answered) return;
        const k = b.dataset.k;
        if (k === 'del') typed = typed.slice(0, -1);
        else if (k === 'ok') { if (typed) answer(Number(typed), box); return; }
        else if (typed.length < 3) typed += k;
        sfx.tap();
        paint();
      };
    });
  }

  // ---------------------------------------------------------------- svar
  function answer(value, node) {
    if (Q.answered) return;
    Q.answered = true;
    const q = Q.queue[Q.idx];
    const ms = Math.round(performance.now() - Q.qShownAt);
    const ok = value === q.answer;
    q._ok = ok;

    if (ok) {
      Q.correct++; Q.combo++; Q.bestCombo = Math.max(Q.bestCombo, Q.combo);
      if (ms < 2000) Q.fast++;
    } else {
      Q.wrong++; Q.combo = 0;
    }

    let gained = 0;
    if (mode === 'placement') {
      Q.placement.push({ key: q.key, correct: ok, ms });
    } else {
      gained = E.recordAnswer(q.key, ok, ms, { hintUsed: Q.hintUsed }).xp;
    }

    // Visuel respons
    if (q.type === 'choice') {
      aBox.querySelectorAll('.choice').forEach((b) => {
        const v = Number(b.dataset.v);
        if (v === q.answer) b.classList.add('right');
        else if (b === node) b.classList.add('wrong');
        else b.classList.add('dim');
      });
    } else {
      node.classList.add(ok ? 'right' : 'wrong');
      if (!ok) node.querySelector('.val').textContent = value;
    }

    if (ok) {
      sfx[Q.combo >= 3 ? 'combo' : 'correct'](Q.combo);
      vibrate(12);
      setMood(qBox, Q.combo >= 5 ? 'excited' : 'happy');
    } else {
      sfx.wrong();
      vibrate([24, 60, 24]);
      setMood(qBox, 'sad');
      if (requeues) {
        const again = E.makeQuestion(q.key, { forceChoice: q.type === 'choice' });
        Q.queue.splice(Math.min(Q.queue.length, Q.idx + 3), 0, again);
      }
    }
    drawTop();
    showFeedback(q, ok, ms, gained);
  }

  function showFeedback(q, ok, ms, gained) {
    root.querySelector('.feedback')?.remove();
    const fast = ok && ms < 2000;
    const headline = ok
      ? (Q.combo >= 5 ? pick(PRAISE_COMBO) : fast ? pick(PRAISE_FAST) : pick(PRAISE_OK))
      : pick(CONSOLE_MSG);
    const body = ok
      ? (gained ? `<div class="hint">+${gained} 🦴${fast ? ` · ${fmtSec(ms)}` : ''}</div>` : '')
      : `<div class="hint"><b>${q.a} × ${q.b} = ${q.answer}</b>${
          Q.hintUsed ? '' : `<br>${esc(F.hintFor(q.key))}`}</div>`;

    const fb = h(`<div class="feedback ${ok ? 'ok' : 'no'}">
      <div class="head">${ok ? '✅' : '🐾'} ${esc(headline)}</div>
      ${body}
      ${ok ? '' : '<button class="btn green small" style="margin-top:12px;margin-bottom:0">Forstået</button>'}
    </div>`);
    root.appendChild(fb);

    if (ok) {
      setTimeout(next, mode === 'sprint' ? 320 : 620);
    } else {
      fb.querySelector('button').onclick = next;
    }
  }

  function next() {
    root.querySelector('.feedback')?.remove();
    Q.idx++;
    if (mode === 'sprint') {
      if (Q.timeLeft <= 0) return finish();
      Q.queue.push(Q.nextGen());
    }
    if (Q.idx >= Q.queue.length) return finish();
    drawQuestion();
  }

  // ---------------------------------------------------------------- slut
  function finish() {
    clearInterval(Q.timer);
    const ms = Math.round(performance.now() - Q.startedAt);
    const total = Q.correct + Q.wrong;

    if (mode === 'placement') return finishPlacement();

    const summary = {
      mode, table, total, correct: Q.correct, wrong: Q.wrong,
      ms, fast: Q.fast, bestCombo: Q.bestCombo,
    };
    const res = finishSession(summary);
    sfx.finish();
    drawResults(summary, res);
  }

  function finishPlacement() {
    E.applyPlacement(Q.placement);
    const d = S.day();
    d.correct += Q.correct; d.wrong += Q.wrong;
    S.addXp(Q.correct * 8);
    S.get().onboarded = true;
    S.save(true);
    sfx.finish();
    const known = Q.placement.filter((p) => p.correct).length;
    const o = overlay(`
      ${mascotSvg()}
      <h2>Så er jeg klog på dig!</h2>
      <p>Du havde <b>${known} ud af ${Q.placement.length}</b> rigtige. Nu ved jeg præcis hvad vi skal øve.</p>
      <button class="btn green" id="p-ok">Videre til Matty</button>`, { dismissable: false });
    setMood(o.el, known >= 8 ? 'excited' : 'happy');
    setAccessory(o.el, st.accessory);
    o.el.querySelector('#p-ok').onclick = () => { closeOverlay(); go('home'); };
  }

  function drawResults(sum, res) {
    const acc = sum.total ? sum.correct / sum.total : 0;
    const line = SESSION_END.find((x) => acc >= x.min);
    const avg = sum.total ? sum.ms / sum.total : 0;
    if (acc >= 0.9) confetti(70);

    const rec = mode === 'test'
      ? S.get().records[table ? `table:${table}` : 'all'] : S.get().records.sprint;

    root.innerHTML = `<div class="screen plain" style="padding-top:20px">
      <div class="hero">${mascotSvg()}<div class="speech">${esc(line.msg)}</div></div>
      <div class="stat-grid" style="margin:16px 0">
        <div class="stat"><b>${sum.correct}/${sum.total}</b><span>Rigtige</span></div>
        <div class="stat"><b>${Math.round(acc * 100)}%</b><span>Træfsikkerhed</span></div>
        <div class="stat"><b>${fmtTime(sum.ms)}</b><span>Tid i alt</span></div>
        <div class="stat"><b>${fmtSec(avg)}</b><span>Pr. spørgsmål</span></div>
      </div>
      ${sum.bestCombo >= 5 ? `<div class="card tight" style="text-align:center">🔥 Bedste serie: <b>${sum.bestCombo} i træk</b></div>` : ''}
      ${sum.newRecord ? '<div class="card tight" style="text-align:center;border-color:var(--gold)">🏆 <b>Ny rekord!</b></div>' : ''}
      ${mode === 'test' && rec ? `<div class="card tight" style="text-align:center" class="meta">
          Din bedste: <b>${fmtTime(rec.ms)}</b> med <b>${rec.wrong}</b> fejl</div>` : ''}
      ${mode === 'sprint' && rec ? `<div class="card tight" style="text-align:center">
          Rekord i tidsløb: <b>${rec.score}</b> rigtige</div>` : ''}
      <button class="btn green" id="r-again">En runde til</button>
      <button class="btn ghost" id="r-home">Tilbage til Matty</button>
    </div>`;
    setMood(root, line.mood);
    setAccessory(root, st.accessory);
    root.querySelector('#r-again').onclick = () => go('quiz', { mode, table, length });
    root.querySelector('#r-home').onclick = () => go('home');

    celebrate(res);
  }

  /** Niveauer, medaljer og hvalpekort vises som små pop-ups efter hinanden. */
  function celebrate(res) {
    const queue = [];
    if (res.goalJustMet) queue.push({
      icon: '🔥', title: 'Dagens mål er nået!',
      body: `Din streak er nu <b>${S.get().streak.count}</b> dag${S.get().streak.count === 1 ? '' : 'e'} i træk.`,
    });
    if (res.leveledUp) queue.push({
      icon: '⭐', title: `Niveau ${res.leveledUp}!`,
      body: `Matty er nu <b>${esc(S.levelInfo().name)}</b>.`,
    });
    for (const c of res.unlocks.cards) queue.push({
      icon: '📸', title: 'Nyt hvalpekort!', body: `<b>${esc(c.name)}</b> er kommet i dit album.`,
    });
    for (const b of res.unlocks.badges) queue.push({
      icon: b.icon, title: 'Ny medalje!', body: `<b>${esc(b.name)}</b> – ${esc(b.desc)}`,
    });
    for (const a of res.unlocks.accessories) queue.push({
      icon: '🎁', title: 'Nyt tilbehør!', body: `Matty kan nu få <b>${esc(a.name)}</b> på.`,
    });
    if (!queue.length) return;

    let i = 0;
    const show = () => {
      if (i >= queue.length) return closeOverlay();
      const item = queue[i++];
      const o = overlay(`
        <div style="font-size:3.4rem;line-height:1">${item.icon}</div>
        <h2>${esc(item.title)}</h2>
        <p>${item.body}</p>
        <button class="btn green" id="c-next">${i < queue.length ? 'Videre' : 'Fedt!'}</button>`,
        { dismissable: false });
      o.el.querySelector('#c-next').onclick = () => { sfx.tap(); show(); };
    };
    setTimeout(() => { sfx.levelUp(); show(); }, 700);
  }

  // ---------------------------------------------------------------- start
  if (mode === 'sprint') {
    Q.timer = setInterval(() => {
      Q.timeLeft--;
      drawTop();
      if (Q.timeLeft <= 0) { clearInterval(Q.timer); if (Q.answered) return; finish(); }
    }, 1000);
  }
  drawQuestion();
  return root;
}
